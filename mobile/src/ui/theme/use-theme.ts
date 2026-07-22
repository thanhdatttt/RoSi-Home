import { useColorScheme } from '@/hooks/use-color-scheme';

import { Colors } from './tokens';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme ?? 'light';

  return Colors[theme];
}
