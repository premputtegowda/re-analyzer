import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { PropertySummary } from '../types/property';
import { propertyApi } from '../services/propertyApi';

type DashboardProps = {
  user: { name: string; email: string };
  handleLogout: () => void;
};

export default function DashboardPage({ user, handleLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the list of properties from our Flask backend
    const fetchProperties = async () => {
      try {
        const data = await propertyApi.getProperties();
        setProperties(data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading properties...</div>;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-2">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 sm:mb-0">Your Properties</h1>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Map over the fetched properties and render a card for each one */}
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="mt-6 text-center text-slate-500 border-2 border-dashed border-slate-300 rounded-lg p-6 sm:p-12">
          <p>Your saved properties will appear here.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate('/add-property')}
        className="fixed bottom-24 right-6 w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors sm:bottom-8 sm:right-8"
        aria-label="Add a new property"
      >
        <Plus className="w-8 h-8" />
      </button>
    </main>
  );
}