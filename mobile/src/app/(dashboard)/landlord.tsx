import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect, Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../components/MobileFrame";
import { Building2, Bell, TrendingUp, UserCircle2, FileText, Receipt, FilePlus, CalendarClock, ChevronRight, Users, AlertTriangle, Wallet, Wrench, BarChart3 } from "lucide-react-native";
import { useAuth } from "../../contexts/auth-context";
import { apiRequest } from "../../lib/api";

const formatVND = (n: number) => {
  if (n == null || isNaN(n)) return '0';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function LandlordDashboard() {
  const { token, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [properties, setProperties] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [occupancy, setOccupancy] = useState<any>(null);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [outstanding, setOutstanding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      async function loadData() {
        if (!token) return;
        try {
          const today = new Date();
          const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

          const [propertiesData, revData, occData, expiringData, outstandingData] = await Promise.all([
            apiRequest<any[]>('/properties?pageSize=3', { token }),
            apiRequest<any>(`/dashboard/revenue?month=${monthStr}`, { token }),
            apiRequest<any>('/dashboard/occupancy', { token }),
            apiRequest<any[]>('/leases/upcoming-expirations', { token }),
            apiRequest<any>('/dashboard/outstanding', { token }),
          ]);

          setProperties(propertiesData);
          setRevenue(revData);
          setOccupancy(occData);
          setExpiring(expiringData ? expiringData.slice(0, 3) : []);
          setOutstanding(
            outstandingData
              ? {
                  ...outstandingData,
                  overdueInvoices: outstandingData.overdueInvoices?.slice(0, 3) || [],
                }
              : null
          );
        } catch (err) {
          console.error("Failed to load dashboard data", err);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }, [token])
  );

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : "Landlord";

  if (loading) {
    return (
      <MobileFrame>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f8ff' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 96) }} showsVerticalScrollIndicator={false}>
          {/* Hero header */}
          <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 48, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' }}>
            <LinearGradient
              colors={["#1e3a8a", "#0f172a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#60a5fa', fontWeight: '600' }}>Landlord</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#ffffff', marginTop: 4 }} numberOfLines={1}>Hi, {firstName}</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                  {properties.length} properties · {occupancy?.occupiedRooms || 0} occupied units
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <Link href="/(dashboard)/landlord/notifications" asChild>
                  <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={16} color="white" />
                  </TouchableOpacity>
                </Link>
                <Link href="/profile" asChild>
                  <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCircle2 size={16} color="white" />
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Revenue card */}
            <View style={{ marginTop: 24, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', padding: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>This month collected</Text>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff', marginTop: 4 }}>
                    {formatVND(revenue?.collectedRevenue ?? 0)} VNĐ
                  </Text>
                </View>
                {revenue?.growthPercentage !== undefined && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(37,99,235,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                    <TrendingUp size={12} color="#60a5fa" />
                    <Text style={{ fontSize: 12, color: '#60a5fa', fontWeight: '600' }}>
                      {revenue.growthPercentage > 0 ? '+' : ''}{revenue.growthPercentage}%
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ marginTop: 16, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <View style={{
                  height: '100%',
                  width: `${revenue?.expectedRevenue > 0 ? Math.min(Math.round((revenue.collectedRevenue / revenue.expectedRevenue) * 100), 100) : 0}%`,
                  backgroundColor: '#60a5fa'
                }} />
              </View>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
                {revenue?.expectedRevenue > 0 ? Math.round((revenue.collectedRevenue / revenue.expectedRevenue) * 100) : 0}% of expected rent received
              </Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={{ paddingHorizontal: 24, marginTop: -32 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderRadius: 24, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <View style={{ width: '33.333%' }}>
                <QuickActionLink to="/landlord/properties" icon={<Building2 size={16} color="#2563eb" />} label="Properties" />
              </View>
              <View style={{ width: '33.333%' }}>
                <QuickActionLink to="/landlord/leases" icon={<FileText size={16} color="#2563eb" />} label="Leases" />
              </View>
              <View style={{ width: '33.333%' }}>
                <QuickActionLink to="/landlord/tenants" icon={<Users size={16} color="#2563eb" />} label="Tenants" />
              </View>
              <View style={{ width: '33.333%' }}>
                <QuickActionLink to="/landlord/invoices" icon={<Receipt size={16} color="#2563eb" />} label="Invoices" />
              </View>
              <View style={{ width: '33.333%' }}>
                <QuickActionLink to="/(dashboard)/landlord/maintenance" icon={<Wrench size={16} color="#2563eb" />} label="Repairs" />
              </View>
              <View style={{ width: '33.333%' }}>
                <QuickActionLink to="/(dashboard)/landlord/reports" icon={<BarChart3 size={16} color="#2563eb" />} label="Reports" />
              </View>
            </View>
          </View>

          {/* Outstanding invoices section (US-DASH-03) */}
          {outstanding && (outstanding.outstandingTotal > 0 || (outstanding.overdueInvoices && outstanding.overdueInvoices.length > 0)) && (
            <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' }}>Outstanding</Text>
                <Link href={"/(dashboard)/landlord/invoices" as any} asChild>
                  <TouchableOpacity>
                    <Text style={{ fontSize: 13, color: '#2563eb', fontWeight: '600' }}>All invoices</Text>
                  </TouchableOpacity>
                </Link>
              </View>
              <View style={{ borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                {/* Total outstanding banner */}
                <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: outstanding.overdueInvoices?.length > 0 ? 1 : 0, borderBottomColor: '#f1f5f9' }}>
                  <View style={{ height: 48, width: 48, borderRadius: 24, backgroundColor: 'rgba(249,115,22,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Wallet size={20} color="#f97316" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 12, color: '#64748b' }}>Total outstanding</Text>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#f97316', marginTop: 2 }}>{formatVND(outstanding.outstandingTotal)} VNĐ</Text>
                  </View>
                </View>

                {/* Overdue invoice rows */}
                {outstanding.overdueInvoices?.map((inv: any, idx: number) => (
                  <Link key={inv.invoiceId} href={{ pathname: "/(dashboard)/landlord/invoices/[id]", params: { id: inv.invoiceId } } as any} asChild>
                    <TouchableOpacity style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: idx < outstanding.overdueInvoices.length - 1 ? 1 : 0, borderBottomColor: '#f1f5f9' }}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontWeight: '600', fontSize: 14, color: '#0f172a' }} numberOfLines={1}>{inv.tenant} · {inv.room}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <AlertTriangle size={12} color="#ef4444" />
                          <Text style={{ fontSize: 12, color: '#ef4444' }}>Due {inv.dueDate} · overdue</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>{formatVND(inv.amount)} VNĐ</Text>
                        <ChevronRight size={14} color="#94a3b8" />
                      </View>
                    </TouchableOpacity>
                  </Link>
                ))}
              </View>
            </View>
          )}

          {/* Expiring Leases section */}
          {expiring.length > 0 && (
            <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' }}>Expiring Leases</Text>
                <Link href={"/(dashboard)/landlord/leases/expiring" as any} asChild>
                  <TouchableOpacity>
                    <Text style={{ fontSize: 13, color: '#2563eb', fontWeight: '600' }}>See all</Text>
                  </TouchableOpacity>
                </Link>
              </View>
              <View style={{ borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                {expiring.map((l, index) => {
                  const [y, m, d] = l.endDate.split('-');
                  const end = new Date(Number(y), Number(m) - 1, Number(d));
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const days = Math.max(0, Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                  const isUrgent = days <= 15;

                  return (
                    <Link key={l.leaseId} href={{ pathname: "/(dashboard)/landlord/leases/[id]", params: { id: l.leaseId } } as any} asChild>
                      <TouchableOpacity style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: index < expiring.length - 1 ? 1 : 0, borderBottomColor: '#f1f5f9' }}>
                        <View style={{ height: 48, width: 48, borderRadius: 24, backgroundColor: isUrgent ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CalendarClock size={20} color={isUrgent ? '#ef4444' : '#2563eb'} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ fontWeight: '600', fontSize: 15, color: '#0f172a' }} numberOfLines={1}>{l.propertyName} · {l.roomName}</Text>
                          <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }} numberOfLines={1}>{l.tenantFullName} · expires {l.endDate}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: isUrgent ? '#ef4444' : '#0f172a' }}>{days}d</Text>
                        </View>
                      </TouchableOpacity>
                    </Link>
                  );
                })}
              </View>
            </View>
          )}

          {/* Properties section */}
          <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' }}>Properties</Text>
              <Link href="/landlord/properties" asChild>
                <TouchableOpacity>
                  <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600' }}>See all</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <View style={{ gap: 12 }}>
              {properties.length > 0 ? (
                properties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    id={prop.id}
                    title={prop.name}
                    address={prop.address}
                    units={prop.units || 0}
                    occupied={prop.occupied || 0}
                  />
                ))
              ) : (
                <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingVertical: 16 }}>No properties found.</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <TouchableOpacity style={{ flexDirection: 'column', alignItems: 'center', gap: 6, paddingVertical: 8 }}>
      <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text style={{ fontSize: 10, fontWeight: '600', color: '#0f172a', textAlign: 'center' }}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuickActionLink({ to, icon, label, blue }: { to: string; icon: React.ReactNode; label: string; blue?: boolean }) {
  return (
    <Link href={to as any} asChild>
      <TouchableOpacity style={{ flexDirection: 'column', alignItems: 'center', gap: 6, paddingVertical: 8 }}>
        <View style={{ height: 40, width: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: blue ? '#2563eb' : 'rgba(37,99,235,0.15)' }}>
          {icon}
        </View>
        <Text style={{ fontSize: 10, fontWeight: '600', color: '#0f172a', textAlign: 'center' }}>{label}</Text>
      </TouchableOpacity>
    </Link>
  );
}

function PropertyCard({ id, title, address, units, occupied }: { id: string; title: string; address: string; units: number; occupied: number }) {
  return (
    <Link href={{ pathname: "/landlord/properties/[id]", params: { id } } as any} asChild>
      <TouchableOpacity style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ height: 48, width: 48, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={20} color="#2563eb" />
        </View>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ fontWeight: '600', fontSize: 14 }} numberOfLines={1}>{title}</Text>
          <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }} numberOfLines={1}>{address}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
          <Text style={{ fontSize: 14, fontWeight: '700' }}>{occupied}/{units}</Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>occupied</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

function Activity({ title, who, amount, muted }: { title: string; who: string; amount: string; muted?: boolean }) {
  return (
    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{title}</Text>
        <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }} numberOfLines={1}>{who}</Text>
      </View>
      <Text style={{ fontSize: 12, fontWeight: '600', flexShrink: 0, color: muted ? '#94a3b8' : '#2563eb' }}>{amount}</Text>
    </View>
  );
}
