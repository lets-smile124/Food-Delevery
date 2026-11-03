import BaseApiService from "./BaseApiService";

class CartService extends BaseApiService {
  /**
   * Add item to user's cart in the backend
   * @param {string} itemId
   * @param {string} token
   */
  async addToCart(itemId, token) {
    const response = await this.client.post(
      "/api/cart/add",
      { itemId },
      this.getAuthHeaders(token)
    );
    return response.data;
  }

  /**
   * Remove item from user's cart in the backend
   * @param {string} itemId
   * @param {string} token
   */
  async removeFromCart(itemId, token) {
    const response = await this.client.post(
      "/api/cart/remove",
      { itemId },
      this.getAuthHeaders(token)
    );
    return response.data;
  }

  /**
   * Retrieve user cart items from the backend
   * @param {string} token
   */
  async getCart(token) {
    const response = await this.client.post(
      "/api/cart/get",
      {},
      this.getAuthHeaders(token)
    );
    return response.data;
  }
}

const cartService = new CartService();
export default cartService;
export { CartService };

