import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal, TextInput, Clipboard } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../components/MobileFrame";
import { Field } from "../../../../components/ui/Field";
import { PrimaryButton } from "../../../../components/ui/PrimaryButton";
import { DatePicker } from "../../../../components/ui/DatePicker";
import { ArrowLeft, Mail, User, Phone, IdCard, Building2, DoorOpen, Calendar, Wallet, ShieldCheck, Copy, Check, KeyRound } from "lucide-react-native";
import { useAuth } from "../../../../contexts/auth-context";
import { createLease } from "../../../../features/leasing/api";
import { listProperties, listRooms } from "../../../../features/portfolio/api";


type Option = { id: string; label: string };

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function NewLease() {
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idNo, setIdNo] = useState("");

  const [properties, setProperties] = useState<Option[]>([]);
  const [rooms, setRooms] = useState<Option[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [roomId, setRoomId] = useState("");

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  });
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const [tempPassword, setTempPassword] = useState("");
  const [tenantAccountProvisioned, setTenantAccountProvisioned] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch properties on mount
  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await listProperties(token, 1, 100);
        const opts = res.data.map((property) => ({ id: property.id, label: property.name }));
        setProperties(opts);
        if (opts.length > 0) setPropertyId(opts[0].id);
      } catch (e) {
        console.error("Failed to fetch properties", e);
      }
    }
    fetchProperties();
  }, [token]);

  // Fetch rooms when property changes
  useEffect(() => {
    if (!propertyId) return;
    async function fetchRooms() {
      try {
        const res = await listRooms(token, propertyId, 1, 100);
        const opts = res.data
          .filter((room) => room.status === "Vacant")
          .map((room) => ({ id: room.id, label: room.name }));
        setRooms(opts);
        setRoomId(opts[0]?.id ?? "");
      } catch (e) {
        console.error("Failed to fetch rooms", e);
      }
    }
    fetchRooms();
  }, [propertyId, token]);

  const formatMoney = (val: string) => {
    if (!val) return "";
    const numeric = val.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const getRawNumber = (val: string) => val.replace(/,/g, "");

  async function submit() {
    if (!name.trim()) return setErr("Tenant full name is required.");
    if (!/^\+?[\d\s]{8,}$/.test(phone)) return setErr("Enter a valid phone number (used as login username).");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
    if (!idNo.trim()) return setErr("Identification number is required.");
    if (!propertyId) return setErr("Please select a property.");
    if (!roomId) return setErr("Please select a room.");

    const rentRaw = getRawNumber(rent);
    const depositRaw = getRawNumber(deposit);
    if (Number(rentRaw) <= 0) return setErr("Monthly rent must be greater than 0.");
    if (Number(depositRaw) < 0) return setErr("Deposit must be zero or more.");

    if (endDate <= startDate) return setErr("End date must be after start date.");

    setErr(null);
    setLoading(true);

    try {
      const res = await createLease(token, {
          roomId,
          tenant: {
            fullName: name.trim(),
            phone: phone.trim(),
            idNumber: idNo.trim(),
            email: email.trim(),
          },
          startDate: toLocalDateString(startDate),
          endDate: toLocalDateString(endDate),
          agreedRent: Number(rentRaw),
          deposit: Number(depositRaw),
      });
      setTenantAccountProvisioned(res.meta?.tenantAccountProvisioned ?? false);
      setTempPassword(res.meta?.tempPassword ?? "");
      setCreated(true);
    } catch (e: any) {
      setErr(e.message || "Failed to create lease and provision account.");
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = () => {
    Clipboard.setString(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (created) {
    const propName = properties.find(p => p.id === propertyId)?.label || "";
    const roomName = rooms.find(r => r.id === roomId)?.label || "";

    return (
      <MobileFrame>
        <View style={{ flex: 1, backgroundColor: '#f5f8ff', paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          <View style={{ height: 56, width: 56, borderRadius: 16, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={24} color="white" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', marginTop: 16, color: '#0f172a' }}>Lease created</Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginTop: 8, lineHeight: 22 }}>
            {tenantAccountProvisioned
              ? <>A tenant account was provisioned for <Text style={{ fontWeight: '700', color: '#0f172a' }}>{name}</Text>. Credential email delivery is best-effort and is not confirmed by this screen.</>
              : <>The existing tenant account for <Text style={{ fontWeight: '700', color: '#0f172a' }}>{name}</Text> was reused.</>}
          </Text>

          <View style={{ marginTop: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
            <Summary icon={<Building2 size={16} color="#2563eb" />} label="Property · Room" value={`${propName} · ${roomName}`} />
            <View style={{ height: 1, width: '100%', backgroundColor: '#e2e8f0' }} />
            <Summary icon={<Calendar size={16} color="#2563eb" />} label="Lease starts" value={toLocalDateString(startDate)} />
            <View style={{ height: 1, width: '100%', backgroundColor: '#e2e8f0' }} />
            <Summary icon={<Wallet size={16} color="#2563eb" />} label="Monthly rent" value={`${Number(getRawNumber(rent)).toLocaleString()} VNĐ`} />
            <View style={{ height: 1, width: '100%', backgroundColor: '#e2e8f0' }} />
            <Summary icon={<Phone size={16} color="#2563eb" />} label="Username (phone)" value={phone} />
          </View>

          {tempPassword ? <View style={{ marginTop: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <KeyRound size={16} color="#2563eb" />
              <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', color: '#2563eb' }}>Temporary password</Text>
            </View>
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12 }}>
                <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 16, letterSpacing: 2 }}>{tempPassword}</Text>
              </View>
              <TouchableOpacity
                onPress={copyToClipboard}
                style={{ height: 46, width: 46, borderRadius: 8, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}
              >
                {copied ? <Check size={16} color="white" /> : <Copy size={16} color="white" />}
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingRight: 8 }}>
              <Mail size={14} color="gray" style={{ marginTop: 2 }} />
              <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.7)', lineHeight: 18, flex: 1 }}>
                Email delivery is best-effort and not confirmed here. Tenant must change this password at first sign-in.
              </Text>
            </View>
          </View> : null}

          <View style={{ marginTop: 'auto', paddingTop: 24 }}>
            <PrimaryButton onPress={() => router.navigate('/landlord')}>Back to dashboard</PrimaryButton>
          </View>
        </View>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Link href="/landlord" asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Leases</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>New lease</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>

          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 14, flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            <ShieldCheck size={16} color="#2563eb" style={{ marginTop: 2 }} />
            <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.8)', lineHeight: 18, flex: 1 }}>
              Creating a lease provisions an account for a new tenant or reuses an existing one. Their <Text style={{ fontWeight: '700' }}>phone number</Text> is the login username; email delivery is best-effort.
            </Text>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 16 }}>Tenant information</Text>
            <View style={{ marginBottom: 16 }}>
              <Field label="Full name" placeholder="Kojo Mensah" icon={<User size={16} color="gray" />} value={name} onChangeText={setName} />
            </View>
            <View style={{ marginBottom: 16 }}>
              <Field label="Phone number (username)" placeholder="+233 24 555 0101" keyboardType="phone-pad" icon={<Phone size={16} color="gray" />} value={phone} onChangeText={setPhone} />
            </View>
            <View style={{ marginBottom: 16 }}>
              <Field label="Email address" placeholder="tenant@email.com" keyboardType="email-address" icon={<Mail size={16} color="gray" />} value={email} onChangeText={setEmail} />
            </View>
            <Field label="Identification number" placeholder="GHA-XXXXXXX-X" icon={<IdCard size={16} color="gray" />} value={idNo} onChangeText={setIdNo} />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 16 }}>Lease details</Text>

            <View style={{ marginBottom: 16 }}>
              <SelectField
                label="Property"
                icon={<Building2 size={16} color="gray" />}
                value={propertyId}
                onChange={setPropertyId}
                options={properties}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <SelectField
                label="Vacant room"
                icon={<DoorOpen size={16} color="gray" />}
                value={roomId}
                onChange={setRoomId}
                options={rooms}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <DatePicker
                  label="Lease start date"
                  value={startDate}
                  onChange={setStartDate}
                />
              </View>
              <View style={{ flex: 1 }}>
                <DatePicker
                  label="Lease end date"
                  value={endDate}
                  onChange={setEndDate}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field label="Monthly rent (VNĐ)" keyboardType="decimal-pad" icon={<Wallet size={16} color="gray" />} value={formatMoney(rent)} onChangeText={setRent} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Deposit (VNĐ)" keyboardType="decimal-pad" icon={<Wallet size={16} color="gray" />} value={formatMoney(deposit)} onChangeText={setDeposit} />
              </View>
            </View>
          </View>

          {err && <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 4, marginBottom: 8 }}>{err}</Text>}

          <View style={{ marginTop: 16 }}>
            <PrimaryButton onPress={submit} disabled={loading}>
              {loading ? "Creating..." : "Create lease & provision account"}
            </PrimaryButton>
            <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 18, marginTop: 12, paddingHorizontal: 16 }}>
              One account per phone. Duplicate email, phone, or lease event is rejected.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileFrame>
  );
}

