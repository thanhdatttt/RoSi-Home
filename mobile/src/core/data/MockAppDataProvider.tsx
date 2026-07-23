import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { initialInvoices } from '@/features/billing/api/mock-data';
import { Invoice, MeterReading } from '@/features/billing/models/billing';
import { initialLeases } from '@/features/leases/api/mock-data';
import { Lease } from '@/features/leases/models/lease';
import { initialMaintenanceRequests } from '@/features/maintenance/api/mock-data';
import {
  MaintenanceRequest,
  MaintenanceStatus,
} from '@/features/maintenance/models/maintenance';
import { initialProperties } from '@/features/properties/api/mock-data';
import { Property } from '@/features/properties/models/property';
import { initialRooms } from '@/features/rooms/api/mock-data';
import { Room } from '@/features/rooms/models/room';
import { initialSurcharges, initialUtilityRates } from '@/features/settings/api/mock-data';
import { Surcharge, UtilityRate } from '@/features/settings/models/settings';

export type AppDataStore = {
  properties: Property[];
  rooms: Room[];
  surcharges: Surcharge[];
  utilityRates: UtilityRate[];
  leases: Lease[];
  maintenanceRequests: MaintenanceRequest[];
  meterReadings: MeterReading[];
  invoices: Invoice[];
  addProperty: (value: Omit<Property, 'id'>) => void;
  addRoom: (value: Omit<Room, 'id' | 'status'>) => void;
  addRooms: (
    propertyId: string,
    prefix: string,
    start: number,
    count: number,
    rent: number,
  ) => void;
  addSurcharge: (value: Omit<Surcharge, 'id' | 'status'>) => void;
  toggleSurcharge: (id: string) => void;
  updateUtilityRate: (value: UtilityRate) => void;
  addLease: (value: Omit<Lease, 'id' | 'status'>) => string;
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus) => void;
  saveMeterReading: (value: Omit<MeterReading, 'id'>) => void;
  createInvoice: (value: Omit<Invoice, 'id' | 'status'>) => string;
  sendInvoice: (id: string) => void;
};

const AppDataContext = createContext<AppDataStore | null>(null);

export function MockAppDataProvider({ children }: PropsWithChildren) {
  const [properties, setProperties] = useState(initialProperties);
  const [rooms, setRooms] = useState(initialRooms);
  const [surcharges, setSurcharges] = useState(initialSurcharges);
  const [utilityRates, setUtilityRates] = useState(initialUtilityRates);
  const [leases, setLeases] = useState(initialLeases);
  const [maintenanceRequests, setMaintenanceRequests] = useState(initialMaintenanceRequests);
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([]);
  const [invoices, setInvoices] = useState(initialInvoices);

  const value = useMemo<AppDataStore>(
    () => ({
      properties,
      rooms,
      surcharges,
      utilityRates,
      leases,
      maintenanceRequests,
      meterReadings,
      invoices,
      addProperty: (property) =>
        setProperties((current) => [...current, { ...property, id: `p${Date.now()}` }]),
      addRoom: (room) =>
        setRooms((current) => [...current, { ...room, id: `r${Date.now()}`, status: 'Trống' }]),
      addRooms: (propertyId, prefix, start, count, rent) =>
        setRooms((current) => [
          ...current,
          ...Array.from({ length: count }, (_, index) => ({
            id: `r${Date.now()}-${index}`,
            propertyId,
            name: `${prefix}${start + index}`,
            rent,
            area: 20,
            status: 'Trống' as const,
          })),
        ]),
      addSurcharge: (surcharge) =>
        setSurcharges((current) => [
          ...current,
          { ...surcharge, id: `s${Date.now()}`, status: 'Đang áp dụng' },
        ]),
      toggleSurcharge: (id) =>
        setSurcharges((current) =>
          current.map((surcharge) =>
            surcharge.id === id
              ? {
                  ...surcharge,
                  status:
                    surcharge.status === 'Đang áp dụng' ? 'Ngừng áp dụng' : 'Đang áp dụng',
                }
              : surcharge,
          ),
        ),
      updateUtilityRate: (rate) =>
        setUtilityRates((current) => [
          ...current.filter((item) => item.propertyId !== rate.propertyId),
          rate,
        ]),
      addLease: (lease) => {
        const id = `l${Date.now()}`;
        setLeases((current) => [...current, { ...lease, id, status: 'Đang hiệu lực' }]);
        return id;
      },
      updateMaintenanceStatus: (id, status) =>
        setMaintenanceRequests((current) =>
          current.map((request) => (request.id === id ? { ...request, status } : request)),
        ),
      saveMeterReading: (reading) =>
        setMeterReadings((current) => [
          ...current.filter(
            (item) => item.roomId !== reading.roomId || item.period !== reading.period,
          ),
          { ...reading, id: `mr${Date.now()}` },
        ]),
      createInvoice: (invoice) => {
        const id = `i${Date.now()}`;
        setInvoices((current) => [...current, { ...invoice, id, status: 'Nháp' }]);
        return id;
      },
      sendInvoice: (id) =>
        setInvoices((current) =>
          current.map((invoice) =>
            invoice.id === id && invoice.status === 'Nháp'
              ? { ...invoice, status: 'Đã gửi' }
              : invoice,
          ),
        ),
    }),
    [
      invoices,
      leases,
      maintenanceRequests,
      meterReadings,
      properties,
      rooms,
      surcharges,
      utilityRates,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useMockAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('MockAppDataProvider is missing');
  return value;
}
