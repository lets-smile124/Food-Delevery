import React, { useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = ({ url }) => {
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.warning("Please upload a dish picture");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", Number(data.price));
      formData.append("category", data.category);
      formData.append("image", image);

      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad",
        });
        setImage(false);
        toast.success(response.data.message || "Food item published successfully!");
      } else {
        toast.error(response.data.message || "Failed to add food item");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-page">
      <div className="add-page-header">
        <div>
          <h2 className="add-page-title">Add New Culinary Dish</h2>
          <p className="add-page-subtitle">
            Create an enticing new menu offering with high-resolution imagery and pricing
          </p>
        </div>

        <a href="/list" className="view-inventory-link">
          <span>View Menu Inventory →</span>
        </a>
      </div>

      <div className="add-form-card">
        <form onSubmit={onSubmitHandler}>
          {/* Image Upload Zone */}
          <div className="form-group-section">
            <label className="form-section-label">Dish Presentation Image *</label>
            <div className="image-dropzone-container">
              <label htmlFor="dish-image" className="dropzone-label">
                {image ? (
                  <div className="image-preview-wrapper">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Dish Preview"
                      className="preview-image"
                    />
                    <div className="preview-overlay">
                      <span>Click to Change Photo 📷</span>
                    </div>
                  </div>
                ) : (
                  <div className="dropzone-empty-state">
                    <div className="upload-icon-circle">
                      <img src={assets.upload_area} alt="Upload" />
                    </div>
                    <strong className="dropzone-main-text">Upload Dish Photograph</strong>
                    <span className="dropzone-hint-text">
                      PNG, JPG, or WEBP up to 5MB (square 1:1 recommended)
                    </span>
                  </div>
                )}
              </label>
              <input
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                id="dish-image"
                accept="image/*"
                hidden
                required
              />
            </div>
          </div>

          {/* Product Name */}
          <div className="form-group-section">
            <label className="form-section-label" htmlFor="name">Dish Title *</label>
            <input
              id="name"
              className="admin-input-field"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              name="name"
              placeholder="e.g. Creamy Truffle Fettuccine"
              required
            />
          </div>

          {/* Product Description */}
          <div className="form-group-section">
            <label className="form-section-label" htmlFor="description">Dish Description & Ingredients *</label>
            <textarea
              id="description"
              className="admin-textarea-field"
              onChange={onChangeHandler}
              value={data.description}
              name="description"
              rows="4"
              placeholder="Describe the mouth-watering flavors, fresh herbs, or preparation style..."
              required
            />
          </div>

          {/* Category & Price Row */}
          <div className="form-row-split">
            <div className="form-group-section">
              <label className="form-section-label" htmlFor="category">Category *</label>
              <select
                id="category"
                className="admin-select-field"
                onChange={onChangeHandler}
                value={data.category}
                name="category"
              >
                <option value="Salad">Salad</option>
                <option value="Rolls">Rolls</option>
                <option value="Deserts">Deserts</option>
                <option value="Sandwich">Sandwich</option>
                <option value="Cake">Cake</option>
                <option value="Pure Veg">Pure Veg</option>
                <option value="Pasta">Pasta</option>
                <option value="Noodles">Noodles</option>
              </select>
            </div>

            <div className="form-group-section">
              <label className="form-section-label" htmlFor="price">Base Price (₹) *</label>
              <div className="price-input-wrapper">
                <span className="price-prefix">₹</span>
                <input
                  id="price"
                  className="admin-input-field price-input"
                  onChange={onChangeHandler}
                  value={data.price}
                  type="number"
                  name="price"
                  placeholder="240"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-submit-row">
            <button
              type="submit"
              className="publish-dish-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Publishing Dish...</span>
                </>
              ) : (
                <>
                  <span>Publish to Menu ✨</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
