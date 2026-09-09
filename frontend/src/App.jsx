import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AIAssistant from "./components/AIAssistant/AIAssistant";
import Profile from "./pages/Profile/Profile";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [search, setSearch] = useState("");
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}

      <div className="app">
        <Navbar
          setShowLogin={setShowLogin}
          search={search}
          setSearch={setSearch}
        />

        <Routes>
          <Route
            path="/"
            element={
              <Home
                setShowLogin={setShowLogin}
                search={search}
                onAskAI={() => setIsAIOpen(true)}
              />
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute setShowLogin={setShowLogin}>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order"
            element={
              <ProtectedRoute setShowLogin={setShowLogin}>
                <PlaceOrder />
              </ProtectedRoute>
            }
          />

          <Route path="/verify" element={<Verify />} />

          <Route
            path="/myorders"
            element={
              <ProtectedRoute setShowLogin={setShowLogin}>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute setShowLogin={setShowLogin}>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
        <AIAssistant isOpen={isAIOpen} setIsOpen={setIsAIOpen} />
      </div>

      <Footer />
    </>
  );
};

export default App;
