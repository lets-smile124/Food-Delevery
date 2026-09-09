import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodItem = ({
  id,
  name,
  price,
  description,
  image,
  setShowLogin
}) => {

  const {
    cartItems,
    addToCart,
    removeFromCart,
    url,
    token
  } = useContext(StoreContext);


  const handleAddToCart = async () => {

    console.log("ADD CLICKED");
    console.log("token:", token);
    console.log("setShowLogin:", setShowLogin);

    if (!token) {
      console.log("User not logged in → opening popup");
      setShowLogin(true);
      return;
    }

    await addToCart(id);
  };


  const handleRemoveFromCart = async () => {

    if (!token) {
      setShowLogin(true);
      return;
    }

    await removeFromCart(id);
  };


  return (
    <div className="food-item">

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

        {!cartItems?.[id] ? (

          <img
            className="add"
            onClick={handleAddToCart}
            src={assets.add_icon_white}
            alt=""
          />

        ) : (

          <div className="food-item-counter">

            <img
              onClick={handleRemoveFromCart}
              src={assets.remove_icon_red}
              alt=""
            />

            <p>{cartItems[id]}</p>

            <img
              onClick={handleAddToCart}
              src={assets.add_icon_green}
              alt=""
            />

          </div>

        )}

      </div>

      <div className="food-item-info">

        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="" />
        </div>

        <p className="food-item-desc">
          {description}
        </p>

        <p className="food-item-price">
          ₹{price}
        </p>

      </div>

    </div>
  );
};

export default FoodItem;