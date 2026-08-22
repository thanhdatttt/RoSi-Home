## Context

The Expo mobile client contains English literals across route components and has no language provider. The existing `Storage` abstraction already persists values through SecureStore on native platforms and localStorage on web, so no additional persistence dependency is needed.

## Goals / Non-Goals

**Goals:**

- Provide one active language source for English and Vietnamese.
- Persist the preference and make it selectable from Profile.
- Localize shared, high-traffic presentation surfaces first and centralize locale-aware formatting.

**Non-Goals:**

- Translating backend API error payloads, email, PDF, or push message content.
- Altering API enums, routes, database values, or role authorization.
- Adding a third language or a remote translation service.

## Decisions

### Typed local dictionaries and a React provider

The client will use typed English and Vietnamese dictionaries exposed through a provider hook. This avoids a new runtime dependency for two static languages and prevents screen-specific translation functions from diverging. A library-based solution remains viable if pluralization or many additional locales are later required.

### Secure/local storage for preference persistence

The existing platform-aware `Storage` wrapper will persist the language key. It has the correct native and Expo web behavior, avoiding a second storage implementation.

### Localize presentation, not contracts

Backend enum strings remain stable. A shared status-label helper maps their presentation value at render time. This keeps existing request bodies and backend assumptions unchanged.

### Incremental screen migration

This implementation migrates shared navigation, Profile, authentication entry, the two role dashboards, and the landlord Property/Room flow first. An audit identified remaining English literals in the feature routes; they remain an explicit migration task rather than being treated as a completed localization. Dashboard landing pages remain dock-free, while role-module detail views retain the dock for direct navigation.

## Risks / Trade-offs

- [Mixed language during incremental migration] → Shared surfaces change first; untranslated feature strings remain identifiable and can be migrated independently.
- [Locale preference briefly loading] → Use an explicit readiness state so the app does not render the wrong language and then visibly switch.
- [Longer Vietnamese labels] → Keep tab labels concise and centered; translations are reviewed at the primary mobile width.

## Migration Plan

1. Add dictionaries, provider, and formatting/status helpers.
2. Mount the provider above the route tree and add Profile selection.
3. Migrate shared navigation, account entry, and dashboard labels.
4. Typecheck the mobile app and verify each language persists after reload.

Rollback consists of removing the provider and leaving the existing English literals; no data migration is required.
