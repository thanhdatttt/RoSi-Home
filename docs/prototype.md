# Prototype — RosiHome

## 1. Goal and Original Artifact

The original prototype is stored in `Prototype/`. It contains interactive landlord and tenant HTML, PNG previews, `DESIGN-MANIFEST.json`, and `DESIGN-HANDOFF.md`. It is an early UI representation of a **business-case workflow**, not proof that the backend worked.

The primary workflow is the landlord setup flow:

```text
Login → Property list → Create property → Add room → Utility rate → Surcharge
```

**FACT:** these screens and links exist in `Prototype/rosihome-mobile-prototype.html`. The prototype lists 17 landlord screens. The separate tenant prototype lists 9 screens and covers a landlord-provisioned account, phone login, forced password change, home, and profile.

## 2. Input / Brief

The artifact itself records the target roles, mobile-first scope, property/room/rate/surcharge setup, tenant account boundary, navigation, default/loading/error states, and “coming soon” boundaries. These items are consistent with Vision & Scope and the Product Backlog.

**INFERENCE:** project requirements were direct inputs to the design because the wording and flows align. A raw original prompt and a requirement-to-prompt trace were not found.

## 3. Formation and Interactivity

The observable formation is:

```text
Business problem and role workflow
→ mobile-first brief and MVP boundary
→ interactive landlord and tenant HTML
→ previews, manifest, and handoff
→ implementation baseline
→ current UI refinement and feature expansion
```

The HTML is interactive: users can choose screens, follow links, submit simulated forms, switch iOS/Android presentation, and display loading/error states. The interactions demonstrate navigation and UI state only; they do not call the production backend.

`data-od-id` markers and the handoff reference Open Design. **NOT FOUND:** the raw prompt, exact tool/model version, detailed creation time, or an independent record of who accepted each design decision.

## 4. Evaluation Method

The defensible evaluation is an artifact review against the intended role, workflow, scope, navigation, state coverage, and implementation routes:

- Does the landlord complete the business sequence without unrelated modules?
- Do screens have a clear main action, back path, validation/error state, and role boundary?
- Are unimplemented prototype modules labelled instead of simulated as working?
- Does the current implementation preserve the core sequence?

`DESIGN-HANDOFF.md` contains review checks, but the repository does not prove that a formal usability test, customer review, lecturer review, or approval meeting occurred. Those results are **NOT FOUND**.

## 5. Prototype Compared with Current UI

| Aspect | Result | Evidence-based interpretation |
|---|---|---|
| CORE FLOW | **PRESERVED** | Login → property → room → utility/surcharge still exists in current Expo routes |
| FEATURE SURFACE | **EXPANDED** | Current code adds leases, meters, invoices, VietQR, payment proof, maintenance, notifications, dashboard, and reports |
| NAVIGATION | **REFINED_OR_EXPANDED** | Current role dashboards and bottom navigation provide more entry points |
| UI / VISUAL DESIGN | **REFINED** | Layout, components, spacing, and presentation differ while the original setup sequence remains recognizable |

Overall: **CORE_FLOW_PRESERVED_WITH_UI_REFINEMENT_AND_FEATURE_EXPANSION**.

This comparison does not prove that every current screen was copied directly from the prototype or that every later change came from a design tool or user feedback.

## 6. Evidence to Print

Print only original artifacts from `Prototype/`:

1. A contact sheet from the landlord interactive HTML showing Login → Property → Room → Utility → Surcharge.
2. The landlord preview/brief page if space allows.
3. Optionally, the tenant preview or manifest/handoff page as supporting evidence.

Do not substitute current application screenshots for original Prototype evidence.
