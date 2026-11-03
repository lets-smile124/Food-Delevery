import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ url }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({
    name: "Store Manager",
    role: "Super Admin",
    avatar: "",
  });

  useEffect(() => {
    const fetchNavAdmin = async () => {
      try {
        const apiUrl = url || "http://localhost:4000";
        const res = await axios.get(`${apiUrl}/api/admin/profile`);
        if (res.data.success && res.data.admin) {
          setAdmin(res.data.admin);
        }
      } catch (err) {
        // Silently use defaults
      }
    };
    fetchNavAdmin();
  }, [url]);

  return (
    <header className="admin-navbar">
      <div className="admin-nav-left">
        <a href="/orders" className="admin-logo-wrapper">
          <img className="admin-logo" src={assets.logo} alt="Tomato" />
          <span className="admin-badge">Admin Suite</span>
        </a>
      </div>

      <div className="admin-nav-right">
        <div className="admin-status-pill">
          <span className="status-indicator-dot"></span>
          <span className="status-text">Store Live</span>
        </div>

        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="visit-store-btn"
          title="Open customer food store in a new tab"
        >
          <span>View Customer Store</span>
          <span>↗</span>
        </a>

        <div
          className="admin-profile-pill"
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
          title="Manage Admin Profile & Settings"
        >
          <div className="admin-avatar-container">
            <img
              className="admin-profile-img"
              src={admin.avatar || assets.profile_image}
              alt="Admin"
            />
            <span className="avatar-online-dot"></span>
          </div>
          <div className="admin-profile-meta">
            <span className="admin-name">{admin.name || "Store Manager"}</span>
            <span className="admin-role">{admin.role || "Super Admin"}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
