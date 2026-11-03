import foodModel from "../models/foodModels.js";
import mediaService from "../services/MediaService.js";
import BaseController from "./BaseController.js";

class FoodController extends BaseController {
  constructor(model = foodModel, media = mediaService) {
    super();
    this.foodModel = model;
    this.mediaService = media;
  }

  /**
   * Add a new food item with uploaded image
   */
  addFood = async (req, res) => {
    try {
      if (!req.file) {
        return this.sendError(res, "Image not uploaded");
      }

      // Upload image to Cloudinary via MediaService
      const result = await this.mediaService.uploadFromBuffer(req.file.buffer);

      // Save Food entity in MongoDB
      const food = new this.foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: result.secure_url,
      });

      await food.save();

      return this.sendSuccess(res, "Food Added");
    } catch (error) {
      return this.handleError(res, error, "Error");
    }
  };

  /**
   * List all food items
   */
  listFood = async (req, res) => {
    try {
      const foods = await this.foodModel.find({});
      return this.sendSuccess(res, { data: foods });
    } catch (error) {
      return this.handleError(res, error, "Error");
    }
  };

  /**
   * Remove a food item and delete its associated image
   */
  removeFood = async (req, res) => {
    try {
      const food = await this.foodModel.findById(req.body.id);

      if (!food) {
        return this.sendError(res, "Food not found");
      }

      // Delete image via MediaService (handles Cloudinary URL or local fallback)
      await this.mediaService.deleteImage(food.image);

      // Delete food from MongoDB
      await this.foodModel.findByIdAndDelete(req.body.id);

      return this.sendSuccess(res, "Food removed");
    } catch (error) {
      return this.handleError(res, error, "Error");
    }
  };
}

const foodController = new FoodController();

export const addFood = foodController.addFood;
export const listFood = foodController.listFood;
export const removeFood = foodController.removeFood;

export default foodController;
export { FoodController };
