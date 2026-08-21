import React, { type ReactNode } from "react";
import { View, Platform } from "react-native";
import { usePathname } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { RoleBottomNav } from "@/components/RoleBottomNav";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Applies the legacy catalogue to static presentation strings passed to a
 * screen. Dynamic values and server data are intentionally left unchanged:
 * `translateLegacy` only replaces an exact, known UI phrase.
 *
 * This keeps older feature routes bilingual while they are migrated to typed
 * translation keys one by one, including labels passed into shared controls.
 */
function localizeStaticContent(node: ReactNode, translate: (value: string) => string): ReactNode {
  if (typeof node === "string") return translate(node);
  if (!React.isValidElement(node)) return node;

  const element = node as React.ReactElement<Record<string, unknown>>;
  const props: Record<string, unknown> = { ...element.props };

  for (const propName of ["accessibilityLabel", "hint", "label", "placeholder", "title"] as const) {
    if (typeof props[propName] === "string") {
      props[propName] = translate(props[propName] as string);
    }
  }

  if (element.props.children !== undefined) {
    props.children = React.Children.map(element.props.children, (child) =>
      localizeStaticContent(child as ReactNode, translate),
    );
  }

  return React.cloneElement(element, props);
}

/**
 * MobileFrame acts as a SafeArea container for React Native.
 */
export function MobileFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { translateLegacy } = useI18n();

  // Enforce rigid styles on web to simulate a mobile screen
  const webStyle = Platform.OS === 'web' ? {
    maxWidth: 440,
    width: '100%',
    marginHorizontal: 'auto',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0', // standard tailwind border color
    minHeight: '100vh',
  } as any : {};

  return (
    <View style={[{ flex: 1, backgroundColor: '#f5f8ff' }, webStyle]}>
      {localizeStaticContent(children, translateLegacy)}
      <RoleBottomNav pathname={pathname} role={user?.role} />
    </View>
  );
}
