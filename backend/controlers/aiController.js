import foodModel from "../models/foodModels.js";
import aiService from "../services/AIService.js";
import BaseController from "./BaseController.js";

class AIController extends BaseController {
  constructor(model = foodModel, service = aiService) {
    super();
    this.foodModel = model;
    this.aiService = service;
  }

  /**
   * Handle AI recommendation chat requests
   */
  aiChat = async (req, res) => {
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
        return this.sendError(res, "Message is required");
      }

      // Fetch food catalog from MongoDB
      const foodList = await this.foodModel.find({}).lean();
      console.log("Food items found:", foodList.length);

      // Build structured prompt
      const prompt = this.aiService.buildFoodRecommendationPrompt(foodList, message);

      // Generate AI response
      const reply = await this.aiService.generateRecommendation(prompt, apiKey);

      return this.sendSuccess(res, { reply });
    } catch (error) {
      console.error("GEMINI ERROR:", error.message || error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate food recommendations",
        details: error.message
      });
    }
  };
}

const aiController = new AIController();

export const aiChat = aiController.aiChat;
export default aiController;
export { AIController };
