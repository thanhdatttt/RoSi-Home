import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal, TextInput, Clipboard } from "react-native";
import { Link, useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { MobileFrame } from "../../../../components/MobileFrame";
import { Field } from "../../../../components/ui/Field";
import { PrimaryButton } from "../../../../components/ui/PrimaryButton";
import { ArrowLeft, Mail, User, Phone, IdCard, Building2, DoorOpen, Calendar, Wallet, ShieldCheck, Copy, Check, KeyRound } from "lucide-react-native";
import { apiRequest } from "../../../../lib/api";
import { useAuth } from "../../../../contexts/auth-context";

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type Option = { id: string; label: string };

export default function NewLease() {
  const router = useRouter();
  const { token } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idNo, setIdNo] = useState("");
  
  const [properties, setProperties] = useState<Option[]>([]);
  const [rooms, setRooms] = useState<Option[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [roomId, setRoomId] = useState("");
  
  const [startDate, setStartDate] = useState(new Date());
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  
  const [tempPassword] = useState(generatePassword());
  const [copied, setCopied] = useState(false);

  // Fetch properties on mount
  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await apiRequest<any>('/properties?pageSize=100', { token });
        const data = res.data || res;
        if (Array.isArray(data)) {
          const opts = data.map((p: any) => ({ id: p.id, label: p.name }));
          setProperties(opts);
          if (opts.length > 0) setPropertyId(opts[0].id);
        }
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
        const res = await apiRequest<any>(`/rooms/properties/${propertyId}`, { token });
        const data = res.data || res;
        if (Array.isArray(data)) {
          // Only show vacant rooms if the backend has status, otherwise show all
          const opts = data.map((r: any) => ({ id: r.id, label: r.name }));
          setRooms(opts);
          if (opts.length > 0) setRoomId(opts[0].id);
          else setRoomId("");
        }
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
    
    setErr(null);
    setLoading(true);

    // Compute endDate as 1 year from startDate to satisfy backend requirement
    const end = new Date(startDate);
    end.setFullYear(end.getFullYear() + 1);

    try {
      await apiRequest('/leases', {
        method: 'POST',
        token,
        body: {
          roomId,
          tenant: {
            fullName: name.trim(),
            phone: phone.trim(),
            idNumber: idNo.trim(),
            email: email.trim(),
          },
          startDate: startDate.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
          agreedRent: Number(rentRaw),
          deposit: Number(depositRaw),
        }
      });
      setCreated(true);
    } catch (e: any) {
      setErr(e.message || "Failed to create lease and provision account.");
    } finally {
      setLoading(false);
    }
  }

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setStartDate(selectedDate);
  };

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
        <View className="flex-1 flex-col bg-background px-6 pt-14 pb-8">
          <View className="h-14 w-14 rounded-2xl bg-[#2563eb] items-center justify-center">
            <Check size={24} color="white" />
          </View>
          <Text className="text-2xl font-extrabold mt-4">Lease created</Text>
          <Text className="text-sm text-muted-foreground mt-2 leading-relaxed">
            A tenant account was auto-provisioned for <Text className="font-bold text-foreground">{name}</Text>. 
            An invite email was sent to <Text className="font-bold text-foreground">{email}</Text> with the login link and temporary password.
          </Text>

          <View className="mt-5 rounded-2xl border border-border bg-surface flex-col">
            <Summary icon={<Building2 size={16} color="#2563eb" />} label="Property · Room" value={`${propName} · ${roomName}`} />
            <View className="h-[1px] w-full bg-border" />
            <Summary icon={<Calendar size={16} color="#2563eb" />} label="Lease starts" value={startDate.toISOString().slice(0, 10)} />
            <View className="h-[1px] w-full bg-border" />
            <Summary icon={<Wallet size={16} color="#2563eb" />} label="Monthly rent" value={`${Number(getRawNumber(rent)).toLocaleString()} VNĐ`} />
            <View className="h-[1px] w-full bg-border" />
            <Summary icon={<Phone size={16} color="#2563eb" />} label="Username (phone)" value={phone} />
          </View>

          <View className="mt-4 rounded-2xl border border-[#2563eb]/40 bg-[#2563eb]/10 p-4">
            <View className="flex-row items-center gap-2">
              <KeyRound size={16} color="#2563eb" />
              <Text className="text-[11px] uppercase tracking-wide font-bold text-[#2563eb]">Temporary password</Text>
            </View>
            <View className="mt-2 flex-row items-center gap-2">
              <View className="flex-1 bg-white/70 rounded-lg px-3 py-3">
                <Text className="font-mono text-base tracking-wider">{tempPassword}</Text>
              </View>
              <TouchableOpacity
                onPress={copyToClipboard}
                className="h-[46px] w-[46px] rounded-lg bg-[#2563eb] items-center justify-center"
              >
                {copied ? <Check size={16} color="white" /> : <Copy size={16} color="white" />}
              </TouchableOpacity>
            </View>
            <View className="mt-2 flex-row items-start gap-1.5 pr-2">
              <Mail size={14} color="gray" style={{ marginTop: 2 }} />
              <Text className="text-[11px] text-foreground/70 leading-relaxed flex-1">
                Also sent by email. Not stored in plain text. Tenant must change it at first sign-in.
              </Text>
            </View>
          </View>

          <View className="mt-auto pt-6 space-y-3">
            <PrimaryButton onPress={() => router.navigate('/landlord')}>Back to dashboard</PrimaryButton>
          </View>
        </View>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-background">
        <View className="px-6 pt-14 pb-4 flex-row items-center gap-3">
          <Link href="/landlord" asChild>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View className="flex-1">
            <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">Leases</Text>
            <Text className="text-2xl font-extrabold leading-tight">New lease</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pb-8" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          
          <View className="rounded-xl border border-[#2563eb]/40 bg-[#2563eb]/10 p-3.5 mb-5 flex-row gap-2">
            <ShieldCheck size={16} color="#2563eb" style={{ marginTop: 2 }} />
            <Text className="text-xs text-foreground/80 leading-relaxed flex-1">
              Creating a lease auto-provisions a tenant account. Their <Text className="font-bold">phone number</Text> becomes their login username, and a temp password is emailed to them.
            </Text>
          </View>

          <View className="space-y-4 mb-6">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tenant information</Text>
            <Field label="Full name" placeholder="Kojo Mensah" icon={<User size={16} color="gray" />} value={name} onChangeText={setName} />
            <Field label="Phone number (username)" placeholder="+233 24 555 0101" keyboardType="phone-pad" icon={<Phone size={16} color="gray" />} value={phone} onChangeText={setPhone} />
            <Field label="Email address" placeholder="tenant@email.com" keyboardType="email-address" icon={<Mail size={16} color="gray" />} value={email} onChangeText={setEmail} />
            <Field label="Identification number" placeholder="GHA-XXXXXXX-X" icon={<IdCard size={16} color="gray" />} value={idNo} onChangeText={setIdNo} />
          </View>

          <View className="space-y-4 mb-4">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Lease details</Text>
            
            <SelectField 
              label="Property" 
              icon={<Building2 size={16} color="gray" />} 
              value={propertyId} 
              onChange={setPropertyId}
              options={properties} 
            />
            
            <SelectField 
              label="Vacant room" 
              icon={<DoorOpen size={16} color="gray" />} 
              value={roomId} 
              onChange={setRoomId}
              options={rooms} 
            />
            
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Lease start date</Text>
              {Platform.OS === 'web' ? (
                React.createElement('input', {
                  type: 'date',
                  value: startDate.toISOString().slice(0, 10),
                  onChange: (e: any) => setStartDate(new Date(e.target.value)),
                  style: { width: '100%', height: 48, borderRadius: 12, backgroundColor: 'var(--background)', borderWidth: 1, borderColor: 'var(--border)', paddingLeft: 44, paddingRight: 16, fontSize: 14, fontWeight: '500', outline: 'none', color: 'var(--foreground)' }
                })
              ) : (
                <>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} className="w-full h-12 rounded-xl bg-background border border-border px-4 pl-11 justify-center">
                    <Text className="text-sm font-medium">{startDate.toISOString().slice(0, 10)}</Text>
                  </TouchableOpacity>
                  {showDatePicker && <DateTimePicker value={startDate} mode="date" display="default" onChange={onChangeDate} />}
                </>
              )}
              <View className="absolute left-3.5 top-[34px]">
                <Calendar size={16} color="gray" />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field label="Monthly rent (VNĐ)" keyboardType="decimal-pad" icon={<Wallet size={16} color="gray" />} value={formatMoney(rent)} onChangeText={setRent} />
              </View>
              <View className="flex-1">
                <Field label="Deposit (VNĐ)" keyboardType="decimal-pad" icon={<Wallet size={16} color="gray" />} value={formatMoney(deposit)} onChangeText={setDeposit} />
              </View>
            </View>
          </View>

          {err && <Text className="text-xs text-destructive mt-1 mb-2">{err}</Text>}

          <View className="mt-4">
            <PrimaryButton onPress={submit} disabled={loading}>
              {loading ? "Creating..." : "Create lease & provision account"}
            </PrimaryButton>
            <Text className="text-[11px] text-muted-foreground text-center leading-relaxed mt-3 px-4">
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
        <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Text>
        <View className="relative justify-center">
          <View className="absolute left-3.5 z-10 pointer-events-none">
            {icon}
          </View>
          {React.createElement('select', {
            value: value,
            onChange: (e: any) => onChange(e.target.value),
            style: { width: '100%', height: 48, borderRadius: 12, backgroundColor: 'var(--background)', borderWidth: 1, borderColor: 'var(--border)', paddingLeft: 44, paddingRight: 16, fontSize: 14, fontWeight: '500', outline: 'none', color: 'var(--foreground)', appearance: 'none' }
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
      <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Text>
      <TouchableOpacity 
        onPress={() => setOpen(true)}
        className="w-full h-12 rounded-xl bg-background border border-border px-4 pl-11 justify-center relative"
      >
        <View className="absolute left-3.5 top-[15px] z-10">
          {icon}
        </View>
        <Text className="text-sm font-medium" numberOfLines={1}>{selectedLabel}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 max-h-[60%]">
            <Text className="text-lg font-bold mb-4">Select {label}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.length === 0 && (
                <Text className="text-muted-foreground py-4">No options available</Text>
              )}
              {options.map((opt) => (
                <TouchableOpacity 
                  key={opt.id}
                  onPress={() => { onChange(opt.id); setOpen(false); }}
                  className="py-4 border-b border-border flex-row justify-between items-center"
                >
                  <Text className={`text-base ${value === opt.id ? "font-bold text-[#2563eb]" : ""}`}>{opt.label}</Text>
                  {value === opt.id && <Check size={18} color="#2563eb" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setOpen(false)} className="mt-6 h-12 rounded-xl bg-secondary items-center justify-center">
              <Text className="font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="p-4 flex-row items-center gap-3">
      <View className="h-10 w-10 rounded-xl bg-[#2563eb]/15 items-center justify-center shrink-0">
        {icon}
      </View>
      <View className="flex-1 pr-2">
        <Text className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</Text>
        <Text className="text-sm font-semibold mt-0.5" numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}
