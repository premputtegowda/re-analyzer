import React from 'react';

type SummaryCardProps = {
  title: string;
  value: string;
  isPositive?: boolean;
  className?: string;
};

export default function SummaryCard({ title, value, isPositive, className = '' }: SummaryCardProps) {
  const baseClasses = "p-4 rounded-lg shadow";
  let colorClasses = "bg-slate-50";

  if (isPositive === true) {
    colorClasses = "bg-emerald-50";
  } else if (isPositive === false) {
    colorClasses = "bg-red-50";
  }
  
  const titleColor = isPositive === undefined ? 'text-slate-500' : isPositive ? 'text-emerald-700' : 'text-red-700';
  const valueColor = isPositive === undefined ? 'text-slate-800' : isPositive ? 'text-emerald-600' : 'text-red-600';


  return (
    <div className={`${baseClasses} ${colorClasses} ${className}`}>
      <p className={`text-sm font-medium ${titleColor}`}>{title}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}