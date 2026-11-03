import BaseApiService from "./BaseApiService";

class FoodService extends BaseApiService {
  /**
   * Fetch all food items from the catalog
   */
  async getFoodList() {
    const response = await this.client.get("/api/food/list");
    return response.data;
  }
}

const foodService = new FoodService();
export default foodService;
export { FoodService };

