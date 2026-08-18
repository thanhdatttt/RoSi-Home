import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { setApiErrorLanguage, Storage } from '@/lib/api';
import { messages, type AppLanguage, type TranslationKey } from './messages';
import { translateLegacy } from './legacy';

const LANGUAGE_STORAGE_KEY = 'rosihome.language';
const DEFAULT_LANGUAGE: AppLanguage = 'en';

type Interpolation = Record<string, string | number>;

type I18nContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: TranslationKey, values?: Interpolation) => string;
  formatNumber: (value: number) => string;
  formatVnd: (value: number) => string;
  formatDate: (value: Date | string) => string;
  roleLabel: (role?: string) => string;
  statusLabel: (status?: string) => string;
  translateLegacy: (value: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, values?: Interpolation) {
  if (!values) return template;
  return template.replace(/{{(.*?)}}/g, (_, key: string) => String(values[key] ?? `{{${key}}}`));
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void Storage.getItemAsync(LANGUAGE_STORAGE_KEY)
      .then((stored) => {
        if (mounted && (stored === 'en' || stored === 'vi')) setLanguageState(stored);
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setApiErrorLanguage(language);
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const t = (key: TranslationKey, values?: Interpolation) => interpolate(messages[language][key], values);

    return {
      language,
      setLanguage: async (nextLanguage) => {
        setLanguageState(nextLanguage);
        await Storage.setItemAsync(LANGUAGE_STORAGE_KEY, nextLanguage);
      },
      t,
      formatNumber: (number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(number) || 0),
      formatVnd: (number) => `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(number) || 0)} ${language === 'vi' ? 'VNĐ' : 'VND'}`,
      formatDate: (date) => new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(typeof date === 'string' ? new Date(date) : date),
      roleLabel: (role) => role === 'Tenant' ? t('role.tenant') : role === 'Landlord' ? t('role.landlord') : role ?? '',
      statusLabel: (status) => {
        const statusKeys: Record<string, TranslationKey> = {
          draft: 'status.draft', occupied: 'status.occupied', vacant: 'status.vacant',
          pending: 'status.pending', inprogress: 'status.inProgress', completed: 'status.completed',
          electricity: 'status.electricity', water: 'status.water', sent: 'status.sent', paid: 'status.paid',
          all: 'status.all', active: 'status.active', ended: 'status.ended',
        };
        const key = status ? status.replace(/[^a-z]/gi, '').toLowerCase() : '';
        return statusKeys[key] ? t(statusKeys[key]) : status ?? '';
      },
      translateLegacy: (legacyValue) => translateLegacy(language, legacyValue),
    };
  }, [language]);

  // Do not render the app in English and visibly switch after the persisted preference loads.
  if (!ready) return null;
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
