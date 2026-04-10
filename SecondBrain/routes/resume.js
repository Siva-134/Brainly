const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const upload = multer({ storage: multer.memoryStorage() });

router.post('/resume/test', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let resumeText = '';
        if (req.file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text;
        } else {
            resumeText = req.file.buffer.toString('utf-8');
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
        const prompt = `You are a strict technical interviewer. Review the following resume text and generate a test evaluating the candidate's skills mentioned in the resume. 
The test should contain:
1. 5 multiple choice questions testing their core skills.
2. Provide feedback on where the user is strong and exactly where the user is negative or weak, and suggestions to improve.
Provide the response in JSON format exactly like this:
{
    "questions": [
        {
            "question": "question text",
            "options": ["opt1", "opt2", "opt3", "opt4"],
            "correctIndex": 0,
            "explanation": "explanation text"
        }
    ],
    "feedback": {
        "strongAreas": "text explaining strengths",
        "weakAreas": "text explaining weaknesses",
        "suggestions": "text providing actionable suggestions"
    }
}
Resume Text:
${resumeText.substring(0, 10000)}
`;
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        responseText = responseText.replace(/```json\n?|```/g, '').trim();
        const testData = JSON.parse(responseText);

        res.json(testData);

    } catch (error) {
        console.error("Resume test error:", error);
        res.status(500).json({ error: 'Failed to process resume test', details: error.message, stack: error.stack });
    }
});

router.post('/resume/ats', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const jobDescription = req.body.jobDescription;
        if (!jobDescription) {
            return res.status(400).json({ error: 'Job description is required' });
        }

        let resumeText = '';
        if (req.file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text;
        } else {
            resumeText = req.file.buffer.toString('utf-8');
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
        const prompt = `You are an expert ATS (Applicant Tracking System). Review the following resume against the provided Job Description.
Calculate an ATS score from 0 to 100 based on keyword match, experience relevance, and skills.
Provide feedback on what the user needs to update or change to improve their score for this specific job.
Format the output EXACTLY in JSON:
{
    "score": 85,
    "feedback": "Detailed feedback on what matches.",
    "improvements": ["Improvement 1", "Improvement 2"]
}

Job Description:
${jobDescription.substring(0, 5000)}

Resume Text:
${resumeText.substring(0, 10000)}
`;
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        responseText = responseText.replace(/```json\n?|```/g, '').trim();
        const atsData = JSON.parse(responseText);

        res.json(atsData);

    } catch (error) {
        console.error("ATS score error:", error);
        res.status(500).json({ error: 'Failed to calculate ATS score', details: error.message, stack: error.stack });
    }
});

module.exports = router;
