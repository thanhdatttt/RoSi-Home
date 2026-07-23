import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { Property } from '../models/property';

export interface PropertiesRepository {
  properties: Property[];
  createProperty(value: Omit<Property, 'id'>): void;
}

export function usePropertiesRepository(): PropertiesRepository {
  const { properties, addProperty } = useMockAppData();
  return { properties, createProperty: addProperty };
}
