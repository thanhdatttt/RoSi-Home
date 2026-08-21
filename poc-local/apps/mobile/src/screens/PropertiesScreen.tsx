import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  createProperty,
  errorMessage,
  getProperty,
  listProperties,
  type AuthenticatedUser,
  type Property,
  updateUtilityRates,
} from "../api/client";
import { AppButton, Field, Notice, Panel } from "../components/ui";
import { colors, radius } from "../theme";
import { BillingPanel } from "./BillingPanel";

interface PropertiesScreenProps {
  onLogout: () => void;
  token: string;
  user: AuthenticatedUser;
}

const currency = new Intl.NumberFormat("vi-VN");

export function PropertiesScreen({
  onLogout,
  token,
  user,
}: PropertiesScreenProps) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const compact = width < 620;
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [electricityRate, setElectricityRate] = useState("");
  const [waterRate, setWaterRate] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const result = await listProperties(token);
      setProperties(result);
      setSelected((current) =>
        current
          ? (result.find((property) => property.id === current.id) ?? null)
          : null,
      );
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setElectricityRate(
      selected?.utilityRates?.electricityRate.toString() ?? "",
    );
    setWaterRate(selected?.utilityRates?.waterRate.toString() ?? "");
  }, [selected]);

  async function selectProperty(id: string) {
    setLoadingDetail(true);
    setError(null);
    setSuccess(null);
    try {
      setSelected(await getProperty(token, id));
    } catch (selectionError) {
      setError(errorMessage(selectionError));
    } finally {
      setLoadingDetail(false);
    }
  }

  async function submitProperty() {
    if (name.trim().length < 2 || address.trim().length < 5) {
      setError("Tên cần ít nhất 2 ký tự và địa chỉ cần ít nhất 5 ký tự.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await createProperty(token, {
        name: name.trim(),
        address: address.trim(),
      });
      setProperties((current) => [created, ...current]);
      setSelected(created);
      setName("");
      setAddress("");
      setSuccess("Đã tạo property bằng API local và lưu vào PGlite.");
    } catch (creationError) {
      setError(errorMessage(creationError));
    } finally {
      setSaving(false);
    }
  }

  async function saveRates() {
    if (!selected) return;
    const electricity = Number(electricityRate);
    const water = Number(waterRate);
    if (
      electricityRate.trim() === "" ||
      waterRate.trim() === "" ||
      !Number.isInteger(electricity) ||
      !Number.isInteger(water) ||
      electricity < 0 ||
      water < 0
    ) {
      setError("Đơn giá phải là số nguyên không âm.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateUtilityRates(token, selected.id, {
        electricityRate: electricity,
        waterRate: water,
      });
      setSelected(updated);
      setProperties((current) =>
        current.map((property) => (property.id === updated.id ? updated : property)),
      );
      setSuccess("Utility rates đã được xác thực ownership và lưu thành công.");
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.page}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View>
          <Text style={styles.brand}>RoSi Home</Text>
          <Text style={styles.headerMeta}>LOCAL POC · LANDLORD WORKSPACE</Text>
        </View>
        <View style={styles.userArea}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.displayName.slice(-1)}</Text>
          </View>
          <View style={[styles.userCopy, compact && styles.userCopyCompact]}>
            <Text style={styles.userName}>{user.displayName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          <AppButton label="Đăng xuất" onPress={onLogout} variant="danger" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          compact && styles.scrollContentCompact,
        ]}
      >
        <View style={[styles.heroRow, compact && styles.heroRowCompact]}>
          <View>
            <Text style={styles.eyebrow}>PROPERTY & UTILITY RATE</Text>
            <Text style={styles.title}>Quản lý dữ liệu local</Text>
            <Text style={styles.subtitle}>
              Mọi thao tác trên màn hình đều đi qua JWT và owner-scoped API.
            </Text>
          </View>
          <AppButton
            label="Tải lại từ DB"
            loading={loadingList}
            onPress={load}
            variant="secondary"
          />
        </View>

        {error ? <Notice message={error} tone="error" /> : null}
        {success ? <Notice message={success} tone="success" /> : null}

        <View style={[styles.columns, wide && styles.columnsWide]}>
          <View style={styles.leftColumn}>
            <Panel style={styles.sectionPanel}>
              <View style={styles.sectionHeading}>
                <View>
                  <Text style={styles.sectionKicker}>YOUR PORTFOLIO</Text>
                  <Text style={styles.sectionTitle}>Properties</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{properties.length}</Text>
                </View>
              </View>

              {loadingList && properties.length === 0 ? (
                <View style={styles.centerState}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={styles.muted}>Đang đọc dữ liệu từ API...</Text>
                </View>
              ) : properties.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>⌂</Text>
                  <Text style={styles.emptyTitle}>Chưa có property</Text>
                  <Text style={styles.muted}>
                    Tạo property đầu tiên để chứng minh luồng ghi xuống PGlite.
                  </Text>
                </View>
              ) : (
                <View style={styles.propertyList}>
                  {properties.map((property) => {
                    const active = selected?.id === property.id;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={property.id}
                        onPress={() => selectProperty(property.id)}
                        style={({ pressed }) => [
                          styles.propertyCard,
                          active && styles.propertyCardActive,
                          pressed && styles.propertyCardPressed,
                        ]}
                      >
                        <View style={styles.propertyMarker} />
                        <View style={styles.propertyCopy}>
                          <Text style={styles.propertyName}>{property.name}</Text>
                          <Text numberOfLines={2} style={styles.propertyAddress}>
                            {property.address}
                          </Text>
                          <Text style={styles.rateSummary}>
                            {property.utilityRates
                              ? `Điện ${currency.format(property.utilityRates.electricityRate)} · Nước ${currency.format(property.utilityRates.waterRate)}`
                              : "Chưa cấu hình utility rates"}
                          </Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </Panel>

            <Panel style={styles.sectionPanel}>
              <Text style={styles.sectionKicker}>CREATE</Text>
              <Text style={styles.sectionTitle}>Property mới</Text>
              <Field
                label="Tên property"
                onChangeText={setName}
                placeholder="Ví dụ: Sunrise House"
                value={name}
              />
              <Field
                label="Địa chỉ"
                onChangeText={setAddress}
                placeholder="12 Local Demo Street"
                value={address}
              />
              <AppButton
                label="Tạo và lưu local"
                loading={saving}
                onPress={submitProperty}
              />
            </Panel>
          </View>

          <Panel style={styles.detailPanel}>
            {loadingDetail ? (
              <View style={styles.centerState}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.muted}>Đang lấy property detail...</Text>
              </View>
            ) : selected ? (
              <View style={styles.detailContent}>
                <View style={styles.detailHeader}>
                  <View style={styles.detailIcon}>
                    <Text style={styles.detailIconText}>⌂</Text>
                  </View>
                  <View style={styles.detailHeadingCopy}>
                    <Text style={styles.detailTitle}>{selected.name}</Text>
                    <Text style={styles.detailAddress}>{selected.address}</Text>
                  </View>
                </View>

                <View style={styles.proofStrip}>
                  <Text style={styles.proofTitle}>OWNERSHIP VERIFIED</Text>
                  <Text style={styles.proofText}>
                    Detail chỉ được trả về khi JWT subject trùng landlord_id.
                  </Text>
                </View>

                <View>
                  <Text style={styles.sectionKicker}>UTILITY CONFIGURATION</Text>
                  <Text style={styles.sectionTitle}>Đơn giá hiện hành</Text>
                </View>
                <Field
                  keyboardType="numeric"
                  label="Điện (VND/kWh)"
                  onChangeText={setElectricityRate}
                  placeholder="3500"
                  value={electricityRate}
                />
                <Field
                  keyboardType="numeric"
                  label="Nước (VND/m³)"
                  onChangeText={setWaterRate}
                  placeholder="18000"
                  value={waterRate}
                />
                <AppButton
                  label="Xác thực và lưu rates"
                  loading={saving}
                  onPress={saveRates}
                />

                <View style={styles.evidenceBox}>
                  <Text style={styles.evidenceLabel}>PERSISTENCE EVIDENCE</Text>
                  <Text style={styles.evidenceValue}>
                    {selected.utilityRates
                      ? `Đã lưu · ${new Date(selected.utilityRates.updatedAt).toLocaleString("vi-VN")}`
                      : "Chưa có rate record"}
                  </Text>
                  <Text style={styles.evidenceHint}>
                    Bấm “Tải lại từ DB” để đọc lại giá trị đã lưu.
                  </Text>
                </View>
                <BillingPanel property={selected} token={token} />
              </View>
            ) : (
              <View style={styles.detailEmpty}>
                <View style={styles.detailEmptyIcon}>
                  <Text style={styles.detailEmptyIconText}>→</Text>
                </View>
                <Text style={styles.emptyTitle}>Chọn một property</Text>
                <Text style={styles.muted}>
                  Detail và utility rates sẽ được tải bằng owner-scoped endpoint.
                </Text>
              </View>
            )}
          </Panel>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  headerCompact: { alignItems: "stretch", flexDirection: "column", gap: 12 },
  brand: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  headerMeta: {
    color: colors.inkMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },
  userArea: { alignItems: "center", flexDirection: "row", gap: 12 },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.warmSoft,
    borderRadius: 99,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  avatarText: { color: "#7A5313", fontSize: 16, fontWeight: "800" },
  userCopy: { marginRight: 4 },
  userCopyCompact: { flex: 1 },
  userName: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  userEmail: { color: colors.inkMuted, fontSize: 11, marginTop: 2 },
  scrollContent: {
    alignSelf: "center",
    gap: 18,
    maxWidth: 1220,
    padding: 28,
    width: "100%",
  },
  scrollContentCompact: { padding: 16 },
  heroRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroRowCompact: { alignItems: "stretch", flexDirection: "column", gap: 16 },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: { color: colors.ink, fontSize: 34, fontWeight: "800", marginTop: 6 },
  subtitle: { color: colors.inkMuted, fontSize: 15, marginTop: 7 },
  columns: { gap: 18 },
  columnsWide: { alignItems: "flex-start", flexDirection: "row" },
  leftColumn: { flex: 0.9, gap: 18, minWidth: 0 },
  sectionPanel: { gap: 16 },
  detailPanel: { flex: 1.1, minHeight: 510 },
  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionKicker: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  sectionTitle: { color: colors.ink, fontSize: 22, fontWeight: "800", marginTop: 4 },
  countBadge: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 99,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  countText: { color: colors.primaryDark, fontSize: 14, fontWeight: "800" },
  centerState: { alignItems: "center", gap: 12, justifyContent: "center", minHeight: 160 },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.medium,
    gap: 7,
    padding: 26,
  },
  emptyIcon: { color: colors.primary, fontSize: 30 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  muted: { color: colors.inkMuted, fontSize: 14, lineHeight: 21, textAlign: "center" },
  propertyList: { gap: 10 },
  propertyCard: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  propertyCardActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  propertyCardPressed: { opacity: 0.75 },
  propertyMarker: {
    backgroundColor: colors.warm,
    borderRadius: 99,
    height: 10,
    width: 10,
  },
  propertyCopy: { flex: 1 },
  propertyName: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  propertyAddress: { color: colors.inkMuted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  rateSummary: { color: colors.primary, fontSize: 11, fontWeight: "700", marginTop: 7 },
  chevron: { color: colors.inkMuted, fontSize: 26 },
  detailContent: { gap: 20 },
  detailHeader: { alignItems: "center", flexDirection: "row", gap: 14 },
  detailIcon: {
    alignItems: "center",
    backgroundColor: colors.warmSoft,
    borderRadius: radius.medium,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  detailIconText: { color: "#7A5313", fontSize: 27 },
  detailHeadingCopy: { flex: 1 },
  detailTitle: { color: colors.ink, fontSize: 24, fontWeight: "800" },
  detailAddress: { color: colors.inkMuted, fontSize: 14, lineHeight: 20, marginTop: 4 },
  proofStrip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.medium,
    gap: 4,
    padding: 14,
  },
  proofTitle: { color: colors.primaryDark, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  proofText: { color: colors.primaryDark, fontSize: 13, lineHeight: 19 },
  evidenceBox: {
    backgroundColor: colors.background,
    borderRadius: radius.medium,
    gap: 5,
    padding: 16,
  },
  evidenceLabel: { color: colors.inkMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  evidenceValue: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  evidenceHint: { color: colors.inkMuted, fontSize: 12 },
  detailEmpty: { alignItems: "center", flex: 1, gap: 9, justifyContent: "center" },
  detailEmptyIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 99,
    height: 54,
    justifyContent: "center",
    marginBottom: 4,
    width: 54,
  },
  detailEmptyIconText: { color: colors.primary, fontSize: 24, fontWeight: "700" },
});
