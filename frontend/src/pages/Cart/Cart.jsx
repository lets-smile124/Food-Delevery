import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import CartCalculator from "../../utils/CartCalculator";

const Cart = () => {
  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    url,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    getDiscountAmount,
    getFinalTotal,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  const detailedItems = CartCalculator.getCartItemsDetailed(cartItems, food_list);
  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : 2;
  const discount = getDiscountAmount ? getDiscountAmount() : 0;
  const finalTotal = getFinalTotal ? getFinalTotal() : subtotal + deliveryFee;

  // Handle promo code submission with first-order backend validation
  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    try {
      setPromoLoading(true);
      setPromoMessage(null);
      const res = await applyPromoCode(promoInput);
      if (res.success) {
        setPromoMessage({ type: "success", text: res.message });
        setShowCelebration(true);
        setPromoInput("");
        // Hide full screen celebration burst after 3 seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 3500);
      } else {
        setPromoMessage({ type: "error", text: res.message });
        setShakeInput(true);
        setTimeout(() => setShakeInput(false), 600);
      }
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoMessage(null);
    setShowCelebration(false);
  };

  return (
    <div className="cart">
      {/* ================= CELEBRATION ANIMATION POPUP ================= */}
      {showCelebration && (
        <div className="promo-celebration-overlay">
          <div className="confetti-container">
            {[...Array(24)].map((_, i) => (
              <span key={i} className={`confetti piece-${i % 6}`} />
            ))}
          </div>

          <div className="celebration-badge-card">
            <span className="celebration-emoji">🎉</span>
            <div className="celebration-text">
              <h3>20% OFF APPLIED!</h3>
              <p>You unlocked a special 20% discount on your feast.</p>
            </div>
            <button
              type="button"
              className="celebration-close-btn"
              onClick={() => setShowCelebration(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="cart-header-title">
        <h2>Your Culinary Bag</h2>
        <p className="cart-subtitle">Review portion sizes and finalize your order</p>
      </div>

      <div className="cart-items-card">
        <div className="cart-items-title">
          <p>Dish</p>
          <p>Details</p>
          <p>Portion Price</p>
          <p>Quantity</p>
          <p>Subtotal</p>
          <p>Action</p>
        </div>
        <hr className="cart-divider" />

        {detailedItems.length > 0 ? (
          detailedItems.map((item) => {
            const imgSrc = item.food.image?.startsWith("http")
              ? item.food.image
              : `${url}/images/${item.food.image}`;

            return (
              <React.Fragment key={item.cartKey}>
                <div className="cart-items-title cart-items-item">
                  <div className="cart-dish-thumb-wrap">
                    <img src={imgSrc} alt={item.food.name} className="cart-dish-thumb" />
                  </div>

                  <div className="cart-item-title-col">
                    <p className="cart-item-name">{item.food.name}</p>
                    <span className={`cart-size-pill size-${item.size.toLowerCase()}`}>
                      {item.sizeOption.name} Portion
                    </span>
                  </div>

                  <p className="cart-item-price">₹{item.unitPrice}</p>
                  
                  <div className="cart-qty-badge">
                    <span>× {item.quantity}</span>
                  </div>

                  <p className="cart-item-subtotal">₹{item.totalPrice}</p>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.cartKey)}
                    className="cart-remove-icon-btn"
                    title="Remove this dish"
                  >
                    ✕
                  </button>
                </div>
                <hr className="cart-item-separator" />
              </React.Fragment>
            );
          })
        ) : (
          <div className="cart-empty-state">
            <span className="empty-cart-icon">🛒</span>
            <h3>Your Bag is Empty</h3>
            <p>Explore our handcrafted menu and add delicious chef-prepared dishes.</p>
            <button className="cart-browse-btn" onClick={() => navigate("/")}>
              Explore Menu & Order
            </button>
          </div>
        )}
      </div>

      {detailedItems.length > 0 && (
        <div className="cart-bottom">
          {/* ================= RECEIPT TOTAL CARD ================= */}
          <div className="cart-total">
            <h2>Order Summary</h2>
            <div className="cart-summary-box">
              <div className="cart-total-details">
                <p>Bag Subtotal</p>
                <p>₹{subtotal}</p>
              </div>

              {appliedPromo && discount > 0 && (
                <>
                  <hr className="summary-divider" />
                  <div className="cart-total-details promo-applied-row">
                    <div className="promo-tag-label">
                      <span>🏷️ Promo (NEW_USER - 20% OFF)</span>
                      <button
                        type="button"
                        className="remove-promo-pill"
                        onClick={handleRemovePromo}
                        title="Remove promo"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="promo-savings-val">-₹{discount}</p>
                  </div>
                </>
              )}

              <hr className="summary-divider" />
              <div className="cart-total-details">
                <p>Delivery & Packaging</p>
                <p>₹{deliveryFee}</p>
              </div>

              <hr className="summary-divider highlight" />
              <div className="cart-total-details final-total-row">
                <b>Grand Total</b>
                <b className="final-total-amount">₹{finalTotal}</b>
              </div>
            </div>

            <button
              type="button"
              className="cart-checkout-btn"
              onClick={() => navigate("/order")}
            >
              <span>Proceed To Checkout</span>
              <span className="checkout-arrow">→</span>
            </button>
          </div>

          {/* ================= PROMO CODE SECTION ================= */}
          <div className="cart-promocode">
            <div className="promocode-box">
              <div className="promocode-header">
                <span className="promocode-badge">Special Offers</span>
                <h3>Have a Promo Code?</h3>
                <p className="promocode-hint">
                  Ordering for the first time? Use code <code className="promo-hint-code">NEW_USER</code> to get <strong>20% OFF</strong> your 1st feast!
                </p>
              </div>

              {appliedPromo ? (
                <div className="promo-active-card">
                  <div className="active-promo-info">
                    <span className="active-sparkle">✨</span>
                    <div>
                      <strong>Code "{appliedPromo}" Active</strong>
                      <small>20% first-order discount applied to your order</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="promo-cancel-btn"
                    onClick={handleRemovePromo}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handlePromoSubmit}
                  className={`cart-promocode-input ${shakeInput ? "shake-animate" : ""}`}
                >
                  <input
                    type="text"
                    placeholder="Enter promo code (e.g. NEW_USER)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    disabled={promoLoading}
                  />
                  <button type="submit" disabled={promoLoading}>
                    {promoLoading ? "Checking..." : "Apply Code"}
                  </button>
                </form>
              )}

              {promoMessage && !appliedPromo && (
                <div className={`promo-feedback-msg ${promoMessage.type}`}>
                  {promoMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
