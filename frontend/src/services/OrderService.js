import BaseApiService from "./BaseApiService";

class OrderService extends BaseApiService {
  /**
   * Place an order and get Stripe checkout session URL
   * @param {object} orderData
   * @param {string} token
   */
  async placeOrder(orderData, token) {
    const response = await this.client.post("/api/order/place", orderData, this.getAuthHeaders(token));
    return response.data;
  }

  /**
   * Verify an order payment status
   * @param {string} orderId
   * @param {boolean|string} success
   */
  async verifyOrder(orderId, success) {
    const response = await this.client.post("/api/order/verify", { orderId, success });
    return response.data;
  }

  /**
   * Fetch authenticated user's orders
   * @param {string} token
   */
  async getUserOrders(token) {
    const response = await this.client.post("/api/order/userorders", {}, this.getAuthHeaders(token));
    return response.data;
  }

  /**
   * Remove delivered order from history
   * @param {string} orderId
   * @param {string} token
   */
  async removeUserOrder(orderId, token) {
    const response = await this.client.post(
      "/api/order/user-remove",
      { orderId },
      this.getAuthHeaders(token)
    );
    return response.data;
  }

  /**
   * Validate a promo code against user order history
   * @param {string} promoCode
   * @param {string} token
   */
  async validatePromo(promoCode, token) {
    const response = await this.client.post(
      "/api/order/validate-promo",
      { promoCode },
      this.getAuthHeaders(token)
    );
    return response.data;
  }
}

const orderService = new OrderService();
export default orderService;
export { OrderService };
