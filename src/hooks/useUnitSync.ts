import { useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { PropertyData, Unit } from '../types/property';

/**
 * Custom hook to synchronize unit information globally across the form
 * Keeps main units and all annual income units in sync
 */
export function useUnitSync() {
  const { watch, setValue, getValues } = useFormContext<PropertyData>();
  
  const mainUnits = watch('units');

  /**
   * Sync changes from main units
   */
  const syncFromMainUnits = useCallback((updatedMainUnits: Unit[]) => {
    setValue('units', updatedMainUnits);
  }, [setValue]);

  /**
   * Update a unit
   */
  const updateUnit = useCallback((unitIndex: number, updatedUnit: Partial<Unit>) => {
    const currentUnits = getValues('units');
    const updatedUnits = currentUnits.map((unit, index) => {
      if (index === unitIndex) {
        return { ...unit, ...updatedUnit };
      }
      return unit;
    });
    setValue('units', updatedUnits);
  }, [setValue, getValues]);

  /**
   * Add a new unit
   */
  const addUnit = useCallback((newUnit: Unit) => {
    const currentUnits = getValues('units');
    const updatedUnits = [...currentUnits, newUnit];
    setValue('units', updatedUnits);
  }, [setValue, getValues]);

  /**
   * Remove a unit
   */
  const removeUnit = useCallback((unitIndex: number) => {
    const currentUnits = getValues('units');
    const updatedUnits = currentUnits.filter((_, index) => index !== unitIndex);
    setValue('units', updatedUnits);
  }, [setValue, getValues]);

  return {
    syncFromMainUnits,
    updateUnit,
    addUnit,
    removeUnit
  };
}
