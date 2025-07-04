// client/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContent } from '../context/AppContext'; // Make sure this path is correct
import { Spinner } from 'react-bootstrap'; // Assuming react-bootstrap for Spinner

const ProtectedRoute = ({ children }) => {
  const { isLoggedin, loadingAuth } = useContext(AppContent);

  if (loadingAuth) {
    // Show a loading spinner while authentication status is being determined
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!isLoggedin) {
    // If not logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child routes/components
  return children ? children : <Outlet />;
};

export default ProtectedRoute;