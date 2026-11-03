import FoodPricingService from "../services/FoodPricingService.js";

class CartCalculator {
  /**
   * Calculate total monetary amount of items in cart with size adjustments
   * @param {Record<string, number>} cartItems
   * @param {Array<{ _id: string, price: number }>} foodList
   * @returns {number} total amount in INR
   */
  static calculateTotal(cartItems = {}, foodList = []) {
    let totalAmount = 0;

    for (const cartKey in cartItems) {
      const quantity = cartItems[cartKey];
      if (quantity > 0) {
        const { foodId, size } = FoodPricingService.parseCartKey(cartKey);
        const itemInfo = foodList.find((product) => product._id === foodId);

        if (itemInfo && itemInfo.price) {
          const unitPrice = FoodPricingService.getPrice(itemInfo.price, size);
          totalAmount += unitPrice * quantity;
        }
      }
    }

    return totalAmount;
  }

  /**
   * Count total items in cart across all items and sizes
   * @param {Record<string, number>} cartItems
   * @returns {number}
   */
  static calculateItemCount(cartItems = {}) {
    let count = 0;
    for (const cartKey in cartItems) {
      if (cartItems[cartKey] > 0) {
        count += cartItems[cartKey];
      }
    }
    return count;
  }

  /**
   * Get total quantity of a specific food item across all sizes
   * @param {Record<string, number>} cartItems
   * @param {string} foodId
   * @returns {number}
   */
  static getFoodTotalQuantity(cartItems = {}, foodId) {
    let count = 0;
    for (const cartKey in cartItems) {
      const { foodId: parsedId } = FoodPricingService.parseCartKey(cartKey);
      if (parsedId === foodId && cartItems[cartKey] > 0) {
        count += cartItems[cartKey];
      }
    }
    return count;
  }

  /**
   * Get item count for a specific food item and specific size
   * @param {Record<string, number>} cartItems
   * @param {string} foodId
   * @param {string} size
   * @returns {number}
   */
  static getFoodSizeQuantity(cartItems = {}, foodId, size = "Medium") {
    const key = FoodPricingService.getCartKey(foodId, size);
    return cartItems[key] || 0;
  }

  /**
   * Build complete list of items in cart with prices and metadata
   * @param {Record<string, number>} cartItems
   * @param {Array<object>} foodList
   * @returns {Array<object>}
   */
  static getCartItemsDetailed(cartItems = {}, foodList = []) {
    const result = [];

    for (const cartKey in cartItems) {
      const quantity = cartItems[cartKey];
      if (quantity > 0) {
        const { foodId, size } = FoodPricingService.parseCartKey(cartKey);
        const food = foodList.find((item) => item._id === foodId);

        if (food) {
          const unitPrice = FoodPricingService.getPrice(food.price, size);
          const sizeOption = FoodPricingService.getSizeOption(size);

          result.push({
            cartKey,
            foodId,
            food,
            size,
            sizeOption,
            unitPrice,
            quantity,
            totalPrice: unitPrice * quantity,
          });
        }
      }
    }

    return result;
  }
}

export default CartCalculator;
