## Purpose

Provide a consistent, persistent English and Vietnamese interface for RosiHome's Expo mobile application without changing backend contracts or business data.

## ADDED Requirements

### Requirement: Bilingual mobile presentation

The mobile application SHALL present supported shared UI text in English or Vietnamese according to the active application language.

#### Scenario: Vietnamese is active

- **WHEN** the user selects Vietnamese
- **THEN** navigation, profile, role, and supported dashboard labels are rendered in Vietnamese

#### Scenario: English is active

- **WHEN** the user selects English
- **THEN** the same supported labels are rendered in English

### Requirement: Persistent language preference

The mobile application SHALL save the user's selected language locally and restore it on a subsequent application launch.

#### Scenario: App is reopened

- **WHEN** a user selects a supported language and later reopens the application
- **THEN** the previously selected language is restored before the primary application UI is rendered

### Requirement: Locale-aware client formatting

The mobile application SHALL format client-rendered dates, numbers, and VND amounts using the active language locale.

#### Scenario: Vietnamese monetary value is displayed

- **WHEN** the active language is Vietnamese and a VND amount is rendered
- **THEN** the amount uses Vietnamese number formatting and the `VNĐ` suffix

### Requirement: Localized property and room management

The mobile application SHALL localize the landlord Property and Room management flow and retain role navigation while the user is inside that module.

#### Scenario: Landlord views a room detail

- **WHEN** Vietnamese is active and the landlord opens a Property or Room detail view
- **THEN** its labels and locally generated messages are rendered in Vietnamese
- **AND** the landlord navigation dock remains available

### Requirement: Backend contracts remain language-neutral

The mobile application SHALL preserve backend request fields, response fields, and stored enum values while localizing their user-visible labels.

#### Scenario: A status is displayed in Vietnamese

- **WHEN** the backend returns an enum such as `Draft` or `Occupied`
- **THEN** the UI displays its Vietnamese label without changing the value sent to or received from the backend

### Requirement: Localized client error presentation

The mobile client SHALL map stable API error codes and transport failures to presentation messages in the active language without modifying backend error payloads.

#### Scenario: Vietnamese API failure presentation

- **WHEN** Vietnamese is the active language and an API request returns a known error code or times out
- **THEN** the app presents a Vietnamese client message that explains the failure category
- **AND** the backend response payload remains unchanged