function SelectField({
  label, icon, value, onChange, options,
}: { label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void; options: Option[] }) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find(o => o.id === value)?.label || "Select...";

  if (Platform.OS === 'web') {
    return (
      <View>
        <Text style={{ marginBottom: 6, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' }}>{label}</Text>
        <View style={{ position: 'relative', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', left: 14, zIndex: 10, pointerEvents: 'none' }}>
            {icon}
          </View>
          {React.createElement('select', {
            value: value,
            onChange: (e: any) => onChange(e.target.value),
            style: { width: '100%', height: 48, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 44, paddingRight: 16, fontSize: 14, fontWeight: '500', outline: 'none', color: '#0f172a', appearance: 'none' }
          },
            options.length === 0 ? [React.createElement('option', { key: 'empty', value: '' }, 'None available')] :
            options.map(o => React.createElement('option', { key: o.id, value: o.id }, o.label))
          )}
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ marginBottom: 6, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' }}>{label}</Text>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{ width: '100%', height: 48, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, paddingLeft: 44, justifyContent: 'center', position: 'relative' }}
      >
        <View style={{ position: 'absolute', left: 14, top: 15, zIndex: 10 }}>
          {icon}
        </View>
        <Text style={{ fontSize: 14, fontWeight: '500' }} numberOfLines={1}>{selectedLabel}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setOpen(false)} activeOpacity={1} />
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 16 }}>Select {label}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.length === 0 && (
                <Text style={{ color: '#94a3b8', paddingVertical: 16 }}>No options available</Text>
              )}
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => { onChange(opt.id); setOpen(false); }}
                  style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 16, fontWeight: value === opt.id ? '700' : '400', color: value === opt.id ? '#2563eb' : '#0f172a' }}>{opt.label}</Text>
                  {value === opt.id && <Check size={18} color="#2563eb" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setOpen(false)} style={{ marginTop: 24, height: 48, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </View>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 2 }} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}
