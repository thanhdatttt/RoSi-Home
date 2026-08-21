import { MobileFrame } from "@/components/MobileFrame";
import { DatePicker } from "@/components/ui/DatePicker";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/contexts/auth-context";
import { downloadAuthenticatedPdf } from "@/lib/download";
import { generateReport, type ReportView, type RevenueBreakdown } from "./api";
import { useRouter } from "expo-router";
import { AlertTriangle, Building2, Download, Receipt, Wrench } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useI18n } from "@/i18n/I18nProvider";

const dateText = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const monthText = (date: Date) => dateText(date).slice(0, 7);
const sum = (value: RevenueBreakdown) => value.rent + value.electricity + value.water + value.surcharges;

export function ReportScreen() {
  const { token } = useAuth(); const router = useRouter();
  const { formatDate, formatVnd: money, t } = useI18n();
  const [periodType, setPeriodType] = useState<"month" | "custom">("month");
  const [month, setMonth] = useState(new Date()); const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); const [endDate, setEndDate] = useState(new Date());
  const [report, setReport] = useState<ReportView | null>(null); const [loading, setLoading] = useState(false); const [downloading, setDownloading] = useState(false); const [error, setError] = useState<string | null>(null);

  async function runReport() {
    if (periodType === "custom" && startDate > endDate) return setError(t('report.invalidRange'));
    setLoading(true); setError(null);
    try { setReport(await generateReport(token, periodType === "month" ? { periodType, month: monthText(month) } : { periodType, startDate: dateText(startDate), endDate: dateText(endDate) })); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }
  async function download() {
    if (!report) return; setDownloading(true); setError(null);
    const period = report.period.type === "month" ? report.period.month : `${report.period.startDate}_to_${report.period.endDate}`;
    try { await downloadAuthenticatedPdf(`/reports/${report.reportId}/pdf`, token, `Business_Report_${period}.pdf`); } catch (e: any) { setError(e.message); } finally { setDownloading(false); }
  }

  return <MobileFrame><View style={{ flex: 1, backgroundColor: "#f5f8ff" }}><ScreenHeader eyebrow={t('report.eyebrow')} title={t('report.title')} />
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 48 }}>
      <View style={{ padding: 16, borderRadius: 18, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0" }}>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>{(["month", "custom"] as const).map((type) => <TouchableOpacity key={type} onPress={() => setPeriodType(type)} style={{ flex: 1, alignItems: "center", padding: 10, borderRadius: 10, backgroundColor: periodType === type ? "#2563eb" : "#e2e8f0" }}><Text style={{ color: periodType === type ? "white" : "#475569", fontWeight: "700" }}>{type === "month" ? t('report.month') : t('report.customRange')}</Text></TouchableOpacity>)}</View>
        {periodType === "month" ? <DatePicker label={t('report.reportingMonth')} value={month} onChange={setMonth} monthOnly /> : <View style={{ flexDirection: "row", gap: 10 }}><DatePicker label={t('report.startDate')} value={startDate} onChange={setStartDate} /><DatePicker label={t('report.endDate')} value={endDate} onChange={setEndDate} /></View>}
        {error ? <Text style={{ color: "#b91c1c", marginVertical: 12 }}>{error}</Text> : <View style={{ height: 16 }} />}
        <PrimaryButton disabled={loading} onPress={runReport}>{loading ? t('report.generating') : t('report.generate')}</PrimaryButton>
      </View>

      {report ? <>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}><Metric label={t('report.expected')} value={money(sum(report.financial.expectedRevenue))} /><Metric label={t('report.collected')} value={money(sum(report.financial.actualCollectedRevenue))} /><Metric label={t('report.outstanding')} value={money(report.financial.totalOutstandingDebt)} /><Metric label={t('report.occupancy')} value={report.occupancy.averageOccupancyRate === "N/A" ? "N/A" : `${report.occupancy.averageOccupancyRate}%`} /></View>
        <Section title={t('report.financialBreakdown')} icon={<Receipt size={18} color="#2563eb" />}><Breakdown label={t('report.expected')} value={report.financial.expectedRevenue} money={money} t={t} /><Breakdown label={t('report.collected')} value={report.financial.actualCollectedRevenue} money={money} t={t} /></Section>
        <Section title={t('report.occupancyLeases')} icon={<Building2 size={18} color="#2563eb" />}><Text style={{ color: "#475569" }}>{t('report.moveInsOuts', { moveIns: report.occupancy.moveIns, moveOuts: report.occupancy.moveOuts })}</Text>{report.occupancy.upcomingExpirations.map((item) => <TouchableOpacity key={item.leaseId} onPress={() => router.push({ pathname: "/(dashboard)/landlord/leases/[id]", params: { id: item.leaseId } } as any)} style={{ paddingTop: 10 }}><Text style={{ fontWeight: "700" }}>{item.propertyName} · {item.roomName}</Text><Text style={{ color: "#64748b", marginTop: 3 }}>{item.tenantFullName} · {t('report.expires', { date: item.endDate })}</Text></TouchableOpacity>)}</Section>
        <Section title={t('report.maintenance')} icon={<Wrench size={18} color="#2563eb" />}><Text style={{ color: "#475569", lineHeight: 22 }}>{t('report.maintenanceSummary', { newRequests: report.maintenance.newRequests, completed: report.maintenance.completedRequests, resolutionRate: report.maintenance.resolutionRate === "N/A" ? "N/A" : `${report.maintenance.resolutionRate}%`, averageResolution: report.maintenance.averageResolutionTime === "N/A" ? "N/A" : `${report.maintenance.averageResolutionTime} hours` })}</Text></Section>
        {report.financial.overdueInvoices.length ? <Section title={t('report.overdueInvoices')} icon={<AlertTriangle size={18} color="#ef4444" />}>{report.financial.overdueInvoices.map((item) => <TouchableOpacity key={item.invoiceId} onPress={() => router.push({ pathname: "/(dashboard)/landlord/invoices/[id]", params: { id: item.invoiceId } } as any)} style={{ paddingVertical: 8 }}><Text style={{ fontWeight: "700" }}>{item.tenant} · {item.room}</Text><Text style={{ color: "#b91c1c", marginTop: 3 }}>{money(item.amount)} · {t('report.due', { date: item.dueDate })}</Text></TouchableOpacity>)}</Section> : null}
        <Text style={{ color: "#94a3b8", fontSize: 11 }}>{t('report.generated', { date: formatDate(report.generatedAt), timezone: report.timezone })}</Text><PrimaryButton disabled={downloading} onPress={download}><View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><Download size={17} color="white" /><Text style={{ color: "white", fontWeight: "700" }}>{downloading ? t('report.preparingPdf') : t('report.openPdf')}</Text></View></PrimaryButton>
      </> : null}
    </ScrollView>
  </View></MobileFrame>;
}

function Metric({ label, value }: { label: string; value: string }) { return <View style={{ minWidth: "47%", flex: 1, padding: 14, borderRadius: 15, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0" }}><Text style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", fontWeight: "700" }}>{label}</Text><Text style={{ color: "#0f172a", fontSize: 17, fontWeight: "900", marginTop: 6 }}>{value}</Text></View>; }
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <View style={{ padding: 16, borderRadius: 18, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0" }}><View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 12 }}>{icon}<Text style={{ fontWeight: "800", fontSize: 16 }}>{title}</Text></View>{children}</View>; }
function Breakdown({ label, value, money, t }: { label: string; value: RevenueBreakdown; money: (value: number) => string; t: (key: 'report.rentElectricity' | 'report.waterSurcharges', values: Record<string, string>) => string }) { return <View style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9" }}><Text style={{ fontWeight: "700", marginBottom: 7 }}>{label} · {money(sum(value))}</Text><Text style={{ color: "#64748b", lineHeight: 20 }}>{t('report.rentElectricity', { rent: money(value.rent), electricity: money(value.electricity) })}{"\n"}{t('report.waterSurcharges', { water: money(value.water), surcharges: money(value.surcharges) })}</Text></View>; }
