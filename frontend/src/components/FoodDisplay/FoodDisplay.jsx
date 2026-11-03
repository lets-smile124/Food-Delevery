import React, { useContext, useState } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import FoodDetailModal from '../FoodDetailModal/FoodDetailModal';

const FoodDisplay = ({
  category,
  setShowLogin,
  search
}) => {
  const { food_list } = useContext(StoreContext);
  const [selectedFood, setSelectedFood] = useState(null);

  const searchText = (search || "").trim().toLowerCase();

  const filteredFood = food_list.filter((item) => {
    const matchesCategory =
      category === "All" ||
      category === item.category;

    const matchesSearch =
      searchText === "" ||
      item.name.toLowerCase().includes(searchText) ||
      item.description.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className='food-display'
      id='food-display'
    >
      <h2>
        {searchText
          ? `Search results for "${search}"`
          : "Top dishes near you"
        }
      </h2>

      <div className="food-display-list">
        {filteredFood.length > 0 ? (
          filteredFood.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              category={item.category}
              setShowLogin={setShowLogin}
              onCardClick={() => setSelectedFood(item)}
            />
          ))
        ) : (
          <p className="no-food-found">
            No food found for "{search}"
          </p>
        )}
      </div>

      {/* Enlarged Food Detail & Size Selection Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
          setShowLogin={setShowLogin}
        />
      )}
    </div>
  );
};

export default FoodDisplay;
