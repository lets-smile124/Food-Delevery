import React, { useContext, useEffect, useState, useRef } from "react";
import "./Profile.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import userService from "../../services/UserService";
import orderService from "../../services/OrderService";
import { assets } from "../../assets/assets";

const Profile = () => {
  const {
    token,
    setToken,
    userData,
    setUserData,
    fetchUserProfile,
    updateUserProfile,
  } = useContext(StoreContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active navigation tab
  const validTabs = ["profile", "addresses", "orders", "preferences", "security"];
  const initialTab = validTabs.includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Global feedback message banner
  const [feedback, setFeedback] = useState(null);
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Sync tab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Initial load
  useEffect(() => {
    if (!token) {
      navigate("/");
    } else if (!userData) {
      fetchUserProfile(token);
    }
  }, [token, userData]);

  // ==========================================
  // 1. PERSONAL PROFILE STATE & HANDLERS
  // ==========================================
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userData) {
      setProfileForm({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        dob: userData.dob ? userData.dob.slice(0, 10) : "",
      });
    }
  }, [userData]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileForm.name.trim().length < 2) {
      showFeedback("error", "Name must be at least 2 characters long.");
      return;
    }

    try {
      setProfileLoading(true);
      const res = await updateUserProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        dob: profileForm.dob,
      });

      if (res.success) {
        showFeedback("success", "Personal details saved successfully!");
      } else {
        showFeedback("error", res.message || "Failed to update profile.");
      }
    } catch (err) {
      showFeedback("error", "Server error updating profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showFeedback("error", "Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showFeedback("error", "Profile photo must be smaller than 5MB.");
      return;
    }

    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await userService.uploadAvatar(formData, token);
      if (res.success) {
        if (setUserData && res.user) {
          setUserData(res.user);
        }
        showFeedback("success", "Profile picture updated successfully!");
      } else {
        showFeedback("error", res.message || "Failed to upload photo.");
      }
    } catch (err) {
      showFeedback("error", "Network error while uploading photo.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;

    try {
      setAvatarUploading(true);
      const res = await userService.deleteAvatar(token);
      if (res.success) {
        if (setUserData && res.user) {
          setUserData(res.user);
        }
        showFeedback("success", "Profile picture removed successfully!");
      } else {
        showFeedback("error", res.message || "Failed to remove photo.");
      }
    } catch (err) {
      showFeedback("error", "Error removing profile picture.");
    } finally {
      setAvatarUploading(false);
    }
  };

  // ==========================================
  // 2. ADDRESS MANAGEMENT STATE & HANDLERS
  // ==========================================
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: "Home",
    houseNo: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    instructions: "",
    isDefault: false,
  });
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  useEffect(() => {
    if (userData?.addresses) {
      setAddresses(userData.addresses);
    }
  }, [userData]);

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      type: "Home",
      houseNo: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      instructions: "",
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      type: addr.type || "Home",
      houseNo: addr.houseNo || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      landmark: addr.landmark || "",
      instructions: addr.instructions || "",
      isDefault: !!addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressForm.street.trim() || !addressForm.city.trim() || !addressForm.pincode.trim()) {
      showFeedback("error", "Street, City, and Pincode are mandatory.");
      return;
    }

    try {
      setAddressSubmitting(true);
      let res;
      if (editingAddressId) {
        res = await userService.updateAddress(
          { ...addressForm, addressId: editingAddressId },
          token
        );
      } else {
        res = await userService.addAddress(addressForm, token);
      }

      if (res.success) {
        setAddresses(res.addresses);
        if (userData) {
          setUserData({ ...userData, addresses: res.addresses });
        }
        setIsAddressModalOpen(false);
        showFeedback(
          "success",
          editingAddressId ? "Address updated successfully!" : "New delivery address saved!"
        );
      } else {
        showFeedback("error", res.message || "Failed to save address.");
      }
    } catch (err) {
      showFeedback("error", "Error saving delivery address.");
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await userService.deleteAddress(addressId, token);
      if (res.success) {
        setAddresses(res.addresses);
        if (userData) {
          setUserData({ ...userData, addresses: res.addresses });
        }
        showFeedback("success", "Address removed from your profile.");
      } else {
        showFeedback("error", res.message || "Failed to delete address.");
      }
    } catch (err) {
      showFeedback("error", "Error deleting address.");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await userService.setDefaultAddress(addressId, token);
      if (res.success) {
        setAddresses(res.addresses);
        if (userData) {
          setUserData({ ...userData, addresses: res.addresses });
        }
        showFeedback("success", "Default delivery address updated.");
      } else {
        showFeedback("error", res.message || "Failed to set default.");
      }
    } catch (err) {
      showFeedback("error", "Error setting default address.");
    }
  };

  // ==========================================
  // 3. ORDER HISTORY STATE & HANDLERS
  // ==========================================
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState("all");
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);

  const fetchUserOrders = async () => {
    if (!token) return;
    try {
      setOrdersLoading(true);
      const res = await orderService.getUserOrders(token);
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.log("Error loading user orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchUserOrders();
    }
  }, [activeTab]);

  const handleDeleteOrderHistory = async (orderId) => {
    if (!window.confirm("Remove this delivered order from your personal history?")) return;

    try {
      setDeletingOrderId(orderId);
      const res = await orderService.removeUserOrder(orderId, token);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        showFeedback("success", "Order removed from history.");
      } else {
        showFeedback("error", res.message || "Cannot delete order.");
      }
    } catch (err) {
      showFeedback("error", err.response?.data?.message || "Failed to remove order.");
    } finally {
      setDeletingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "all") return true;
    const st = (order.status || "").toLowerCase();
    if (orderFilter === "processing") return st.includes("process");
    if (orderFilter === "delivered") return st.includes("deliver");
    if (orderFilter === "cancelled") return st.includes("cancel");
    return true;
  });

  // ==========================================
  // 4. PREFERENCES STATE & HANDLERS
  // ==========================================
  const availableDietTags = [
    "Vegan",
    "Vegetarian",
    "Jain Food",
    "Gluten-Free",
    "Halal",
    "Dairy-Free",
    "Keto",
    "Low Carb",
  ];
  const commonAllergies = [
    "Peanuts",
    "Tree Nuts",
    "Dairy / Lactose",
    "Gluten / Wheat",
    "Soy",
    "Shellfish",
    "Eggs",
    "Sesame",
  ];

  const [preferences, setPreferences] = useState({
    dietaryType: "All",
    dietaryRestrictions: [],
    allergies: [],
    emailNotifications: true,
    orderUpdates: true,
    promotionalOffers: true,
    preferredLanguage: "English",
  });
  const [customAllergyInput, setCustomAllergyInput] = useState("");
  const [preferencesSaving, setPreferencesSaving] = useState(false);

  useEffect(() => {
    if (userData?.preferences) {
      setPreferences({
        dietaryType: userData.preferences.dietaryType || "All",
        dietaryRestrictions: userData.preferences.dietaryRestrictions || [],
        allergies: userData.preferences.allergies || [],
        emailNotifications: userData.preferences.emailNotifications ?? true,
        orderUpdates: userData.preferences.orderUpdates ?? true,
        promotionalOffers: userData.preferences.promotionalOffers ?? true,
        preferredLanguage: userData.preferences.preferredLanguage || "English",
      });
    }
  }, [userData]);

  const toggleDietTag = (tag) => {
    setPreferences((prev) => {
      const exists = prev.dietaryRestrictions.includes(tag);
      return {
        ...prev,
        dietaryRestrictions: exists
          ? prev.dietaryRestrictions.filter((t) => t !== tag)
          : [...prev.dietaryRestrictions, tag],
      };
    });
  };

  const toggleAllergy = (allergy) => {
    setPreferences((prev) => {
      const exists = prev.allergies.includes(allergy);
      return {
        ...prev,
        allergies: exists
          ? prev.allergies.filter((a) => a !== allergy)
          : [...prev.allergies, allergy],
      };
    });
  };

  const handleAddCustomAllergy = (e) => {
    e.preventDefault();
    const clean = customAllergyInput.trim();
    if (!clean) return;
    if (!preferences.allergies.includes(clean)) {
      setPreferences((prev) => ({
        ...prev,
        allergies: [...prev.allergies, clean],
      }));
    }
    setCustomAllergyInput("");
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      setPreferencesSaving(true);
      const res = await userService.updatePreferences(preferences, token);
      if (res.success) {
        if (userData) {
          setUserData({ ...userData, preferences: res.preferences });
        }
        showFeedback("success", "Preferences saved to your profile!");
      } else {
        showFeedback("error", res.message || "Failed to save preferences.");
      }
    } catch (err) {
      showFeedback("error", "Error saving preferences.");
    } finally {
      setPreferencesSaving(false);
    }
  };

  // ==========================================
  // 5. ACCOUNT SECURITY STATE & HANDLERS
  // ==========================================
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);

  // Delete account modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Password strength calculator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "#ef4444" };
    if (score <= 3) return { score: 2, label: "Medium", color: "#f59e0b" };
    return { score: 3, label: "Strong", color: "#10b981" };
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showFeedback("error", "New passwords do not match.");
      return;
    }
    if (securityForm.newPassword.length < 8) {
      showFeedback("error", "New password must be at least 8 characters long.");
      return;
    }

    try {
      setSecuritySaving(true);
      const res = await userService.changePassword(
        {
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
        },
        token
      );

      if (res.success) {
        setSecurityForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        showFeedback("success", "Password updated successfully!");
      } else {
        showFeedback("error", res.message || "Failed to update password.");
      }
    } catch (err) {
      showFeedback("error", err.response?.data?.message || "Failed to update password.");
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    if (setUserData) setUserData(null);
    navigate("/");
  };

  const handleDeleteAccountConfirm = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      showFeedback("error", "Please enter your password to confirm deletion.");
      return;
    }

    try {
      setDeleteLoading(true);
      const res = await userService.deleteAccount(deletePassword, token);
      if (res.success) {
        alert("Your account has been permanently deleted.");
        handleLogout();
      } else {
        showFeedback("error", res.message || "Failed to delete account.");
      }
    } catch (err) {
      showFeedback("error", err.response?.data?.message || "Error deleting account.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("process")) {
      return { className: "status-processing", dotColor: "#f59e0b", label: status };
    }
    if (s.includes("out") || s.includes("delivery")) {
      return { className: "status-delivery", dotColor: "#3b82f6", label: status };
    }
    if (s.includes("deliver")) {
      return { className: "status-delivered", dotColor: "#10b981", label: status };
    }
    return { className: "status-default", dotColor: "#ea580c", label: status };
  };

  const avatarDisplay = userData?.avatar ? (
    <img src={userData.avatar} alt={userData.name} className="profile-avatar-img" />
  ) : (
    <span className="profile-avatar-initial">
      {userData?.name ? userData.name.trim().charAt(0).toUpperCase() : "👤"}
    </span>
  );

  return (
    <div className="profile-dashboard-wrapper">
      {/* Top Breadcrumb / Title */}
      <div className="dashboard-title-row">
        <div>
          <h1 className="dashboard-main-heading">Account Dashboard</h1>
          <p className="dashboard-sub-heading">
            Manage your personal profile, addresses, orders, and culinary preferences
          </p>
        </div>
        <button
          type="button"
          className="back-to-menu-btn"
          onClick={() => navigate("/")}
        >
          <span>← Back to Menu</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div className={`dashboard-feedback-banner ${feedback.type}`}>
          <span>{feedback.type === "success" ? "✓" : "⚠️"}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main 2-Column Dashboard Layout */}
      <div className="profile-dashboard-grid">
        {/* ===================================== */}
        {/* LEFT SIDEBAR NAVIGATION */}
        {/* ===================================== */}
        <aside className="profile-sidebar-card">
          <div className="sidebar-profile-header">
            <div
              className="sidebar-avatar-wrap"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change profile photo"
            >
              {avatarDisplay}
              <div className="avatar-camera-overlay">
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

            <h3 className="sidebar-user-name">{userData?.name || "Customer"}</h3>
            <span className="sidebar-user-email">{userData?.email}</span>

            <div className="sidebar-verified-pill">
              <span className="verified-check">✓</span>
              <span>Verified Account</span>
            </div>
          </div>

          <nav className="profile-sidebar-nav">
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => handleTabChange("profile")}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-label">My Profile</span>
              <span className="nav-arrow">›</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === "addresses" ? "active" : ""}`}
              onClick={() => handleTabChange("addresses")}
            >
              <span className="nav-icon">📍</span>
              <span className="nav-label">My Addresses</span>
              {addresses.length > 0 && (
                <span className="nav-count-badge">{addresses.length}</span>
              )}
              <span className="nav-arrow">›</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => handleTabChange("orders")}
            >
              <span className="nav-icon">📦</span>
              <span className="nav-label">My Orders</span>
              <span className="nav-arrow">›</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === "preferences" ? "active" : ""}`}
              onClick={() => handleTabChange("preferences")}
            >
              <span className="nav-icon">🥗</span>
              <span className="nav-label">Preferences</span>
              <span className="nav-arrow">›</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === "security" ? "active" : ""}`}
              onClick={() => handleTabChange("security")}
            >
              <span className="nav-icon">🔒</span>
              <span className="nav-label">Account Security</span>
              <span className="nav-arrow">›</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
              <span>🚪</span>
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* ===================================== */}
        {/* RIGHT CONTENT WORKSPACE */}
        {/* ===================================== */}
        <main className="profile-content-area">
          {/* TAB 1: MY PROFILE */}
          {activeTab === "profile" && (
            <div className="content-card-panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Personal Profile</h2>
                  <p className="panel-subtitle">
                    Manage your personal identity, contact numbers, and public avatar
                  </p>
                </div>
              </div>

              {/* Profile Photo Quick Section */}
              <div className="profile-photo-bar">
                <div className="photo-preview-box">
                  {avatarDisplay}
                </div>
                <div className="photo-info-meta">
                  <h4>Profile Picture</h4>
                  <p>JPG, PNG or WEBP. Max size 5MB. Click to upload or remove photo.</p>
                  <div className="photo-actions-btns">
                    <button
                      type="button"
                      className="change-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? "Uploading..." : "Change Photo 📷"}
                    </button>
                    {userData?.avatar && (
                      <button
                        type="button"
                        className="delete-photo-btn"
                        onClick={handleDeleteAvatar}
                        disabled={avatarUploading}
                      >
                        Remove Photo 🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="profile-form-grid">
                <div className="form-field-group">
                  <label className="field-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="modern-input"
                    placeholder="Your Full Name"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label">Email Address</label>
                  <div className="input-with-badge">
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      className="modern-input disabled"
                      disabled
                    />
                    <span className="input-tag-verified">Verified ✓</span>
                  </div>
                  <small className="field-hint">Primary email used for order confirmations</small>
                </div>

                <div className="form-field-group">
                  <label className="field-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="modern-input"
                    placeholder="e.g. +91 98765 43210"
                  />
                  <small className="field-hint">Used by delivery partners for order handoff</small>
                </div>

                <div className="form-field-group">
                  <label className="field-label">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    name="dob"
                    value={profileForm.dob}
                    onChange={handleProfileChange}
                    className="modern-input"
                  />
                  <small className="field-hint">Receive special surprises on your birthday</small>
                </div>

                <div className="form-actions-row">
                  <button
                    type="submit"
                    className="primary-save-btn"
                    disabled={profileLoading}
                  >
                    {profileLoading ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MY ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="content-card-panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Delivery Addresses ({addresses.length})</h2>
                  <p className="panel-subtitle">
                    Save multiple delivery locations for swift, 1-click checkout
                  </p>
                </div>
                <button
                  type="button"
                  className="add-address-trigger-btn"
                  onClick={openAddAddressModal}
                >
                  <span>+ Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="empty-panel-box">
                  <span className="empty-icon">📍</span>
                  <h3>No Saved Addresses</h3>
                  <p>
                    Add your home, office, or frequently visited addresses to speed up your order checkout.
                  </p>
                  <button
                    type="button"
                    className="primary-save-btn"
                    onClick={openAddAddressModal}
                  >
                    + Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="addresses-cards-grid">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`address-card ${addr.isDefault ? "default-card" : ""}`}
                    >
                      <div className="address-card-top">
                        <div className="address-type-pill">
                          <span>{addr.type === "Home" ? "🏠" : addr.type === "Work" ? "🏢" : "📍"}</span>
                          <span>{addr.type}</span>
                        </div>
                        {addr.isDefault && (
                          <span className="default-badge">DEFAULT ADDRESS</span>
                        )}
                      </div>

                      <div className="address-card-body">
                        <p className="address-main-line">
                          <strong>{addr.houseNo ? addr.houseNo + ", " : ""}</strong>
                          {addr.street}
                        </p>
                        <p className="address-sub-line">
                          {addr.city}{addr.state ? `, ${addr.state}` : ""} - {addr.pincode}
                        </p>
                        {addr.landmark && (
                          <p className="address-landmark-line">
                            <span>Landmark:</span> {addr.landmark}
                          </p>
                        )}
                        {addr.instructions && (
                          <p className="address-instructions-line">
                            <span>Instructions:</span> "{addr.instructions}"
                          </p>
                        )}
                      </div>

                      <div className="address-card-actions">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            className="address-action-text-btn default"
                            onClick={() => handleSetDefaultAddress(addr._id)}
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          type="button"
                          className="address-action-text-btn"
                          onClick={() => openEditAddressModal(addr)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="address-action-text-btn danger"
                          onClick={() => handleDeleteAddress(addr._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="content-card-panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Order History & Deliveries</h2>
                  <p className="panel-subtitle">
                    Track live deliveries, view past receipts, and manage order logs
                  </p>
                </div>
                <button
                  type="button"
                  className="refresh-orders-btn"
                  onClick={fetchUserOrders}
                  title="Refresh order statuses"
                >
                  <span>↻ Refresh</span>
                </button>
              </div>

              {/* Order Filters */}
              <div className="orders-tab-filter-bar">
                <button
                  type="button"
                  className={`order-filter-chip ${orderFilter === "all" ? "active" : ""}`}
                  onClick={() => setOrderFilter("all")}
                >
                  All ({orders.length})
                </button>
                <button
                  type="button"
                  className={`order-filter-chip ${orderFilter === "processing" ? "active" : ""}`}
                  onClick={() => setOrderFilter("processing")}
                >
                  Processing ({orders.filter((o) => (o.status || "").toLowerCase().includes("process")).length})
                </button>
                <button
                  type="button"
                  className={`order-filter-chip ${orderFilter === "delivered" ? "active" : ""}`}
                  onClick={() => setOrderFilter("delivered")}
                >
                  Delivered ({orders.filter((o) => (o.status || "").toLowerCase().includes("deliver")).length})
                </button>
              </div>

              {ordersLoading ? (
                <div className="empty-panel-box">
                  <div className="orders-spinner"></div>
                  <p>Fetching your culinary deliveries...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="empty-panel-box">
                  <span className="empty-icon">📦</span>
                  <h3>No Orders Found</h3>
                  <p>
                    {orderFilter === "all"
                      ? "You haven't placed any orders yet. Discover our fresh chef creations!"
                      : `No orders match filter "${orderFilter}".`}
                  </p>
                  <button
                    type="button"
                    className="primary-save-btn"
                    onClick={() => navigate("/")}
                  >
                    Explore Menu & Order Now
                  </button>
                </div>
              ) : (
                <div className="profile-orders-list">
                  {filteredOrders.map((order, idx) => {
                    const statusInfo = getStatusBadge(order.status);
                    const isDelivered = (order.status || "").toLowerCase().trim() === "delivered";
                    const dateFormatted = order.date
                      ? new Date(order.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recent Order";

                    return (
                      <div key={order._id || idx} className="profile-order-card">
                        <div className="profile-order-header">
                          <div className="order-main-meta">
                            <span className="order-id-label">
                              Order #{order._id?.slice(-6).toUpperCase() || idx + 1}
                            </span>
                            <span className="order-date-label">{dateFormatted}</span>
                          </div>

                          <div className="order-status-row-right">
                            <div className={`status-pill ${statusInfo.className}`}>
                              <span
                                className="status-pulse-dot"
                                style={{ backgroundColor: statusInfo.dotColor }}
                              />
                              <span>{statusInfo.label}</span>
                            </div>

                            {/* Delivered Order Removal (reusing sanctioned endpoint) */}
                            {isDelivered && (
                              <button
                                type="button"
                                className="delete-history-btn"
                                onClick={() => handleDeleteOrderHistory(order._id)}
                                disabled={deletingOrderId === order._id}
                                title="Remove delivered order from history"
                              >
                                {deletingOrderId === order._id ? "..." : "🗑️ Delete"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="profile-order-items-preview">
                          <span className="items-header-label">Items:</span>
                          <p className="items-names-text">
                            {order.items.map((it, i) => (
                              <span key={i} className="item-token">
                                <strong>{it.name}</strong> × {it.quantity}
                                {it.selectedSize ? ` (${it.selectedSize})` : ""}
                                {i < order.items.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </p>
                        </div>

                        <div className="profile-order-footer">
                          <div className="order-price-box">
                            <span className="price-tag-label">Total Amount</span>
                            <span className="order-amount-bold">₹{Number(order.amount).toFixed(2)}</span>
                            <span className="payment-status-pill">
                              {order.payment ? "✓ Paid Online" : "⚠️ Payment Pending"}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="view-order-details-btn"
                            onClick={() => setSelectedOrderReceipt(order)}
                          >
                            <span>View Full Receipt</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="content-card-panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Dining & Taste Preferences</h2>
                  <p className="panel-subtitle">
                    Customize dietary requirements, food allergies, and communication alerts
                  </p>
                </div>
              </div>

              <form onSubmit={handlePreferencesSubmit} className="preferences-form">
                {/* Dietary Type Segment */}
                <div className="pref-section">
                  <h4 className="pref-section-title">Dietary Focus</h4>
                  <div className="diet-type-selector">
                    {[
                      { id: "All", label: "All Dishes (No restriction)", icon: "🍽️" },
                      { id: "Veg", label: "Pure Vegetarian", icon: "🌱" },
                      { id: "Non-Veg", label: "Non-Vegetarian", icon: "🍗" },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        className={`diet-option-card ${preferences.dietaryType === opt.id ? "active" : ""}`}
                        onClick={() =>
                          setPreferences((prev) => ({ ...prev, dietaryType: opt.id }))
                        }
                      >
                        <span className="diet-icon">{opt.icon}</span>
                        <span className="diet-label">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specific Diets */}
                <div className="pref-section">
                  <h4 className="pref-section-title">Specific Dietary Lifestyles</h4>
                  <p className="pref-section-desc">Select any lifestyle guidelines you follow:</p>
                  <div className="chips-wrap">
                    {availableDietTags.map((tag) => {
                      const isSelected = preferences.dietaryRestrictions.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          className={`pref-chip ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleDietTag(tag)}
                        >
                          <span>{isSelected ? "✓" : "+"}</span>
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Allergies */}
                <div className="pref-section">
                  <h4 className="pref-section-title">Food Allergies & Intolerances</h4>
                  <p className="pref-section-desc">
                    We will highlight dishes containing allergens you wish to avoid:
                  </p>
                  <div className="chips-wrap">
                    {commonAllergies.map((allergy) => {
                      const isSelected = preferences.allergies.includes(allergy);
                      return (
                        <button
                          key={allergy}
                          type="button"
                          className={`pref-chip allergy ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleAllergy(allergy)}
                        >
                          <span>{isSelected ? "⚠️" : "+"}</span>
                          <span>{allergy}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Allergy */}
                  <div className="custom-allergy-row">
                    <input
                      type="text"
                      className="modern-input"
                      placeholder="Add other allergy (e.g. Mustard, Mushrooms)..."
                      value={customAllergyInput}
                      onChange={(e) => setCustomAllergyInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="add-allergy-btn"
                      onClick={handleAddCustomAllergy}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Notifications & Language */}
                <div className="pref-section">
                  <h4 className="pref-section-title">Communication & Language</h4>
                  <div className="toggle-list">
                    <label className="pref-toggle-row">
                      <div className="toggle-info">
                        <strong>Order Updates & Delivery Tracking</strong>
                        <small>Real-time delivery progress via email</small>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.orderUpdates}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            orderUpdates: e.target.checked,
                          }))
                        }
                      />
                    </label>

                    <label className="pref-toggle-row">
                      <div className="toggle-info">
                        <strong>Promotions & Welcome Discounts</strong>
                        <small>Exclusive coupon codes like NEW_USER and seasonal offers</small>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.promotionalOffers}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            promotionalOffers: e.target.checked,
                          }))
                        }
                      />
                    </label>

                    <div className="pref-language-row">
                      <label className="field-label">Preferred Platform Language</label>
                      <select
                        className="modern-select"
                        value={preferences.preferredLanguage}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            preferredLanguage: e.target.value,
                          }))
                        }
                      >
                        <option value="English">English</option>
                        <option value="Hindi">हिंदी (Hindi)</option>
                        <option value="Spanish">Español (Spanish)</option>
                        <option value="French">Français (French)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-actions-row">
                  <button
                    type="submit"
                    className="primary-save-btn"
                    disabled={preferencesSaving}
                  >
                    {preferencesSaving ? "Saving Preferences..." : "Save Preferences"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: ACCOUNT SECURITY */}
          {activeTab === "security" && (
            <div className="content-card-panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Account Security & Credentials</h2>
                  <p className="panel-subtitle">
                    Update your password, review active protection, or manage account data
                  </p>
                </div>
              </div>

              {/* Change Password Card */}
              <div className="security-subcard">
                <h3 className="security-subcard-title">Change Password</h3>
                <p className="security-subcard-desc">
                  Choose a robust password with at least 8 characters including numbers and symbols.
                </p>

                <form onSubmit={handlePasswordChange} className="security-form-fields">
                  <div className="form-field-group">
                    <label className="field-label">Current Password *</label>
                    <div className="input-with-eye">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        className="modern-input"
                        placeholder="Enter your current password"
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
                        className="eye-toggle-btn"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                      >
                        {showCurrentPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="field-label">New Password *</label>
                    <div className="input-with-eye">
                      <input
                        type={showNewPass ? "text" : "password"}
                        className="modern-input"
                        placeholder="At least 8 characters"
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
                        className="eye-toggle-btn"
                        onClick={() => setShowNewPass(!showNewPass)}
                      >
                        {showNewPass ? "🙈" : "👁️"}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {securityForm.newPassword && (
                      <div className="password-strength-bar">
                        {(() => {
                          const strength = getPasswordStrength(securityForm.newPassword);
                          return (
                            <>
                              <div className="strength-indicators">
                                <span
                                  className="strength-step"
                                  style={{
                                    backgroundColor:
                                      strength.score >= 1 ? strength.color : "#e2e8f0",
                                  }}
                                />
                                <span
                                  className="strength-step"
                                  style={{
                                    backgroundColor:
                                      strength.score >= 2 ? strength.color : "#e2e8f0",
                                  }}
                                />
                                <span
                                  className="strength-step"
                                  style={{
                                    backgroundColor:
                                      strength.score >= 3 ? strength.color : "#e2e8f0",
                                  }}
                                />
                              </div>
                              <span
                                className="strength-label"
                                style={{ color: strength.color }}
                              >
                                {strength.label} Password
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label className="field-label">Confirm New Password *</label>
                    <div className="input-with-eye">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        className="modern-input"
                        placeholder="Re-type your new password"
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
                        className="eye-toggle-btn"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                      >
                        {showConfirmPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button
                      type="submit"
                      className="primary-save-btn"
                      disabled={securitySaving}
                    >
                      {securitySaving ? "Updating Password..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="security-subcard danger-subcard">
                <h3 className="security-subcard-title danger">Danger Zone</h3>
                <p className="security-subcard-desc">
                  Permanently delete your account and all associated order history, saved addresses, and profile data.
                </p>

                <div className="danger-actions-row">
                  <button
                    type="button"
                    className="delete-account-btn"
                    onClick={() => {
                      setDeletePassword("");
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    Delete Account Permanently
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================== */}
      {/* MODAL: ADD / EDIT DELIVERY ADDRESS */}
      {/* ========================================== */}
      {isAddressModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddressModalOpen(false)}>
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddressModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="modal-form-body">
              {/* Type Pills */}
              <div className="address-type-selector">
                {["Home", "Work", "Other"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`type-pill-btn ${addressForm.type === t ? "active" : ""}`}
                    onClick={() => setAddressForm((prev) => ({ ...prev, type: t }))}
                  >
                    <span>{t === "Home" ? "🏠" : t === "Work" ? "🏢" : "📍"}</span>
                    <span>{t}</span>
                  </button>
                ))}
              </div>

              <div className="form-field-group">
                <label className="field-label">House / Flat / Building No.</label>
                <input
                  type="text"
                  className="modern-input"
                  placeholder="e.g. Flat 402, Sunshine Residency"
                  value={addressForm.houseNo}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, houseNo: e.target.value }))
                  }
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">Street / Area Name *</label>
                <input
                  type="text"
                  className="modern-input"
                  placeholder="e.g. 14 MG Road, Indiranagar"
                  value={addressForm.street}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, street: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-field-group">
                  <label className="field-label">City *</label>
                  <input
                    type="text"
                    className="modern-input"
                    placeholder="e.g. Bengaluru"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label">State</label>
                  <input
                    type="text"
                    className="modern-input"
                    placeholder="e.g. Karnataka"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, state: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-field-group">
                  <label className="field-label">Pincode *</label>
                  <input
                    type="text"
                    className="modern-input"
                    placeholder="e.g. 560038"
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, pincode: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label">Nearby Landmark</label>
                  <input
                    type="text"
                    className="modern-input"
                    placeholder="e.g. Near Metro Station"
                    value={addressForm.landmark}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, landmark: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label className="field-label">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  className="modern-input"
                  placeholder="e.g. Leave with security / Ring bell twice"
                  value={addressForm.instructions}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, instructions: e.target.value }))
                  }
                />
              </div>

              <label className="checkbox-default-row">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                  }
                />
                <span>Set as my default delivery address</span>
              </label>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="secondary-cancel-btn"
                  onClick={() => setIsAddressModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-save-btn"
                  disabled={addressSubmitting}
                >
                  {addressSubmitting ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ORDER RECEIPT DETAILS */}
      {/* ========================================== */}
      {selectedOrderReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedOrderReceipt(null)}>
          <div className="modal-dialog-card receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Order #{selectedOrderReceipt._id?.slice(-6).toUpperCase()}</h3>
                <small className="receipt-date">
                  {selectedOrderReceipt.date
                    ? new Date(selectedOrderReceipt.date).toLocaleString("en-IN")
                    : ""}
                </small>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedOrderReceipt(null)}
              >
                ✕
              </button>
            </div>

            <div className="receipt-content-body">
              {/* Status pill */}
              <div className="receipt-status-banner">
                <span>Status:</span>
                <strong>{selectedOrderReceipt.status}</strong>
                <span className="receipt-paid-tag">
                  {selectedOrderReceipt.payment ? "✓ Paid Online" : "⚠️ Payment Pending"}
                </span>
              </div>

              {/* Items List */}
              <div className="receipt-items-table">
                <div className="receipt-table-header">
                  <span>Dish</span>
                  <span style={{ textAlign: "center" }}>Qty</span>
                  <span style={{ textAlign: "right" }}>Amount</span>
                </div>
                {selectedOrderReceipt.items?.map((it, idx) => (
                  <div key={idx} className="receipt-item-row">
                    <div>
                      <strong>{it.name}</strong>
                      {it.selectedSize && <small> ({it.selectedSize})</small>}
                    </div>
                    <div style={{ textAlign: "center" }}>×{it.quantity}</div>
                    <div style={{ textAlign: "right" }}>₹{Number(it.price * (it.quantity || 1)).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="receipt-delivery-box">
                <h4>Delivery Address</h4>
                <p>
                  📍 {selectedOrderReceipt.address?.street},{" "}
                  {selectedOrderReceipt.address?.city}
                  {selectedOrderReceipt.address?.zipcode ? ` - ${selectedOrderReceipt.address.zipcode}` : ""}
                </p>
                {selectedOrderReceipt.address?.phone && (
                  <p>📞 Phone: {selectedOrderReceipt.address.phone}</p>
                )}
              </div>

              {/* Total Calculation */}
              <div className="receipt-total-summary">
                <div className="receipt-sum-row">
                  <span>Delivery Charges</span>
                  <span>₹2.00</span>
                </div>
                <div className="receipt-sum-row total">
                  <span>Total Paid</span>
                  <strong className="receipt-price-bold">₹{Number(selectedOrderReceipt.amount).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      {/* ========================================== */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-dialog-card delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="danger-modal-title">Delete Account Confirmation</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeleteAccountConfirm} className="modal-form-body">
              <p className="delete-warning-text">
                ⚠️ <strong>Warning:</strong> This action cannot be undone. All your order history, delivery addresses, and personal profile data will be permanently wiped out.
              </p>

              <div className="form-field-group">
                <label className="field-label">Enter your password to confirm *</label>
                <input
                  type="password"
                  className="modern-input"
                  placeholder="Your current password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="secondary-cancel-btn"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="danger-confirm-btn"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Permanently Delete Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
