import React, { useRef, useState, useEffect } from "react";
import "./ExploreMenu.css";
import { menu_list } from "../../assets/assets";

const ExploreMenu = ({ category, setCategory }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll boundaries for arrow button states
  const checkScrollBounds = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScrollBounds();
    const current = scrollContainerRef.current;
    if (current) {
      current.addEventListener("scroll", checkScrollBounds);
      window.addEventListener("resize", checkScrollBounds);
      return () => {
        current.removeEventListener("scroll", checkScrollBounds);
        window.removeEventListener("resize", checkScrollBounds);
      };
    }
  }, []);

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 300;
    scrollContainerRef.current.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <div className="explore-menu-header-row">
        <div className="explore-menu-titles">
          <span className="explore-menu-badge">Handcrafted Cravings</span>
          <h1 className="explore-menu-title">Explore Our Menu</h1>
          <p className="explore-menu-text">
            Choose from a diverse menu featuring chef-crafted delights. 
            Select any category below to filter your favorite dishes.
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="explore-carousel-controls">
          <button
            type="button"
            className={`carousel-arrow-btn ${!canScrollLeft ? "disabled" : ""}`}
            onClick={() => handleScroll(-1)}
            aria-label="Previous categories"
            disabled={!canScrollLeft}
          >
            &#8592;
          </button>
          <button
            type="button"
            className={`carousel-arrow-btn ${!canScrollRight ? "disabled" : ""}`}
            onClick={() => handleScroll(1)}
            aria-label="Next categories"
            disabled={!canScrollRight}
          >
            &#8594;
          </button>
        </div>
      </div>

      {/* Categories Carousel */}
      <div className="explore-carousel-wrapper">
        <div className="explore-menu-list" ref={scrollContainerRef}>
          {/* "All" category selector item */}
          <div
            onClick={() => setCategory("All")}
            className={`explore-menu-list-item ${category === "All" ? "selected" : ""}`}
          >
            <div className={`menu-img-circle ${category === "All" ? "active" : ""}`}>
              <div className="all-icon-inner">✨</div>
            </div>
            <p>All Flavors</p>
          </div>

          {/* Individual Categories from menu_list */}
          {menu_list.map((item, index) => {
            const isSelected = category === item.menu_name;
            return (
              <div
                onClick={() =>
                  setCategory((prev) =>
                    prev === item.menu_name ? "All" : item.menu_name
                  )
                }
                key={index}
                className={`explore-menu-list-item ${isSelected ? "selected" : ""}`}
              >
                <div className={`menu-img-circle ${isSelected ? "active" : ""}`}>
                  <img
                    src={item.menu_image}
                    alt={item.menu_name}
                    loading="lazy"
                  />
                </div>
                <p>{item.menu_name}</p>
                {isSelected && <span className="category-pill-dot" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="explore-menu-divider" />
    </div>
  );
};

export default ExploreMenu;
