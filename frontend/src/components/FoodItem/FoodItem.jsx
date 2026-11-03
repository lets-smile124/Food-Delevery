import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import FoodPricingService from "../../services/FoodPricingService";

const FoodItem = ({
  id,
  name,
  price,
  description,
  image,
  category,
  onCardClick,
}) => {
  const {
    cartItems,
    getItemTotalQuantity,
    url,
  } = useContext(StoreContext);

  const totalQuantity = getItemTotalQuantity
    ? getItemTotalQuantity(id)
    : cartItems?.[id] || 0;

  const smallPrice = FoodPricingService.getPrice(price, "Small");

  return (
    <div
      className="food-item"
      onClick={onCardClick}
      title="Click to view details & select size"
    >
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={
            image.startsWith("http")
              ? image
              : `${url}/images/${image}`
          }
          alt={name}
        />

        {totalQuantity > 0 && (
          <div className="food-item-badges">
            <span className="food-item-cart-badge">
              ✓ {totalQuantity} in cart
            </span>
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating" />
        </div>

        <p className="food-item-desc">{description}</p>

        <div className="food-item-price-row">
          <div>
            <span className="food-item-price-from">From </span>
            <span className="food-item-price">₹{smallPrice}</span>
          </div>
          <span className="food-item-customize-btn">Select Size &gt;</span>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
