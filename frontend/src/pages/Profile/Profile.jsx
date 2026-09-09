import React, { useContext, useEffect, useState } from "react";
import "./Profile.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const Profile = ({ onClose, onLogout }) => {
    const { url, token } = useContext(StoreContext);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(
                `${url}/api/user/profile`,
                {
                    headers: {
                        token: token,
                    },
                }
            );

            console.log("Profile response:", response.data);

            if (response.data.success) {
                setUser(response.data.user);
            } else {
                console.log(
                    "Profile error:",
                    response.data.message
                );
            }

        } catch (error) {
            console.log(
                "Profile API error:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [token]);

    return (
        <div className="profile-overlay" onClick={onClose}>

            <div
                className="profile-popup"
                onClick={(e) => e.stopPropagation()}
            >

                {/* CLOSE BUTTON */}

                <button
                    className="profile-close"
                    onClick={onClose}
                >
                    ×
                </button>

                {/* AVATAR */}

                <div className="profile-avatar">
                    👤
                </div>

                <h2>My Profile</h2>

                {loading ? (
                    <p className="profile-loading">
                        Loading profile...
                    </p>
                ) : (
                    <>

                        {/* NAME */}

                        <div className="profile-field">
                            <span className="profile-label">
                                Name
                            </span>

                            <p>
                                {user?.name ||
                                    "Name not available"}
                            </p>
                        </div>

                        {/* EMAIL */}

                        <div className="profile-field">
                            <span className="profile-label">
                                Email
                            </span>

                            <p>
                                {user?.email ||
                                    "Email not available"}
                            </p>
                        </div>

                        {/* ADDRESS */}

                        <div className="profile-field">
                            <span className="profile-label">
                                Address
                            </span>

                            <p>
                                {user?.address ||
                                    "No address added"}
                            </p>
                        </div>

                    </>
                )}

                {/* LOGOUT */}

                <button
                    className="profile-logout"
                    onClick={onLogout}
                >
                    Logout
                </button>

            </div>

        </div>
    );
};

export default Profile;