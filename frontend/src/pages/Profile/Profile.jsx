import React, { useContext, useEffect, useState } from "react";
import "./Profile.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Profile = ({ onClose, onLogout }) => {
    const { token, setToken, userData, fetchUserProfile, updateUserProfile } = useContext(StoreContext);
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [saveLoading, setSaveLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (userData) {
            setEditName(userData.name || "");
            setEditAddress(userData.address || "");
        } else if (token) {
            fetchUserProfile(token);
        }
    }, [userData, token]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveLoading(true);
        setMessage("");

        const res = await updateUserProfile({
            name: editName.trim(),
            address: editAddress.trim(),
        });

        setSaveLoading(false);
        if (res.success) {
            setIsEditing(false);
            setMessage("Profile updated successfully!");
            setTimeout(() => setMessage(""), 3000);
        } else {
            setMessage(res.message || "Failed to update profile");
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate("/");
        }
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem("token");
            setToken("");
            navigate("/");
        }
    };

    const handleOrdersClick = () => {
        if (onClose) onClose();
        navigate("/myorders");
    };

    const firstLetter = userData?.name ? userData.name.trim().charAt(0).toUpperCase() : "👤";

    return (
        <div className="profile-overlay" onClick={handleClose}>
            <div className="profile-popup" onClick={(e) => e.stopPropagation()}>
                {/* CLOSE BUTTON */}
                <button
                    className="profile-close"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    ×
                </button>

                {/* AVATAR */}
                <div className="profile-avatar">
                    {firstLetter}
                </div>

                <h2>{userData?.name || "My Profile"}</h2>

                {message && (
                    <div className={`profile-status-msg ${message.includes("success") ? "success" : "error"}`}>
                        {message}
                    </div>
                )}

                {!userData ? (
                    <p className="profile-loading">Loading profile...</p>
                ) : isEditing ? (
                    <form onSubmit={handleSave} className="profile-edit-form">
                        <div className="profile-field">
                            <span className="profile-label">Name</span>
                            <input
                                type="text"
                                className="profile-input"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <span className="profile-label">Email (cannot change)</span>
                            <p className="profile-readonly-email">{userData.email}</p>
                        </div>

                        <div className="profile-field">
                            <span className="profile-label">Default Address</span>
                            <textarea
                                className="profile-textarea"
                                value={editAddress}
                                onChange={(e) => setEditAddress(e.target.value)}
                                placeholder="Enter street, city, state, zip"
                                rows="3"
                            />
                        </div>

                        <div className="profile-btn-row">
                            <button
                                type="button"
                                className="profile-cancel-btn"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditName(userData.name || "");
                                    setEditAddress(userData.address || "");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="profile-save-btn"
                                disabled={saveLoading}
                            >
                                {saveLoading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="profile-field">
                            <span className="profile-label">Name</span>
                            <p>{userData.name || "Name not set"}</p>
                        </div>

                        <div className="profile-field">
                            <span className="profile-label">Email</span>
                            <p>{userData.email || "Email not available"}</p>
                        </div>

                        <div className="profile-field">
                            <span className="profile-label">Address</span>
                            <p>{userData.address || "No address added yet"}</p>
                        </div>

                        <div className="profile-action-links">
                            <button
                                type="button"
                                className="profile-edit-trigger"
                                onClick={() => setIsEditing(true)}
                            >
                                ✏️ Edit Profile
                            </button>
                            <button
                                type="button"
                                className="profile-orders-trigger"
                                onClick={handleOrdersClick}
                            >
                                📦 My Orders
                            </button>
                        </div>
                    </>
                )}

                {/* LOGOUT */}
                <button
                    className="profile-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;