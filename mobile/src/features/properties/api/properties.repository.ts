import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { Property } from '../models/property';

export interface PropertiesRepository {
  properties: Property[];
  loading: boolean;
  error: string | null;
  refresh(): Promise<void>;
  createProperty(value: Omit<Property, 'id'>): Promise<Property>;
  updateProperty(value: Property): Promise<Property>;
}

export function usePropertiesRepository(): PropertiesRepository {
  const {
    properties,
    loading,
    error,
    refresh,
    addProperty,
    updateProperty,
  } = useMockAppData();
  return {
    properties,
    loading,
    error,
    refresh,
    createProperty: addProperty,
    updateProperty,
  };
}
