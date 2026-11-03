import userModel from "../models/userModel.js";
import otpModel from "../models/otpModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import BaseController from "./BaseController.js";
import emailService from "../services/EmailService.js";
import mediaService from "../services/MediaService.js";

class UserController extends BaseController {
  constructor(model = userModel, otp_model = otpModel, media = mediaService) {
    super();
    this.userModel = model;
    this.otpModel = otp_model;
    this.mediaService = media;
  }

  /**
   * Generate JWT authentication token
   * @param {string} id - user id
   * @returns {string} signed JWT token
   */
  createToken(id) {
    const secret = process.env.JWT_SECRET || "default_jwt_secret";
    return jwt.sign({ id }, secret, { expiresIn: "7d" });
  }

  /**
   * User login
   */
  loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return this.sendError(res, "Email and password are required");
      }

      const user = await this.userModel.findOne({ email });

      if (!user) {
        return this.sendError(res, "User does not exist");
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return this.sendError(res, "Invalid credentials");
      }

      const token = this.createToken(user._id);

      return this.sendSuccess(res, {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          dob: user.dob || "",
          avatar: user.avatar || "",
          isEmailVerified: user.isEmailVerified ?? true,
          address: user.address || "",
          addresses: user.addresses || [],
          preferences: user.preferences || {},
        },
      });
    } catch (error) {
      return this.handleError(res, error, "Login failed");
    }
  };

  /**
   * Send 6-digit OTP for Registration or Forgot Password
   */
  sendOTP = async (req, res) => {
    const { email, purpose = "register", name = "" } = req.body;

    try {
      if (!email || !validator.isEmail(email)) {
        return this.sendError(res, "Please provide a valid email address");
      }

      const cleanEmail = email.toLowerCase().trim();

      // For registration: check if already registered
      if (purpose === "register") {
        const userExists = await this.userModel.findOne({ email: cleanEmail });
        if (userExists) {
          return this.sendError(res, "Email is already registered. Please login.");
        }
      }

      // For forgot password: verify user exists
      if (purpose === "forgot_password") {
        const userExists = await this.userModel.findOne({ email: cleanEmail });
        if (!userExists) {
          return this.sendError(res, "No account found with this email.");
        }
      }

      // Generate 6-digit numeric OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Upsert OTP record
      await this.otpModel.findOneAndUpdate(
        { email: cleanEmail, purpose },
        { otp: generatedOtp, createdAt: new Date() },
        { upsert: true, returnDocument: 'after' }
      );

      // Send OTP via EmailService
      const emailResult = await emailService.sendOTPEmail({
        email: cleanEmail,
        otp: generatedOtp,
        purpose,
        name,
      });

      return this.sendSuccess(res, {
        message: emailResult.live
          ? `Verification code sent to ${cleanEmail}`
          : `Verification code generated for ${cleanEmail}`,
        email: cleanEmail,
        isLive: !!emailResult.live,
        devOtp: emailResult.live ? undefined : generatedOtp,
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to send verification code");
    }
  };

  /**
   * Verify an OTP code
   */
  verifyOTP = async (req, res) => {
    const { email, otp, purpose = "register" } = req.body;

    try {
      if (!email || !otp) {
        return this.sendError(res, "Email and OTP are required");
      }

      const cleanEmail = email.toLowerCase().trim();
      const record = await this.otpModel.findOne({ email: cleanEmail, purpose });

      if (!record || record.otp !== otp.trim()) {
        return this.sendError(res, "Invalid or expired verification code");
      }

      return this.sendSuccess(res, {
        verified: true,
        message: "Code verified successfully",
      });
    } catch (error) {
      return this.handleError(res, error, "Verification failed");
    }
  };

  /**
   * User registration with OTP verification
   */
  registerUser = async (req, res) => {
    const { name, password, email, otp } = req.body;

    try {
      const cleanEmail = (email || "").toLowerCase().trim();

      const exists = await this.userModel.findOne({ email: cleanEmail });
      if (exists) {
        return this.sendError(res, "User already exists with this email");
      }

      if (!validator.isEmail(cleanEmail)) {
        return this.sendError(res, "Please enter a valid email");
      }

      if (!password || password.length < 8) {
        return this.sendError(res, "Please enter a strong password (min 8 characters)");
      }

      // Verify OTP record
      if (!otp) {
        return this.sendError(res, "OTP verification code is required");
      }

      const otpRecord = await this.otpModel.findOne({
        email: cleanEmail,
        purpose: "register",
      });

      if (!otpRecord || otpRecord.otp !== otp.trim()) {
        return this.sendError(res, "Invalid or expired verification code. Please request a new one.");
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new this.userModel({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        isEmailVerified: true,
      });

      const user = await newUser.save();

      // Clean up used OTP
      await this.otpModel.deleteOne({ email: cleanEmail, purpose: "register" });

      // Send warm welcome email with 20% discount coupon
      emailService
        .sendWelcomeEmail({ email: cleanEmail, name: user.name })
        .catch((err) => console.log("[Welcome Email Non-blocking Error]:", err.message));

      const token = this.createToken(user._id);

      return this.sendSuccess(res, {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          dob: user.dob || "",
          avatar: user.avatar || "",
          isEmailVerified: true,
          address: user.address || "",
          addresses: user.addresses || [],
          preferences: user.preferences || {},
        },
      });
    } catch (error) {
      return this.handleError(res, error, "Registration failed");
    }
  };

  /**
   * Reset Password with OTP Verification
   */
  resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
      if (!email || !otp || !newPassword) {
        return this.sendError(res, "Email, OTP, and new password are required");
      }

      if (newPassword.length < 8) {
        return this.sendError(res, "New password must be at least 8 characters long");
      }

      const cleanEmail = email.toLowerCase().trim();

      const otpRecord = await this.otpModel.findOne({
        email: cleanEmail,
        purpose: "forgot_password",
      });

      if (!otpRecord || otpRecord.otp !== otp.trim()) {
        return this.sendError(res, "Invalid or expired OTP code.");
      }

      const user = await this.userModel.findOne({ email: cleanEmail });
      if (!user) {
        return this.sendError(res, "No user found with this email");
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      await this.otpModel.deleteOne({ email: cleanEmail, purpose: "forgot_password" });

      return this.sendSuccess(res, {
        message: "Password reset successfully. You can now log in with your new password.",
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to reset password");
    }
  };

  /**
   * Get logged-in user profile
   */
  getProfile = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      const user = await this.userModel.findById(userId).select("-password");

      if (!user) {
        return this.sendError(res, "User not found");
      }

      return this.sendSuccess(res, { user });
    } catch (error) {
      return this.handleError(res, error, "Error fetching profile");
    }
  };

  /**
   * Update logged-in user personal profile details
   */
  updateProfile = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      const { name, phone, dob, address } = req.body;

      const updateData = {};
      if (name) {
        if (name.trim().length < 2) {
          return this.sendError(res, "Name must be at least 2 characters long");
        }
        updateData.name = name.trim();
      }
      if (phone !== undefined) updateData.phone = phone.trim();
      if (dob !== undefined) updateData.dob = dob.trim();
      if (address !== undefined) updateData.address = address.trim();

      const user = await this.userModel
        .findByIdAndUpdate(userId, updateData, { returnDocument: "after" })
        .select("-password");

      if (!user) {
        return this.sendError(res, "User not found");
      }

      return this.sendSuccess(res, {
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      return this.handleError(res, error, "Error updating profile");
    }
  };

  /**
   * Upload or change profile avatar
   */
  uploadAvatar = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      if (!req.file) {
        return this.sendError(res, "Please provide an image file");
      }

      let avatarUrl = "";
      try {
        const uploadRes = await this.mediaService.uploadFromBuffer(
          req.file.buffer,
          "user-avatars"
        );
        avatarUrl = uploadRes.secure_url;
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to data URI:", cloudErr.message);
        avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      }

      const user = await this.userModel
        .findByIdAndUpdate(userId, { avatar: avatarUrl }, { returnDocument: "after" })
        .select("-password");

      if (!user) {
        return this.sendError(res, "User not found");
      }

      return this.sendSuccess(res, {
        message: "Profile photo updated successfully",
        avatar: avatarUrl,
        user,
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to upload profile photo");
    }
  };

  /**
   * Delete user profile picture
   */
  deleteAvatar = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      const user = await this.userModel
        .findByIdAndUpdate(userId, { avatar: "" }, { returnDocument: "after" })
        .select("-password");

      if (!user) {
        return this.sendError(res, "User not found");
      }

      return this.sendSuccess(res, {
        message: "Profile picture removed successfully",
        user,
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to remove profile picture");
    }
  };

  /**
   * Add a new delivery address
   */
  addAddress = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      const { type, houseNo, street, city, state, pincode, landmark, instructions, isDefault } = req.body;

      if (!street || !city || !pincode) {
        return this.sendError(res, "Street, City, and Pincode are required");
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        return this.sendError(res, "User not found");
      }

      if (!user.addresses) user.addresses = [];

      const willBeDefault = isDefault || user.addresses.length === 0;

      if (willBeDefault) {
        user.addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      const newAddress = {
        type: type || "Home",
        houseNo: houseNo || "",
        street: street.trim(),
        city: city.trim(),
        state: state || "",
        pincode: pincode.trim(),
        landmark: landmark || "",
        instructions: instructions || "",
        isDefault: willBeDefault,
      };

      user.addresses.push(newAddress);

      if (willBeDefault) {
        user.address = `${houseNo ? houseNo + ", " : ""}${street}, ${city}, ${state ? state + " " : ""}${pincode}`.trim();
      }

      await user.save();

      return this.sendSuccess(res, {
        message: "Address added successfully",
        addresses: user.addresses,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          address: user.address,
          addresses: user.addresses,
        },
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to add address");
    }
  };

  /**
   * Update an existing delivery address
   */
  updateAddress = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      const { addressId, type, houseNo, street, city, state, pincode, landmark, instructions, isDefault } = req.body;

      if (!addressId) {
        return this.sendError(res, "Address ID is required");
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        return this.sendError(res, "User not found");
      }

      const addr = user.addresses.id(addressId);
      if (!addr) {
        return this.sendError(res, "Address not found");
      }

      if (isDefault) {
        user.addresses.forEach((a) => {
          a.isDefault = false;
        });
        addr.isDefault = true;
      }

      if (type) addr.type = type;
      if (houseNo !== undefined) addr.houseNo = houseNo;
      if (street) addr.street = street.trim();
      if (city) addr.city = city.trim();
      if (state !== undefined) addr.state = state;
      if (pincode) addr.pincode = pincode.trim();
      if (landmark !== undefined) addr.landmark = landmark;
      if (instructions !== undefined) addr.instructions = instructions;

      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      if (defaultAddr) {
        user.address = `${defaultAddr.houseNo ? defaultAddr.houseNo + ", " : ""}${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.state ? defaultAddr.state + " " : ""}${defaultAddr.pincode}`.trim();
      }

      await user.save();

      return this.sendSuccess(res, {
        message: "Address updated successfully",
        addresses: user.addresses,
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to update address");
    }
  };

  /**
   * Delete a delivery address
   */
  deleteAddress = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      const { addressId } = req.body;

      if (!addressId) {
        return this.sendError(res, "Address ID is required");
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        return this.sendError(res, "User not found");
      }

      const target = user.addresses.id(addressId);
      if (!target) {
        return this.sendError(res, "Address not found");
      }

      const wasDefault = target.isDefault;
      user.addresses.pull({ _id: addressId });

      if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }

      const defaultAddr = user.addresses.find((a) => a.isDefault);
      user.address = defaultAddr
        ? `${defaultAddr.houseNo ? defaultAddr.houseNo + ", " : ""}${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.state ? defaultAddr.state + " " : ""}${defaultAddr.pincode}`.trim()
        : "";

      await user.save();

      return this.sendSuccess(res, {
        message: "Address deleted successfully",
        addresses: user.addresses,
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to delete address");
    }
  };

  /**
   * Set an address as the default delivery address
   */
  setDefaultAddress = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      const { addressId } = req.body;

      if (!addressId) {
        return this.sendError(res, "Address ID is required");
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        return this.sendError(res, "User not found");
      }

      let found = false;
      user.addresses.forEach((addr) => {
        if (addr._id.toString() === addressId) {
          addr.isDefault = true;
          found = true;
          user.address = `${addr.houseNo ? addr.houseNo + ", " : ""}${addr.street}, ${addr.city}, ${addr.state ? addr.state + " " : ""}${addr.pincode}`.trim();
        } else {
          addr.isDefault = false;
        }
      });

      if (!found) {
        return this.sendError(res, "Address not found");
      }

      await user.save();

      return this.sendSuccess(res, {
        message: "Default delivery address updated",
        addresses: user.addresses,
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to set default address");
    }
  };

  /**
   * Update user dietary and notification preferences
   */
  updatePreferences = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      const { preferences } = req.body;

      if (!preferences || typeof preferences !== "object") {
        return this.sendError(res, "Invalid preferences payload");
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        return this.sendError(res, "User not found");
      }

      const current = user.preferences?.toObject ? user.preferences.toObject() : (user.preferences || {});
      user.preferences = {
        ...current,
        ...preferences,
      };

      await user.save();

      return this.sendSuccess(res, {
        message: "Preferences updated successfully",
        preferences: user.preferences,
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to update preferences");
    }
  };

  /**
   * Change user password with current password verification
   */
  changePassword = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return this.sendError(res, "Current and new password are required");
      }

      if (newPassword.length < 8) {
        return this.sendError(res, "New password must be at least 8 characters long");
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        return this.sendError(res, "User not found");
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return this.sendError(res, "Incorrect current password");
      }

      const isSame = await bcrypt.compare(newPassword, user.password);
      if (isSame) {
        return this.sendError(res, "New password cannot be the same as your old password");
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      return this.sendSuccess(res, {
        message: "Password changed successfully",
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to change password");
    }
  };

  /**
   * Permanently delete user account
   */
  deleteAccount = async (req, res) => {
    try {
      const userId = req.userId || req.body?.userId;
      const { password } = req.body;

      if (!password) {
        return this.sendError(res, "Password confirmation is required to delete your account");
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        return this.sendError(res, "User not found");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return this.sendError(res, "Incorrect password. Cannot delete account.");
      }

      await this.userModel.findByIdAndDelete(userId);

      return this.sendSuccess(res, {
        message: "Your account has been permanently deleted",
      });
    } catch (error) {
      return this.handleError(res, error, "Failed to delete account");
    }
  };
}

const userController = new UserController();

export const loginUser = userController.loginUser;
export const registerUser = userController.registerUser;
export const sendOTP = userController.sendOTP;
export const verifyOTP = userController.verifyOTP;
export const resetPassword = userController.resetPassword;
export const getProfile = userController.getProfile;
export const updateProfile = userController.updateProfile;
export const uploadAvatar = userController.uploadAvatar;
export const deleteAvatar = userController.deleteAvatar;
export const addAddress = userController.addAddress;
export const updateAddress = userController.updateAddress;
export const deleteAddress = userController.deleteAddress;
export const setDefaultAddress = userController.setDefaultAddress;
export const updatePreferences = userController.updatePreferences;
export const changePassword = userController.changePassword;
export const deleteAccount = userController.deleteAccount;

export default userController;
export { UserController };
