import React from 'react';
import { Link } from 'react-router-dom';

type HeaderProps = {
  handleLogout: () => void;
};

export default function Header({ handleLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
        <Link to="/dashboard" className="text-rose-500 font-bold text-xl mb-2 sm:mb-0">REDA</Link>
        <div className="flex items-center space-x-0 sm:space-x-4 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 font-normal text-lg bg-transparent border-none shadow-none p-0 hover:bg-gray-100 focus:outline-none focus:underline cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block">
              <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="2" stroke="currentColor" fill="none"/>
              <circle cx="8" cy="12" r="1" fill="currentColor" />
            </svg>
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}