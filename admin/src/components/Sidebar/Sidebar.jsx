import React from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-section-label">MAIN DISPATCH</div>
      <nav className="sidebar-options">
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `sidebar-option ${isActive ? "active" : ""}`
          }
        >
          <div className="sidebar-icon-wrap">
            <img src={assets.order_icon} alt="Orders" />
          </div>
          <div className="sidebar-label-group">
            <span className="sidebar-title">Live Orders</span>
            <span className="sidebar-desc">Manage & track delivery</span>
          </div>
        </NavLink>

        <NavLink
          to="/list"
          className={({ isActive }) =>
            `sidebar-option ${isActive ? "active" : ""}`
          }
        >
          <div className="sidebar-icon-wrap">
            <span className="sidebar-emoji-icon">🍱</span>
          </div>
          <div className="sidebar-label-group">
            <span className="sidebar-title">Menu Inventory</span>
            <span className="sidebar-desc">View all live dishes</span>
          </div>
        </NavLink>

        <NavLink
          to="/add"
          className={({ isActive }) =>
            `sidebar-option ${isActive ? "active" : ""}`
          }
        >
          <div className="sidebar-icon-wrap">
            <img src={assets.add_icon} alt="Add Item" />
          </div>
          <div className="sidebar-label-group">
            <span className="sidebar-title">Add New Dish</span>
            <span className="sidebar-desc">Upload & price menu</span>
          </div>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-option ${isActive ? "active" : ""}`
          }
        >
          <div className="sidebar-icon-wrap">
            <span className="sidebar-emoji-icon">⚙️</span>
          </div>
          <div className="sidebar-label-group">
            <span className="sidebar-title">Admin Profile</span>
            <span className="sidebar-desc">Settings & restaurant info</span>
          </div>
        </NavLink>
      </nav>

      <div className="sidebar-footer-card">
        <div className="sidebar-footer-icon">⚡</div>
        <div className="sidebar-footer-text">
          <strong>Auto-sync Active</strong>
          <small>Orders update in real-time</small>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
