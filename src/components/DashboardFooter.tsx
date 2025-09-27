import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Star } from 'lucide-react';

export default function DashboardFooter() {
  const activeLinkStyle = { color: '#F43F5E' }; // rose-500

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t z-20 sm:hidden">
      <div className="max-w-5xl mx-auto px-4 flex justify-around items-center">
        <NavLink
          to="/dashboard"
          className="flex flex-col items-center justify-center p-2 text-xs font-medium text-slate-500 hover:text-slate-700 w-full pt-3"
          style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
        >
          <LayoutDashboard className="w-6 h-6 mb-1" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/favorites"
          className="flex flex-col items-center justify-center p-2 text-xs font-medium text-slate-500 hover:text-slate-700 w-full pt-3"
          style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
        >
          <Star className="w-6 h-6 mb-1" />
          <span>Favorites</span>
        </NavLink>
      </div>
    </footer>
  );
}