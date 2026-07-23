import { usePropertiesRepository } from '../api/properties.repository';

export function useProperties() {
  return usePropertiesRepository();
}
