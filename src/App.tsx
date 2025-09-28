import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import AddPropertyPage from './pages/AddPropertyPage';
import MainLayout from './components/MainLayout'; 
import FavoritesPage from './pages/FavoritesPage';
import DashboardLayout from './components/DashboardLayout';
import PropertyDetailPage from './pages/PropertyDetailPage';
import EditPropertyPage from './pages/EditPropertyPage'; // Import the new edit page
import './App.css';

type User = { name: string; email: string };

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/me`, {credentials: 'include'})
      .then(res => res.json())
      .then(data => {
        setUser(data.error ? null : data);
        setLoading(false);
      });
  }, []);

  const handleLogin = () => { window.location.href = `${process.env.REACT_APP_BACKEND_URL}/login`; };
  const handleLogout = () => { window.location.href = `${process.env.REACT_APP_BACKEND_URL}/logout`; };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <LoginPage handleLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={user ? <DashboardLayout handleLogout={handleLogout}><DashboardPage user={user} handleLogout={handleLogout} /></DashboardLayout> : <Navigate to="/" />} />
      <Route path="/add-property" element={user ? <MainLayout handleLogout={handleLogout}><AddPropertyPage /></MainLayout> : <Navigate to="/" />} />
      <Route path="/property/:propertyId" element={user ? <MainLayout handleLogout={handleLogout}><PropertyDetailPage /></MainLayout> : <Navigate to="/" />} />
      <Route path="/property/:propertyId/edit" element={user ? <MainLayout handleLogout={handleLogout}><EditPropertyPage /></MainLayout> : <Navigate to="/" />} />
      <Route path="/favorites" element={user ? <DashboardLayout handleLogout={handleLogout}><FavoritesPage /></DashboardLayout> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;