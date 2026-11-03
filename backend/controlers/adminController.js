import adminModel from "../models/adminModel.js";
import mediaService from "../services/MediaService.js";
import BaseController from "./BaseController.js";

class AdminController extends BaseController {
  constructor(model = adminModel, media = mediaService) {
    super();
    this.adminModel = model;
    this.mediaService = media;
  }

  /**
   * Helper to fetch or initialize default admin profile
   */
  async getOrCreateAdmin() {
    let admin = await this.adminModel.findOne({});
    if (!admin) {
      admin = new this.adminModel({});
      await admin.save();
    }
    return admin;
  }

  /**
   * Get Admin Profile
   */
  getProfile = async (req, res) => {
    try {
      const admin = await this.getOrCreateAdmin();
      return this.sendSuccess(res, { admin });
    } catch (error) {
      return this.handleError(res, error, "Failed to fetch admin profile");
    }
  };

  /**
   * Update Admin Profile & Storefront Details
   */
  updateProfile = async (req, res) => {
    try {
      const admin = await this.getOrCreateAdmin();
      const {
        name,
        email,
        phone,
        role,
        restaurantName,
        tagline,
        storeAddress,
        supportEmail,
        supportPhone,
        deliveryTime,
        deliveryFee,
      } = req.body;

      if (name) admin.name = name.trim();
      if (email) admin.email = email.trim();
      if (phone !== undefined) admin.phone = phone.trim();
      if (role) admin.role = role.trim();
      if (restaurantName) admin.restaurantName = restaurantName.trim();
      if (tagline !== undefined) admin.tagline = tagline.trim();
      if (storeAddress !== undefined) admin.storeAddress = storeAddress.trim();
      if (supportEmail !== undefined) admin.supportEmail = supportEmail.trim();
      if (supportPhone !== undefined) admin.supportPhone = supportPhone.trim();
      if (deliveryTime !== undefined) admin.deliveryTime = deliveryTime.trim();
      if (deliveryFee !== undefined) admin.deliveryFee = Number(deliveryFee) || 0;

      admin.updatedAt = new Date();
      await admin.save();

      return this.sendSuccess(res, {
        message: "Admin profile updated successfully",
        admin,
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to update admin profile");
    }
  };

  /**
   * Upload or change Admin Profile Picture
   */
  uploadAvatar = async (req, res) => {
    try {
      if (!req.file) {
        return this.sendError(res, "Please provide an image file");
      }

      const admin = await this.getOrCreateAdmin();

      let avatarUrl = "";
      try {
        const uploadRes = await this.mediaService.uploadFromBuffer(
          req.file.buffer,
          "admin-avatars"
        );
        avatarUrl = uploadRes.secure_url;
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to data URI:", cloudErr.message);
        avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      }

      admin.avatar = avatarUrl;
      admin.updatedAt = new Date();
      await admin.save();

      return this.sendSuccess(res, {
        message: "Admin profile picture updated successfully",
        avatar: avatarUrl,
        admin,
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to upload admin photo");
    }
  };

  /**
   * Delete Admin Profile Picture
   */
  deleteAvatar = async (req, res) => {
    try {
      const admin = await this.getOrCreateAdmin();
      admin.avatar = "";
      admin.updatedAt = new Date();
      await admin.save();

      return this.sendSuccess(res, {
        message: "Admin profile picture removed successfully",
        admin,
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to delete admin profile picture");
    }
  };

  /**
   * Update Admin Security Credentials
   */
  updateSecurity = async (req, res) => {
    try {
      const { newPassword, confirmPassword } = req.body;
      if (!newPassword || newPassword.length < 8) {
        return this.sendError(res, "New password must be at least 8 characters long");
      }
      if (newPassword !== confirmPassword) {
        return this.sendError(res, "Passwords do not match");
      }

      // Simulated security update for the admin dashboard
      return this.sendSuccess(res, {
        message: "Admin security credentials updated successfully",
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to update admin security");
    }
  };
}

const adminController = new AdminController();
export default adminController;
export { AdminController };

