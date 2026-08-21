import { MobileFrame } from "@/components/MobileFrame";
import { ContentState } from "@/components/ui/ContentState";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/contexts/auth-context";
import { uploadPaymentProof, type PaymentProofFile } from "@/features/payments/api";
import { pickPaymentProof } from "@/features/payments/proof-picker";
import { apiRequest } from "@/lib/api";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, ImagePlus, ShieldCheck, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useI18n } from '@/i18n/I18nProvider';

type Invoice = { id: string; billingPeriod: string; totalAmount: number; status: "Draft" | "Sent" | "Paid"; roomName?: string };
export default function UploadPaymentProofScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { formatVnd, t } = useI18n();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [file, setFile] = useState<PaymentProofFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Invoice>(`/invoices/${id}`, { token })
      .then(setInvoice)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  async function chooseFile() {
    setError(null);
    const result = await pickPaymentProof();
    if (result.status === "selected") setFile(result.file);
    if (result.status === "error") setError(result.message);
  }

  async function submit() {
    if (!file || !invoice || invoice.status !== "Sent") return;
    setUploading(true);
    setError(null);
    try {
      await uploadPaymentProof(token, invoice.id, file);
      setUploaded(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  return <MobileFrame><View style={{ flex: 1, backgroundColor: "#f5f8ff" }}>
    <ScreenHeader eyebrow={t('invoice.uploadProofEyebrow')} title={t('invoice.uploadProof')} />
    <ContentState loading={loading} error={!invoice ? error : null} />
    {invoice ? <ScrollView contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 40 }}>
      <View style={{ padding: 16, borderRadius: 16, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0" }}>
        <Text style={{ color: "#64748b", fontSize: 12 }}>{t('payment.invoice', { period: invoice.billingPeriod })}</Text>
        <Text style={{ color: "#0f172a", fontSize: 24, fontWeight: "800", marginTop: 4 }}>{formatVnd(invoice.totalAmount)}</Text>
        {invoice.roomName ? <Text style={{ color: "#64748b", marginTop: 4 }}>{invoice.roomName}</Text> : null}
      </View>
      {uploaded ? <View style={{ padding: 22, borderRadius: 18, backgroundColor: "#dcfce7", alignItems: "center", gap: 10 }}><CheckCircle2 size={40} color="#16a34a" /><Text style={{ color: "#166534", fontSize: 18, fontWeight: "800" }}>{t('invoice.proofSubmitted')}</Text><Text style={{ color: "#166534", textAlign: "center", lineHeight: 20 }}>{t('invoice.proofSubmittedNotice')}</Text></View> : <>
        <View style={{ padding: 14, borderRadius: 14, backgroundColor: "#eff6ff", flexDirection: "row", gap: 10 }}><ShieldCheck size={20} color="#2563eb" /><Text style={{ flex: 1, color: "#1e40af", lineHeight: 19 }}>{t('invoice.proofNotice')}</Text></View>
        {invoice.status !== "Sent" ? <View style={{ padding: 14, borderRadius: 12, backgroundColor: "#fee2e2" }}><Text style={{ color: "#b91c1c" }}>{t('invoice.proofUnavailable')}</Text></View> : null}
        {file ? <View style={{ backgroundColor: "white", padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0" }}><Image source={{ uri: file.uri }} contentFit="contain" style={{ width: "100%", height: 280, borderRadius: 12, backgroundColor: "#f1f5f9" }} /><View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 }}><Text numberOfLines={1} style={{ flex: 1, color: "#475569" }}>{file.name}</Text><TouchableOpacity accessibilityLabel={t('invoice.removeProof')} onPress={() => setFile(null)}><X size={20} color="#ef4444" /></TouchableOpacity></View></View> : <TouchableOpacity disabled={invoice.status !== "Sent"} onPress={chooseFile} style={{ height: 180, borderRadius: 18, borderWidth: 2, borderStyle: "dashed", borderColor: "#93c5fd", alignItems: "center", justifyContent: "center", backgroundColor: "white", opacity: invoice.status === "Sent" ? 1 : 0.5 }}><ImagePlus size={34} color="#2563eb" /><Text style={{ fontWeight: "700", color: "#2563eb", marginTop: 10 }}>{t('invoice.chooseProof')}</Text><Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{t('invoice.proofFileRequirements')}</Text></TouchableOpacity>}
        {error ? <Text style={{ color: "#b91c1c" }}>{error}</Text> : null}
        <PrimaryButton disabled={!file || uploading || invoice.status !== "Sent"} onPress={submit}>{uploading ? t('invoice.uploading') : t('invoice.submitProof')}</PrimaryButton>
      </>}
      {uploaded ? <PrimaryButton variant="outline" onPress={() => router.replace({ pathname: "/(dashboard)/tenant/invoices/[id]", params: { id } } as any)}>{t('invoice.backToInvoice')}</PrimaryButton> : null}
    </ScrollView> : null}
  </View></MobileFrame>;
}
