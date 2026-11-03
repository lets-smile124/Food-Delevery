import BaseApiService from "./BaseApiService";

class UserService extends BaseApiService {
  /**
   * User login
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const response = await this.client.post("/api/user/login", credentials);
    return response.data;
  }

  /**
   * User registration
   * @param {{ name: string, email: string, password: string, otp?: string }} data
   */
  async register(data) {
    const response = await this.client.post("/api/user/register", data);
    return response.data;
  }

  /**
   * Send verification OTP for register or forgot password
   * @param {{ email: string, purpose?: "register"|"forgot_password", name?: string }} data
   */
  async sendOTP(data) {
    const response = await this.client.post("/api/user/send-otp", data);
    return response.data;
  }

  /**
   * Verify an OTP code
   * @param {{ email: string, otp: string, purpose?: string }} data
   */
  async verifyOTP(data) {
    const response = await this.client.post("/api/user/verify-otp", data);
    return response.data;
  }

  /**
   * Reset password with verified OTP
   * @param {{ email: string, otp: string, newPassword: string }} data
   */
  async resetPassword(data) {
    const response = await this.client.post("/api/user/reset-password", data);
    return response.data;
  }

  /**
   * Fetch authenticated user profile
   * @param {string} token
   */
  async getProfile(token) {
    const response = await this.client.get("/api/user/profile", this.getAuthHeaders(token));
    return response.data;
  }

  /**
   * Update authenticated user profile
   * @param {object} updatedFields
   * @param {string} token
   */
  async updateProfile(updatedFields, token) {
    const response = await this.client.post(
      "/api/user/update-profile",
      updatedFields,
      this.getAuthHeaders(token)
    );
    return response.data;
  }

  /**
   * Upload or change profile picture
   * @param {FormData} formData
   * @param {string} token
   */
  async uploadAvatar(formData, token) {
    const response = await this.client.post("/api/user/upload-avatar", formData, {
      headers: {
        token,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Delete profile picture
   * @param {string} token
   */
  async deleteAvatar(token) {
    const response = await this.client.post(
      "/api/user/delete-avatar",
      {},
      this.getAuthHeaders(token)
    );
    return response.data;
  }

  /**
   * Add new delivery address
   * @param {object} addressData
   * @param {string} token
   */
  async addAddress(addressData, token) {
    const response = await this.client.post(
      "/api/user/address/add",
      addressData,
      this.getAuthHeaders(token)
    );
    return response.data;
  }

  /**
   * Update existing delivery address
   * @param {object} addressData
   * @param {string} token
   */
  async updateAddress(addressData, token) {
    const response = await this.client.post(
      "/api/user/address/update",
      addressData,
      this.getAuthHeaders(token)
    );
    return response.data;
  }

  /**
   * Delete a delivery address
   * @param {string} addressId
   * @param {string} token
   */
  async deleteAddress(addressId, token) {
    const response = await this.client.post(
      "/api/user/address/delete",
      { addressId },
      this.getAuthHeaders(token)
    );
    return response.data;
  }

  /**
   * Set address as default
   * @param {string} addressId
   * @param {string} token
   */
  async setDefaultAddress(addressId, token) {
    const response = await this.client.post(
      "/api/user/address/default",
      { addressId },
      this.getAuthHeaders(token)
    );
    return response.data;
  }

  /**
   * Update dietary and notification preferences
   * @param {object} preferences
   * @param {string} token
   */
  async updatePreferences(preferences, token) {
    const response = await this.client.post(
      "/api/user/preferences",
      { preferences },
      this.getAuthHeaders(token)
    );
    return response.data;
  }

  /**
   * Change account password
   * @param {{ currentPassword: string, newPassword: string }} data
   * @param {string} token
   */
  async changePassword(data, token) {
    const response = await this.client.post(
      "/api/user/change-password",
      data,
      this.getAuthHeaders(token)
    );
    return response.data;
  }

  /**
   * Permanently delete user account
   * @param {string} password
   * @param {string} token
   */
  async deleteAccount(password, token) {
    const response = await this.client.post(
      "/api/user/delete-account",
      { password },
      this.getAuthHeaders(token)
    );
    return response.data;
  }
}

const userService = new UserService();
export default userService;
export { UserService };
