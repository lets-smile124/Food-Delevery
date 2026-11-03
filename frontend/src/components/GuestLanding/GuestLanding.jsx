import React, { useState } from "react";
import "./GuestLanding.css";
import { assets } from "../../assets/assets";

// Direct image imports to guarantee bundle resolution
import food_1 from "../../assets/food_1.png";
import food_15 from "../../assets/food_15.png";
import food_25 from "../../assets/food_25.png";
import food_9 from "../../assets/food_9.png";
import hero_img from "../../assets/header_img.png";

const GuestLanding = ({ setShowLogin, onExploreMenu }) => {
  const handleCtaClick = () => {
    if (onExploreMenu) {
      onExploreMenu();
    } else if (setShowLogin) {
      setShowLogin(true);
    }
  };

  // High quality curated showcase dishes
  const featuredDishes = [
    {
      id: "f1",
      name: "Greek Garden Salad",
      category: "Salad",
      rating: "4.9",
      price: "₹168",
      image: food_1,
      badge: "Chef's Pick",
      desc: "Crisp organic cucumber, kalamata olives, cherry tomatoes, and crumbled feta cheese with aromatic olive vinaigrette.",
    },
    {
      id: "f2",
      name: "Artisan Grilled Sandwich",
      category: "Sandwich",
      rating: "4.8",
      price: "₹180",
      image: food_15,
      badge: "Most Loved",
      desc: "Golden sourdough packed with melted farm cheddar, caramelized onions, and garden-fresh bell peppers.",
    },
    {
      id: "f3",
      name: "Creamy Truffle Pasta",
      category: "Pasta",
      rating: "4.9",
      price: "₹240",
      image: food_25,
      badge: "Trending",
      desc: "Handmade fettuccine tossed in aromatic black truffle cream, roasted garlic, and aged parmesan cheese.",
    },
    {
      id: "f4",
      name: "Velvet Berry Parfait",
      category: "Deserts",
      rating: "4.9",
      price: "₹140",
      image: food_9,
      badge: "Sweet Indulgence",
      desc: "Layers of silky whipped mascarpone, fresh wild berries, and golden toasted almond crumble.",
    },
  ];

  return (
    <div className="guest-landing">
      {/* ================= HERO SECTION ================= */}
      <section className="guest-hero">
        <div className="guest-hero-content">
          <div className="guest-badge-pill">
            <span className="badge-sparkle">✨</span>
            <span>Handcrafted Flavors • Delivered in 30 Mins</span>
          </div>

          <h1 className="guest-hero-title">
            Craving something <br />
            <span className="title-highlight">truly delicious?</span>
          </h1>

          <p className="guest-hero-subtitle">
            Welcome to <strong>CraveBox</strong> — where every dish is culinary perfection. 
            Fresh farm ingredients, portion choices that fit your appetite, and lightning-fast 
            hot delivery right to your door.
          </p>

          <div className="guest-hero-actions">
            <button
              type="button"
              className="guest-cta-primary"
              onClick={handleCtaClick}
            >
              <span>Explore Menu</span>
              <span className="cta-arrow">&#8594;</span>
            </button>

            <button
              type="button"
              className="guest-cta-secondary"
              onClick={() => setShowLogin(true)}
            >
              <span>Sign In / Register</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="guest-hero-trust">
            <div className="trust-stars">
              {"★".repeat(5)}
              <span className="trust-rating-num">4.9 / 5</span>
            </div>
            <span className="trust-divider">•</span>
            <span className="trust-count">Over 15,000+ meals delivered with love</span>
          </div>
        </div>

        {/* Hero Visual Card Stack */}
        <div className="guest-hero-visual">
          <div className="hero-image-card">
            <img
              src={food_1}
              alt="Artisan Greek Salad"
              className="hero-main-img"
              loading="eager"
            />
            <div className="hero-floating-badge badge-top-right">
              <span className="badge-emoji">⚡</span>
              <div>
                <strong>30 Mins</strong>
                <small>Average Delivery</small>
              </div>
            </div>
            <div className="hero-floating-badge badge-bottom-left">
              <span className="badge-emoji">🎁</span>
              <div>
                <strong>Flat 20% OFF</strong>
                <small>On Your 1st Order</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CRAVEBOX PILLARS ================= */}
      <section className="guest-pillars">
        <div className="section-header-centered">
          <span className="section-eyebrow">The CraveBox Difference</span>
          <h2 className="section-title">Food Made With Heart & Soul</h2>
          <p className="section-desc">
            We don’t believe in mass-produced, stale fast food. Here is why thousands 
            of food lovers order from us every day.
          </p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-box">🛵</div>
            <h3>Steaming Hot & Fresh</h3>
            <p>
              Special thermal-sealed packaging guarantees your fries stay crisp, 
              broth stays piping hot, and salads stay icy-fresh.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">👨‍🍳</div>
            <h3>Artisanal Culinary Recipes</h3>
            <p>
              Hand-prepared by skilled passionate chefs using real, whole ingredients 
              and zero artificial flavor powders.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">⚖️</div>
            <h3>Flexible Portion Sizes</h3>
            <p>
              Hungry for a snack or feeding an appetite? Select Small, Medium, 
              or Large portions with fair, transparent pricing.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">🌱</div>
            <h3>Verified Farm Produce</h3>
            <p>
              Crisp greens, organic dairy, and sustainably sourced ingredients 
              delivered straight from trusted regional growers.
            </p>
          </div>
        </div>
      </section>

      {/* ================= SIGNATURE DISHES PREVIEW ================= */}
      <section className="guest-showcase">
        <div className="section-header-centered">
          <span className="section-eyebrow">A Sneak Peek</span>
          <h2 className="section-title">Signature Dishes Waiting For You</h2>
          <p className="section-desc">
            Click any dish or hit "Explore Menu" to sign in and personalize your feast.
          </p>
        </div>

        <div className="showcase-grid">
          {featuredDishes.map((dish) => (
            <div
              key={dish.id}
              className="showcase-card"
              onClick={handleCtaClick}
            >
              <div className="showcase-img-wrap">
                <img
                  src={dish.image}
                  alt={dish.name}
                  loading="lazy"
                />
                <span className="showcase-badge">{dish.badge}</span>
                <span className="showcase-category">{dish.category}</span>
              </div>

              <div className="showcase-content">
                <div className="showcase-title-row">
                  <h3>{dish.name}</h3>
                  <div className="showcase-rating">
                    <span>★ {dish.rating}</span>
                  </div>
                </div>

                <p className="showcase-desc">{dish.desc}</p>

                <div className="showcase-footer">
                  <div className="showcase-price-box">
                    <span className="price-label">Starts at</span>
                    <span className="price-value">{dish.price}</span>
                  </div>

                  <button
                    type="button"
                    className="showcase-order-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCtaClick();
                    }}
                  >
                    <span>Order Now</span>
                    <span className="btn-icon">&#8594;</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BOTTOM INVITATION BANNER ================= */}
      <section className="guest-banner">
        <div className="guest-banner-card">
          <div className="banner-text">
            <h2>Your next unforgettable meal is just a click away</h2>
            <p>
              Sign up in seconds, unlock our full 30+ dish menu, choose portion sizes, 
              and track your delivery in real-time.
            </p>
          </div>
          <button
            type="button"
            className="guest-cta-primary banner-btn"
            onClick={handleCtaClick}
          >
            <span>Explore Menu & Order</span>
            <span className="cta-arrow">&#8594;</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default GuestLanding;
