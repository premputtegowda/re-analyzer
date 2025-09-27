import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button'; 

type DashboardProps = {
  user: { name: string; email: string };
  handleLogout: () => void;
};

export default function DashboardPage({ user, handleLogout }: DashboardProps) {
  const navigate = useNavigate();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-2">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 sm:mb-0">Your Deals</h1>
        <Button onClick={() => navigate('/add-property')} className="w-full sm:w-1/4">
          <span>+ Add a Property</span>
        </Button>
      </div>
      <div className="mt-6 text-center text-slate-500 border-2 border-dashed border-slate-300 rounded-lg p-6 sm:p-12">
        <p>Your saved deals will appear here.</p>
      </div>
    </main>
  );
}