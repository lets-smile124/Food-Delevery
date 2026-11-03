import React, { useState, useContext } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import GuestLanding from '../../components/GuestLanding/GuestLanding';
import { StoreContext } from '../../context/StoreContext';

const Home = ({ setShowLogin, search, onAskAI }) => {
  const [category, setCategory] = useState("All");
  const { token, authLoading } = useContext(StoreContext);

  // If still checking localStorage auth token, show a smooth loading state
  if (authLoading) {
    return (
      <div className="home-auth-loader">
        <div className="loader-spinner"></div>
        <p>Setting up your dining experience...</p>
      </div>
    );
  }

  // If user is not logged in / registered, show the rich interactive guest landing page
  if (!token) {
    return (
      <GuestLanding
        setShowLogin={setShowLogin}
        onExploreMenu={() => setShowLogin(true)}
      />
    );
  }

  // Authenticated user experience: full menu, carousel, and food display (AIExperience box removed)
  return (
    <div className="home-authenticated">
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
    </div>
  );
};

export default Home;
