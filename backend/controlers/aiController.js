import { GoogleGenAI } from "@google/genai";
import foodModel from "../models/foodModels.js";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export const aiChat = async (req, res) => {
    console.log("AI controller reached");

    try {
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
You are Foodie AI, a food recommendation assistant
inside a food delivery application.

Your job is to help users discover food from the menu.

Here is the CURRENT food menu from the application's database:

${JSON.stringify(foodContext, null, 2)}

IMPORTANT RULES:

1. Recommend ONLY food items that exist in the menu above.
2. NEVER invent a food item.
3. NEVER invent or change a price.
4. Use the actual name, price, description and category from the menu.
5. If the user asks for something that is not available,
   politely say that it is not currently available.
6. If the user gives a budget, recommend items within that budget.
7. If the user asks for vegetarian/non-vegetarian food,
   use the category and description to make the best recommendation.
8. If the user asks for spicy food, look for relevant words
   in the food name, description or category.
9. Keep answers short and conversational.
10. You can use emojis occasionally.
11. Do not claim that you can place an order or modify the cart.
12. If the question is unrelated to food, politely explain that
    you are designed to help with food discovery.

RESPONSE FORMATTING:

When recommending multiple food items, use this exact format:

🍽️ Food Name
💰 ₹Price
📝 Short description

🍽️ Food Name
💰 ₹Price
📝 Short description

Do NOT use Markdown symbols such as **, *, #, or bullet points.
Keep each food recommendation separated by a blank line.

For example:

🍽️ Greek Salad
💰 ₹100
📝 Fresh salad with cucumber, olives, feta cheese and herbs.

🍽️ Cup Cake
💰 ₹110
📝 A soft and sweet cupcake with a delicious flavor.

At the end, optionally add one short sentence such as:
"Would you like something spicy? 🌶️"

User's question:

${message}
`;

        console.log("Calling Gemini...");

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        console.log("Gemini response received");

        // Safely extract text from Gemini response
        let replyText = "";
        if (typeof response.text === "string") {
            replyText = response.text;
        } else if (response.candidates && response.candidates[0]) {
            replyText = response.candidates[0].content.parts[0].text;
        }

        return res.json({
            success: true,
            reply: replyText
        });

    } catch (error) {

        console.error("GEMINI ERROR:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "AI assistant is currently unavailable."
        });
    }
};