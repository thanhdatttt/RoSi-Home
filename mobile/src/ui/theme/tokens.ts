import { Platform } from 'react-native';

export const colors = {
  background: '#F5F8FF',
  surface: '#FFFFFF',
  surfaceAlt: '#EAF1FF',
  text: '#101828',
  textSecondary: '#667085',
  border: '#D7E0EF',
  primary: '#2563EB',
  primaryPressed: '#1D4ED8',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  occupiedSoft: '#DBEAFE',
  neutralSoft: '#F2F4F7',
  warning: '#D97706',
  danger: '#DC2626',
  disabled: '#98A2B3',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const Colors = {
  light: {
    text: colors.text,
    background: colors.background,
    backgroundElement: colors.surfaceAlt,
    backgroundSelected: colors.border,
    textSecondary: colors.textSecondary,
  },
  dark: {
    text: colors.text,
    background: colors.background,
    backgroundElement: colors.surfaceAlt,
    backgroundSelected: colors.border,
    textSecondary: colors.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const BottomTabInset = Platform.select({ ios: 50, android: 72 }) ?? 0;
export const MaxContentWidth = 800;
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;
