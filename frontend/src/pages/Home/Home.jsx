import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AIExperience from '../../components/AIExperience/AIExperience'

const Home = ({ setShowLogin, search , onAskAI}) => {

  const [category, setCategory] = useState("All")

  return (
    <div>
      <Header />

      <ExploreMenu
        category={category}
        setCategory={setCategory}
      />

      <FoodDisplay
        category={category}
        setShowLogin={setShowLogin}
        search={search}
      />

      <AIExperience onAskAI={onAskAI} />
    </div>
  )
}

export default Home