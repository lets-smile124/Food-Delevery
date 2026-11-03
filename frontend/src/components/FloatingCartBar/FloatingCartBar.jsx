import React, { useContext } from "react";
import "./FloatingCartBar.css";
import { StoreContext } from "../../context/StoreContext";
import { useLocation, useNavigate } from "react-router-dom";
import FoodPricingService from "../../services/FoodPricingService";

const FloatingCartBar = ({ setShowLogin }) => {
  const { cartItems, food_list, getTotalCartAmount, token } =
    useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on checkout / cart / verify pages
  const hiddenPaths = ["/cart", "/order", "/verify"];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  // Calculate total items and compile order summary
  let totalItemsCount = 0;
  const itemsSummary = [];

  for (const cartKey in cartItems) {
    const qty = cartItems[cartKey];
    if (qty > 0) {
      totalItemsCount += qty;
      const { baseId, size } = FoodPricingService.parseCartKey(cartKey);
      const itemInfo = food_list.find((p) => p._id === baseId);
      if (itemInfo) {
        itemsSummary.push({
          name: itemInfo.name,
          qty,
          size: size !== "Medium" ? size : "",
        });
      }
    }
  }

  const totalAmount = getTotalCartAmount ? getTotalCartAmount() : 0;

  // Don't render if cart is empty
  if (totalItemsCount === 0 || totalAmount === 0) {
    return null;
  }

  // Format short summary string (e.g. "Greek Salad × 2, Truffle Pasta × 1")
  const summaryText = itemsSummary
    .slice(0, 2)
    .map((it) => `${it.name} × ${it.qty}`)
    .join(", ");
  const extraCount = itemsSummary.length > 2 ? ` +${itemsSummary.length - 2} more` : "";

  const handleCheckoutClick = () => {
    if (!token) {
      if (setShowLogin) setShowLogin(true);
      return;
    }
    navigate("/cart");
  };

  return (
    <div className="floating-cart-bar-wrapper">
      <div className="floating-cart-bar">
        {/* Left: Summary & Total */}
        <div className="cart-bar-left" onClick={() => navigate("/cart")}>
          <div className="cart-bar-badge">
            <span className="cart-bag-icon">🛒</span>
            <span className="cart-items-qty">
              {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="cart-bar-divider"></div>

          <div className="cart-bar-meta">
            <div className="cart-bar-price">₹{totalAmount}</div>
            <div className="cart-bar-summary" title={summaryText + extraCount}>
              {summaryText}
              {extraCount}
            </div>
          </div>
        </div>

        {/* Right: Proceed Button */}
        <div className="cart-bar-right">
          <button
            type="button"
            className="cart-bar-checkout-btn"
            onClick={handleCheckoutClick}
          >
            <span>Proceed to Checkout</span>
            <span className="cart-bar-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingCartBar;

