import express from "express";
import multer from "multer";
import {
  loginUser,
  registerUser,
  sendOTP,
  verifyOTP,
  resetPassword,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  updatePreferences,
  changePassword,
  deleteAccount,
} from "../controlers/userControlers.js";
import authMiddleware from "../middleware/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const userRouter = express.Router();

// Public auth endpoints
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/send-otp", sendOTP);
userRouter.post("/verify-otp", verifyOTP);
userRouter.post("/reset-password", resetPassword);

// Protected user profile & preferences endpoints
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.post("/update-profile", authMiddleware, updateProfile);
userRouter.post("/upload-avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
userRouter.post("/delete-avatar", authMiddleware, deleteAvatar);

// Protected address management endpoints
userRouter.post("/address/add", authMiddleware, addAddress);
userRouter.post("/address/update", authMiddleware, updateAddress);
userRouter.post("/address/delete", authMiddleware, deleteAddress);
userRouter.post("/address/default", authMiddleware, setDefaultAddress);

// Preferences & Security
userRouter.post("/preferences", authMiddleware, updatePreferences);
userRouter.post("/change-password", authMiddleware, changePassword);
userRouter.post("/delete-account", authMiddleware, deleteAccount);

export default userRouter;
