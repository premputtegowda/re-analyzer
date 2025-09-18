import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import './App.css';

type User = { name: string; email: string };

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/me`, {credentials: 'include'})
      .then(res => res.json())
      .then(data => {
        setUser(data.error ? null : data);
        setLoading(false); // Set loading to false after fetch completes
      });
  }, []);

  const handleLogin = () => { window.location.href = `${process.env.REACT_APP_BACKEND_URL}/login`; };
  const handleLogout = () => { window.location.href = `${process.env.REACT_APP_BACKEND_URL}/logout`; };

  // Show a loading message while we check the user's status
  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <LoginPage handleLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={user ? <DashboardPage user={user} handleLogout={handleLogout} /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;