import express from "express";
import multer from "multer";
import adminController from "../controlers/adminController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const adminRouter = express.Router();

adminRouter.get("/profile", adminController.getProfile);
adminRouter.post("/update-profile", adminController.updateProfile);
adminRouter.post("/upload-avatar", upload.single("avatar"), adminController.uploadAvatar);
adminRouter.post("/delete-avatar", adminController.deleteAvatar);
adminRouter.post("/security", adminController.updateSecurity);

export default adminRouter;

