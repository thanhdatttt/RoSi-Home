import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ApiError,
  ApiEnvelope,
  ApiListEnvelope,
  useApiSession,
} from '@/core/api';
import { initialInvoices } from '@/features/billing/api/mock-data';
import {
  Invoice,
  MeterReading,
  previousBillingPeriod,
} from '@/features/billing/models/billing';
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
import {
  initialSurcharges,
  initialUtilityRates,
} from '@/features/settings/api/mock-data';
import {
  Surcharge,
  UtilityRate,
} from '@/features/settings/models/settings';

import {
  InvoiceDto,
  LeaseDto,
  MaintenanceRequestDto,
  PropertyDto,
  RoomDto,
  SurchargeDto,
  toApiDate,
  toInvoice,
  toLease,
  toMaintenanceRequest,
  toProperty,
  toRoom,
  toSurcharge,
  toUtilityRate,
  UtilityRateDto,
} from './api-mappers';

export type AppDataStore = {
  remote: boolean;
  loading: boolean;
  error: string | null;
  properties: Property[];
  rooms: Room[];
  surcharges: Surcharge[];
  utilityRates: UtilityRate[];
  leases: Lease[];
  maintenanceRequests: MaintenanceRequest[];
  meterReadings: MeterReading[];
  invoices: Invoice[];
  refresh(): Promise<void>;
  addProperty(value: Omit<Property, 'id'>): Promise<Property>;
  updateProperty(value: Property): Promise<Property>;
  addRoom(value: Omit<Room, 'id' | 'status'>): Promise<Room>;
  addRooms(
    propertyId: string,
    prefix: string,
    start: number,
    count: number,
    rent: number,
  ): Promise<Room[]>;
  addSurcharge(value: Omit<Surcharge, 'id' | 'status'>): Promise<Surcharge>;
  toggleSurcharge(id: string): Promise<void>;
  updateUtilityRate(value: UtilityRate): Promise<UtilityRate>;
  addLease(value: Omit<Lease, 'id' | 'status'>): Promise<string>;
  updateMaintenanceStatus(
    id: string,
    status: MaintenanceStatus,
  ): Promise<void>;
  saveMeterReading(value: Omit<MeterReading, 'id'>): Promise<void>;
  createInvoice(
    value: Omit<Invoice, 'id' | 'status'>,
  ): Promise<string | null>;
  sendInvoice(id: string): Promise<void>;
};

