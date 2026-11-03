import React, { useContext, useEffect, useState, useRef } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import orderService from "../../services/OrderService";
import CartCalculator from "../../utils/CartCalculator";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    userData,
    getDiscountAmount,
    getFinalTotal,
    appliedPromo,
    url,
    authLoading,
  } = useContext(StoreContext);

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [touchedFields, setTouchedFields] = useState({});

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  // Pre-fill profile info if available
  useEffect(() => {
    if (userData) {
      const nameParts = (userData.name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setData((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || userData.email || "",
        street: prev.street || userData.address || "",
      }));
    }
  }, [userData]);

  // Protect route
  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      navigate("/cart");
      return;
    }

    if (food_list.length > 0 && Object.keys(cartItems).length === 0) {
      navigate("/cart");
    }
  }, [token, authLoading, food_list, cartItems, navigate]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));

    // Clear touched error if user types
    if (touchedFields[name]) {
      setTouchedFields((prev) => ({ ...prev, [name]: false }));
    }
    if (validationError) {
      setValidationError("");
    }
  };

  // Mandatory fields specification
  const mandatoryFields = [
    { name: "firstName", label: "First Name" },
    { name: "lastName", label: "Last Name" },
    { name: "email", label: "Email Address" },
    { name: "street", label: "Street Address" },
    { name: "city", label: "City" },
    { name: "state", label: "State" },
    { name: "zipcode", label: "Zip / Postal Code" },
    { name: "country", label: "Country" },
    { name: "phone", label: "Phone Number" },
  ];

  const placeOrder = async (event) => {
    event.preventDefault();

    // Custom complete validation across all mandatory fields
    const missing = [];
    const newTouched = {};

    mandatoryFields.forEach((field) => {
      const val = (data[field.name] || "").trim();
      if (!val) {
        missing.push(field.label);
        newTouched[field.name] = true;
      }
    });

    if (missing.length > 0) {
      setTouchedFields(newTouched);
      setValidationError(
        `Please fill in all mandatory fields marked with (*). Missing: ${missing.join(", ")}`
      );

      // Scroll to the first missing input field
      const firstMissing = mandatoryFields.find((f) => newTouched[f.name]);
      if (firstMissing) {
        const el = document.getElementById(`field-${firstMissing.name}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }
      return;
    }

    const detailedItems = CartCalculator.getCartItemsDetailed(cartItems, food_list);
    if (!detailedItems || detailedItems.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      navigate("/cart");
      return;
    }

    const orderItems = detailedItems.map((item) => ({
      _id: item.food._id,
      name: `${item.food.name} (${item.sizeOption.name})`,
      price: item.unitPrice,
      quantity: item.quantity,
      size: item.size,
      image: item.food.image,
      category: item.food.category,
    }));

    const subtotal = getTotalCartAmount();
    const discount = getDiscountAmount ? getDiscountAmount() : 0;
    const finalAmount = getFinalTotal ? getFinalTotal() : subtotal + 2;

    const orderData = {
      address: data,
      items: orderItems,
      amount: finalAmount,
      promoCode: appliedPromo || undefined,
      discount: discount,
    };

    setLoading(true);

    try {
      let resData;
      try {
        resData = await orderService.placeOrder(orderData, token);
      } catch (serviceErr) {
        console.warn("orderService failed, trying direct axios:", serviceErr.message);
        const res = await axios.post(`${url}/api/order/place`, orderData, {
          headers: { token },
        });
        resData = res.data;
      }

      if (resData && (resData.success || resData.session_url)) {
        const sessionUrl = resData.session_url || resData.url;
        if (sessionUrl) {
          window.location.replace(sessionUrl);
          return;
        }
      }

      alert("Error placing order: " + (resData?.message || "Failed to generate checkout session"));
    } catch (err) {
      console.error("Place order failed:", err);
      const errMsg =
        err.response?.data?.message || err.message || "Failed to connect to checkout service";
      alert("Checkout error: " + errMsg);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getTotalCartAmount();
  const discount = getDiscountAmount ? getDiscountAmount() : 0;
  const finalAmount = getFinalTotal ? getFinalTotal() : subtotal + 2;

  return (
    <div className="place-order-page">
      <div className="place-order-header">
        <h2>Delivery & Payment</h2>
        <p className="place-order-subtitle">
          Confirm your delivery destination and proceed to secure checkout
        </p>
      </div>

      {/* Global Validation Alert Banner */}
      {validationError && (
        <div className="mandatory-validation-banner">
          <span className="banner-alert-icon">⚠️</span>
          <div>
            <strong>Required Information Incomplete:</strong>
            <p>{validationError}</p>
          </div>
        </div>
      )}

      <form onSubmit={placeOrder} className="place-order" noValidate ref={formRef}>
        {/* ================= LEFT: DELIVERY INFORMATION ================= */}
        <div className="place-order-left-card">
          <div className="section-title-wrap">
            <span className="step-number-badge">1</span>
            <div>
              <h3 className="section-heading">Delivery Address</h3>
              <p className="section-subtext">All fields marked with (*) are required</p>
            </div>
          </div>

          <div className="delivery-form-grid">
            {/* First & Last Name */}
            <div className="form-row-two">
              <div
                className={`order-input-group ${
                  touchedFields.firstName && !data.firstName.trim() ? "input-has-error" : ""
                }`}
              >
                <label htmlFor="field-firstName">
                  First Name <span className="req-star">*</span>
                </label>
                <input
                  id="field-firstName"
                  name="firstName"
                  onChange={onChangeHandler}
                  value={data.firstName}
                  type="text"
                  placeholder="e.g. John"
                />
                {touchedFields.firstName && !data.firstName.trim() && (
                  <span className="field-error-msg">First name is mandatory *</span>
                )}
              </div>

              <div
                className={`order-input-group ${
                  touchedFields.lastName && !data.lastName.trim() ? "input-has-error" : ""
                }`}
              >
                <label htmlFor="field-lastName">
                  Last Name <span className="req-star">*</span>
                </label>
                <input
                  id="field-lastName"
                  name="lastName"
                  onChange={onChangeHandler}
                  value={data.lastName}
                  type="text"
                  placeholder="e.g. Doe"
                />
                {touchedFields.lastName && !data.lastName.trim() && (
                  <span className="field-error-msg">Last name is mandatory *</span>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div
              className={`order-input-group ${
                touchedFields.email && !data.email.trim() ? "input-has-error" : ""
              }`}
            >
              <label htmlFor="field-email">
                Email Address <span className="req-star">*</span>
              </label>
              <input
                id="field-email"
                name="email"
                onChange={onChangeHandler}
                value={data.email}
                type="email"
                placeholder="name@example.com"
              />
              {touchedFields.email && !data.email.trim() && (
                <span className="field-error-msg">Email address is mandatory *</span>
              )}
            </div>

            {/* Street Address */}
            <div
              className={`order-input-group ${
                touchedFields.street && !data.street.trim() ? "input-has-error" : ""
              }`}
            >
              <label htmlFor="field-street">
                Street Address <span className="req-star">*</span>
              </label>
              <input
                id="field-street"
                name="street"
                onChange={onChangeHandler}
                value={data.street}
                type="text"
                placeholder="Apartment, suite, house number, street"
              />
              {touchedFields.street && !data.street.trim() && (
                <span className="field-error-msg">Street address is mandatory *</span>
              )}
            </div>

            {/* City & State */}
            <div className="form-row-two">
              <div
                className={`order-input-group ${
                  touchedFields.city && !data.city.trim() ? "input-has-error" : ""
                }`}
              >
                <label htmlFor="field-city">
                  City <span className="req-star">*</span>
                </label>
                <input
                  id="field-city"
                  name="city"
                  onChange={onChangeHandler}
                  value={data.city}
                  type="text"
                  placeholder="City"
                />
                {touchedFields.city && !data.city.trim() && (
                  <span className="field-error-msg">City is mandatory *</span>
                )}
              </div>

              <div
                className={`order-input-group ${
                  touchedFields.state && !data.state.trim() ? "input-has-error" : ""
                }`}
              >
                <label htmlFor="field-state">
                  State / Province <span className="req-star">*</span>
                </label>
                <input
                  id="field-state"
                  name="state"
                  onChange={onChangeHandler}
                  value={data.state}
                  type="text"
                  placeholder="State"
                />
                {touchedFields.state && !data.state.trim() && (
                  <span className="field-error-msg">State is mandatory *</span>
                )}
              </div>
            </div>

            {/* Zip & Country */}
            <div className="form-row-two">
              <div
                className={`order-input-group ${
                  touchedFields.zipcode && !data.zipcode.trim() ? "input-has-error" : ""
                }`}
              >
                <label htmlFor="field-zipcode">
                  Zip / Postal Code <span className="req-star">*</span>
                </label>
                <input
                  id="field-zipcode"
                  name="zipcode"
                  onChange={onChangeHandler}
                  value={data.zipcode}
                  type="text"
                  placeholder="Postal Code"
                />
                {touchedFields.zipcode && !data.zipcode.trim() && (
                  <span className="field-error-msg">Postal code is mandatory *</span>
                )}
              </div>

              <div
                className={`order-input-group ${
                  touchedFields.country && !data.country.trim() ? "input-has-error" : ""
                }`}
              >
                <label htmlFor="field-country">
                  Country <span className="req-star">*</span>
                </label>
                <input
                  id="field-country"
                  name="country"
                  onChange={onChangeHandler}
                  value={data.country}
                  type="text"
                  placeholder="Country"
                />
                {touchedFields.country && !data.country.trim() && (
                  <span className="field-error-msg">Country is mandatory *</span>
                )}
              </div>
            </div>

            {/* Phone */}
            <div
              className={`order-input-group ${
                touchedFields.phone && !data.phone.trim() ? "input-has-error" : ""
              }`}
            >
              <label htmlFor="field-phone">
                Phone Number <span className="req-star">*</span>
              </label>
              <input
                id="field-phone"
                name="phone"
                onChange={onChangeHandler}
                value={data.phone}
                type="tel"
                placeholder="Mobile number for delivery updates"
              />
              {touchedFields.phone && !data.phone.trim() && (
                <span className="field-error-msg">Phone number is mandatory *</span>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: RECEIPT TOTAL & PAYMENT ================= */}
        <div className="place-order-right-card">
          <div className="section-title-wrap">
            <span className="step-number-badge">2</span>
            <div>
              <h3 className="section-heading">Order Summary</h3>
              <p className="section-subtext">Review total and proceed to payment</p>
            </div>
          </div>

          <div className="order-summary-content">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {discount > 0 && (
              <>
                <hr className="summary-hr" />
                <div className="summary-line discount-highlight">
                  <span>🏷️ Promo Discount (20% OFF)</span>
                  <span>-₹{discount}</span>
                </div>
              </>
            )}

            <hr className="summary-hr" />
            <div className="summary-line">
              <span>Delivery & Packaging</span>
              <span>₹{subtotal === 0 ? 0 : 2}</span>
            </div>

            <hr className="summary-hr bold-hr" />
            <div className="summary-line grand-total-line">
              <b>Grand Total</b>
              <b className="total-highlight">₹{finalAmount}</b>
            </div>

            <div className="secure-badge">
              <span>🔒 256-Bit SSL Encrypted & Stripe Protected</span>
            </div>

            <button
              type="submit"
              className="proceed-payment-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Redirecting to Payment Gateway...</span>
              ) : (
                <>
                  <span>Proceed To Payment</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
