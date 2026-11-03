import React, { useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data || []);
      } else {
        toast.error("Failed to load food list");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load food list");
    } finally {
      setLoading(false);
    }
  };

  const removeFood = async (foodId, foodName) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${foodName || "this dish"}" from the menu?`
    );
    if (!confirmed) return;

    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      if (response.data.success) {
        toast.success(response.data.message || "Dish removed successfully");
        setList((prev) => prev.filter((item) => item._id !== foodId));
      } else {
        toast.error(response.data.message || "Error removing food");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete dish");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const categories = ["All", ...new Set(list.map((item) => item.category).filter(Boolean))];

  const filteredList = list.filter((item) => {
    const matchesSearch = (item.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-list-page">
      <div className="list-page-header">
        <div>
          <h2 className="list-page-title">Menu Inventory ({list.length})</h2>
          <p className="list-page-subtitle">
            Manage your active restaurant dishes, categories, and live pricing
          </p>
        </div>

        <a href="/add" className="add-dish-shortcut-btn">
          <span>+</span>
          <span>Add New Dish</span>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="list-controls-card">
        <div className="list-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search dish by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="category-scroll-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-filter-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Table */}
      {loading ? (
        <div className="admin-loading-state">
          <div className="admin-spinner"></div>
          <p>Loading menu items...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="admin-empty-state">
          <span className="empty-state-icon">🥗</span>
          <h3>No Dishes Match Your Search</h3>
          <p>Try clearing your search filters or add a new recipe to the menu.</p>
        </div>
      ) : (
        <div className="list-table-container">
          <table className="modern-food-table">
            <thead>
              <tr>
                <th style={{ width: "90px" }}>Image</th>
                <th>Dish Name</th>
                <th>Category</th>
                <th>Price</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => {
                const imageSrc = (item.image || "").startsWith("http")
                  ? item.image
                  : `${url}/images/${item.image}`;

                return (
                  <tr key={item._id}>
                    <td>
                      <div className="dish-table-thumbnail">
                        <img
                          src={imageSrc}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80";
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <strong className="dish-name-cell">{item.name}</strong>
                      {item.description && (
                        <p className="dish-desc-cell">{item.description}</p>
                      )}
                    </td>
                    <td>
                      <span className="dish-category-badge">{item.category}</span>
                    </td>
                    <td>
                      <span className="dish-price-cell">₹{item.price}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="dish-delete-action-btn"
                        onClick={() => removeFood(item._id, item.name)}
                        title="Delete this dish"
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default List;
