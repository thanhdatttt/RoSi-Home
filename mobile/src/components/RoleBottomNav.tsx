import { type Href, useRouter } from 'expo-router';
import { Building2, House, ReceiptText, UserRound, Wrench, type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/messages';

type UserRole = 'Landlord' | 'Tenant';

type NavigationItem = {
  labelKey: TranslationKey;
  href: Href;
  icon: LucideIcon;
};

const LANDLORD_ITEMS: NavigationItem[] = [
  { labelKey: 'nav.home', href: '/landlord', icon: House },
  { labelKey: 'nav.properties', href: '/landlord/properties', icon: Building2 },
  { labelKey: 'nav.invoices', href: '/landlord/invoices', icon: ReceiptText },
  { labelKey: 'nav.repairs', href: '/landlord/maintenance', icon: Wrench },
  { labelKey: 'nav.profile', href: '/profile', icon: UserRound },
];

const TENANT_ITEMS: NavigationItem[] = [
  { labelKey: 'nav.home', href: '/tenant', icon: House },
  { labelKey: 'nav.invoices', href: '/tenant/invoices', icon: ReceiptText },
  { labelKey: 'nav.repairs', href: '/tenant/maintenance', icon: Wrench },
  { labelKey: 'nav.profile', href: '/profile', icon: UserRound },
];

/**
 * Primary areas keep the navigation visible. Detail, create, and edit routes
 * deliberately stay outside this list so their existing Back actions remain
 * the only navigation affordance.
 */
function isPrimaryArea(pathname: string, role: UserRole) {
  // The dashboard landing pages are intentionally uncluttered. Once a user
  // enters a role module, the dock remains available on list and detail views.
  if (pathname === '/profile') return true;
  return role === 'Landlord'
    ? pathname.startsWith('/landlord/')
    : pathname.startsWith('/tenant/');
}

export function RoleBottomNav({ pathname, role }: { pathname: string; role?: UserRole }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();

  if (!role || !isPrimaryArea(pathname, role)) return null;

  const items = role === 'Landlord' ? LANDLORD_ITEMS : TENANT_ITEMS;

  return (
    <View
      accessibilityRole="tablist"
      style={{
        backgroundColor: '#f6f8fc',
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: '#e5eaf3',
          backgroundColor: '#ffffff',
          paddingHorizontal: 4,
          paddingVertical: 7,
          shadowColor: '#152447',
          shadowOpacity: 0.07,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {items.map(({ labelKey, href, icon: Icon }) => {
          const label = t(labelKey);
          const selected = pathname === href;
          const color = selected ? '#155eef' : '#718096';

          return (
            <Pressable
              key={labelKey}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              testID={`bottom-nav-${label.toLowerCase()}`}
              onPress={() => router.replace(href)}
              style={({ pressed }) => ({
                flexGrow: 1,
                flexBasis: 0,
                minWidth: 0,
                minHeight: 58,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                paddingHorizontal: 2,
                opacity: pressed ? 0.68 : 1,
              })}
            >
              <View
                style={{
                  height: 34,
                  width: 42,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 17,
                  backgroundColor: selected ? '#e6efff' : 'transparent',
                }}
              >
                <Icon size={20} strokeWidth={selected ? 2.6 : 2} color={color} />
              </View>
              <Text
                numberOfLines={1}
                style={{
                  width: '100%',
                  color,
                  fontSize: 10,
                  fontWeight: selected ? '700' : '600',
                  letterSpacing: 0.05,
                  textAlign: 'center',
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
