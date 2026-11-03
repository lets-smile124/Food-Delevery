import React, { useState, useEffect } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url + "/api/order/list");
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: newStatus,
      });
      if (response.data.success) {
        toast.success(`Order status updated to "${newStatus}"`);
        // Update local state directly for instantaneous feedback
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    }
  };

  const deleteOrderHandler = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order? This action will permanently remove it from the system."
    );
    if (!confirmed) return;

    try {
      setDeletingId(orderId);
      const response = await axios.post(url + "/api/order/remove", { orderId });
      if (response.data.success) {
        toast.success("Order removed successfully!");
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
      } else {
        toast.error(response.data.message || "Failed to remove order");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete order failed");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    return (order.status || "").toLowerCase().includes(activeFilter.toLowerCase());
  });

  // Calculate order metrics
  const totalCount = orders.length;
  const processingCount = orders.filter((o) =>
    (o.status || "").toLowerCase().includes("processing")
  ).length;
  const deliveryCount = orders.filter((o) =>
    (o.status || "").toLowerCase().includes("out")
  ).length;
  const deliveredCount = orders.filter((o) =>
    (o.status || "").toLowerCase().includes("delivered")
  ).length;

  return (
    <div className="admin-orders-page">
      {/* Top Header */}
      <div className="orders-page-header">
        <div>
          <h2 className="orders-page-title">Order Dispatch & Management</h2>
          <p className="orders-page-subtitle">
            Monitor incoming customer feasts, update delivery dispatch, or purge completed orders
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAllOrders}
          className="admin-refresh-btn"
          title="Refresh orders list"
        >
          <span>↻</span>
          <span>Refresh Live Data</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="admin-stats-grid">
        <div
          className={`stat-card ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          <div className="stat-card-info">
            <span className="stat-card-title">Total Orders</span>
            <span className="stat-card-number">{totalCount}</span>
          </div>
          <div className="stat-card-icon total">📦</div>
        </div>

        <div
          className={`stat-card ${activeFilter === "processing" ? "active" : ""}`}
          onClick={() => setActiveFilter("processing")}
        >
          <div className="stat-card-info">
            <span className="stat-card-title">Food Processing</span>
            <span className="stat-card-number">{processingCount}</span>
          </div>
          <div className="stat-card-icon processing">🍳</div>
        </div>

        <div
          className={`stat-card ${activeFilter === "out" ? "active" : ""}`}
          onClick={() => setActiveFilter("out")}
        >
          <div className="stat-card-info">
            <span className="stat-card-title">Out for Delivery</span>
            <span className="stat-card-number">{deliveryCount}</span>
          </div>
          <div className="stat-card-icon delivery">🚴</div>
        </div>

        <div
          className={`stat-card ${activeFilter === "delivered" ? "active" : ""}`}
          onClick={() => setActiveFilter("delivered")}
        >
          <div className="stat-card-info">
            <span className="stat-card-title">Delivered</span>
            <span className="stat-card-number">{deliveredCount}</span>
          </div>
          <div className="stat-card-icon delivered">✅</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="orders-filter-bar">
        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-tab-pill ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All Orders ({totalCount})
          </button>
          <button
            type="button"
            className={`filter-tab-pill ${activeFilter === "processing" ? "active" : ""}`}
            onClick={() => setActiveFilter("processing")}
          >
            Processing ({processingCount})
          </button>
          <button
            type="button"
            className={`filter-tab-pill ${activeFilter === "out" ? "active" : ""}`}
            onClick={() => setActiveFilter("out")}
          >
            Out for Delivery ({deliveryCount})
          </button>
          <button
            type="button"
            className={`filter-tab-pill ${activeFilter === "delivered" ? "active" : ""}`}
            onClick={() => setActiveFilter("delivered")}
          >
            Delivered ({deliveredCount})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="admin-loading-state">
          <div className="admin-spinner"></div>
          <p>Loading latest orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-empty-state">
          <span className="empty-state-icon">📭</span>
          <h3>No Orders Found</h3>
          <p>
            {activeFilter === "all"
              ? "No customer orders have been placed yet."
              : `There are currently no orders with status "${activeFilter}".`}
          </p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filteredOrders.map((order, index) => {
            const customerName =
              order.address?.firstName || order.address?.lastName
                ? `${order.address.firstName || ""} ${order.address.lastName || ""}`.trim()
                : "Customer";

            const fullAddress = [
              order.address?.street,
              order.address?.city,
              order.address?.country,
              order.address?.zipcode,
            ]
              .filter(Boolean)
              .join(", ");

            const statusClass = (order.status || "")
              .toLowerCase()
              .includes("delivered")
              ? "status-delivered"
              : (order.status || "").toLowerCase().includes("out")
              ? "status-delivery"
              : "status-processing";

            const dateFormatted = order.date
              ? new Date(order.date).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recent";

            return (
              <div key={order._id || index} className="admin-order-card">
                {/* Header Row */}
                <div className="admin-order-header">
                  <div className="order-primary-info">
                    <div className="order-box-symbol">
                      <img src={assets.parcel_icon} alt="Order" />
                    </div>
                    <div>
                      <div className="order-id-badge">
                        <span>Order #{order._id?.slice(-6).toUpperCase()}</span>
                        <span className="order-date-pill">{dateFormatted}</span>
                      </div>
                      <h4 className="customer-display-name">{customerName}</h4>
                    </div>
                  </div>

                  <div className="order-action-controls">
                    <div className="status-dropdown-wrapper">
                      <select
                        className={`admin-status-select ${statusClass}`}
                        onChange={(e) => statusHandler(e, order._id)}
                        value={order.status || "Food Processing"}
                      >
                        <option value="Food Processing">🍳 Food Processing</option>
                        <option value="Out for delivery">🚴 Out for delivery</option>
                        <option value="Delivered">✅ Delivered</option>
                      </select>
                    </div>

                    {/* Admin Delete Order Option */}
                    <button
                      type="button"
                      className="admin-delete-order-btn"
                      onClick={() => deleteOrderHandler(order._id)}
                      disabled={deletingId === order._id}
                      title="Permanently delete this order"
                    >
                      {deletingId === order._id ? "..." : "🗑️ Delete"}
                    </button>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="admin-order-body">
                  {/* Food Items */}
                  <div className="order-section-items">
                    <span className="section-label">Ordered Dishes:</span>
                    <div className="order-dishes-chips">
                      {order.items.map((item, i) => (
                        <div key={i} className="dish-chip">
                          <span className="dish-chip-name">{item.name}</span>
                          <span className="dish-chip-qty">×{item.quantity}</span>
                          {item.selectedSize && (
                            <span className="dish-chip-size">({item.selectedSize})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Delivery Details */}
                  <div className="order-section-address">
                    <span className="section-label">Delivery Address:</span>
                    <p className="address-text">
                      <span className="address-pin-icon">📍</span>
                      {fullAddress || "No address provided"}
                    </p>
                    {order.address?.phone && (
                      <p className="phone-text">
                        <span>📞 Phone:</span>
                        <a href={`tel:${order.address.phone}`} className="phone-link">
                          {order.address.phone}
                        </a>
                      </p>
                    )}
                    {order.address?.email && (
                      <p className="email-text">
                        <span>✉️ Email:</span> {order.address.email}
                      </p>
                    )}
                  </div>

                  {/* Summary & Price */}
                  <div className="order-section-total">
                    <div className="total-stat-box">
                      <span className="stat-label">Items Count</span>
                      <strong className="stat-val">{order.items.length} items</strong>
                    </div>

                    <div className="total-stat-box highlight">
                      <span className="stat-label">Total Amount</span>
                      <strong className="stat-price">₹{Number(order.amount).toFixed(2)}</strong>
                      <span className="stat-payment-tag">
                        {order.payment ? "✓ Paid Online" : "⚠️ Payment Pending"}
                      </span>
                    </div>
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

export default Orders;
