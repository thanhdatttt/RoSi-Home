import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/ui/theme';

export type TimelineItem = {
  title: string;
  date: string;
  detail?: string;
};

export function Timeline({ items }: { items: readonly TimelineItem[] }) {
  return (
    <View style={styles.root}>
      {items.map((item, index) => (
        <View key={`${item.title}-${item.date}`} style={styles.item}>
          <View style={styles.rail}>
            <View style={styles.dot} />
            {index < items.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{item.date}</Text>
            {item.detail ? <Text style={styles.detail}>{item.detail}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 0 },
  item: { minHeight: 64, flexDirection: 'row', gap: spacing.md },
  rail: { width: 16, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  line: { width: 2, flex: 1, backgroundColor: colors.border },
  copy: { flex: 1, paddingBottom: spacing.md, gap: spacing.xs },
  title: { color: colors.text, fontSize: 14, fontWeight: '800' },
  date: { color: colors.textSecondary, fontSize: 12 },
  detail: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});
