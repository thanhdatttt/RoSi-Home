import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../../../components/MobileFrame";
import { PrimaryButton } from "../../../../../../components/ui/PrimaryButton";
import { MoneyInput } from "../../../../../../components/ui/MoneyInput";
import { ArrowLeft, Check } from "lucide-react-native";
import { useAuth } from "../../../../../../contexts/auth-context";
import {
  bulkCreateRooms,
  createRoom,
  listRooms,
} from "../../../../../../features/portfolio/api";
import { useI18n } from "@/i18n/I18nProvider";

const MAX_ROOMS = 50;

export default function NewRooms() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { language, translateLegacy, t } = useI18n();

  const [prefix, setPrefix] = useState("P");
  const [start, setStart] = useState("101");
  const [count, setCount] = useState("6");
  const [rent, setRent] = useState("1200000");
  const [existingRooms, setExistingRooms] = useState<{ prefix: string; num: number }[]>([]);

  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-detect prefix and next start number from existing rooms
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const result = await listRooms(token, id, 1, 100);
        const rooms = result.data;
        if (!rooms.length) return;

        // Extract prefix + number from room names (e.g. "P101" → prefix "P", number 101)
        const parsed = rooms
          .map((r) => {
            const match = (r.name || "").match(/^([A-Za-z]*)(\d+)$/);
            if (!match) return null;
            return { prefix: match[1], num: parseInt(match[2], 10) };
          })
          .filter(Boolean) as { prefix: string; num: number }[];

        if (!parsed.length) return;
        setExistingRooms(parsed);

        // Use the most common prefix
        const prefixCounts: Record<string, number> = {};
        parsed.forEach(p => { prefixCounts[p.prefix] = (prefixCounts[p.prefix] || 0) + 1; });
        const mostCommonPrefix = Object.entries(prefixCounts).sort((a, b) => b[1] - a[1])[0][0];

        // Find the lowest available missing number
        const prefixNums = parsed.filter(p => p.prefix === mostCommonPrefix).map(p => p.num).sort((a, b) => a - b);
        let firstMissing = prefixNums.length > 0 ? prefixNums[0] : 101;
        while (prefixNums.includes(firstMissing)) {
          firstMissing++;
        }

        setPrefix(mostCommonPrefix || "P");
        setStart(String(firstMissing));
      } catch {
        // If fetching fails, keep defaults
      }
    })();
  }, [id, token]);

  const startNum = Number(start);
  const countNum = Number(count);
  const rentRaw = rent.replace(/,/g, "");
  const rentNum = Number(rentRaw);

  const errors = {
    prefix: !prefix.trim() ? translateLegacy("Prefix is required.") : "",
    start: !start || Number.isNaN(startNum) || startNum < 0 ? translateLegacy("Enter a valid start number.") : "",
    count:
      !count || Number.isNaN(countNum) || countNum < 1
        ? translateLegacy("Add at least 1 room.")
        : countNum > MAX_ROOMS
          ? (language === "vi" ? `Tối đa ${MAX_ROOMS} phòng trong một lần.` : `Maximum ${MAX_ROOMS} rooms at once.`)
          : "",
    rent: rentRaw === "" || Number.isNaN(rentNum) || rentNum < 0 ? translateLegacy("Rent must be zero or more.") : "",
  };
  const valid = !Object.values(errors).some(Boolean);

  const names = useMemo(() => {
    if (Number.isNaN(startNum) || Number.isNaN(countNum)) return [];
    const n = Math.min(Math.max(countNum || 0, 0), MAX_ROOMS);

    const taken = new Set(
      existingRooms
        .filter(r => r.prefix === prefix.trim())
        .map(r => r.num)
    );

    const generated: string[] = [];
    let currentNum = startNum;

    while (generated.length < n) {
      if (!taken.has(currentNum)) {
        generated.push(`${prefix.trim()}${currentNum}`);
      }
      currentNum++;
    }

    return generated;
  }, [prefix, startNum, countNum, existingRooms]);

  const handleSave = async () => {
    setTouched(true);
    if (!valid) return;

    setSubmitError(null);
    setSaving(true);

    try {
      const roomInputs = names.map(name => ({ name, baseRent: rentNum }));
      if (roomInputs.length === 1) {
        await createRoom(token, id, roomInputs[0]);
      } else {
        await bulkCreateRooms(token, id, roomInputs);
      }
      setDone(true);
    } catch (err: any) {
      setSubmitError(err.message || translateLegacy("Failed to create rooms"));
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <MobileFrame>
        <View style={{ flex: 1, backgroundColor: '#f5f8ff', paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          <View style={{ height: 56, width: 56, borderRadius: 16, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={24} color="white" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', marginTop: 16 }}>
            {language === "vi" ? `Đã tạo ${names.length} phòng` : `${names.length} room${names.length > 1 ? "s" : ""} created`}
          </Text>
          <Text style={{ fontSize: 14, color: '#94a3b8', marginTop: 8, lineHeight: 20 }}>
            {language === "vi" ? "Mỗi phòng mới bắt đầu ở trạng thái " : "Every new room starts as "}<Text style={{ fontWeight: '700', color: '#0f172a' }}>{translateLegacy("Vacant")}</Text>{language === "vi" ? ` với giá ${rentNum.toLocaleString("vi-VN")} VNĐ / tháng. Bạn vẫn có thể chỉnh sửa từng phòng.` : ` at ${rentNum.toLocaleString()} VNĐ / month. You can still edit each room individually.`}
          </Text>
          <View style={{ marginTop: 24, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16 }}>
            <Text style={{ fontSize: 14, lineHeight: 20 }}>{names.join(" · ")}</Text>
          </View>
          <View style={{ marginTop: 'auto', paddingTop: 24 }}>
            <PrimaryButton onPress={() => router.back()}>Back to property</PrimaryButton>
          </View>
        </View>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: '#f5f8ff' }}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Math.max(insets.top + 16, 56) }}>
          <TouchableOpacity onPress={() => router.push(`/landlord/properties/${id}`)} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(37,99,235,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={16} color="#2563eb" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Rooms</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>Create many rooms</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 8 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          {/* Info banner */}
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 14, marginBottom: 20 }}>
            <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)', lineHeight: 18 }}>
              Quickly create rooms from one template. You can still edit each room afterwards. Either all rooms save, or none do.
            </Text>
          </View>

          {/* Form fields */}
          <TplField
            label="Prefix"
            value={prefix}
            onChangeText={setPrefix}
            hint="e.g. P101, P102"
            error={touched ? errors.prefix : ""}
          />
          <View style={{ marginTop: 16 }}>
            <MoneyInput
              label={translateLegacy('Shared base rent (VNĐ)')}
              placeholder="0"
              value={rent}
              onChangeText={setRent}
            />
          </View>
          <View style={{ marginTop: 16 }}>
            <TplField
              label="Start number"
              keyboardType="number-pad"
              value={start}
              onChangeText={setStart}
              error={touched ? errors.start : ""}
            />
          </View>
          <View style={{ marginTop: 16 }}>
            <TplField
              label="Number of rooms"
              keyboardType="number-pad"
              value={count}
              onChangeText={setCount}
              hint={`Up to ${MAX_ROOMS} rooms`}
              error={touched ? errors.count : ""}
            />
          </View>


          {/* Preview */}
          <View style={{ marginTop: 24, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '700' }}>Preview</Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: '#94a3b8', lineHeight: 20 }}>
              {names.length ? names.join(" · ") : "—"}
            </Text>
          </View>

          {submitError && (
            <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{submitError}</Text>
          )}

          <View style={{ marginTop: 24 }}>
            <PrimaryButton onPress={handleSave} disabled={saving}>
              {saving ? translateLegacy("Creating...") : (language === "vi" ? `Tạo ${names.length || 0} phòng` : `Create ${names.length || 0} room${names.length === 1 ? "" : "s"}`)}
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileFrame>
  );
}

function TplField({
  label, value, onChangeText, hint, error, keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  hint?: string;
  error?: string;
  keyboardType?: any;
}) {
  return (
    <View>
      <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        style={{ width: '100%', height: 48, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: error ? '#ef4444' : '#e2e8f0', paddingHorizontal: 12, fontSize: 14, fontWeight: '500' }}
      />
      {hint && !error && <Text style={{ marginTop: 4, fontSize: 11, color: '#94a3b8' }}>{hint}</Text>}
      {error ? <Text style={{ marginTop: 4, fontSize: 11, color: '#ef4444' }}>{error}</Text> : null}
    </View>
  );
}
