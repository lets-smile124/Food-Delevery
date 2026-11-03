import { createContext, useEffect, useState } from "react";
import foodService from "../services/FoodService";
import cartService from "../services/CartService";
import userService from "../services/UserService";
import orderService from "../services/OrderService";
import FoodPricingService from "../services/FoodPricingService";
import CartCalculator from "../utils/CartCalculator";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // =========================
  // STATES
  // =========================

  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState(null);

  // Used to prevent ProtectedRoute from checking token before localStorage is loaded
  const [authLoading, setAuthLoading] = useState(true);

  // Promo code states
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoDiscountRate, setPromoDiscountRate] = useState(0);

  const applyPromoCode = async (code) => {
    const cleanCode = (code || "").trim().toUpperCase();

    if (!token) {
      return {
        success: false,
        message: "Please sign in to apply coupon code 'NEW_USER'.",
      };
    }

    if (cleanCode !== "NEW_USER") {
      return {
        success: false,
        message: "Invalid promo code. Enter 'NEW_USER' for your first order discount.",
      };
    }

    try {
      const res = await orderService.validatePromo(cleanCode, token);
      if (res.success) {
        setAppliedPromo(cleanCode);
        setPromoDiscountRate(res.data?.discountRate || 0.20);
        return {
          success: true,
          discountRate: res.data?.discountRate || 0.20,
          message: res.message || res.data?.message || "20% first-order discount applied! 🎉",
        };
      } else {
        removePromoCode();
        return {
          success: false,
          message: res.message || "Coupon is not applicable.",
        };
      }
    } catch (err) {
      removePromoCode();
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Coupon 'NEW_USER' is only valid on your first order. You have already placed previous orders.",
      };
    }
  };

  const removePromoCode = () => {
    setAppliedPromo("");
    setPromoDiscountRate(0);
  };

  const getDiscountAmount = () => {
    const subtotal = CartCalculator.calculateTotal(cartItems, food_list);
    return Math.round(subtotal * promoDiscountRate);
  };

  const getFinalTotal = () => {
    const subtotal = CartCalculator.calculateTotal(cartItems, food_list);
    if (subtotal === 0) return 0;
    const discount = getDiscountAmount();
    return Math.max(0, subtotal - discount + 2);
  };

  // Backend URL (strips any trailing slash automatically)
  const url = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/+$/, "");

  // =========================
  // ADD TO CART (with size support)
  // =========================

  const addToCart = async (itemId, size = "Medium") => {
    if (!token) {
      return false;
    }

    const cartKey = itemId.includes("_")
      ? itemId
      : FoodPricingService.getCartKey(itemId, size);

    // Update UI immediately (optimistic update)
    setCartItems((prev) => ({
      ...prev,
      [cartKey]: (prev[cartKey] || 0) + 1,
    }));

    try {
      await cartService.addToCart(cartKey, token);
      return true;
    } catch (error) {
      console.log("Add to cart error:", error.response?.data || error.message);
      return false;
    }
  };

  // =========================
  // REMOVE FROM CART (with size support)
  // =========================

  const removeFromCart = async (itemId, size = "Medium") => {
    if (!token) {
      return false;
    }

    const cartKey = itemId.includes("_")
      ? itemId
      : FoodPricingService.getCartKey(itemId, size);

    // Update UI immediately
    setCartItems((prev) => {
      const updatedCart = {
        ...prev,
        [cartKey]: (prev[cartKey] || 0) - 1,
      };

      if (updatedCart[cartKey] <= 0) {
        delete updatedCart[cartKey];
      }

      return updatedCart;
    });

    try {
      await cartService.removeFromCart(cartKey, token);
      return true;
    } catch (error) {
      console.log(
        "Remove from cart error:",
        error.response?.data || error.message,
      );
      return false;
    }
  };

  // =========================
  // GET TOTAL CART AMOUNT
  // =========================

  const getTotalCartAmount = () => {
    return CartCalculator.calculateTotal(cartItems, food_list);
  };

  /**
   * Helper to get total count of food item in cart across all sizes
   */
  const getItemTotalQuantity = (foodId) => {
    return CartCalculator.getFoodTotalQuantity(cartItems, foodId);
  };

  /**
   * Helper to get count of food item in cart for a specific size
   */
  const getItemSizeQuantity = (foodId, size = "Medium") => {
    return CartCalculator.getFoodSizeQuantity(cartItems, foodId, size);
  };

  // =========================
  // FETCH FOOD LIST
  // =========================

  const fetchFoodList = async () => {
    try {
      const data = await foodService.getFoodList();

      if (data.success) {
        setFoodList(data.data || []);
      } else {
        setFoodList([]);
      }
    } catch (error) {
      console.log("Food list error:", error.response?.data || error.message);
      setFoodList([]);
    }
  };

  // =========================
  // LOAD CART FROM DATABASE
  // =========================

  const loadCartData = async (userToken) => {
    try {
      const data = await cartService.getCart(userToken);

      if (data.success) {
        setCartItems(data.cartData || {});
      } else {
        setCartItems({});
      }
    } catch (error) {
      console.log("Load cart error:", error.response?.data || error.message);
      setCartItems({});
    }
  };

  // =========================
  // USER PROFILE
  // =========================

  const fetchUserProfile = async (userToken) => {
    const activeToken = userToken || token;
    if (!activeToken) {
      setUserData(null);
      return null;
    }

    try {
      const data = await userService.getProfile(activeToken);

      if (data.success) {
        setUserData(data.user);
        return data.user;
      } else {
        console.log("Fetch profile message:", data.message);
      }
    } catch (error) {
      console.log("Fetch user profile error:", error.response?.data || error.message);
    }
    return null;
  };

  const updateUserProfile = async (updatedFields) => {
    if (!token) return { success: false, message: "Not authenticated" };

    try {
      const data = await userService.updateProfile(updatedFields, token);

      if (data.success) {
        setUserData(data.user);
        return { success: true, message: data.message, user: data.user };
      }
      return { success: false, message: data.message || "Failed to update" };
    } catch (error) {
      console.log("Update profile error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Server error while updating profile",
      };
    }
  };

  // =========================
  // INITIAL DATA LOAD
  // =========================

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchFoodList();

        const savedToken = localStorage.getItem("token");

        if (savedToken) {
          setToken(savedToken);
          await Promise.all([
            loadCartData(savedToken),
            fetchUserProfile(savedToken),
          ]);
        } else {
          setCartItems({});
          setUserData(null);
        }
      } catch (error) {
        console.log("Initial loading error:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadData();
  }, []);

  // When token changes (login / logout)
  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
      loadCartData(token);
    } else {
      setUserData(null);
      setCartItems({});
    }
  }, [token]);

  // =========================
  // CONTEXT VALUE
  // =========================

  const contextValue = {
    // Food
    food_list,

    // Cart
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getItemTotalQuantity,
    getItemSizeQuantity,

    // Promo & Discounts
    appliedPromo,
    promoDiscountRate,
    applyPromoCode,
    removePromoCode,
    getDiscountAmount,
    getFinalTotal,

    // Backend URL
    url,

    // Authentication & User
    token,
    setToken,
    userData,
    setUserData,
    fetchUserProfile,
    updateUserProfile,
    authLoading,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
