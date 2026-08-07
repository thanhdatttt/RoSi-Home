import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../components/MobileFrame";
import { ArrowLeft, Bell } from "lucide-react-native";
import { useAuth } from "../../../contexts/auth-context";
import { apiRequest } from "../../../lib/api";

export default function NotificationsCenter() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      if (!token) return;
      try {
        const data = await apiRequest<any[]>('/notifications', { token });
        setNotifications(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [token]);

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Link href="/(dashboard)/landlord" asChild>
              <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={16} color="black" />
              </TouchableOpacity>
            </Link>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a' }}>Notifications</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: Math.max(insets.bottom + 24, 32), gap: 16 }}>
            {notifications.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <View style={{ height: 64, width: 64, borderRadius: 32, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Bell size={32} color="#94a3b8" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748b' }}>No notifications yet</Text>
              </View>
            ) : (
              notifications.map((n) => (
                <View key={n.id} style={{ padding: 16, borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>{n.title}</Text>
                  <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{n.body}</Text>
                  <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>{new Date(n.createdAt).toLocaleString()}</Text>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </MobileFrame>
  );
}
