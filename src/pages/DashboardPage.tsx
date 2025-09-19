import React from 'react';
import Button from '../components/Button'; 

// The 'user' object and a 'handleLogout' function will be passed in as props
type DashboardProps = {
  user: { name: string; email: string };
  handleLogout: () => void;
};

export default function DashboardPage({ user, handleLogout }: DashboardProps) {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-rose-500 font-bold text-xl mb-2 sm:mb-0">REDA</div>
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-2">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 sm:mb-0">Your Deals</h1>
          <Button onClick={() => alert('Navigate to new deal form!')} className="w-full sm:w-64">
            <span>+ Add a Property</span>
          </Button>
        </div>
        <div className="mt-6 text-center text-slate-500 border-2 border-dashed border-slate-300 rounded-lg p-6 sm:p-12">
          <p>Your saved deals will appear here.</p>
        </div>
      </main>
    </div>
  );
}