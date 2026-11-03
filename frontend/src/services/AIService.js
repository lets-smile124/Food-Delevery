import BaseApiService from "./BaseApiService";

class AIService extends BaseApiService {
  /**
   * Send user message to AI assistant
   * @param {string} message
   */
  async sendMessage(message) {
    const response = await this.client.post("/api/ai/chat", { message });
    return response.data;
  }
}

const aiService = new AIService();
export default aiService;
export { AIService };

