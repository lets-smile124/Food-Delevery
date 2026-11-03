import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  deleteOrder,
  deleteUserOrder,
  listOrders,
  placeOrder,
  updateStatus,
  userOrders,
  verifyOrder,
  validatePromo,
} from "../controlers/orderControler.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.post("/remove", deleteOrder);
orderRouter.post("/user-remove", authMiddleware, deleteUserOrder);
orderRouter.post("/validate-promo", authMiddleware, validatePromo);

export default orderRouter;
