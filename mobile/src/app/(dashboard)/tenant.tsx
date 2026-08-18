import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../components/MobileFrame";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { Bell, UserCircle2, Wallet, Wrench, FileText, ChevronRight, Receipt } from "lucide-react-native";
import { useAuth } from "../../contexts/auth-context";
import { apiRequest } from "../../lib/api";
import { useI18n } from "@/i18n/I18nProvider";

export default function TenantDashboard() {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const { formatVnd, t } = useI18n();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        if (!token) return;
        try {
          const res = await apiRequest<any>('/dashboard/tenant', { token });
          setData(res);
        } catch (err) {
          console.error("Failed to load tenant dashboard", err);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }, [token])
  );

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : t('role.tenant');

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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 16, 32) }} showsVerticalScrollIndicator={false}>
          {/* Hero header */}
          <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 48, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' }}>
            <LinearGradient
              colors={["#1e3a8a", "#0f172a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#60a5fa', fontWeight: '600' }}>{t('role.tenant')}</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#ffffff', marginTop: 4 }} numberOfLines={1}>{t('dashboard.welcome', { name: firstName })}</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                  {data ? `${data.propertyName} · ${data.roomName}` : t('dashboard.noActiveLease')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <Link href="/(dashboard)/tenant/notifications" asChild><TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}><Bell size={16} color="white" /></TouchableOpacity></Link>
                <Link href="/profile" asChild>
                  <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCircle2 size={16} color="white" />
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Payment card */}
            <View style={{ marginTop: 24, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', padding: 20 }}>
              {data?.nextPayment ? (
                <>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{t('tenant.nextPaymentDue')}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff' }}>{formatVnd(data.nextPayment.amount)}</Text>
                    <Text style={{ fontSize: 12, color: '#60a5fa', fontWeight: '600' }}>
                      {(() => {
                        const [y, m, d] = data.nextPayment.dueDate.split('-');
                        const end = new Date(Number(y), Number(m) - 1, Number(d));
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const days = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return days < 0 ? t('time.overdue') : days === 0 ? t('time.today') : t('time.inDays', { days });
                      })()}
                    </Text>
                  </View>
                  <View style={{ marginTop: 16 }}>
                    <PrimaryButton variant="primary">{t('tenant.payNow')}</PrimaryButton>
                  </View>
                </>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>{t('tenant.allCaughtUp')}</Text>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{t('tenant.noPaymentsDue')}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Menu rows */}
          <View style={{ paddingHorizontal: 24, marginTop: 32, gap: 12 }}>
            <TenantRow href="/(dashboard)/tenant/invoices" icon={<Receipt size={16} color="#2563eb" />} title={t('tenant.myInvoices')} sub={t('tenant.myInvoicesHint')} />
            <TenantRow href="/(dashboard)/tenant/lease" icon={<FileText size={16} color="#2563eb" />} title={t('tenant.myLease')} sub={t('tenant.myLeaseHint')} />
            <TenantRow href="/(dashboard)/tenant/reports" icon={<Wallet size={16} color="#2563eb" />} title={t('tenant.myReport')} sub={t('tenant.myReportHint')} />
            <TenantRow href="/(dashboard)/tenant/maintenance" icon={<Wrench size={16} color="#2563eb" />} title={t('tenant.maintenance')} sub={t('tenant.maintenanceHint')} />
          </View>

          {/* Announcements */}
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 12 }}>{t('tenant.announcements')}</Text>
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>{t('tenant.waterMaintenance')}</Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, lineHeight: 18 }}>
                {t('tenant.waterMaintenanceHint')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}

function TenantRow({ icon, title, sub, href }: { icon: React.ReactNode; title: string; sub: string; href?: string }) {
  const content = (
    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' }}>
      <View style={{ height: 44, width: 44, borderRadius: 16, backgroundColor: 'rgba(37,99,235,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontWeight: '600', fontSize: 15, color: '#0f172a' }}>{title}</Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{sub}</Text>
      </View>
      <ChevronRight size={16} color="#94a3b8" />
    </View>
  );

  if (href) {
    return (
      <Link href={href as any} asChild>
        <TouchableOpacity>
          {content}
        </TouchableOpacity>
      </Link>
    );
  }

  return (
    <TouchableOpacity>
      {content}
    </TouchableOpacity>
  );
}
