import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { MobileFrame } from "../../components/MobileFrame";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { MailCheck } from "lucide-react-native";
import { useI18n } from "@/i18n/I18nProvider";

export default function ResetSent() {
  const { t } = useI18n();
  return (
    <MobileFrame>
      <View className="flex-1 flex-col items-center justify-center px-8 bg-background">
        <View className="h-20 w-20 rounded-3xl bg-[#2563eb] items-center justify-center shadow-lg shadow-[#2563eb]/60">
          <MailCheck size={36} color="#ffffff" />
        </View>
        <Text className="text-2xl font-extrabold mt-6 text-center">{t('auth.checkInbox')}</Text>
        <Text className="text-sm text-muted-foreground mt-3 leading-relaxed text-center">
          {t('auth.passwordResetSentDescription')}
        </Text>

        <View className="mt-8 w-full gap-2">
          <Link href="/login" asChild>
            <PrimaryButton variant="primary">{t('auth.backToSignIn')}</PrimaryButton>
          </Link>
          <Link href="/forgot-password" asChild>
            <PrimaryButton variant="ghost">{t('auth.sendAgain')}</PrimaryButton>
          </Link>
        </View>
      </View>
    </MobileFrame>
  );
}
