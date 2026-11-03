import axios from "axios";

class BaseApiService {
  constructor(baseURL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/+$/, "")) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
    });
  }

  /**
   * Helper to format authentication headers
   * @param {string} token
   * @returns {object} header configuration
   */
  getAuthHeaders(token) {
    return token ? { headers: { token } } : {};
  }
}

export default BaseApiService;

