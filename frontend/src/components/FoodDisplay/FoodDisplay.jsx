import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({
  category,
  setShowLogin,
  search
}) => {

  const { food_list } = useContext(StoreContext);

  const searchText = search.trim().toLowerCase();

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
              setShowLogin={setShowLogin}
            />

          ))

        ) : (

          <p className="no-food-found">
            No food found for "{search}"
          </p>

        )}

      </div>

    </div>
  )
}

export default FoodDisplay