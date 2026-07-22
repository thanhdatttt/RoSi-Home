import { Platform } from 'react-native';

export const typography = {
  title: 32,
  heading: 24,
  subheading: 18,
  body: 16,
  small: 14,
  caption: 12,
} as const;

export const Fonts = {
  sans: Platform.select({ ios: 'system-ui', default: 'sans-serif' }),
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
};
