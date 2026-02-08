import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).skipped;
        // The SDK doesn't have a direct "listModels" on the instance easily accessible in all versions without admin usage sometimes, 
        // but honestly the error message suggested calling ListModels.
        // Let's try to infer from a basic request or check documentation behavior.
        // Wait, the SDK wrapping might hide the list endpoint. 
        // Let's try raw fetch to valid endpoint if SDK doesn't expose it easily, 
        // but actually `genAI.getGenerativeModel` is just a factory. 

        // Changing approach: The error message came from the server, implying the SDK *is* working but the model name is wrong.
        // I will try a raw REST call to list models using the key to see what's there.
        // https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY

        const key = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("Error listing models:", JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error(e);
    }
}

listModels();
