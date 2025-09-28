import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AddPropertyPage from './AddPropertyPage';
import { PropertySummary } from '../types/property';

export default function EditPropertyPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [propertyData, setPropertyData] = useState<PropertySummary | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/properties/${propertyId}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Property not found');
        return res.json();
      })
      .then(data => {
        setPropertyData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching property:", error);
        setLoading(false);
      });
  }, [propertyId]);

  if (loading) {
    return <div className="text-center p-8">Loading property data...</div>;
  }

  if (!propertyData) {
    return <div className="text-center p-8">Property not found.</div>;
  }
  
  return <AddPropertyPage existingPropertyData={propertyData} />;
}