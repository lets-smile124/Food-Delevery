import React, { useState, useContext } from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Footer = ({ setShowLogin }) => {
  const { token } = useContext(StoreContext);

  // Modal state for full reading view
  const [activeModal, setActiveModal] = useState(null);
  // Hover card state
  const [hoveredLink, setHoveredLink] = useState(null);

  // Content definitions for company sections
  const companyInfo = {
    about: {
      title: "About Us",
      tagline: "Crafting Culinary Memories Since 2024",
      icon: "👨‍🍳",
      summary:
        "We are an artisan food platform born from a passion for honest ingredients and culinary craftsmanship.",
      highlights: [
        "Fresh farm-to-table ingredients sourced daily",
        "Chef-curated gourmet recipes with transparent portion sizing",
        "Over 15,000+ happy meals delivered across the city",
        "Zero artificial flavors or preservation chemicals",
      ],
      fullText: [
        "Welcome to our kitchen! We believe that fast food shouldn't mean compromised quality. Every single item on our menu is meticulously prepared by trained culinary artisans using organic greens, sustainably sourced proteins, and wholesome whole grains.",
        "Our journey started with a simple belief: everyone deserves fresh, restaurant-quality dishes in personalized portions (Small, Medium, or Large) right in the comfort of their home.",
        "Thank you for letting us be part of your daily table. Every dish is cooked with love, sealed with heat, and dispatched with urgency.",
      ],
    },
    delivery: {
      title: "Delivery & Fulfillment",
      tagline: "Steaming Hot in 30 Minutes or Less",
      icon: "🛵",
      summary:
        "Engineered packaging and hyper-local cloud kitchens ensure food arrives at peak culinary temperature.",
      highlights: [
        "Thermal-insulated heat-lock packaging for all hot meals",
        "Chilled barrier pockets for salads and cold desserts",
        "Live GPS tracking from dispatch to your front door",
        "Zero-contact hygienic delivery options available",
      ],
      fullText: [
        "We treat delivery as an extension of the kitchen. Our signature insulated boxes maintain meal temperature for up to 45 minutes, preventing sogginess or temperature drop.",
        "Average delivery duration across active service zones is 28 minutes. If unexpected delays occur due to weather or traffic, our real-time notification engine keeps you informed every step of the way.",
        "Delivery fee is a flat transparent rate with no hidden peak-hour surge surcharges.",
      ],
    },
    privacy: {
      title: "Privacy & Security",
      tagline: "Your Trust is Our Highest Priority",
      icon: "🔒",
      summary:
        "Bank-grade encryption, zero advertising trackers, and PCI-DSS verified payment processing via Stripe.",
      highlights: [
        "256-bit SSL encryption on all account credentials",
        "Stripe-certified transactions — we never store card numbers or CVVs",
        "Strict anti-spam policy: we never sell or rent your contact details",
        "One-click complete account and profile data erasure on demand",
      ],
      fullText: [
        "We take your personal and transactional privacy seriously. All data transmitted between your device and our cloud servers is encrypted using industry-standard TLS 1.3 cryptographic protocols.",
        "Payment card data is tokenized directly by Stripe. Neither our servers nor our personnel ever see or store your full card number or security code.",
        "We only use your contact information for order confirmation, live delivery alerts, and direct customer support.",
      ],
    },
  };

  const openInfoModal = (type) => {
    setActiveModal(companyInfo[type]);
    setHoveredLink(null);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleLoginClick = () => {
    if (setShowLogin) {
      setShowLogin(true);
    }
  };

  return (
    <>
      <footer className="footer" id="footer">
        <div className="footer-content">
          {/* ================= BRAND COLUMN ================= */}
          <div className="footer-content-left">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img
                src={assets.logo}
                alt="Logo"
                className="footer-logo"
              />
            </Link>
            <p className="footer-brand-bio">
              Serving happiness, one delicious bite at a time. Handcrafted bowls, 
              crisp salads, and wholesome delights delivered hot to your doorstep.
            </p>

            <div className="footer-social-icons">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <img src={assets.facebook_icon} alt="Facebook" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
              >
                <img src={assets.twitter_icon} alt="Twitter" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <img src={assets.linkedin_icon} alt="LinkedIn" />
              </a>
            </div>
          </div>

          {/* ================= COMPANY LINKS COLUMN ================= */}
          <div className="footer-content-center">
            <h2>COMPANY</h2>
            <ul className="footer-nav-list">
              <li>
                <Link
                  to="/"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="footer-nav-link"
                >
                  <span>Home</span>
                </Link>
              </li>

              {/* ABOUT US LINK WITH HOVER CARD */}
              <li
                className="footer-interactive-item"
                onMouseEnter={() => setHoveredLink("about")}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <button
                  type="button"
                  className="footer-nav-link-btn"
                  onClick={() => openInfoModal("about")}
                >
                  <span>About Us</span>
                  <span className="link-arrow">&#8594;</span>
                </button>

                {hoveredLink === "about" && (
                  <div className="footer-hover-popover">
                    <div className="popover-badge">👨‍🍳 Our Story</div>
                    <h4>Crafted with Passion</h4>
                    <p>
                      Fresh farm-to-table culinary delights cooked by certified
                      chefs.
                    </p>
                    <span className="popover-cta">Click to read our full story →</span>
                  </div>
                )}
              </li>

              {/* DELIVERY LINK WITH HOVER CARD */}
              <li
                className="footer-interactive-item"
                onMouseEnter={() => setHoveredLink("delivery")}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <button
                  type="button"
                  className="footer-nav-link-btn"
                  onClick={() => openInfoModal("delivery")}
                >
                  <span>Delivery Info</span>
                  <span className="link-arrow">&#8594;</span>
                </button>

                {hoveredLink === "delivery" && (
                  <div className="footer-hover-popover">
                    <div className="popover-badge">🛵 30-Min Promise</div>
                    <h4>Thermal Insulated</h4>
                    <p>
                      Guaranteed steaming hot meals with live real-time GPS
                      tracking.
                    </p>
                    <span className="popover-cta">Click for delivery details →</span>
                  </div>
                )}
              </li>

              {/* PRIVACY POLICY LINK WITH HOVER CARD */}
              <li
                className="footer-interactive-item"
                onMouseEnter={() => setHoveredLink("privacy")}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <button
                  type="button"
                  className="footer-nav-link-btn"
                  onClick={() => openInfoModal("privacy")}
                >
                  <span>Privacy Policy</span>
                  <span className="link-arrow">&#8594;</span>
                </button>

                {hoveredLink === "privacy" && (
                  <div className="footer-hover-popover">
                    <div className="popover-badge">🔒 Bank-Grade Security</div>
                    <h4>100% Encrypted</h4>
                    <p>
                      Stripe-verified processing with zero third-party data
                      sharing.
                    </p>
                    <span className="popover-cta">Click for privacy policy →</span>
                  </div>
                )}
              </li>
            </ul>
          </div>

          {/* ================= GET IN TOUCH COLUMN (AUTHENTICATED ONLY) ================= */}
          <div className="footer-content-right">
            <h2>GET IN TOUCH</h2>

            {token ? (
              <ul className="footer-contact-list">
                <li>
                  <a
                    href="tel:+919519296779"
                    className="footer-contact-link phone-highlight"
                  >
                    <span className="contact-icon">📞</span>
                    <span>+91 9519296779</span>
                  </a>
                </li>

                <li>
                  <a
                    href="https://wa.me/919519296779?text=Hello%20Support"
                    target="_blank"
                    rel="noreferrer"
                    className="footer-contact-link whatsapp-highlight"
                  >
                    <span className="contact-icon">💬</span>
                    <span>Chat on WhatsApp</span>
                  </a>
                </li>

                <li>
                  <a
                    href="mailto:contact@tomato.com"
                    className="footer-contact-link"
                  >
                    <span className="contact-icon">✉️</span>
                    <span>contact@tomato.com</span>
                  </a>
                </li>

                <li className="footer-hours-row">
                  <span className="contact-icon">⏱️</span>
                  <span>Available 8:00 AM – 11:30 PM Daily</span>
                </li>
              </ul>
            ) : (
              <div className="footer-contact-locked">
                <div className="locked-badge">
                  <span className="locked-icon">🔒</span>
                  <span>Members Only</span>
                </div>
                <p>
                  Direct support and contact channels are available for signed-in users.
                </p>
                <button
                  type="button"
                  className="footer-contact-login-btn"
                  onClick={handleLoginClick}
                >
                  Sign in to Access Contact
                </button>
              </div>
            )}
          </div>
        </div>

        <hr />
        <p className="footer-copyright">
          Copyright {new Date().getFullYear()} © Tomato.com - All Rights Reserved
        </p>
      </footer>

      {/* ================= FULL INFO MODAL ================= */}
      {activeModal && (
        <div className="footer-modal-backdrop" onClick={closeModal}>
          <div
            className="footer-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="footer-modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>

            <div className="footer-modal-header">
              <span className="modal-icon">{activeModal.icon}</span>
              <div>
                <h2>{activeModal.title}</h2>
                <p className="modal-tagline">{activeModal.tagline}</p>
              </div>
            </div>

            <div className="footer-modal-body">
              <p className="modal-summary">{activeModal.summary}</p>

              <div className="modal-highlights-box">
                <h4>Key Highlights</h4>
                <ul>
                  {activeModal.highlights.map((point, idx) => (
                    <li key={idx}>
                      <span className="point-check">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="modal-paragraphs">
                {activeModal.fullText.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            <div className="footer-modal-footer">
              <button
                type="button"
                className="modal-dismiss-btn"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
