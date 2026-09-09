import React, { useContext, useEffect } from "react";
import { StoreContext } from "../../context/StoreContext";

const ProtectedRoute = ({ children, setShowLogin }) => {
  const { token, authLoading } = useContext(StoreContext);

  // Wait until we know whether the user is logged in
  useEffect(() => {
    if (!authLoading && !token) {
      setShowLogin(true);
    }
  }, [token, authLoading, setShowLogin]);

  // While checking localStorage
  if (authLoading) {
    return <div>Loading...</div>;
  }

  // User is not logged in
  if (!token) {
    return null;
  }

  // User is logged in
  return children;
};

export default ProtectedRoute;
