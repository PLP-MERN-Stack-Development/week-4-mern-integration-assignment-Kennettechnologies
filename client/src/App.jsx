import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PostList from './pages/PostList';
import PostView from './pages/PostView';
import PostForm from './pages/PostForm';
import Login from './pages/Login';
import Register from './pages/Register';
import NavBar from './components/NavBar';
import { authService } from './services/api';

const PrivateRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <NavBar />
      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/posts/new" element={<PrivateRoute><PostForm /></PrivateRoute>} />
          <Route path="/posts/:id" element={<PostView />} />
          <Route path="/posts/:id/edit" element={<PrivateRoute><PostForm /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 