const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const candidates = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-pro",
    "gemini-1.5-pro-001", 
    "gemini-pro",
    "gemini-1.0-pro"
];

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log("Testing models...");

    for (const modelName of candidates) {
        try {
            console.log(`Testing: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello");
            const response = await result.response;
            console.log(`SUCCESS with: ${modelName}`);
            console.log(`Response: ${response.text()}`);
            return; // Stop after first success
        } catch (error) {
            console.log(`FAILED ${modelName}: ${error.message.split(' ')[0]}...`); // Short error
        }
    }
    console.log("All candidates failed.");
}

testModels();