const AppDataContext = createContext<AppDataStore | null>(null);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể tải dữ liệu.';
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const { enabled, authenticated, user, client } = useApiSession();
  const [properties, setProperties] = useState<Property[]>(
    enabled ? [] : initialProperties,
  );
  const [rooms, setRooms] = useState<Room[]>(enabled ? [] : initialRooms);
  const [surcharges, setSurcharges] = useState<Surcharge[]>(
    enabled ? [] : initialSurcharges,
  );
  const [utilityRates, setUtilityRates] = useState<UtilityRate[]>(
    enabled ? [] : initialUtilityRates,
  );
  const [leases, setLeases] = useState<Lease[]>(enabled ? [] : initialLeases);
  const [maintenanceRequests, setMaintenanceRequests] = useState<
    MaintenanceRequest[]
  >(enabled ? [] : initialMaintenanceRequests);
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>(
    enabled ? [] : initialInvoices,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionalRequest = useCallback(
    async <T,>(path: string): Promise<T | null> => {
      try {
        return await client.request<T>({ path });
      } catch (requestError) {
        if (
          requestError instanceof ApiError &&
          requestError.kind === 'not-found'
        ) {
          return null;
        }
        throw requestError;
      }
    },
    [client],
  );

  const refresh = useCallback(async () => {
    if (!enabled || !authenticated || user?.mustChangePassword) return;
    setLoading(true);
    setError(null);
    try {
      const leaseResponse = await client.request<ApiListEnvelope<LeaseDto>>({
        path: '/api/v1/leases?page=1&pageSize=100',
      });
      setLeases(leaseResponse.data.map(toLease));

      const maintenanceResponse = await client.request<
        ApiListEnvelope<MaintenanceRequestDto>
      >({
        path: '/api/v1/maintenance-requests?page=1&pageSize=100',
      });
      setMaintenanceRequests(
        maintenanceResponse.data.map(toMaintenanceRequest),
      );

      if (user?.role === 'Landlord') {
        const propertyResponse = await client.request<
          ApiListEnvelope<PropertyDto>
        >({
          path: '/api/v1/properties?page=1&pageSize=100',
        });
        const nextProperties = propertyResponse.data.map(toProperty);
        setProperties(nextProperties);

        const roomResponses = await Promise.all(
          nextProperties.map((property) =>
            client.request<ApiListEnvelope<RoomDto>>({
              path: `/api/v1/rooms/properties/${property.id}?page=1&pageSize=100`,
            }),
          ),
        );
        setRooms(roomResponses.flatMap((response) => response.data.map(toRoom)));

        const surchargeResponses = await Promise.all(
          nextProperties.map((property) =>
            client.request<ApiListEnvelope<SurchargeDto>>({
              path: `/api/v1/charges/properties/${property.id}/surcharges?page=1&pageSize=100`,
            }),
          ),
        );
        setSurcharges(
          surchargeResponses.flatMap((response) =>
            response.data.map(toSurcharge),
          ),
        );

        const rateResponses = await Promise.all(
          nextProperties.map((property) =>
            optionalRequest<ApiEnvelope<UtilityRateDto>>(
              `/api/v1/utilities/properties/${property.id}/utility-rates`,
            ),
          ),
        );
        setUtilityRates(
          rateResponses
            .filter(
              (
                response,
              ): response is ApiEnvelope<UtilityRateDto> => response !== null,
            )
            .map((response) => toUtilityRate(response.data)),
        );
      }

      // The backend currently has no invoice-list or meter-reading-list API.
      setInvoices([]);
      setMeterReadings([]);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [
    authenticated,
    client,
    enabled,
    optionalRequest,
    user?.mustChangePassword,
    user?.role,
  ]);

  useEffect(() => {
    if (enabled && authenticated && !user?.mustChangePassword) {
      void refresh();
    }
    if (enabled && !authenticated) {
      setProperties([]);
      setRooms([]);
      setSurcharges([]);
      setUtilityRates([]);
      setLeases([]);
      setMaintenanceRequests([]);
      setInvoices([]);
      setMeterReadings([]);
    }
  }, [authenticated, enabled, refresh, user?.mustChangePassword]);

  const value = useMemo<AppDataStore>(
    () => ({
      remote: enabled,
      loading,
      error,
      properties,
      rooms,
      surcharges,
      utilityRates,
      leases,
      maintenanceRequests,
      meterReadings,
      invoices,
      refresh,
      addProperty: async (property) => {
        if (!enabled) {
          const created = { ...property, id: `p${Date.now()}` };
          setProperties((current) => [...current, created]);
          return created;
        }
        const response = await client.request<ApiEnvelope<PropertyDto>>({
          method: 'POST',
          path: '/api/v1/properties',
          body: property,
        });
        const created = toProperty(response.data);
        setProperties((current) => [...current, created]);
        return created;
      },
      updateProperty: async (property) => {
        if (!enabled) {
          setProperties((current) =>
            current.map((item) => (item.id === property.id ? property : item)),
          );
          return property;
        }
        const response = await client.request<ApiEnvelope<PropertyDto>>({
          method: 'PATCH',
          path: `/api/v1/properties/${property.id}`,
          body: { name: property.name, address: property.address },
        });
        const updated = toProperty(response.data);
        setProperties((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        return updated;
      },
      addRoom: async (room) => {
        if (!enabled) {
          const created: Room = {
            ...room,
            id: `r${Date.now()}`,
            status: 'Trống',
          };
          setRooms((current) => [...current, created]);
          return created;
        }
        const response = await client.request<ApiEnvelope<RoomDto>>({
          method: 'POST',
          path: `/api/v1/rooms/properties/${room.propertyId}`,
          body: {
            name: room.name,
            baseRent: room.rent,
          },
        });
        const created = toRoom(response.data);
        setRooms((current) => [...current, created]);
        return created;
      },
      addRooms: async (propertyId, prefix, start, count, rent) => {
        if (!enabled) {
          const created = Array.from({ length: count }, (_, index) => ({
            id: `r${Date.now()}-${index}`,
            propertyId,
            name: `${prefix}${start + index}`,
            rent,
            status: 'Trống' as const,
          }));
          setRooms((current) => [...current, ...created]);
          return created;
        }
        const response = await client.request<
          ApiEnvelope<{ created: RoomDto[] }>
        >({
          method: 'POST',
          path: `/api/v1/rooms/properties/${propertyId}/bulk`,
          body: {
            rooms: Array.from({ length: count }, (_, index) => ({
              name: `${prefix}${start + index}`,
              baseRent: rent,
            })),
          },
        });
        const created = response.data.created.map(toRoom);
        setRooms((current) => [...current, ...created]);
        return created;
      },
      addSurcharge: async (surcharge) => {
        if (!enabled) {
          const created: Surcharge = {
            ...surcharge,
            id: `s${Date.now()}`,
            status: 'Đang áp dụng',
          };
          setSurcharges((current) => [...current, created]);
          return created;
        }
        const response = await client.request<ApiEnvelope<SurchargeDto>>({
          method: 'POST',
          path: `/api/v1/charges/properties/${surcharge.propertyId}/surcharges`,
          body: {
            name: surcharge.name,
            monthlyAmount: surcharge.amount,
            effectiveFrom: new Date().toISOString().slice(0, 10),
            effectiveTo: null,
          },
        });
        const created = toSurcharge(response.data);
        setSurcharges((current) => [...current, created]);
        return created;
      },
      toggleSurcharge: async (id) => {
        const current = surcharges.find((item) => item.id === id);
        if (!enabled) {
          setSurcharges((items) =>
            items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status:
                      item.status === 'Đang áp dụng'
                        ? 'Ngừng áp dụng'
                        : 'Đang áp dụng',
                  }
                : item,
            ),
          );
          return;
        }
        if (current?.status !== 'Đang áp dụng') {
          throw new ApiError(
            'Backend chưa hỗ trợ kích hoạt lại phụ phí đã xóa.',
            'validation',
          );
        }
        await client.request({
          method: 'DELETE',
          path: `/api/v1/charges/${id}`,
        });
        setSurcharges((items) =>
          items.map((item) =>
            item.id === id ? { ...item, status: 'Ngừng áp dụng' } : item,
          ),
        );
      },
      updateUtilityRate: async (rate) => {
        if (!enabled) {
          setUtilityRates((current) => [
            ...current.filter(
              (item) => item.propertyId !== rate.propertyId,
            ),
            rate,
          ]);
          return rate;
        }
        const flat = rate.waterMethod === 'Theo người';
        const response = await client.request<ApiEnvelope<UtilityRateDto>>({
          method: 'POST',
          path: `/api/v1/utilities/properties/${rate.propertyId}/utility-rates`,
          body: {
            electricityRatePerKwh: rate.electricityRate,
            waterBillingMethod: flat ? 'Flat' : 'Metered',
            waterRatePerM3: flat ? null : rate.waterRate,
            waterFlatAmountPerTenant: flat ? rate.waterRate : null,
            effectiveFrom: toApiDate(rate.effectiveFrom),
          },
        });
        const updated = toUtilityRate(response.data);
        setUtilityRates((current) => [
          ...current.filter(
            (item) => item.propertyId !== updated.propertyId,
          ),
          updated,
        ]);
        return updated;
      },
      addLease: async (lease) => {
        if (!enabled) {
          const id = `l${Date.now()}`;
          setLeases((current) => [
            ...current,
            { ...lease, id, status: 'Đang hiệu lực' },
          ]);
          setRooms((current) =>
            current.map((room) =>
              room.id === lease.roomId
                ? { ...room, status: 'Đang thuê' }
                : room,
            ),
          );
          return id;
        }
        const response = await client.request<ApiEnvelope<LeaseDto>>({
          method: 'POST',
          path: '/api/v1/leases',
          body: {
            roomId: lease.roomId,
            tenant: {
              fullName: lease.tenantName,
              phone: lease.phone,
              idNumber: lease.identityNumber,
              email: lease.email,
            },
            startDate: toApiDate(lease.startDate),
            endDate: toApiDate(lease.endDate),
            agreedRent: lease.rent,
            deposit: lease.deposit,
          },
        });
        const created = toLease(response.data);
        setLeases((current) => [...current, created]);
        setRooms((current) =>
          current.map((room) =>
            room.id === created.roomId
              ? { ...room, status: 'Đang thuê' }
              : room,
          ),
        );
        return created.id;
      },
      updateMaintenanceStatus: async (id, status) => {
        if (enabled) {
          await client.request({
            method: 'PATCH',
            path: `/api/v1/maintenance-requests/${id}/status`,
            body: {
              status:
                status === 'Mới'
                  ? 'Pending'
                  : status === 'Đang xử lý'
                    ? 'InProgress'
                    : 'Completed',
            },
          });
        }
        setMaintenanceRequests((current) =>
          current.map((request) =>
            request.id === id ? { ...request, status } : request,
          ),
        );
      },
      saveMeterReading: async (reading) => {
        if (enabled) {
          const recordUtility = async (
            utilityType: 'Electricity' | 'Water',
            previousValue: number,
            currentValue: number,
          ) => {
            const record = (
              billingPeriod: string,
              value: number,
              isInitial: boolean,
            ) =>
              client.request({
                method: 'POST',
                path: `/api/v1/rooms/${reading.roomId}/meter-readings`,
                body: { utilityType, billingPeriod, value, isInitial },
              });
            try {
              await record(reading.period, currentValue, false);
            } catch (requestError) {
              if (
                requestError instanceof ApiError &&
                requestError.status === 409
              ) {
                return;
              }
              const missingBaseline =
                requestError instanceof ApiError &&
                requestError.status === 422 &&
                requestError.message.includes('No preceding reading found');
              if (!missingBaseline) throw requestError;
              await record(
                previousBillingPeriod(reading.period),
                previousValue,
                true,
              );
              await record(reading.period, currentValue, false);
            }
          };

          await recordUtility(
            'Electricity',
            reading.previousElectricity,
            reading.electricity,
          );
          if (reading.waterMetered !== false) {
            await recordUtility(
              'Water',
              reading.previousWater,
              reading.water,
            );
          }
        }
        setMeterReadings((current) => [
          ...current.filter(
            (item) =>
              item.roomId !== reading.roomId ||
              item.period !== reading.period,
          ),
          { ...reading, id: `mr${Date.now()}` },
        ]);
      },
      createInvoice: async (invoice) => {
        if (!enabled) {
          const id = `i${Date.now()}`;
          setInvoices((current) => [
            ...current,
            { ...invoice, id, status: 'Nháp' },
          ]);
          return id;
        }
        const room = rooms.find((item) => item.id === invoice.roomId);
        if (!room) {
          throw new ApiError('Không tìm thấy phòng của hóa đơn.', 'not-found');
        }
        await client.request({
          method: 'POST',
          path: `/api/v1/properties/${room.propertyId}/invoices/generate?period=${invoice.period}`,
        });
        // Backend has no invoice-list endpoint, so the generated invoice id
        // cannot be resolved here yet.
        return null;
      },
      sendInvoice: async (id) => {
        if (enabled) {
          const response = await client.request<ApiEnvelope<InvoiceDto>>({
            method: 'POST',
            path: `/api/v1/invoices/${id}/send`,
          });
          const sent = toInvoice(response.data);
          setInvoices((current) =>
            current.map((invoice) => (invoice.id === id ? sent : invoice)),
          );
          return;
        }
        setInvoices((current) =>
          current.map((invoice) =>
            invoice.id === id && invoice.status === 'Nháp'
              ? { ...invoice, status: 'Đã gửi' }
              : invoice,
          ),
        );
      },
    }),
    [
      client,
      enabled,
      error,
      invoices,
      leases,
      loading,
      maintenanceRequests,
      meterReadings,
      properties,
      refresh,
      rooms,
      surcharges,
      utilityRates,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export const MockAppDataProvider = AppDataProvider;

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('AppDataProvider is missing');
  return value;
}

export const useMockAppData = useAppData;
