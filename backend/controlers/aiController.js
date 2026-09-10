import { GoogleGenAI } from "@google/genai";
import foodModel from "../models/foodModels.js";

export const aiChat = async (req, res) => {
    console.log("AI controller reached");

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in environment variables!");
            return res.status(500).json({
                success: false,
                message: "AI service key is missing on the server. Please configure GEMINI_API_KEY."
            });
        }

        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.json({
                success: false,
                message: "Message is required"
            });
        }

        // Get food data from MongoDB
        const foodList = await foodModel.find({}).lean();

        console.log("Food items found:", foodList.length);

        // Keep only the information AI actually needs
        const foodContext = foodList.map((food) => ({
            name: food.name,
            description: food.description,
            price: food.price,
            category: food.category
        }));

        const prompt = `
You are Foodie AI, a food recommendation assistant inside a food delivery application.

Your job is to help users discover food from the menu.

Here is the CURRENT food menu from the application's database:

${JSON.stringify(foodContext, null, 2)}

IMPORTANT RULES:
1. Recommend ONLY food items that exist in the menu above.
2. NEVER invent a food item or price.
3. Use the actual name, price, description and category from the menu.
4. If the user asks for something not available, politely say that it is not currently available.
5. If the user gives a budget, recommend items within that budget.
6. Keep answers short, friendly, and conversational.
7. You can use emojis.
8. User's question: "${message}"
`;

        const ai = new GoogleGenAI({ apiKey });

        // Try primary model with fallback support
        const candidateModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-3.6-flash"];
        let replyText = "";
        let lastError = null;

        for (const modelName of candidateModels) {
            try {
                console.log(`Calling Gemini with model: ${modelName}...`);
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: prompt
                });

                if (typeof response.text === "string") {
                    replyText = response.text;
                } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
                    replyText = response.candidates[0].content.parts[0].text;
                }

                if (replyText) {
                    console.log(`Gemini response received from ${modelName}`);
                    break;
                }
            } catch (err) {
                console.warn(`Model ${modelName} failed, trying next fallback:`, err.message);
                lastError = err;
            }
        }

        if (!replyText) {
            throw lastError || new Error("All Gemini models failed to generate response.");
        }

        return res.json({
            success: true,
            reply: replyText
        });

    } catch (error) {
        console.error("GEMINI ERROR:", error.message || error);

        return res.status(500).json({
            success: false,
            message: "AI assistant is currently unavailable."
        });
    }
};