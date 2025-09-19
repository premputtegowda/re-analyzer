

import React from 'react';

// Define the "blueprint" for our component's props
type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
};

export default function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  const baseClasses = "w-full py-3 px-4 font-bold rounded-lg flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300";

  // Airbnb-style color variants
  const variants = {
    primary: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500',
    secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-500',
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      {children}
    </button>
  );
}