import { MobileFrame } from "@/components/MobileFrame";
import { DatePicker } from "@/components/ui/DatePicker";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/contexts/auth-context";
import { getPaymentHistory, type PaymentHistory } from "@/features/payments/api";
import { downloadAuthenticatedPdf } from "@/lib/download";
import { generateReport, type ReportView, type RevenueBreakdown } from "./api";
import { useRouter } from "expo-router";
import { AlertTriangle, Building2, Download, Receipt, Wrench } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useI18n } from "@/i18n/I18nProvider";

const dateText = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const monthText = (date: Date) => dateText(date).slice(0, 7);
const money = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
const sum = (value: RevenueBreakdown) => value.rent + value.electricity + value.water + value.surcharges;

export function ReportScreen() {
  const { token, user } = useAuth(); const router = useRouter();
  const { translateLegacy } = useI18n();
  const [periodType, setPeriodType] = useState<"month" | "custom">("month");
  const [month, setMonth] = useState(new Date()); const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); const [endDate, setEndDate] = useState(new Date());
  const [report, setReport] = useState<ReportView | null>(null); const [history, setHistory] = useState<PaymentHistory | null>(null); const [loading, setLoading] = useState(false); const [downloading, setDownloading] = useState(false); const [error, setError] = useState<string | null>(null);
  const landlord = user?.role === "Landlord";

  useEffect(() => { if (!landlord) { setLoading(true); getPaymentHistory(token).then(setHistory).catch((e) => setError(e.message)).finally(() => setLoading(false)); } }, [landlord, token]);
  const tenantEntries = useMemo(() => history?.entries.filter((entry) => entry.billingPeriod === monthText(month)) ?? [], [history, month]);
  const tenantOutstanding = tenantEntries.filter((entry) => entry.status === "Sent").reduce((total, entry) => total + entry.amount, 0);
  const tenantPaid = tenantEntries.filter((entry) => entry.status === "Paid").reduce((total, entry) => total + entry.amount, 0);

  async function runReport() {
    if (periodType === "custom" && startDate > endDate) return setError('Start date cannot be after end date.');
    setLoading(true); setError(null);
    try { setReport(await generateReport(token, periodType === "month" ? { periodType, month: monthText(month) } : { periodType, startDate: dateText(startDate), endDate: dateText(endDate) })); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }
  async function download() {
    if (!report) return; setDownloading(true); setError(null);
    const period = report.period.type === "month" ? report.period.month : `${report.period.startDate}_to_${report.period.endDate}`;
    try { await downloadAuthenticatedPdf(`/reports/${report.reportId}/pdf`, token, `Business_Report_${period}.pdf`); } catch (e: any) { setError(e.message); } finally { setDownloading(false); }
  }

  return <MobileFrame><View style={{ flex: 1, backgroundColor: "#f5f8ff" }}><ScreenHeader eyebrow={landlord ? "Portfolio analytics" : "Tenant account"} title={landlord ? "Business report" : "My report"} />
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 48 }}>
      {landlord ? <View style={{ padding: 16, borderRadius: 18, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0" }}>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>{(["month", "custom"] as const).map((type) => <TouchableOpacity key={type} onPress={() => setPeriodType(type)} style={{ flex: 1, alignItems: "center", padding: 10, borderRadius: 10, backgroundColor: periodType === type ? "#2563eb" : "#e2e8f0" }}><Text style={{ color: periodType === type ? "white" : "#475569", fontWeight: "700" }}>{translateLegacy(type === "month" ? "Month" : "Custom range")}</Text></TouchableOpacity>)}</View>
        {periodType === "month" ? <DatePicker label="Reporting month" value={month} onChange={setMonth} monthOnly /> : <View style={{ flexDirection: "row", gap: 10 }}><DatePicker label="Start date" value={startDate} onChange={setStartDate} /><DatePicker label="End date" value={endDate} onChange={setEndDate} /></View>}
        {error ? <Text style={{ color: "#b91c1c", marginVertical: 12 }}>{error}</Text> : <View style={{ height: 16 }} />}
        <PrimaryButton disabled={loading} onPress={runReport}>{loading ? "Generating..." : "Generate report"}</PrimaryButton>
      </View> : <><View style={{ padding: 14, borderRadius: 14, backgroundColor: "#eff6ff" }}><Text style={{ color: "#1e40af", lineHeight: 19 }}>Business analytics and PDF export are landlord-only. This personal report uses only your authorized invoice and payment history.</Text></View><View style={{ padding: 16, borderRadius: 18, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0" }}><DatePicker label="Billing month" value={month} onChange={setMonth} monthOnly /></View>{error ? <Text style={{ color: "#b91c1c" }}>{error}</Text> : null}</>}

      {landlord && report ? <>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}><Metric label="Expected" value={money(sum(report.financial.expectedRevenue))} /><Metric label="Collected" value={money(sum(report.financial.actualCollectedRevenue))} /><Metric label="Outstanding" value={money(report.financial.totalOutstandingDebt)} /><Metric label="Occupancy" value={report.occupancy.averageOccupancyRate === "N/A" ? "N/A" : `${report.occupancy.averageOccupancyRate}%`} /></View>
        <Section title="Financial breakdown" icon={<Receipt size={18} color="#2563eb" />}><Breakdown label="Expected" value={report.financial.expectedRevenue} /><Breakdown label="Collected" value={report.financial.actualCollectedRevenue} /></Section>
        <Section title="Occupancy & leases" icon={<Building2 size={18} color="#2563eb" />}><Text style={{ color: "#475569" }}>Move-ins: {report.occupancy.moveIns} · Move-outs: {report.occupancy.moveOuts}</Text>{report.occupancy.upcomingExpirations.map((item) => <TouchableOpacity key={item.leaseId} onPress={() => router.push({ pathname: "/(dashboard)/landlord/leases/[id]", params: { id: item.leaseId } } as any)} style={{ paddingTop: 10 }}><Text style={{ fontWeight: "700" }}>{item.propertyName} · {item.roomName}</Text><Text style={{ color: "#64748b", marginTop: 3 }}>{item.tenantFullName} · expires {item.endDate}</Text></TouchableOpacity>)}</Section>
        <Section title="Maintenance" icon={<Wrench size={18} color="#2563eb" />}><Text style={{ color: "#475569", lineHeight: 22 }}>New requests: {report.maintenance.newRequests}{"\n"}Completed: {report.maintenance.completedRequests}{"\n"}Resolution rate: {report.maintenance.resolutionRate === "N/A" ? "N/A" : `${report.maintenance.resolutionRate}%`}{"\n"}Average resolution: {report.maintenance.averageResolutionTime === "N/A" ? "N/A" : `${report.maintenance.averageResolutionTime} hours`}</Text></Section>
        {report.financial.overdueInvoices.length ? <Section title="Overdue invoices" icon={<AlertTriangle size={18} color="#ef4444" />}>{report.financial.overdueInvoices.map((item) => <TouchableOpacity key={item.invoiceId} onPress={() => router.push({ pathname: "/(dashboard)/landlord/invoices/[id]", params: { id: item.invoiceId } } as any)} style={{ paddingVertical: 8 }}><Text style={{ fontWeight: "700" }}>{item.tenant} · {item.room}</Text><Text style={{ color: "#b91c1c", marginTop: 3 }}>{money(item.amount)} · due {item.dueDate}</Text></TouchableOpacity>)}</Section> : null}
        <Text style={{ color: "#94a3b8", fontSize: 11 }}>Generated {new Date(report.generatedAt).toLocaleString()} · {report.timezone}</Text><PrimaryButton disabled={downloading} onPress={download}><View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><Download size={17} color="white" /><Text style={{ color: "white", fontWeight: "700" }}>{downloading ? "Preparing PDF..." : "Open or share PDF"}</Text></View></PrimaryButton>
      </> : null}

      {!landlord && !loading ? <><View style={{ flexDirection: "row", gap: 10 }}><Metric label="Paid" value={money(tenantPaid)} /><Metric label="Outstanding" value={money(tenantOutstanding)} /></View>{tenantEntries.length === 0 ? <View style={{ padding: 28, alignItems: "center" }}><Text style={{ color: "#64748b" }}>No sent or paid invoices for {monthText(month)}.</Text></View> : tenantEntries.map((entry) => <TouchableOpacity key={entry.invoiceId} onPress={() => router.push({ pathname: "/(dashboard)/tenant/invoices/[id]", params: { id: entry.invoiceId } } as any)} style={{ padding: 16, borderRadius: 16, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0" }}><View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}><View><Text style={{ fontWeight: "800", fontSize: 16 }}>Invoice {entry.billingPeriod}</Text><Text style={{ color: "#64748b", marginTop: 5 }}>{entry.verifiedAt ? `Verified ${new Date(entry.verifiedAt).toLocaleDateString()}` : "Awaiting payment confirmation"}</Text></View><StatusBadge value={entry.status} /></View><Text style={{ marginTop: 12, fontWeight: "800", color: "#2563eb" }}>{money(entry.amount)}</Text></TouchableOpacity>)}</> : null}
    </ScrollView>
  </View></MobileFrame>;
}

function Metric({ label, value }: { label: string; value: string }) { return <View style={{ minWidth: "47%", flex: 1, padding: 14, borderRadius: 15, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0" }}><Text style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", fontWeight: "700" }}>{label}</Text><Text style={{ color: "#0f172a", fontSize: 17, fontWeight: "900", marginTop: 6 }}>{value}</Text></View>; }
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <View style={{ padding: 16, borderRadius: 18, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0" }}><View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 12 }}>{icon}<Text style={{ fontWeight: "800", fontSize: 16 }}>{title}</Text></View>{children}</View>; }
function Breakdown({ label, value }: { label: string; value: RevenueBreakdown }) { return <View style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9" }}><Text style={{ fontWeight: "700", marginBottom: 7 }}>{label} · {money(sum(value))}</Text><Text style={{ color: "#64748b", lineHeight: 20 }}>Rent {money(value.rent)} · Electricity {money(value.electricity)}{"\n"}Water {money(value.water)} · Additional fees {money(value.surcharges)}</Text></View>; }
