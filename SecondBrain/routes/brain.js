const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();
const userAuth = require("../middleware/auth");
const Content = require("../models/content");
require("dotenv").config();

// Initialize model dynamically
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateWithFallback(prompt) {
    const fallbackModels = [
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-2.0-flash",
        "gemini-flash-lite-latest"
    ];

    let lastError;
    for (const modelName of fallbackModels) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
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
            throw e;
        }
    }
    throw lastError;
}

router.post("/ask-brain", userAuth, async (req, res) => {
    try {
        const { question, history } = req.body;
        const userId = req.user._id;

        // Fetch user's content to use as context
        const userContent = await Content.find({ userId: userId });
        
        // Prepare context from user's content
        const context = userContent.map(c => `Title: ${c.title}\nType: ${c.type}\nTags: ${c.tags ? c.tags.join(", ") : "None"}\nLink: ${c.link}\nDescription: ${c.description || ""}`).join("\n\n");

        const historyText = history && Array.isArray(history) ? history.map(h => `${h.role === 'ai' ? 'Assistant' : 'User'}: ${h.content}`).join('\n') : "No previous history.";

        const prompt = `You are a helpful "Second Brain" assistant designed to help users learn and retrieve information from their saved content.
        
        CHAT HISTORY (Use this to understand follow-up questions like "yes" or "no"):
        ${historyText}

        USER'S KNOWLEDGE BASE:
        ${context}

        CURRENT USER QUESTION: ${question}

        INSTRUCTIONS FOR YOUR RESPONSE:
        1. If the CURRENT USER QUESTION is a follow up like "yes" or "Yes" indicating they want more questions based on the chat history, DO NOT summarize the content again. Simply provide 5 new, advanced questions and answers about the topic previously discussed.
        2. If the user is asking "no", politely acknowledge and ask how else you can help.
        3. If the user asks about a new topic/video/article, check the Knowledge Base. If found, use the Title, Type, and URL with your pre-trained knowledge to deeply explain the *actual subject matter and core concepts*. Explicitly mention the title of the saved item.
        4. When explaining a new topic, always generate 3 important Questions & Answers (Q&A) to test the user's understanding.
        5. CRITICAL: NO MATTER WHAT, AT THE VERY END OF YOUR RESPONSE, you MUST literally append this exact sentence on a new line: "Would you like me to generate more test questions about this topic? (Yes/No)"
        `;

        // Fallback to avoid 503
        const result = await generateWithFallback(prompt);
        const response = await result.response;
        const text = response.text();

        // Simple source matching (basic heuristic)
        const sources = userContent.filter(c => 
            text.toLowerCase().includes(c.title.toLowerCase()) || 
            question.toLowerCase().includes(c.title.toLowerCase())
        ).slice(0, 3).map(c => ({
            title: c.title,
            link: c.link,
            type: c.type
        }));

        res.json({
            answer: text,
            suggestedContent: sources
        });

    } catch (e) {
        console.error("AI Error:", e);
        res.status(500).json({ 
            message: "Error processing request",
            error: e.message,
            details: e.toString()
        });
    }
});

module.exports = router;
