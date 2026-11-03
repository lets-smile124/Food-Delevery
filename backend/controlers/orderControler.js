import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import BaseController from "./BaseController.js";

class OrderController extends BaseController {
  constructor(order_model = orderModel, user_model = userModel) {
    super();
    this.orderModel = order_model;
    this.userModel = user_model;
    this.stripeInstance = null;
  }

  /**
   * Lazily retrieve or initialize Stripe client
   */
  getStripe() {
    if (!this.stripeInstance) {
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret) {
        throw new Error("STRIPE_SECRET_KEY is missing from environment variables");
      }
      this.stripeInstance = new Stripe(secret);
    }
    return this.stripeInstance;
  }

  /**
   * Place user order and generate Stripe checkout session
   */
  placeOrder = async (req, res) => {
    // Determine the dynamic frontend URL from request origin/referer or env
    let frontendUrl = "http://localhost:5173";
    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
    if (origin) {
      frontendUrl = origin.replace(/\/+$/, "");
    } else if (process.env.FRONTEND_URL) {
      frontendUrl = process.env.FRONTEND_URL.replace(/\/+$/, "");
    }

    try {
      if (!req.body.items || req.body.items.length === 0) {
        return this.sendError(res, "Order must contain at least one item", 400);
      }

      const newOrder = new this.orderModel({
        userId: req.body.userId,
        items: req.body.items,
        amount: req.body.amount,
        address: req.body.address,
      });

      await newOrder.save();

      // Clear user cart and optionally update saved address
      const userUpdate = { cartData: {} };
      if (req.body.address) {
        const addr = typeof req.body.address === "object"
          ? `${req.body.address.street || ""}, ${req.body.address.city || ""}, ${req.body.address.state || ""} ${req.body.address.zipcode || ""}`.trim()
          : req.body.address;
        if (addr && addr !== ",  ") {
          userUpdate.address = addr;
        }
      }
      await this.userModel.findByIdAndUpdate(req.body.userId, userUpdate);

      // Calculate discount ratio if promo was applied
      let discount = Number(req.body.discount) || 0;
      const promoCode = (req.body.promoCode || "").trim().toUpperCase();

      // Strictly enforce first-time order requirement for promo discounts
      if (promoCode === "NEW_USER" || discount > 0) {
        const previousOrders = await this.orderModel.countDocuments({
          userId: req.body.userId,
          _id: { $ne: newOrder._id },
          $or: [
            { payment: true },
            { status: { $in: ["Food Processing", "Out for delivery", "Delivered"] } },
          ],
        });

        if (previousOrders > 0) {
          discount = 0;
        }
      }

      const rawSubtotal = req.body.items.reduce(
        (sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)),
        0
      );
      const discountRatio = discount > 0 && rawSubtotal > 0
        ? Math.min(0.9, discount / rawSubtotal)
        : 0;

      // Build Stripe line items
      const line_items = req.body.items.map((item) => {
        const itemPrice = Number(item.price) || 0;
        const discountedPrice = discountRatio > 0
          ? Math.max(1, Math.round(itemPrice * (1 - discountRatio)))
          : itemPrice;

        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: String(item.name || "Food Item"),
            },
            unit_amount: Math.round(discountedPrice * 100),
          },
          quantity: Number(item.quantity) || 1,
        };
      });

      // Delivery charges
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Delivery Charges",
          },
          unit_amount: 2 * 100,
        },
        quantity: 1,
      });

      const stripe = this.getStripe();
      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: `${frontendUrl}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${frontendUrl}/verify?success=false&orderId=${newOrder._id}`,
      });

      return this.sendSuccess(res, { session_url: session.url });
    } catch (error) {
      console.error("[placeOrder error]:", error.message || error);
      return this.handleError(res, error, error.message || "Failed to create checkout session");
    }
  };

  /**
   * Verify order payment status
   */
  verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
      if (success === "true" || success === true) {
        await this.orderModel.findByIdAndUpdate(orderId, { payment: true });
        return this.sendSuccess(res, "Paid");
      } else {
        await this.orderModel.findByIdAndDelete(orderId);
        return this.sendSuccess(res, "Not Paid");
      }
    } catch (error) {
      return this.handleError(res, error, "Error");
    }
  };

  /**
   * Get orders placed by a specific user
   */
  userOrders = async (req, res) => {
    try {
      const orders = await this.orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
      return this.sendSuccess(res, { data: orders });
    } catch (error) {
      return this.handleError(res, error, "Error");
    }
  };

  /**
   * List all orders (for admin dashboard)
   */
  listOrders = async (req, res) => {
    try {
      const orders = await this.orderModel.find({}).sort({ date: -1 });
      return this.sendSuccess(res, { data: orders });
    } catch (error) {
      return this.handleError(res, error, "Error");
    }
  };

  /**
   * Update order status
   */
  updateStatus = async (req, res) => {
    try {
      await this.orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
      return this.sendSuccess(res, "Status Updated");
    } catch (error) {
      return this.handleError(res, error, "Error");
    }
  };

  /**
   * Admin removes any order
   */
  deleteOrder = async (req, res) => {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        return this.sendError(res, "Order ID is required", 400);
      }
      const deleted = await this.orderModel.findByIdAndDelete(orderId);
      if (!deleted) {
        return this.sendError(res, "Order not found", 404);
      }
      return this.sendSuccess(res, "Order removed successfully");
    } catch (error) {
      return this.handleError(res, error, "Failed to remove order");
    }
  };

  /**
   * User removes delivered order from history
   */
  deleteUserOrder = async (req, res) => {
    try {
      const { orderId, userId } = req.body;
      if (!orderId) {
        return this.sendError(res, "Order ID is required", 400);
      }
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        return this.sendError(res, "Order not found", 404);
      }
      if (order.userId.toString() !== userId?.toString()) {
        return this.sendError(res, "Unauthorized to delete this order", 403);
      }
      // Only delivered orders can be removed
      if ((order.status || "").trim().toLowerCase() !== "delivered") {
        return this.sendError(
          res,
          "Only delivered orders can be removed from your order history",
          400
        );
      }

      await this.orderModel.findByIdAndDelete(orderId);
      return this.sendSuccess(res, "Order removed from history");
    } catch (error) {
      return this.handleError(res, error, "Failed to remove order from history");
    }
  };

  /**
   * Validate a promo code for first-time orderers
   */
  validatePromo = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      const { promoCode } = req.body;

      if (!userId) {
        return this.sendError(res, "Please sign in to apply promo code", 401);
      }

      if (!promoCode) {
        return this.sendError(res, "Promo code is required", 400);
      }

      const cleanCode = promoCode.trim().toUpperCase();

      if (cleanCode === "NEW_USER") {
        // Count previous orders where payment was made or order is processed/delivered
        const previousOrdersCount = await this.orderModel.countDocuments({
          userId,
          $or: [
            { payment: true },
            { status: { $in: ["Food Processing", "Out for delivery", "Delivered"] } },
          ],
        });

        if (previousOrdersCount > 0) {
          return this.sendError(
            res,
            "Coupon 'NEW_USER' is only valid on your first order. You have already placed previous orders.",
            400
          );
        }

        return this.sendSuccess(res, {
          valid: true,
          promoCode: "NEW_USER",
          discountRate: 0.20,
          message: "First-Order Special: Flat 20% discount applied successfully! 🎉",
        });
      }

      return this.sendError(
        res,
        `Coupon code '${cleanCode}' is invalid. Try 'NEW_USER' on your first feast!`,
        400
      );
    } catch (error) {
      return this.handleError(res, error, "Failed to validate promo code");
    }
  };
}

const orderController = new OrderController();

export const placeOrder = orderController.placeOrder;
export const verifyOrder = orderController.verifyOrder;
export const userOrders = orderController.userOrders;
export const listOrders = orderController.listOrders;
export const updateStatus = orderController.updateStatus;
export const deleteOrder = orderController.deleteOrder;
export const deleteUserOrder = orderController.deleteUserOrder;
export const validatePromo = orderController.validatePromo;

export default orderController;
export { OrderController };
