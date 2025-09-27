import React from 'react';
import { Link, NavLink } from 'react-router-dom';

type HeaderProps = {
  handleLogout: () => void;
};

export default function Header({ handleLogout }: HeaderProps) {
  const activeLinkStyle = {
    textDecoration: 'underline',
    color: '#F43F5E', // This is the Tailwind rose-500 color
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-rose-500 font-bold text-xl">REDA</Link>
        <div className="flex items-center space-x-6">
          <NavLink 
            to="/dashboard" 
            className="text-lg text-slate-700 hover:text-rose-500 transition-colors hidden sm:inline"
            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/favorites" 
            className="text-lg text-slate-700 hover:text-rose-500 transition-colors hidden sm:inline"
            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
          >
            Favorites
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="text-lg text-slate-700 hover:text-rose-500 transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}