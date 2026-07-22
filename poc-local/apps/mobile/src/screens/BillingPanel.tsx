import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  errorMessage,
  generateInvoice,
  getBankAccount,
  getInvoiceVietQr,
  listInvoices,
  type Invoice,
  type Property,
  saveBankAccount,
  sendInvoice,
  type VietQrResult,
} from "../api/client";
import { AppButton, Field, Notice } from "../components/ui";
import { colors, radius } from "../theme";

interface BillingPanelProps {
  property: Property;
  token: string;
}

const currency = new Intl.NumberFormat("vi-VN");

export function BillingPanel({ property, token }: BillingPanelProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [vietQr, setVietQr] = useState<VietQrResult | null>(null);
  const [bankBin, setBankBin] = useState("970436");
  const [accountNumber, setAccountNumber] = useState("DEMO12345");
  const [accountName, setAccountName] = useState("SYNTHETIC DEMO");
  const [roomReference, setRoomReference] = useState("P.101");
  const [tenantName, setTenantName] = useState("Synthetic Tenant");
  const [billingPeriod, setBillingPeriod] = useState("2026-07");
  const [issueDate, setIssueDate] = useState("2026-07-01");
  const [dueDate, setDueDate] = useState("2026-07-10");
  const [baseRent, setBaseRent] = useState("4000000");
  const [previousElectricity, setPreviousElectricity] = useState("100.125");
  const [currentElectricity, setCurrentElectricity] = useState("112.625");
  const [previousWater, setPreviousWater] = useState("20");
  const [currentWater, setCurrentWater] = useState("22.333");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [savedInvoices, bankAccount] = await Promise.all([
        listInvoices(token, property.id),
        getBankAccount(token),
      ]);
      setInvoices(savedInvoices);
      setSelected((current) =>
        current
          ? (savedInvoices.find((invoice) => invoice.id === current.id) ?? null)
          : (savedInvoices[0] ?? null),
      );
      if (bankAccount) {
        setBankBin(bankAccount.bankBin);
        setAccountNumber(bankAccount.accountNumber);
        setAccountName(bankAccount.accountName);
      }
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [property.id, token]);

  useEffect(() => {
    setSelected(null);
    setVietQr(null);
    void load();
  }, [load]);

  function replaceInvoice(invoice: Invoice) {
    setInvoices((current) => {
      const exists = current.some((item) => item.id === invoice.id);
      return exists
        ? current.map((item) => (item.id === invoice.id ? invoice : item))
        : [invoice, ...current];
    });
    setSelected(invoice);
  }

  async function configureBank() {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await saveBankAccount(token, { bankBin, accountNumber, accountName });
      setSuccess("Đã lưu cấu hình ngân hàng owner-scoped trên PGlite.");
    } catch (bankError) {
      setError(errorMessage(bankError));
    } finally {
      setBusy(false);
    }
  }

  async function createInvoice() {
    const parsedRent = Number(baseRent);
    if (!Number.isSafeInteger(parsedRent) || parsedRent < 0) {
      setError("Base rent phải là số nguyên VND không âm.");
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    setVietQr(null);
    try {
      const result = await generateInvoice(token, {
        baseRent: parsedRent,
        billingPeriod,
        currentElectricity,
        currentWater,
        dueDate,
        issueDate,
        previousElectricity,
        previousWater,
        propertyId: property.id,
        roomReference,
        tenantName,
      });
      replaceInvoice(result.invoice);
      setSuccess(
        result.replayed
          ? "Idempotency replay: API trả lại invoice cũ, không tạo bản sao."
          : "Đã tính và snapshot invoice Draft bằng integer arithmetic.",
      );
    } catch (invoiceError) {
      setError(errorMessage(invoiceError));
    } finally {
      setBusy(false);
    }
  }

  async function sendSelected() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const sent = await sendInvoice(token, selected.id);
      replaceInvoice(sent);
      setSuccess("Invoice đã chuyển Draft → Sent đúng một lần.");
    } catch (sendError) {
      setError(errorMessage(sendError));
    } finally {
      setBusy(false);
    }
  }

  async function generateQr() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await getInvoiceVietQr(token, selected.id);
      setVietQr(result);
      setSuccess("Payload và CRC đã được validate local; invoice vẫn giữ trạng thái Sent.");
    } catch (qrError) {
      setError(errorMessage(qrError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.divider} />
      <View>
        <Text style={styles.kicker}>HARDEST PROBLEM POC</Text>
        <Text style={styles.title}>Billing snapshot & VietQR</Text>
        <Text style={styles.description}>
          Tính consumption thập phân, làm tròn VND, chống duplicate và dựng QR
          NAPAS hoàn toàn local.
        </Text>
      </View>

      {error ? <Notice message={error} tone="error" /> : null}
      {success ? <Notice message={success} tone="success" /> : null}

      {!property.utilityRates ? (
        <Notice
          message="Hãy lưu electricity/water rates phía trên trước khi tạo invoice."
          tone="error"
        />
      ) : null}

      <View style={styles.proofGrid}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>ELECTRICITY RATE</Text>
          <Text style={styles.metricValue}>
            {currency.format(property.utilityRates?.electricityRate ?? 0)} VND
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>WATER RATE</Text>
          <Text style={styles.metricValue}>
            {currency.format(property.utilityRates?.waterRate ?? 0)} VND
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>ROUNDING</Text>
          <Text style={styles.metricValue}>milli-unit · half-up</Text>
        </View>
      </View>

      <View style={styles.subsection}>
        <Text style={styles.subheading}>1. Bank configuration</Text>
        <Text style={styles.hint}>
          Giá trị điền sẵn là synthetic và chỉ chứng minh cấu trúc QR, không đại
          diện tài khoản nhận tiền thật.
        </Text>
        <View style={styles.fieldRow}>
          <View style={styles.fieldFlex}>
            <Field
              keyboardType="numeric"
              label="Bank BIN (6 số)"
              onChangeText={setBankBin}
              placeholder="970436"
              value={bankBin}
            />
          </View>
          <View style={styles.fieldFlex}>
            <Field
              autoCapitalize="characters"
              label="Account number"
              onChangeText={setAccountNumber}
              placeholder="DEMO12345"
              value={accountNumber}
            />
          </View>
        </View>
        <Field
          autoCapitalize="characters"
          label="Account holder"
          onChangeText={setAccountName}
          placeholder="SYNTHETIC DEMO"
          value={accountName}
        />
        <AppButton
          label="Lưu bank config local"
          loading={busy}
          onPress={configureBank}
          variant="secondary"
        />
      </View>

      <View style={styles.subsection}>
        <Text style={styles.subheading}>2. Generate invoice snapshot</Text>
        <View style={styles.fieldRow}>
          <View style={styles.fieldFlex}>
            <Field
              autoCapitalize="characters"
              label="Room reference"
              onChangeText={setRoomReference}
              placeholder="P.101"
              value={roomReference}
            />
          </View>
          <View style={styles.fieldFlex}>
            <Field
              label="Tenant label"
              onChangeText={setTenantName}
              placeholder="Synthetic Tenant"
              value={tenantName}
            />
          </View>
        </View>
        <View style={styles.fieldRow}>
          <View style={styles.fieldFlex}>
            <Field
              label="Billing period"
              onChangeText={setBillingPeriod}
              placeholder="2026-07"
              value={billingPeriod}
            />
          </View>
          <View style={styles.fieldFlex}>
            <Field
              keyboardType="numeric"
              label="Base rent (VND)"
              onChangeText={setBaseRent}
              placeholder="4000000"
              value={baseRent}
            />
          </View>
        </View>
        <View style={styles.fieldRow}>
          <View style={styles.fieldFlex}>
            <Field
              label="Issue date"
              onChangeText={setIssueDate}
              placeholder="2026-07-01"
              value={issueDate}
            />
          </View>
          <View style={styles.fieldFlex}>
            <Field
              label="Due date"
              onChangeText={setDueDate}
              placeholder="2026-07-10"
              value={dueDate}
            />
          </View>
        </View>
        <View style={styles.fieldRow}>
          <View style={styles.fieldFlex}>
            <Field
              keyboardType="decimal-pad"
              label="Electricity previous"
              onChangeText={setPreviousElectricity}
              placeholder="100.125"
              value={previousElectricity}
            />
          </View>
          <View style={styles.fieldFlex}>
            <Field
              keyboardType="decimal-pad"
              label="Electricity current"
              onChangeText={setCurrentElectricity}
              placeholder="112.625"
              value={currentElectricity}
            />
          </View>
        </View>
        <View style={styles.fieldRow}>
          <View style={styles.fieldFlex}>
            <Field
              keyboardType="decimal-pad"
              label="Water previous"
              onChangeText={setPreviousWater}
              placeholder="20"
              value={previousWater}
            />
          </View>
          <View style={styles.fieldFlex}>
            <Field
              keyboardType="decimal-pad"
              label="Water current"
              onChangeText={setCurrentWater}
              placeholder="22.333"
              value={currentWater}
            />
          </View>
        </View>
        <AppButton
          disabled={!property.utilityRates}
          label="Tính và tạo Draft"
          loading={busy}
          onPress={createInvoice}
        />
      </View>

      <View style={styles.subsection}>
        <View style={styles.listHeading}>
          <Text style={styles.subheading}>3. Invoice state & VietQR</Text>
          <AppButton label="Reload" loading={loading} onPress={load} variant="secondary" />
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : invoices.length === 0 ? (
          <Text style={styles.hint}>Chưa có invoice cho property này.</Text>
        ) : (
          <View style={styles.invoiceList}>
            {invoices.map((invoice) => (
              <Pressable
                accessibilityRole="button"
                key={invoice.id}
                onPress={() => {
                  setSelected(invoice);
                  setVietQr(null);
                }}
                style={[
                  styles.invoiceRow,
                  selected?.id === invoice.id && styles.invoiceRowActive,
                ]}
              >
                <View style={styles.invoiceCopy}>
                  <Text style={styles.invoiceTitle}>
                    {invoice.roomReference} · {invoice.billingPeriod}
                  </Text>
                  <Text style={styles.hint}>{invoice.tenantName}</Text>
                </View>
                <Text style={styles.invoiceTotal}>{currency.format(invoice.total)} VND</Text>
                <View
                  style={[
                    styles.statusBadge,
                    invoice.status === "Sent" && styles.statusBadgeSent,
                  ]}
                >
                  <Text style={styles.statusText}>{invoice.status}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {selected ? (
          <View style={styles.invoiceDetail}>
            <Text style={styles.detailLabel}>IMMUTABLE LINE ITEMS</Text>
            {selected.lineItems.map((item) => (
              <View key={item.code} style={styles.lineItem}>
                <Text style={styles.lineLabel}>
                  {item.description}
                  {item.quantity ? ` · ${item.quantity} × ${currency.format(item.rate ?? 0)}` : ""}
                </Text>
                <Text style={styles.lineAmount}>{currency.format(item.amount)} VND</Text>
              </View>
            ))}
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{currency.format(selected.total)} VND</Text>
            </View>
            <Text selectable style={styles.fingerprint}>
              SHA-256: {selected.inputFingerprint}
            </Text>
            <View style={styles.actionRow}>
              <View style={styles.actionFlex}>
                <AppButton
                  disabled={selected.status !== "Draft"}
                  label={selected.status === "Draft" ? "Send invoice" : "Đã Sent"}
                  loading={busy}
                  onPress={sendSelected}
                />
              </View>
              <View style={styles.actionFlex}>
                <AppButton
                  disabled={selected.status !== "Sent"}
                  label="Generate VietQR"
                  loading={busy}
                  onPress={generateQr}
                  variant="secondary"
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {vietQr ? (
        <View style={styles.qrCard}>
          <Text style={styles.kicker}>LOCAL STRUCTURAL VALIDATION: PASSED</Text>
          <Image accessibilityLabel="VietQR local" source={{ uri: vietQr.qrDataUrl }} style={styles.qrImage} />
          <Text style={styles.qrAmount}>{currency.format(vietQr.amount)} VND</Text>
          <Text style={styles.qrRemark}>{vietQr.remark}</Text>
          <ScrollView horizontal style={styles.payloadScroll}>
            <Text selectable style={styles.payload}>
              {vietQr.payload}
            </Text>
          </ScrollView>
          <Text style={styles.warning}>
            QR này không chuyển tiền, không kiểm tra beneficiary thật và không đổi invoice sang Paid.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 20 },
  divider: { backgroundColor: colors.border, height: 1 },
  kicker: { color: colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 24, fontWeight: "800", marginTop: 4 },
  description: { color: colors.inkMuted, fontSize: 14, lineHeight: 21, marginTop: 6 },
  proofGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  metric: {
    backgroundColor: colors.background,
    borderRadius: radius.small,
    flexGrow: 1,
    minWidth: 130,
    padding: 12,
  },
  metricLabel: { color: colors.inkMuted, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  metricValue: { color: colors.ink, fontSize: 13, fontWeight: "800", marginTop: 5 },
  subsection: {
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    gap: 13,
    padding: 16,
  },
  subheading: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  hint: { color: colors.inkMuted, fontSize: 12, lineHeight: 18 },
  fieldRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  fieldFlex: { flex: 1, minWidth: 180 },
  listHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  invoiceList: { gap: 8 },
  invoiceRow: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.small,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 11,
  },
  invoiceRowActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  invoiceCopy: { flex: 1 },
  invoiceTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  invoiceTotal: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  statusBadge: { backgroundColor: colors.warmSoft, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5 },
  statusBadgeSent: { backgroundColor: colors.primarySoft },
  statusText: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  invoiceDetail: { backgroundColor: colors.background, borderRadius: radius.medium, gap: 10, padding: 14 },
  detailLabel: { color: colors.inkMuted, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  lineItem: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  lineLabel: { color: colors.inkMuted, flex: 1, fontSize: 12 },
  lineAmount: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  totalLine: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingTop: 10 },
  totalLabel: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  totalValue: { color: colors.primary, fontSize: 17, fontWeight: "900" },
  fingerprint: { color: colors.inkMuted, fontSize: 9, lineHeight: 14 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionFlex: { flex: 1, minWidth: 160 },
  qrCard: { alignItems: "center", backgroundColor: colors.warmSoft, borderRadius: radius.medium, gap: 9, padding: 18 },
  qrImage: { backgroundColor: colors.surface, height: 260, width: 260 },
  qrAmount: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  qrRemark: { color: colors.primaryDark, fontSize: 14, fontWeight: "800" },
  payloadScroll: { alignSelf: "stretch", backgroundColor: colors.surface, borderRadius: radius.small, maxHeight: 55, padding: 9 },
  payload: { color: colors.inkMuted, fontFamily: "monospace", fontSize: 9 },
  warning: { color: "#7A5313", fontSize: 11, lineHeight: 16, textAlign: "center" },
});
