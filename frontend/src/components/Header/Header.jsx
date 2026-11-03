import React from "react";
import "./Header.css";

const Header = () => {
  const scrollToMenu = () => {
    const el = document.getElementById("explore-menu");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="header">
      <div className="header-contents">
        <span className="header-tag">Chef's Selection Today</span>
        <h2>Order your favourite food here</h2>
        <p>
          Choose from a diverse menu featuring a delectable array of dishes
          crafted with the finest ingredients and culinary expertise, one
          delicious meal at a time.
        </p>
        <button onClick={scrollToMenu} type="button">
          <span>Explore Dishes</span>
          <span className="btn-down">&#8595;</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
