import { GoogleGenAI } from "@google/genai";

class AIService {
  constructor() {
    this.candidateModels = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-2.0-flash",
      "gemini-3.6-flash"
    ];
  }

  /**
   * Build the prompt injecting menu data and user question
   * @param {Array} foodItems
   * @param {string} userMessage
   * @returns {string} formatted prompt
   */
  buildFoodRecommendationPrompt(foodItems, userMessage) {
    const foodContext = foodItems.map((food) => ({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category
    }));

    return `
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
8. User's question: "${userMessage}"
`;
  }

  /**
   * Generate AI recommendation response with fallback across model versions
   * @param {string} prompt
   * @param {string} apiKey
   * @returns {Promise<string>} AI generated reply
   */
  async generateRecommendation(prompt, apiKey) {
    const ai = new GoogleGenAI({ apiKey });
    let replyText = "";
    let lastError = null;

    for (const modelName of this.candidateModels) {
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
          return replyText;
        }
      } catch (err) {
        console.warn(`Model ${modelName} failed, trying next fallback:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error("All Gemini models failed to generate response.");
  }
}

const aiService = new AIService();
export default aiService;
export { AIService };

