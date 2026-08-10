import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { MobileFrame } from "../../../../components/MobileFrame";
import { PrimaryButton } from "../../../../components/ui/PrimaryButton";
import { ArrowLeft, User, Mail, Phone, IdCard, Archive, ShieldCheck } from "lucide-react-native";
import { apiRequest } from "../../../../lib/api";
import { useAuth } from "../../../../contexts/auth-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TenantView = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
};

export default function TenantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantView | null>(null);
  
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", idNumber: "" });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        if (!token || !id) return;
        try {
          const res = await apiRequest<TenantView>(`/tenants/${id}`, { token });
          setTenant(res);
          setForm({
            fullName: res.fullName,
            email: res.email,
            phone: res.phone,
            idNumber: res.idNumber,
          });
        } catch (e: any) {
          setErr(e.message);
        } finally {
          setLoading(false);
        }
      }
      load();
    }, [id, token])
  );

  async function submit() {
    if (!form.fullName.trim()) return setErr("Name is required.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErr("Enter a valid email.");
    if (form.phone.trim().length < 8) return setErr("Enter a valid phone number.");
    if (!form.idNumber.trim()) return setErr("ID number is required.");
    
    setErr(null);
    setNotice(null);
    setSubmitting(true);
    
    try {
      await apiRequest(`/tenants/${id}`, {
        method: "PATCH",
        token,
        body: form
      });
      setNotice("Saved. Login-identity changes will require the tenant to re-verify.");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleArchive() {
    Alert.alert(
      "Archive Tenant",
      "Are you sure you want to archive this tenant? Lease, invoice, payment, and audit history will be preserved.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Archive", 
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest(`/tenants/${id}`, { method: "DELETE", token });
              router.replace("/landlord/tenants");
            } catch (e: any) {
              setErr(e.message);
            }
          }
        }
      ]
    );
  }

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Math.max(insets.top + 16, 56) }}>
          <Link href="/landlord/tenants" asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Tenant</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }} numberOfLines={1}>{tenant?.fullName || "Loading..."}</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          {loading ? (
             <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 32 }} />
          ) : !tenant ? (
             <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 32 }}>Tenant not found.</Text>
          ) : (
            <View style={{ gap: 16 }}>
              {/* Field: Full Name */}
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 }}>Full name</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12 }}>
                  <User size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, fontSize: 15, color: '#0f172a' }}
                    value={form.fullName}
                    onChangeText={(t) => setForm({ ...form, fullName: t })}
                    placeholder="Enter full name"
                  />
                </View>
              </View>

              {/* Field: Email */}
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 }}>Email</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12 }}>
                  <Mail size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, fontSize: 15, color: '#0f172a' }}
                    value={form.email}
                    onChangeText={(t) => setForm({ ...form, email: t })}
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Field: Phone */}
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 }}>Phone (login username)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12 }}>
                  <Phone size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, fontSize: 15, color: '#0f172a' }}
                    value={form.phone}
                    onChangeText={(t) => setForm({ ...form, phone: t })}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Field: ID Number */}
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 }}>ID number</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12 }}>
                  <IdCard size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, fontSize: 15, color: '#0f172a' }}
                    value={form.idNumber}
                    onChangeText={(t) => setForm({ ...form, idNumber: t })}
                    placeholder="Enter ID number"
                  />
                </View>
              </View>

              <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 12, flexDirection: 'row', gap: 8 }}>
                <ShieldCheck size={16} color="#2563eb" style={{ marginTop: 2 }} />
                <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)', lineHeight: 18, flex: 1, paddingRight: 8 }}>
                  Changing phone or email triggers verification and updates the tenant's login identity.
                </Text>
              </View>

              {err && <Text style={{ fontSize: 13, color: '#ef4444' }}>{err}</Text>}
              {notice && <Text style={{ fontSize: 13, color: '#059669', fontWeight: '600' }}>{notice}</Text>}

              <View style={{ marginTop: 8 }}>
                <PrimaryButton onPress={submit} disabled={submitting}>
                  {submitting ? "Saving..." : "Save changes"}
                </PrimaryButton>
              </View>

              <TouchableOpacity 
                onPress={handleArchive}
                style={{ marginTop: 16, width: '100%', height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Archive size={16} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '600' }}>Archive tenant relationship</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8, paddingHorizontal: 16 }}>
                Archiving is a soft-delete. Lease, invoice, payment, and audit history are preserved.
              </Text>

            </View>
          )}
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
