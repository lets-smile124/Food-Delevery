import userModel from "../models/userModel.js";
import BaseController from "./BaseController.js";

class CartController extends BaseController {
  constructor(model = userModel) {
    super();
    this.userModel = model;
  }

  /**
   * Add item to user cart
   */
  addToCart = async (req, res) => {
    try {
      const userData = await this.userModel.findById(req.body.userId);
      const cartData = (userData && userData.cartData) ? { ...userData.cartData } : {};

      if (!cartData[req.body.itemId]) {
        cartData[req.body.itemId] = 1;
      } else {
        cartData[req.body.itemId] += 1;
      }

      await this.userModel.findByIdAndUpdate(req.body.userId, { cartData });
      return this.sendSuccess(res, "Added to cart");
    } catch (error) {
      return this.handleError(res, error, "Error");
    }
  };

  /**
   * Remove item from user cart
   */
  removeFromCart = async (req, res) => {
    try {
      const userData = await this.userModel.findById(req.body.userId);
      const cartData = (userData && userData.cartData) ? { ...userData.cartData } : {};

      if (cartData[req.body.itemId] > 0) {
        cartData[req.body.itemId] -= 1;
      }

      await this.userModel.findByIdAndUpdate(req.body.userId, { cartData });
      return this.sendSuccess(res, "Removed from cart");
    } catch (error) {
      return this.handleError(res, error, "Error");
    }
  };

  /**
   * Fetch user cart data
   */
  getCart = async (req, res) => {
    try {
      console.log("USER ID:", req.body.userId);
      const userData = await this.userModel.findById(req.body.userId);

      if (!userData) {
        return res.json({
          success: false,
          message: "User not found",
          cartData: {}
        });
      }

      const cartData = userData.cartData || {};

      return this.sendSuccess(res, { cartData });
    } catch (error) {
      console.log("GET CART ERROR:", error);
      return res.json({
        success: false,
        message: "Error",
        cartData: {}
      });
    }
  };
}

const cartController = new CartController();

export const addToCart = cartController.addToCart;
export const removeFromCart = cartController.removeFromCart;
export const getCart = cartController.getCart;

export default cartController;
export { CartController };
