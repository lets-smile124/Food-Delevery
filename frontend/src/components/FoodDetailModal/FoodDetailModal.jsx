import React, { useContext, useState, useEffect } from "react";
import "./FoodDetailModal.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import FoodPricingService, { FOOD_SIZES } from "../../services/FoodPricingService";

const FoodDetailModal = ({ food, onClose, setShowLogin }) => {
  const {
    addToCart,
    removeFromCart,
    getItemSizeQuantity,
    getItemTotalQuantity,
    url,
    token,
  } = useContext(StoreContext);

  // Initialize with a random size between Small, Medium, and Large
  const [selectedSize, setSelectedSize] = useState(() => FoodPricingService.getRandomSize());

  // Randomize selected size whenever a new food item is opened
  useEffect(() => {
    if (food) {
      setSelectedSize(FoodPricingService.getRandomSize());
    }
  }, [food?._id]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!food) return null;

  const currentPrice = FoodPricingService.getPrice(food.price, selectedSize);
  const currentQuantity = getItemSizeQuantity(food._id, selectedSize);
  const totalItemQuantity = getItemTotalQuantity(food._id);

  // Total monetary amount for all selected portions of this food item
  const totalFoodAmount = Object.values(FOOD_SIZES).reduce((sum, sizeOpt) => {
    const qty = getItemSizeQuantity(food._id, sizeOpt.key);
    const price = FoodPricingService.getPrice(food.price, sizeOpt.key);
    return sum + qty * price;
  }, 0);

  // Summary breakdown text of all portions added for this food
  const selectedBreakdown = Object.values(FOOD_SIZES)
    .filter((sizeOpt) => getItemSizeQuantity(food._id, sizeOpt.key) > 0)
    .map((sizeOpt) => {
      const qty = getItemSizeQuantity(food._id, sizeOpt.key);
      const price = FoodPricingService.getPrice(food.price, sizeOpt.key);
      return `${qty} × ${sizeOpt.name} (₹${qty * price})`;
    });

  const imageUrl = food.image?.startsWith("http")
    ? food.image
    : `${url}/images/${food.image}`;

  const handleSizeAdd = async (sizeKey, e) => {
    if (e) e.stopPropagation();
    if (!token) {
      onClose();
      setShowLogin(true);
      return;
    }
    setSelectedSize(sizeKey);
    await addToCart(food._id, sizeKey);
  };

  const handleSizeRemove = async (sizeKey, e) => {
    if (e) e.stopPropagation();
    if (!token) {
      onClose();
      setShowLogin(true);
      return;
    }
    setSelectedSize(sizeKey);
    await removeFromCart(food._id, sizeKey);
  };

  return (
    <div className="food-modal-backdrop" onClick={onClose}>
      <div
        className="food-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          className="food-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="food-modal-body">
          {/* Left Column: Image & Badges */}
          <div className="food-modal-image-wrapper">
            <img
              src={imageUrl}
              alt={food.name}
              className="food-modal-image"
            />
            <span className="food-modal-category-badge">
              {food.category || "Special"}
            </span>
            {totalItemQuantity > 0 && (
              <span className="food-modal-in-cart-pill">
                ✓ {totalItemQuantity} in cart
              </span>
            )}
          </div>

          {/* Right Column: Details & Size Selection */}
          <div className="food-modal-content">
            <div className="food-modal-header">
              <div className="food-modal-title-row">
                <h2>{food.name}</h2>
                <div className="food-modal-rating">
                  <img src={assets.rating_starts} alt="Rating stars" />
                  <span>4.8 (120+ reviews)</span>
                </div>
              </div>

              <p className="food-modal-desc">{food.description}</p>
            </div>

            {/* Size Options Section */}
            <div className="food-modal-sizes-section">
              <div className="food-modal-sizes-header">
                <h3>Choose Portion Size</h3>
                <span className="food-modal-sizes-hint">Required</span>
              </div>

              <div className="food-modal-sizes-grid">
                {Object.values(FOOD_SIZES).map((sizeOpt) => {
                  const sizePrice = FoodPricingService.getPrice(food.price, sizeOpt.key);
                  const isSelected = selectedSize === sizeOpt.key;
                  const qtyForThisSize = getItemSizeQuantity(food._id, sizeOpt.key);

                  return (
                    <div
                      key={sizeOpt.key}
                      className={`food-size-card ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedSize(sizeOpt.key)}
                    >
                      <div className="food-size-card-main">
                        <div className="food-size-card-top">
                          <span className="food-size-badge">{sizeOpt.badge}</span>
                          <div className="food-size-name-wrap">
                            <span className="food-size-name">{sizeOpt.name}</span>
                            <span className="food-size-tagline">{sizeOpt.tagline}</span>
                          </div>
                        </div>

                        <p className="food-size-description">{sizeOpt.description}</p>

                        <div className="food-size-card-bottom">
                          <span className="food-size-price">₹{sizePrice}</span>
                          {qtyForThisSize > 0 && (
                            <span className="food-size-subtotal-tag">
                              (Total: ₹{sizePrice * qtyForThisSize})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add/Remove counter icons right on the size card */}
                      <div className="food-size-card-action">
                        {qtyForThisSize === 0 ? (
                          <img
                            src={assets.add_icon_white}
                            alt="Add"
                            className="size-add-icon-btn"
                            title={`Add ${sizeOpt.name}`}
                            onClick={(e) => handleSizeAdd(sizeOpt.key, e)}
                          />
                        ) : (
                          <div
                            className="food-size-icon-counter"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img
                              src={assets.remove_icon_red}
                              alt="Remove"
                              className="size-counter-icon"
                              title="Decrease"
                              onClick={(e) => handleSizeRemove(sizeOpt.key, e)}
                            />
                            <span className="size-counter-qty">{qtyForThisSize}</span>
                            <img
                              src={assets.add_icon_green}
                              alt="Add"
                              className="size-counter-icon"
                              title="Increase"
                              onClick={(e) => handleSizeAdd(sizeOpt.key, e)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer: Total Amount Selected & Actions */}
            <div className="food-modal-footer">
              <div className="food-modal-price-display">
                <span className="food-modal-price-label">
                  {totalItemQuantity > 0
                    ? `Total Amount Selected (${totalItemQuantity} item${totalItemQuantity > 1 ? "s" : ""}):`
                    : `Price for ${FOOD_SIZES[selectedSize]?.name || selectedSize}:`}
                </span>
                <span className="food-modal-price-val">
                  ₹{totalItemQuantity > 0 ? totalFoodAmount : currentPrice}
                </span>

                {totalItemQuantity > 0 && selectedBreakdown.length > 0 && (
                  <span className="food-modal-breakdown-text">
                    {selectedBreakdown.join(" • ")}
                  </span>
                )}
              </div>

              <div className="food-modal-action-row">
                {currentQuantity === 0 ? (
                  <button
                    className="food-modal-add-btn"
                    onClick={(e) => handleSizeAdd(selectedSize, e)}
                  >
                    <img
                      src={assets.add_icon_white}
                      alt="Add icon"
                      className="modal-btn-add-icon"
                    />
                    <span>Add {FOOD_SIZES[selectedSize]?.name}</span>
                    <span className="btn-divider">•</span>
                    <span>₹{currentPrice}</span>
                  </button>
                ) : (
                  <div className="food-modal-counter-wrap">
                    <div className="food-modal-icon-counter">
                      <img
                        src={assets.remove_icon_red}
                        alt="Remove"
                        className="modal-counter-img"
                        title="Decrease quantity"
                        onClick={(e) => handleSizeRemove(selectedSize, e)}
                      />
                      <span className="modal-counter-val">{currentQuantity}</span>
                      <img
                        src={assets.add_icon_green}
                        alt="Add"
                        className="modal-counter-img"
                        title="Increase quantity"
                        onClick={(e) => handleSizeAdd(selectedSize, e)}
                      />
                    </div>
                    <span className="food-modal-counter-subtotal">
                      {FOOD_SIZES[selectedSize]?.name} Total: ₹{currentPrice * currentQuantity}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailModal;
