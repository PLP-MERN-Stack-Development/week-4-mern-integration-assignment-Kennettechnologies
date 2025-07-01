import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const NavBar = () => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">Home</Link> |{' '}
      <Link to="/posts/new">Create Post</Link> |{' '}
      {user ? (
        <>
          <span>Welcome, {user.username}!</span> |{' '}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link> |{' '}
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default NavBar; 