import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../components/MobileFrame";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { Bell, UserCircle2, Wallet, Wrench, FileText, ChevronRight } from "lucide-react-native";

export default function TenantDashboard() {
  const insets = useSafeAreaInsets();

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
                <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#60a5fa', fontWeight: '600' }}>Tenant</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#ffffff', marginTop: 4 }} numberOfLines={1}>Welcome, Kojo</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Adenta Court · Unit #3</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={16} color="white" />
                </TouchableOpacity>
                <Link href="/profile" asChild>
                  <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCircle2 size={16} color="white" />
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Payment card */}
            <View style={{ marginTop: 24, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', padding: 20 }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Next payment due</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff' }}>3,800,000 VNĐ</Text>
                <Text style={{ fontSize: 12, color: '#60a5fa', fontWeight: '600' }}>in 6 days</Text>
              </View>
              <View style={{ marginTop: 16 }}>
                <PrimaryButton variant="primary">Pay now</PrimaryButton>
              </View>
            </View>
          </View>

          {/* Menu rows */}
          <View style={{ paddingHorizontal: 24, marginTop: 32, gap: 12 }}>
            <TenantRow icon={<Wallet size={16} color="#2563eb" />} title="Payment history" sub="View last 12 months" />
            <TenantRow icon={<Wrench size={16} color="#2563eb" />} title="Report a repair" sub="Plumbing, electricity, etc." />
            <TenantRow icon={<FileText size={16} color="#2563eb" />} title="My lease & documents" sub="Signed 12 Jan 2026" />
          </View>

          {/* Announcements */}
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 12 }}>Announcements</Text>
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>Water maintenance on Saturday</Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, lineHeight: 18 }}>
                Supply will be off between 9am–1pm as scheduled by GWCL. Sorry for the inconvenience.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}

function TenantRow({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <TouchableOpacity style={{ width: '100%', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</View>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{title}</Text>
        <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }} numberOfLines={1}>{sub}</Text>
      </View>
      <ChevronRight size={16} color="gray" />
    </TouchableOpacity>
  );
}
