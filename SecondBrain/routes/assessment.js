const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();
const userAuth = require("../middleware/auth");
const Content = require("../models/content");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateWithFallback(prompt) {
    const fallbackModels = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
        "gemini-1.0-pro"
    ];

    let lastError;
    for (const modelName of fallbackModels) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: {
                    responseMimeType: "application/json"
                }
            });
            const result = await model.generateContent(prompt);
            return result;
        } catch (e) {
            lastError = e;
            const msg = (e.message || "").toLowerCase();
            // Catch overloaded, quota limit (429), or missing model (404) errors to fallback
            if (msg.includes("503") || msg.includes("429") || msg.includes("404") || msg.includes("overloaded") || msg.includes("quota") || msg.includes("not found") || msg.includes("service unavailable")) {
                console.log(`[API Issue] ${modelName} failed (${msg.substring(0, 50)}...), retrying next model...`);
                continue;
            }
            throw e; // Real syntax/prompt error
        }
    }
    throw lastError;
}

router.post("/generate-assessment", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { mode, topic, projectId, questionCount, difficulty } = req.body;
        const count = questionCount || 5;
        const diffLevel = difficulty || "medium";

        let prompt = "";

        if (mode === 'topic') {
            if (!topic) {
                 return res.status(400).json({ message: "Topic is required for topic-based assessments." });
            }
            
            prompt = `You are an AI assessment generator. 
            Create a ${diffLevel}-difficulty ${count}-question multiple-choice educational quiz testing actual, factual knowledge about the following topic: ${topic}.
            
            CRITICAL RULES:
            1. Test deep understanding of the core concepts related to this topic.
            2. Make the questions appropriate for a ${diffLevel} difficulty level while remaining educational and factual.
            
            For each question, provide 4 options and identify the correct option index (0 to 3), along with an educational explanation.
            Please return the response as a valid JSON array of objects. 
            EACH object should have the exact following shape:
            {
              "question": "string",
              "options": ["string", "string", "string", "string"],
              "correctIndex": integer,
              "explanation": "string"
            }
            
            DO NOT include markdown code block syntax (like \`\`\`json) in your answer, just provide the raw JSON.`;
        } else if (mode === 'project') {
             const { projectId } = req.body;
             if (!projectId) {
                 return res.status(400).json({ message: "Project ID is required for project-based assessments." });
             }

             const projectContent = await Content.find({ userId: userId, projectId: projectId });
            
             if (!projectContent || projectContent.length === 0) {
                 return res.status(400).json({ message: "No content found in this project to generate an assessment." });
             }
 
             const context = projectContent.map(c => `Title: ${c.title}\nType: ${c.type}\nTags: ${c.tags ? c.tags.join(", ") : "None"}\nDescription: ${c.description || ""}`).join("\n\n");
 
             prompt = `You are an AI assessment generator. 
             Analyze the user's saved knowledge base context from a specific project below to identify the core topics and subjects they are learning about.
             
             Create a ${count}-question multiple-choice educational quiz testing actual, factual knowledge about those inferred topics.
             
             CRITICAL RULES:
             1. DO NOT ask questions about the metadata itself (e.g., DO NOT ask "What is the type of content for X?", "What tags does Y have?", or "What is the link for Z?").
             2. Test the user's understanding of the underlying real-world concepts represented by their saved content.
             3. Make the questions challenging and useful for someone trying to master these subjects.
             
             PROJECT'S KNOWLEDGE BASE:
             ${context}
 
             For each question, provide 4 options and identify the correct option index (0 to 3), along with an educational explanation.
             Please return the response as a valid JSON array of objects. 
             EACH object should have the exact following shape:
             {
               "question": "string",
               "options": ["string", "string", "string", "string"],
               "correctIndex": integer,
               "explanation": "string"
             }
             
             DO NOT include markdown code block syntax (like \`\`\`json) in your answer, just provide the raw JSON.`;
        } else {
            const userContent = await Content.find({ userId: userId });
            
            if (!userContent || userContent.length === 0) {
                return res.status(400).json({ message: "Not enough content to generate assessment. Add some content first." });
            }

            const context = userContent.map(c => `Title: ${c.title}\nType: ${c.type}\nTags: ${c.tags ? c.tags.join(", ") : "None"}\nDescription: ${c.description || ""}`).join("\n\n");

            prompt = `You are an AI assessment generator. 
            Analyze the user's saved knowledge base context below to identify the core topics and subjects they are learning about (e.g., AWS, React, DevOps, etc.).
            
            Create a ${count}-question multiple-choice educational quiz testing actual, factual knowledge about those inferred topics.
            
            CRITICAL RULES:
            1. DO NOT ask questions about the metadata itself (e.g., DO NOT ask "What is the type of content for X?", "What tags does Y have?", or "What is the link for Z?").
            2. Test the user's understanding of the underlying real-world concepts represented by their saved content.
            3. Make the questions challenging and useful for someone trying to master these subjects.
            
            USER'S KNOWLEDGE BASE:
            ${context}

            For each question, provide 4 options and identify the correct option index (0 to 3), along with an educational explanation.
            Please return the response as a valid JSON array of objects. 
            EACH object should have the exact following shape:
            {
              "question": "string",
              "options": ["string", "string", "string", "string"],
              "correctIndex": integer,
              "explanation": "string"
            }
            
            DO NOT include markdown code block syntax (like \`\`\`json) in your answer, just provide the raw JSON.`;
        }

        // Automatically try multiple models in case Google's servers are overloaded
        const result = await generateWithFallback(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json\n?|```/g, '').trim();
        const questions = JSON.parse(text);

        res.json({
            questions: questions
        });

    } catch (e) {
        console.error("AI Error:", e);
        require("fs").writeFileSync("assessment_error.log", String(e.stack || e.message || e));
        res.status(500).json({ 
            message: "Error generating assessment",
            error: e.message
        });
    }
});

module.exports = router;
