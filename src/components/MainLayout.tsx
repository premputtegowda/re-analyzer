import React from 'react';
import Header from './Header';

type MainLayoutProps = {
  children: React.ReactNode;
  handleLogout: () => void;
};

export default function MainLayout({ children, handleLogout }: MainLayoutProps) {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Header handleLogout={handleLogout} />
      <main>{children}</main>
    </div>
  );
}