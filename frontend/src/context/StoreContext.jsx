import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // =========================
  // STATES
  // =========================

  const [cartItems, setCartItems] = useState({});

  const [food_list, setFoodList] = useState([]);

  const [token, setToken] = useState("");

  // Used to prevent ProtectedRoute
  // from checking token before localStorage is loaded
  const [authLoading, setAuthLoading] = useState(true);

  // Backend URL
  const url = import.meta.env.VITE_API_URL;

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = async (itemId) => {
    // User must be logged in
    if (!token) {
      return false;
    }

    // Update UI immediately
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({
        ...prev,
        [itemId]: 1,
      }));
    } else {
      setCartItems((prev) => ({
        ...prev,
        [itemId]: prev[itemId] + 1,
      }));
    }

    try {
      // Save cart in backend
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        {
          headers: {
            token,
          },
        },
      );

      return true;
    } catch (error) {
      console.log("Add to cart error:", error.response?.data || error.message);

      return false;
    }
  };

  // =========================
  // REMOVE FROM CART
  // =========================

  const removeFromCart = async (itemId) => {
    // User must be logged in
    if (!token) {
      return false;
    }

    // Update UI immediately
    setCartItems((prev) => {
      const updatedCart = {
        ...prev,
        [itemId]: prev[itemId] - 1,
      };

      // Optional cleanup
      if (updatedCart[itemId] <= 0) {
        delete updatedCart[itemId];
      }

      return updatedCart;
    });

    try {
      // Update backend
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        {
          headers: {
            token,
          },
        },
      );

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
    let totalAmount = 0;

    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product._id === item);

        // Prevent undefined.price error
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }

    return totalAmount;
  };

  // =========================
  // FETCH FOOD LIST
  // =========================

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");

      if (response.data.success) {
        setFoodList(response.data.data || []);
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
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        {
          headers: {
            token: userToken,
          },
        },
      );

      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      } else {
        setCartItems({});
      }
    } catch (error) {
      console.log("Load cart error:", error.response?.data || error.message);

      setCartItems({});
    }
  };

  // =========================
  // INITIAL DATA LOAD
  // =========================

  useEffect(() => {
    const loadData = async () => {
      try {
        // First load food list
        await fetchFoodList();

        // Check localStorage
        const savedToken = localStorage.getItem("token");

        if (savedToken) {
          // Store token in React state
          setToken(savedToken);

          // Load user's cart
          await loadCartData(savedToken);
        } else {
          // No user logged in
          setCartItems({});
        }
      } catch (error) {
        console.log("Initial loading error:", error);
      } finally {
        // Authentication check finished
        setAuthLoading(false);
      }
    };

    loadData();
  }, []);

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

    // Backend URL
    url,

    // Authentication
    token,
    setToken,
    authLoading,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
