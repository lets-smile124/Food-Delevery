export const FOOD_SIZES = {
  Small: {
    key: "Small",
    name: "Small",
    tagline: "Single Serving",
    multiplier: 0.8,
    badge: "S",
    description: "Ideal for a light meal or personal snack"
  },
  Medium: {
    key: "Medium",
    name: "Medium",
    tagline: "Regular Serving",
    multiplier: 1.0,
    badge: "M",
    description: "Perfect standard portion for 1 person"
  },
  Large: {
    key: "Large",
    name: "Large",
    tagline: "Hearty Portion",
    multiplier: 1.35,
    badge: "L",
    description: "Generous portion for hearty appetite or sharing"
  }
};

// Backwards-compatible alias
export const BOWL_SIZES = FOOD_SIZES;

class FoodPricingService {
  /**
   * Available size keys
   */
  static SIZE_KEYS = ["Small", "Medium", "Large"];

  /**
   * Pick a random size between Small, Medium, and Large
   * @returns {"Small"|"Medium"|"Large"}
   */
  static getRandomSize() {
    const keys = this.SIZE_KEYS;
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }

  /**
   * Get adjusted price based on base price and size
   * @param {number} basePrice
   * @param {string} size
   * @returns {number}
   */
  static getPrice(basePrice, size = "Medium") {
    const config = FOOD_SIZES[size] || FOOD_SIZES.Medium;
    return Math.round(Number(basePrice) * config.multiplier);
  }

  /**
   * Create compound cart key for food item and size
   * @param {string} foodId
   * @param {string} size
   * @returns {string}
   */
  static getCartKey(foodId, size = "Medium") {
    return `${foodId}_${size}`;
  }

  /**
   * Parse compound cart key into foodId and size
   * @param {string} key
   * @returns {{ foodId: string, size: string }}
   */
  static parseCartKey(key) {
    if (!key || typeof key !== "string") {
      return { foodId: key, size: "Medium" };
    }
    const idx = key.lastIndexOf("_");
    if (idx !== -1) {
      const foodId = key.substring(0, idx);
      const size = key.substring(idx + 1);
      if (FOOD_SIZES[size]) {
        return { foodId, size };
      }
    }
    return { foodId: key, size: "Medium" };
  }

  /**
   * Get size metadata
   * @param {string} size
   */
  static getSizeOption(size = "Medium") {
    return FOOD_SIZES[size] || FOOD_SIZES.Medium;
  }
}

export default FoodPricingService;
export { FoodPricingService };
