import React from 'react';
import Header from './Header';
import DashboardFooter from './DashboardFooter';

type DashboardLayoutProps = {
  children: React.ReactNode;
  handleLogout: () => void;
};

export default function DashboardLayout({ children, handleLogout }: DashboardLayoutProps) {
  return (
    <div className="bg-slate-50 min-h-screen pb-24 sm:pb-0">
      <Header handleLogout={handleLogout} />
      <main>{children}</main>
      <DashboardFooter />
    </div>
  );
}