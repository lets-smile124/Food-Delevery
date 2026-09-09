import React, { useContext, useState, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import Profile from "../../pages/Profile/Profile";

const Navbar = ({ setShowLogin, search, setSearch }) => {
  const [menu, setMenu] = useState("Home");
  const [showSearch, setShowSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  const { getTotalCartAmount, token, setToken, food_list } =
    useContext(StoreContext);

  const navigate = useNavigate();

  // Load recent searches
  useEffect(() => {
    const savedSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];

    setRecentSearches(savedSearches);
  }, []);

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setShowLogin(false);
    setShowProfile(false);
    navigate("/");
  };

  // Save search
  const saveRecentSearch = (value) => {
    const searchValue = value.trim();

    if (!searchValue) return;

    let updatedSearches = [
      searchValue,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== searchValue.toLowerCase(),
      ),
    ];

    updatedSearches = updatedSearches.slice(0, 5);

    setRecentSearches(updatedSearches);

    localStorage.setItem(
      "recentSearches",
      JSON.stringify(updatedSearches),
    );
  };

  // Perform search
  const handleSearch = (value = search) => {
    const searchValue = value.trim();

    if (!searchValue) return;

    setSearch(searchValue);
    saveRecentSearch(searchValue);

    navigate("/");

    setTimeout(() => {
      const foodSection = document.getElementById("food-display");

      if (foodSection) {
        foodSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // Enter key
  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  // Suggestions
  const searchText = search.trim().toLowerCase();

  const matchingFoods = searchText
    ? food_list
        .filter(
          (item) =>
            item.name?.toLowerCase().includes(searchText) ||
            item.category?.toLowerCase().includes(searchText),
        )
        .slice(0, 6)
    : [];

  // Remove recent search
  const removeRecentSearch = (itemToRemove) => {
    const updatedSearches = recentSearches.filter(
      (item) => item !== itemToRemove,
    );

    setRecentSearches(updatedSearches);

    localStorage.setItem(
      "recentSearches",
      JSON.stringify(updatedSearches),
    );
  };

  return (
    <>
      <div className="navbar">

        {/* ================= LOGO ================= */}

        <Link to="/">
          <img
            src={assets.logo}
            alt="Logo"
            className="logo"
          />
        </Link>

        {/* ================= MENU ================= */}

        <ul className="navbar-menu">

          <Link
            to="/"
            onClick={() => setMenu("Home")}
            className={menu === "Home" ? "active" : ""}
          >
            Home
          </Link>

          <a
            href="#explore-menu"
            onClick={() => setMenu("Menu")}
            className={menu === "Menu" ? "active" : ""}
          >
            Menu
          </a>

          <Link
            to="/myorders"
            onClick={() => setMenu("My Orders")}
            className={menu === "My Orders" ? "active" : ""}
          >
            My Orders
          </Link>

          <a
            href="#footer"
            onClick={() => setMenu("Contact us")}
            className={menu === "Contact us" ? "active" : ""}
          >
            Contact us
          </a>

        </ul>

        {/* ================= RIGHT SIDE ================= */}

        <div className="navbar-right">

          {/* ================= SEARCH ================= */}

          <div className="navbar-search">

            <img
              src={assets.search_icon}
              alt="Search"
              onClick={() => setShowSearch(!showSearch)}
            />

            {showSearch && (
              <div className="navbar-search-box">

                <div className="search-input-container">

                  <img src={assets.search_icon} alt="" />

                  <input
                    type="text"
                    placeholder="Search for food..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    onKeyDown={handleSearchKeyDown}
                    autoFocus
                  />

                  {search && (
                    <button
                      type="button"
                      className="search-clear"
                      onClick={() => setSearch("")}
                    >
                      ×
                    </button>
                  )}

                </div>

                {/* RECENT SEARCHES */}

                {!searchText &&
                  recentSearches.length > 0 && (
                    <div className="search-suggestions">

                      <div className="search-heading">
                        <span>Recent searches</span>

                        <button
                          onClick={() => {
                            setRecentSearches([]);
                            localStorage.removeItem(
                              "recentSearches",
                            );
                          }}
                        >
                          Clear all
                        </button>
                      </div>

                      {recentSearches.map(
                        (item, index) => (
                          <div
                            className="search-suggestion-item"
                            key={index}
                            onClick={() =>
                              handleSearch(item)
                            }
                          >
                            <span className="suggestion-icon">
                              🕘
                            </span>

                            <span className="suggestion-text">
                              {item}
                            </span>

                            <button
                              className="remove-recent"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecentSearch(item);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ),
                      )}

                    </div>
                  )}

                {/* MATCHING FOODS */}

                {searchText && (
                  <div className="search-suggestions">

                    <div className="search-heading">
                      <span>Matching foods</span>
                    </div>

                    {matchingFoods.length > 0 ? (
                      matchingFoods.map((item) => (
                        <div
                          className="search-suggestion-item"
                          key={item._id}
                          onClick={() =>
                            handleSearch(item.name)
                          }
                        >

                          <img
                            className="suggestion-food-image"
                            src={
                              item.image?.startsWith("http")
                                ? item.image
                                : `${import.meta.env.VITE_API_URL}/images/${item.image}`
                            }
                            alt=""
                          />

                          <div className="suggestion-food-info">
                            <span>{item.name}</span>
                            <small>{item.category}</small>
                          </div>

                          <span className="suggestion-arrow">
                            →
                          </span>

                        </div>
                      ))
                    ) : (
                      <div className="no-search-results">
                        No matching food found
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

          </div>

          {/* ================= CART ================= */}

          <div className="navbar-search-icon">

            <Link to="/cart">
              <img
                src={assets.basket_icon}
                alt="Cart"
              />
            </Link>

            <div
              className={
                !getTotalCartAmount() ? "" : "dot"
              }
            ></div>

          </div>

          {/* ================= LOGIN / PROFILE ================= */}

          {!token ? (
            <button
              onClick={() => setShowLogin(true)}
            >
              Sign in
            </button>
          ) : (
            <div className="navbar-profile">

              {/* PROFILE ICON */}

              <img
                src={assets.profile_icon}
                alt="Profile"
                onClick={() =>
                  setShowProfile(!showProfile)
                }
              />

            </div>
          )}

        </div>

      </div>

      {/* ================= PROFILE POPUP ================= */}

      {showProfile && (
        <Profile
          onClose={() => setShowProfile(false)}
          onLogout={logout}
        />
      )}

    </>
  );
};

export default Navbar;