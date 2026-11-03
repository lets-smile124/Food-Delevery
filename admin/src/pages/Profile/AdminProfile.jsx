import React, { useState, useEffect, useRef } from "react";
import "./AdminProfile.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const AdminProfile = ({ url }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("personal");

  const [profileData, setProfileData] = useState({
    name: "Store Manager",
    email: "ankitanone12@gmail.com",
    phone: "+91 9519296779",
    role: "Super Admin",
    avatar: "",
    restaurantName: "Tomato - Handcrafted Flavors",
    tagline: "Serving happiness, one delicious bite at a time.",
    storeAddress: "Main Culinary Boulevard, Food City",
    supportEmail: "ankitanone12@gmail.com",
    supportPhone: "+91 9519296779",
    deliveryTime: "30 Mins",
    deliveryFee: 2,
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);

  // Fetch admin profile data
  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/api/admin/profile`);
      if (res.data.success && res.data.admin) {
        setProfileData(res.data.admin);
      }
    } catch (err) {
      console.log("Fetch admin profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit profile details
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axios.post(`${url}/api/admin/update-profile`, profileData);
      if (res.data.success) {
        toast.success(res.data.message || "Admin profile saved successfully!");
        setProfileData(res.data.admin);
      } else {
        toast.error(res.data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving admin profile");
    } finally {
      setSaving(false);
    }
  };

  // Upload Avatar
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.post(`${url}/api/admin/upload-avatar`, formData);
      if (res.data.success) {
        toast.success("Admin profile picture updated successfully!");
        setProfileData((prev) => ({ ...prev, avatar: res.data.avatar }));
      } else {
        toast.error(res.data.message || "Failed to upload avatar");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error uploading profile picture");
    } finally {
      setAvatarUploading(false);
    }
  };

  // Delete Avatar
  const handleDeleteAvatar = async () => {
    if (!window.confirm("Are you sure you want to remove your admin profile photo?")) return;

    try {
      setAvatarUploading(true);
      const res = await axios.post(`${url}/api/admin/delete-avatar`, {});
      if (res.data.success) {
        toast.success("Profile photo removed successfully!");
        setProfileData((prev) => ({ ...prev, avatar: "" }));
      } else {
        toast.error(res.data.message || "Failed to remove photo");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  // Change Security Credentials
  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (securityForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    try {
      setSecuritySaving(true);
      const res = await axios.post(`${url}/api/admin/security`, securityForm);
      if (res.data.success) {
        toast.success(res.data.message || "Admin credentials updated!");
        setSecurityForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(res.data.message || "Failed to update security");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating credentials");
    } finally {
      setSecuritySaving(false);
    }
  };

  const avatarDisplay = profileData.avatar ? (
    <img src={profileData.avatar} alt="Admin" className="admin-avatar-img" />
  ) : (
    <img src={assets.profile_image} alt="Admin" className="admin-avatar-img" />
  );

  return (
    <div className="admin-profile-page">
      {/* Header */}
      <div className="admin-profile-header">
        <div>
          <h2 className="admin-profile-title">Admin Profile & Settings</h2>
          <p className="admin-profile-subtitle">
            Configure administrator credentials, restaurant operations, and storefront delivery settings
          </p>
        </div>

        <div className="admin-role-badge">
          <span className="role-dot"></span>
          <span>{profileData.role || "Super Admin"}</span>
        </div>
      </div>

      {/* Profile Overview Card with Avatar Management */}
      <div className="admin-identity-card">
        <div className="admin-avatar-section">
          <div
            className="admin-avatar-wrapper"
            onClick={() => fileInputRef.current?.click()}
            title="Click to change profile picture"
          >
            {avatarDisplay}
            <div className="admin-avatar-overlay">
              <span>{avatarUploading ? "..." : "📷"}</span>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarFileSelect}
            accept="image/*"
            style={{ display: "none" }}
          />

          <div className="admin-identity-text">
            <h3>{profileData.name}</h3>
            <p className="admin-email-text">{profileData.email}</p>
            <span className="admin-status-text">🟢 Store Active & Dispatched</span>
          </div>
        </div>

        {/* Option to Delete or Change Photo */}
        <div className="admin-avatar-actions">
          <button
            type="button"
            className="admin-change-photo-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
          >
            {avatarUploading ? "Uploading..." : "Upload New Picture 📷"}
          </button>

          {profileData.avatar && (
            <button
              type="button"
              className="admin-delete-photo-btn"
              onClick={handleDeleteAvatar}
              disabled={avatarUploading}
              title="Delete profile picture and revert to default"
            >
              Delete Picture 🗑️
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs-row">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          <span>👤</span>
          <span>Manager Profile</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "store" ? "active" : ""}`}
          onClick={() => setActiveTab("store")}
        >
          <span>🏪</span>
          <span>Restaurant Settings</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <span>🔒</span>
          <span>Admin Security</span>
        </button>
      </div>

      {/* ================= TAB 1: PERSONAL MANAGER ================= */}
      {activeTab === "personal" && (
        <div className="admin-panel-card">
          <h3 className="panel-section-title">Personal Information</h3>
          <p className="panel-section-desc">
            Primary contact details for executive communication and notification dispatch
          </p>

          <form onSubmit={handleSubmitProfile} className="admin-form-grid">
            <div className="admin-field-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                placeholder="Manager Name"
                required
              />
            </div>

            <div className="admin-field-group">
              <label>Official Email Address *</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="admin-field-group">
              <label>Administrator Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                placeholder="+91 9519296779"
              />
            </div>

            <div className="admin-field-group">
              <label>System Role</label>
              <input
                type="text"
                name="role"
                value={profileData.role}
                onChange={handleChange}
                placeholder="Super Admin"
              />
            </div>

            <div className="admin-form-submit-row">
              <button type="submit" className="admin-primary-save-btn" disabled={saving}>
                {saving ? "Saving Changes..." : "Save Manager Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 2: STORE SETTINGS ================= */}
      {activeTab === "store" && (
        <div className="admin-panel-card">
          <h3 className="panel-section-title">Restaurant & Storefront Operations</h3>
          <p className="panel-section-desc">
            Public operational details visible on receipts, customer emails, and the live storefront
          </p>

          <form onSubmit={handleSubmitProfile} className="admin-form-grid">
            <div className="admin-field-group">
              <label>Restaurant Name *</label>
              <input
                type="text"
                name="restaurantName"
                value={profileData.restaurantName}
                onChange={handleChange}
                placeholder="e.g. Tomato - Handcrafted Flavors"
                required
              />
            </div>

            <div className="admin-field-group">
              <label>Brand Tagline</label>
              <input
                type="text"
                name="tagline"
                value={profileData.tagline}
                onChange={handleChange}
                placeholder="e.g. Serving happiness, one delicious bite at a time."
              />
            </div>

            <div className="admin-field-group full-width">
              <label>Main Kitchen / Dispatch Address</label>
              <input
                type="text"
                name="storeAddress"
                value={profileData.storeAddress}
                onChange={handleChange}
                placeholder="Kitchen Address for order dispatch"
              />
            </div>

            <div className="admin-field-group">
              <label>Customer Support Hotline</label>
              <input
                type="tel"
                name="supportPhone"
                value={profileData.supportPhone}
                onChange={handleChange}
                placeholder="+91 9519296779"
              />
            </div>

            <div className="admin-field-group">
              <label>Customer Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={profileData.supportEmail}
                onChange={handleChange}
                placeholder="support@tomato.com"
              />
            </div>

            <div className="admin-field-group">
              <label>Estimated Delivery Time</label>
              <input
                type="text"
                name="deliveryTime"
                value={profileData.deliveryTime}
                onChange={handleChange}
                placeholder="e.g. 30 Mins"
              />
            </div>

            <div className="admin-field-group">
              <label>Standard Delivery Fee (₹)</label>
              <input
                type="number"
                name="deliveryFee"
                value={profileData.deliveryFee}
                onChange={handleChange}
                min="0"
                placeholder="2"
              />
            </div>

            <div className="admin-form-submit-row">
              <button type="submit" className="admin-primary-save-btn" disabled={saving}>
                {saving ? "Saving Store Details..." : "Save Restaurant Settings"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 3: ADMIN SECURITY ================= */}
      {activeTab === "security" && (
        <div className="admin-panel-card">
          <h3 className="panel-section-title">Administrator Security Credentials</h3>
          <p className="panel-section-desc">
            Update your master administration passcode to ensure protected operations
          </p>

          <form onSubmit={handleSecuritySubmit} className="admin-security-form">
            <div className="admin-field-group">
              <label>Current Admin Password *</label>
              <div className="admin-input-eye-wrap">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  placeholder="Enter current password"
                  value={securityForm.currentPassword}
                  onChange={(e) =>
                    setSecurityForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                >
                  {showCurrentPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="admin-field-group">
              <label>New Passcode (Min. 8 characters) *</label>
              <div className="admin-input-eye-wrap">
                <input
                  type={showNewPass ? "text" : "password"}
                  placeholder="Enter robust new passcode"
                  value={securityForm.newPassword}
                  onChange={(e) =>
                    setSecurityForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowNewPass(!showNewPass)}
                >
                  {showNewPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="admin-field-group">
              <label>Confirm New Passcode *</label>
              <div className="admin-input-eye-wrap">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Re-type new passcode"
                  value={securityForm.confirmPassword}
                  onChange={(e) =>
                    setSecurityForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                >
                  {showConfirmPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="admin-form-submit-row">
              <button
                type="submit"
                className="admin-primary-save-btn"
                disabled={securitySaving}
              >
                {securitySaving ? "Updating Credentials..." : "Update Passcode"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;

