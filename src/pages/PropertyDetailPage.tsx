import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PropertySummary } from '../types/property';
import { ArrowLeft, Edit } from 'lucide-react';

export default function PropertyDetailPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/properties/${propertyId}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Property not found');
        }
        return res.json();
      })
      .then(data => {
        setProperty(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching property:", error);
        setLoading(false);
      });
  }, [propertyId]);

  if (loading) {
    return <div className="text-center p-8">Loading property details...</div>;
  }

  if (!property) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800">Property not found</h2>
        <Link to="/dashboard" className="text-rose-500 hover:underline mt-4 inline-block">
          &larr; Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/dashboard" className="text-slate-600 hover:text-rose-500 font-semibold flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{property.nickname}</h1>
            <p className="text-slate-500">{property.address}</p>
          </div>
          <button 
            onClick={() => navigate(`/property/${property.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>

        <hr className="my-6" />

        <div className="text-center text-slate-400">
          <p>Detailed analysis will be displayed here.</p>
        </div>
      </div>
    </main>
  );
}