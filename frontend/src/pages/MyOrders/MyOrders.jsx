import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import orderService from "../../services/OrderService";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const { token } = useContext(StoreContext);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders(token);
      if (response.success) {
        setData(response.data || []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.log("Fetch orders error:", error.response?.data || error.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Handle removing delivered order from user history
  const handleRemoveDeliveredOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this delivered order from your history?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(orderId);
      const res = await orderService.removeUserOrder(orderId, token);
      if (res.success) {
        setData((prev) => prev.filter((order) => order._id !== orderId));
        setFeedback({
          type: "success",
          message: "Order successfully removed from your history.",
        });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Failed to remove order.",
        });
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Could not remove order.",
      });
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setDeletingId(null);
    }
  };

  // Helper for status badge styling
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

  return (
    <div className="my-orders">
      <div className="my-orders-header">
        <div>
          <h2>My Orders</h2>
          <p className="my-orders-subtitle">
            Track your real-time deliveries and view your order history
          </p>
        </div>

        <button
          type="button"
          className="my-orders-refresh-btn"
          onClick={fetchOrders}
          title="Refresh orders"
        >
          <span>↻</span>
          <span>Refresh Status</span>
        </button>
      </div>

      {feedback && (
        <div className={`orders-feedback-banner ${feedback.type}`}>
          <span>{feedback.type === "success" ? "✓" : "⚠️"}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="orders-loading-state">
          <div className="orders-spinner"></div>
          <p>Fetching your orders...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="orders-empty-card">
          <span className="empty-box-icon">📦</span>
          <h3>No Orders Placed Yet</h3>
          <p>Your culinary journey starts here! Explore our fresh menu and satisfy your cravings.</p>
          <button
            type="button"
            className="orders-explore-btn"
            onClick={() => navigate("/")}
          >
            Explore Menu & Order
          </button>
        </div>
      ) : (
        <div className="my-orders-list">
          {data.map((order, index) => {
            const statusInfo = getStatusBadge(order.status);
            const isDelivered = (order.status || "").toLowerCase().trim() === "delivered";
            const dateStr = order.date
              ? new Date(order.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : `Order #${order._id?.slice(-6).toUpperCase() || index + 1}`;

            return (
              <div key={order._id || index} className="order-card">
                <div className="order-card-header">
                  <div className="order-id-meta">
                    <div className="order-icon-badge">
                      <img src={assets.parcel_icon} alt="Order Box" />
                    </div>
                    <div>
                      <span className="order-num">
                        Order #{order._id?.slice(-6).toUpperCase() || index + 1}
                      </span>
                      <small className="order-time">{dateStr}</small>
                    </div>
                  </div>

                  <div className="order-header-right">
                    <div className={`order-status-badge ${statusInfo.className}`}>
                      <span
                        className="status-pulse-dot"
                        style={{ backgroundColor: statusInfo.dotColor }}
                      />
                      <span>{statusInfo.label}</span>
                    </div>

                    {/* ONLY delivered orders can be removed from history */}
                    {isDelivered && (
                      <button
                        type="button"
                        className="order-remove-history-btn"
                        onClick={() => handleRemoveDeliveredOrder(order._id)}
                        disabled={deletingId === order._id}
                        title="Remove this delivered order from your history"
                      >
                        {deletingId === order._id ? "Removing..." : "Remove History 🗑️"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-items-col">
                    <span className="items-label">Dishes Ordered:</span>
                    <p className="order-dishes-text">
                      {order.items.map((item, idx) => {
                        const isLast = idx === order.items.length - 1;
                        return (
                          <span key={idx} className="order-item-token">
                            <strong>{item.name}</strong> × {item.quantity}
                            {item.selectedSize ? ` (${item.selectedSize})` : ""}
                            {!isLast && ", "}
                          </span>
                        );
                      })}
                    </p>
                  </div>

                  <div className="order-card-meta-row">
                    <div className="meta-stat">
                      <span className="stat-label">Total Items</span>
                      <strong className="stat-val">
                        {order.items.reduce((acc, it) => acc + (it.quantity || 1), 0)} items
                      </strong>
                    </div>

                    <div className="meta-stat">
                      <span className="stat-label">Total Amount</span>
                      <strong className="stat-amount">₹{Number(order.amount).toFixed(2)}</strong>
                    </div>

                    <button
                      type="button"
                      className="track-order-btn"
                      onClick={fetchOrders}
                    >
                      <span>Track Order</span>
                      <span className="track-arrow">→</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
