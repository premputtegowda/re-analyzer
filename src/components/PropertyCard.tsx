// src/components/PropertyCard.tsx
import React from 'react';
import { PropertySummary } from '../types/property';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, DollarSign, ArrowRight } from 'lucide-react';

type PropertyCardProps = {
  property: PropertySummary;
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <img src={property.imageUrl} alt={property.nickname} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-bold text-slate-800 mb-1">{property.nickname}</h3>
        <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4" /> {property.address}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-rose-500" />
            <div>
              <p className="font-semibold text-slate-600">Property Type</p>
              <p>{property.propertyType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-rose-500" />
            <div>
              <p className="font-semibold text-slate-600">Purchase Price</p>
              <p>${property.purchasePrice.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/property/${property.id}`)}
          className="w-full mt-2 py-2 px-4 bg-rose-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors"
        >
          <span>View Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}