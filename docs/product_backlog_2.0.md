# Product Backlog 2.0 — RosiHome

## 1. Backlog Conventions

### Work item types

| Type | Meaning |
|---|---|
| **Epic** | A major product area. |
| **Feature** | A related group of user stories. |
| **User Story (US)** | A testable outcome that gives value to a user. |
| **Task (TASK)** | Technical, management, or documentation work; not a user story or feature. |

### Priority

- **Must:** required for the MVP or course submission.
- **Should:** valuable, but completed after Must items if time is limited.

### Status

`To Do` → `In Progress` → `Review` → `Done`

### Definition of Done

A work item is Done when its acceptance criteria pass, relevant tests pass, code or content is reviewed, no critical/high defect remains, and the result is available in the shared development environment or repository.

For all product stories:

- The delivery surface is the React Native mobile app; a Web implementation is not required.
- The backend enforces authentication, role, ownership, and data-isolation rules.
- Auditable business records use soft deletion and append-only audit events; product/API workflows do not hard-delete them.
- Errors and logs do not expose passwords, tokens, private files, or another user's data.

## 2. Workflow Reference

| Workflow | Description | Users |
|---|---|---|
| **WF-1** | Automated monthly billing and payment | Landlord, Tenant |
| **WF-2** | Lease and maintenance management | Landlord, Tenant |
| **WF-3** | Portfolio performance monitoring | Landlord |
| **WF-4** | Infrastructure and core management | System, Landlord, Tenant |

## 3. Technical and Project Tasks

### TASK-TECH-01 — Set up backend infrastructure

- **Priority:** Must
- **Acceptance criteria:**
  - [ ] The TypeScript Node.js 22/Express monolith provides `/api-docs` and versioned REST routes under `/api/v1`.
  - [ ] Central environment configuration supports PostgreSQL, JWT, Supabase Storage, email, Expo push, public URL, billing dates, and port; secrets remain uncommitted.
  - [ ] PostgreSQL connects through Drizzle; schema, migration, seed, and disposable local integration-test database commands are reproducible.
  - [ ] Zod validation, standard success/error envelopes, redacted error logging, async error handling, JWT access/refresh sessions, forced password change, role checks, and record-ownership checks are applied consistently.
  - [ ] Audit events and soft deletion are implemented for auditable records, and active queries exclude soft-deleted data.
  - [ ] Private Supabase Storage supports maintenance photos and payment proofs through validated uploads and authorized signed URLs.

### TASK-TECH-02 — Set up frontend infrastructure

- **Priority:** Must
- **Work estimation:** ~3 hours | ~20,000 tokens
- **Acceptance criteria:**
  - [ ] The mobile project uses Expo SDK 57, React 19, and React Native 0.86, with Android/iOS development and optional Web commands configured.
  - [ ] Expo Router provides typed auth and role-based dashboard routes, including guards for signed-out users, landlord/tenant separation, and forced temporary-password change.
  - [ ] NativeWind theme styles and reusable field/button components support consistent forms, validation messages, and loading states.
  - [ ] The shared REST client reads the configured API base URL, sends JWT authorization, and parses the backend response/error envelope.
  - [ ] Remembered sessions use Expo SecureStore on native platforms, logout clears stored tokens, and an invalid restored access token is removed.
  - [ ] Expo notifications and EAS development, preview, and production profiles are configured.

### TASK-TECH-03 — Set up quality tooling

- **Priority:** Must
- **Acceptance criteria:**
  - [ ] Backend scripts and Vitest configurations provide unit, API-contract, PostgreSQL integration, coverage, typecheck, and build commands.
  - [ ] A disposable local PostgreSQL test-database helper and integration-test configuration are available.
  - [ ] Coverage reports and thresholds are configured for the selected utility, surcharge, maintenance, and storage modules.
  - [ ] Backend testing instructions and an OpenAPI specification are stored in the repository.
  - [ ] Development interfaces or adapters exist for email, Expo push notifications, Supabase Storage, VietQR, and invoice/report PDF generation.

### TASK-PM-01 — Manage the team's Trello board

- **Priority:** Must
- **Acceptance criteria:**
  - [ ] Trello contains every active user story and task with ID, title, priority, assignee, reviewer, status, and dependencies where relevant.
  - [ ] Columns follow the backlog status flow and work-in-progress is visible.
  - [ ] The board is updated after planning, assignment, review, acceptance, or blocking changes.
  - [ ] Completed cards link to the relevant pull request, document, test evidence, or review result.

## 4. Documentation Tasks

All documents remain concise, use consistent RosiHome terminology and scope, cite sources where needed, and are stored as Markdown in the first level of `docs/`. `rosihome_slides.html` and `project_plan.md` are excluded as requested.

### TASK-DOC-01 — Write the Technical Architecture document

- **Output:** `docs/architecture.md`
- **Priority:** Must
- **Work estimation:** ~7 hours | ~120,000 tokens
- **Acceptance criteria:**
  - [ ] Title: **Technical Architecture — RosiHome**.
  - [ ] Includes **Architecture Style, Tech Stack, How It Fits Together, Core Data (Simple Version),** and **Why This Stack Works**.
  - [ ] Defines the three-layer monolithic client-server design, REST boundaries, React/React Native clients, Node.js/Express API, PostgreSQL/Drizzle, Supabase storage, JWT, VietQR, CI/CD, and hosting.
  - [ ] Diagrams and choices agree with the MVP scope and are understandable by the project team.

### TASK-DOC-03 — Write Product Backlog Version 1

- **Output:** `docs/product_backlog.md`
- **Priority:** Must
- **Acceptance criteria:**
  - [ ] Title: **Product Backlog: RosiHome Property Management System**.
  - [ ] Includes **Backlog Conventions, Workflow Mapping Reference, Product Decision Record, Epics 1–5, Feature Summary,** and **Regulatory Pricing Notes**.
  - [ ] Defines the hierarchy, status, priority, Definition of Done, audit/deletion rules, dependencies, 15 features, and all 51 user stories with testable acceptance criteria.
  - [ ] Story IDs, scope, workflow mapping, decisions, feature totals, and regulatory references are internally consistent.

### TASK-DOC-05 — Write Product Backlog 2.0

- **Output:** `docs/product_backlog_2.0.md`
- **Priority:** Must
- **Acceptance criteria:**
  - [ ] Title: **Product Backlog 2.0 — RosiHome**.
  - [ ] Includes **Backlog Conventions, Workflow Reference, Technical and Project Tasks, Documentation Tasks, Product User Stories, Suggested Delivery Order, Backlog Summary,** and **Regulatory Pricing Notes**.
  - [ ] Contains all 51 Version 1 user stories under the same 15 features and five epics.
  - [ ] Contains technical, Trello-management, and document-writing tasks without counting them as user stories or features.
  - [ ] Has no separate product-decision record; approved outcomes appear in related story acceptance criteria.
  - [ ] Keeps `docs/product_backlog.md` unchanged.

### TASK-DOC-07 — Write the Project Charter

- **Output:** `docs/project_charter.md`
- **Priority:** Must
- **Work estimation:** ~6 hours | ~100,000 tokens
- **Acceptance criteria:**
  - [ ] Title: **Project Charter — RosiHome**.
  - [ ] Includes **Project Background, Context, and Overview; Project Objectives; Project Scope; Project Management and Governance; Stakeholder Analysis; Project Facilities and Resources; Major Milestones; Impact Analysis; Assumptions;** and **Project Risks (Summary)**.
  - [ ] States measurable objectives, in/out scope, ownership, resources, milestones, assumptions, and key risks consistently with the proposal and backlog.

### TASK-DOC-09 — Write the Software Project Estimation document

- **Output:** `docs/project_estimation.md`
- **Priority:** Must
- **Acceptance criteria:**
  - [ ] Title: **Software Project Estimation Document**.
  - [ ] Includes **Introduction, 2 Estimation Methodologies, Estimated time/effort/tokens for both methodolgies, Final Estimation Summary,** and **Appendix**.
  - [ ] Shows assumptions, metrics, calculations, source data, feature/story mapping, units, and a reconciled final estimate.

### TASK-DOC-11 — Write the Project Proposal

- **Output:** `docs/proposal.md`
- **Priority:** Must
- **Work estimation:** ~7 hours | ~135,000 tokens
- **Acceptance criteria:**
  - [ ] Title: **Project Proposal — RosiHome**.
  - [ ] Includes **Pain Points & Problem Statement, Business Case, Stakeholders, Competitor Analysis, Feasibility Study, Project Timeline & Schedule, Cost & Budget Plan, Risk Assessment,** and **Elevator Pitch**.
  - [ ] Supports claims with appropriate evidence, clearly explains RosiHome's value, and keeps scope, schedule, costs, and risks internally consistent.

### TASK-DOC-13 — Write the Statement of Work

- **Output:** `docs/statement_of_work.md`
- **Priority:** Must
- **Acceptance criteria:**
  - [ ] Title: **RosiHome Statement of Work**.
  - [ ] Includes **Document Information, Purpose and Agreement, Project Background and Objectives, Scope of Work, Deliverables and Acceptance, Schedule and Milestones, Roles and Responsibilities, Resource and Budget Baseline, Assumptions/Dependencies/Constraints,** and **Change Control**.
  - [ ] Defines verifiable deliverables, acceptance ownership, schedule, responsibilities, constraints, and a practical change process consistent with the charter and backlog.

### TASK-DOC-15 — Write the Vision and Scope document

- **Output:** `docs/vision_and_scope.md`
- **Priority:** Must
- **Acceptance criteria:**
  - [ ] Title: **Vision and Scope Document**.
  - [ ] Includes **Background, Context, and Overview; Current Business Use Cases; Current Domain Model; Current Users' Problems and Objectives; Components and Features to be Developed; Components and Features Excluded; Future Business Use Cases; Business Process Comparison; Future Domain Model; Assumptions; Risks;** and **Conclusion**.
  - [ ] Current/future workflows and domain models are distinguishable, actors and pain points are traceable to features, and exclusions match the MVP backlog.

### TASK-DOC-17 — Write the Risk Management Plan

- **Output:** `docs/risk_management_plan.md`
- **Priority:** Must
- **Acceptance criteria:**
  - [ ] Title: **Risk Management Plan — RosiHome**.
  - [ ] Includes **Purpose and Scope, Risk Management Approach, Roles and Responsibilities, Risk Identification, Risk Analysis and Prioritization, Risk Register, Risk Response Planning, Risk Monitoring and Reporting, Escalation,** and **Review Schedule**.
  - [ ] Defines simple likelihood and impact scales, risk score/priority rules, owners, response strategies, triggers, contingency actions, status, and review frequency.
  - [ ] Covers project, schedule, scope, technical, security/privacy, third-party service, budget, quality, and user-adoption risks consistently with the charter, proposal, SOW, and backlog.

## 5. Product User Stories

### EPIC 1 — Infrastructure and User Management

#### F-01 — User Registration, Authentication, and Profile Management

- **Priority:** Must (US-AUTH-06 is Should)
- **Objective:** Users can securely access the correct functions and manage their profile.

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-AUTH-01** | As a new landlord, I want to register a Landlord account so that I can manage my rental portfolio in RosiHome. | Requires valid full name, unique email, password and confirmation; rejects invalid/duplicate data safely; stores only a password hash; self-registration creates exactly one `Landlord` role and never both roles. |
| **US-AUTH-02** | As a registered user, I want to log in with valid credentials so that I can access my authorized RosiHome functions. | Active users can log in; failures use a generic error; success returns a JWT and current role; secrets are not exposed in logs or responses. |
| **US-AUTH-03** | As an authenticated user, I want to log out so that another person using the device cannot continue my session. | Logout is available in mobile; protected screens/APIs require authentication again; cached screens reveal no usable private data. |
| **US-AUTH-04** | As a RosiHome user, I want access limited to my role and related rental data so that private information is protected. | Backend returns `401/403` correctly; tenants cannot use landlord functions; landlords see only owned portfolios; tenants see only lease-linked records; changed IDs/payloads cannot bypass checks. |
| **US-AUTH-05** | As an authenticated user, I want to change my password so that I can replace a temporary or compromised credential. | Requires current password except for first temporary-password change; new/confirmed values match policy and differ from old; tenant temporary password must be changed before other access; old password stops working; audit event stores no password. |
| **US-PROFILE-01** | As an authenticated user, I want to view and update my basic profile so that my contact information remains current. | User can view own name, contact/login and role; editable fields are validated; no user can edit another profile or elevate a role. |
| **US-AUTH-06** | As a registered user who forgot my password, I want to receive a new password by email so that I can regain access immediately. | Email-only recovery never reveals account existence; backend generates, hashes and emails a policy-compliant random password; it works immediately without a reset link; previous password and all sessions are revoked; password is not logged. |

### EPIC 2 — Portfolio and Property Setup

#### F-02 — Property and Room Management

- **Priority:** Must (US-ROOM-03 is Should)

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-PROPERTY-01** | As a landlord, I want to create a rental property so that I can manage its rooms in RosiHome. | Authenticated landlord supplies required name/address unique within their portfolio; property is owned by and visible only to that landlord; invalid input creates nothing. |
| **US-PROPERTY-02** | As a landlord, I want to view and update my property details so that the portfolio record stays accurate. | Landlord lists/opens/updates only owned properties; name/address rules remain valid; rejected updates leave stored data unchanged. |
| **US-ROOM-01** | As a landlord, I want to add a room to one of my properties so that it can be used in leasing and billing workflows. | Room can be added only to an owned property; room number/name is required and unique per property; base rent is non-negative; new room is `Vacant`. |
| **US-ROOM-02** | As a landlord, I want to view and update room details and availability so that I can manage my rental units accurately. | Owned rooms show number/name, rent and lease-derived occupancy; valid details can be updated; occupancy cannot be manually overridden; other landlords' rooms are inaccessible. |
| **US-ROOM-03** | As a landlord, I want to add multiple rooms in one operation so that I can set up a property without repeating the same form for every room. | Landlord submits multiple valid rooms for one owned property; duplicate/invalid rows are identified before save; operation follows the approved all-or-nothing rule; created rooms are `Vacant` and totals are reported. |

- **Work estimation:** ~10 hours | ~12,000,000 tokens
#### F-03 — Tenant Information and Account Management

- **Priority:** Must

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-TENANT-01** | As a landlord, I want to view and update tenant information captured during lease creation so that the rental contact record remains current. | Tenant records originate from lease entry, not a separate pre-lease profile; landlord sees/updates only tenants linked to owned leases; validations and account-link integrity are preserved; tenant sees own allowed data. |
| **US-TENANT-02** | As a landlord, I want the system to provision a tenant account when I create the tenant's lease so that the tenant can access RosiHome without self-registering. | Lease creation provisions exactly one `Tenant` account using phone number as username; links it to the tenant/lease; emails a temporary password and mobile-app link; duplicate contact is handled safely; account has one role and must change temporary password. |

#### F-04 — Utility Pricing and Property Surcharges

- **Priority:** Must (US-CHARGE-01 is Should)

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-UTILITY-01** | As a landlord, I want to configure electricity and water rates so that monthly utility charges use my actual pricing rules. | Rates are property-level; electricity is metered per kWh; water is either metered per m³ or a configurable flat monthly amount per tenant; values are non-negative and effective-dated; seeded defaults record source, locality and dates rather than a permanent national constant. |
| **US-UTILITY-02** | As a landlord, I want to view and update utility rates so that future calculations reflect current pricing. | Landlord views/updates only owned-property rates and water method; effective dates prevent silent changes to past calculations; history/audit is retained; no unrelated or expired seed is applied. |
| **US-CHARGE-01** | As a landlord, I want to configure recurring property-wide surcharges so that shared services such as internet appear consistently on tenant invoices. | Owned property accepts named non-negative recurring charges with effective periods; active charges appear once on applicable invoices; edits do not rewrite sent/paid invoices; changes are audited. |

### EPIC 3 — Automated Monthly Billing and Payment

#### F-05 — Utility Meter Reading and Calculation

- **Priority:** Must

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-METER-01** | As a landlord, I want to record the first meter reading for a room so that future monthly consumption has a valid baseline. | Landlord records dated non-negative initial electricity and, when metered, water readings only for owned rooms; duplicates/earlier invalid dates are rejected; flat-water properties require no water baseline. |
| **US-METER-02** | As a landlord, I want to enter current monthly readings and see calculated utility charges so that I can prepare an accurate invoice. | Current metered readings cannot be below previous readings; consumption is difference × effective rate; flat water is monthly rate × lease tenant count and needs no water reading; calculation shows inputs and rounding; owned rooms only. |
| **US-METER-03** | As a landlord, I want to correct an erroneous reading before sending its draft invoice so that the tenant receives an accurate bill without losing accountability. | Only owning landlord can correct a reading while its invoice is `Draft`; draft recalculates deterministically; before/after values, actor, time and reason are audited; sent/paid invoice cannot be silently changed. |

- **Work estimation:** ~8 hours | ~15,000,000 tokens
#### F-06 — Billing and Invoice Generation

- **Priority:** Must

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-INVOICE-01** | As a landlord, I want the system to generate a scheduled draft invoice from rent and new utility readings so that I can review a complete monthly bill before sending it. | Scheduled job creates one `Draft` per active lease/period only when all readings required by that property's methods exist; flat water needs no reading; missing-data rooms are skipped and reported; line items include rent, utilities and active surcharges; duplicates are prevented. |
| **US-INVOICE-02** | As a landlord or assigned tenant, I want to view an itemized invoice so that I understand the amount charged. | Authorized users see period, room, parties, line items, totals, due date and status; tenant sees only explicitly sent invoices; draft is landlord-only; calculations/rounding are consistent. |
| **US-INVOICE-03** | As a landlord or assigned tenant, I want to download an invoice document so that I can retain or share a billing record outside RosiHome. | Authorized user downloads a readable PDF containing invoice identity, parties, itemization, total, due date, status and VietQR when applicable; document matches stored invoice and contains no unrelated data. |
| **US-INVOICE-04** | As a landlord, I want to review and explicitly send a generated draft invoice so that the tenant receives only a bill I have confirmed. | Owning landlord reviews a complete draft, corrects readings if needed, then explicitly sends it; status changes from `Draft` to sent/issued; assigned tenant gains access and receives mobile push once; sent/paid data is immutable except through an audited correction process. |

- **Work estimation:** ~12 hours | ~20,000,000 tokens
#### F-07 — VietQR Payment Integration

- **Priority:** Must

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-VIETQR-01** | As a landlord, I want to maintain the bank details used for VietQR so that tenants transfer payment to the correct account. | Landlord creates/updates validated bank, account number/name and required VietQR data for owned portfolio; sensitive display is limited; changes affect future QR generation and are audited. |
| **US-VIETQR-02** | As an assigned tenant, I want to scan a VietQR code for my invoice so that I do not have to type the landlord's transfer details manually. | Sent unpaid invoice displays scannable VietQR with landlord account, exact amount and stable invoice reference; data matches invoice; unauthorized users cannot obtain it; RosiHome does not hold or process funds. |

#### F-08 — Payment Verification and Tracking

- **Priority:** Must

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-PAYMENT-01** | As an assigned tenant, I want to upload proof for an unpaid invoice so that the landlord can verify my bank transfer. | Assigned tenant uploads an approved image within size limits to a sent unpaid invoice; proof is private, linked and timestamped; invalid upload leaves no orphan file; landlord receives one mobile push. |
| **US-PAYMENT-02** | As a landlord, I want to review payment proof and confirm a received bank transfer so that the invoice and outstanding balance are accurate. | Owning landlord reviews proof and manually verifies bank receipt before confirming; status/amount/time/actor are audited; invoice and balance update once; rejection/duplicate action is safe; tenant receives mobile push; RosiHome never auto-verifies through a gateway. |
| **US-PAYMENT-03** | As a landlord or tenant, I want to view the relevant payment history and unpaid balances so that I can resolve payment questions from a shared record. | Landlord sees owned portfolio and tenant sees only linked records; history shows invoice, amount, dates, status and proof/verification context; unpaid/overdue totals reconcile; archived records remain in authorized history. |

#### F-09 — Rent Payment Reminders

- **Priority:** Should

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-REMINDER-01** | As a tenant, I want to receive a reminder when my invoice is overdue so that I can act on an outstanding payment. | Scheduled process sends mobile push only after due date for sent unpaid invoices; message links to authorized invoice; paid invoices are excluded; reruns do not duplicate the same reminder event. |
| **US-REMINDER-02** | As a landlord, I want to send a reminder for a specific unpaid invoice so that I can follow up without composing a separate message. | Owning landlord sends mobile push for a sent unpaid invoice; assigned tenant receives a safe summary/link; paid/foreign invoices are rejected; actor/time/channel are recorded and duplicate taps are controlled. |

### EPIC 4 — Lease Management and Maintenance Tracking

#### F-10 — Digital Lease Tracking

- **Priority:** Must

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-LEASE-01** | As a landlord, I want to enter tenant information while creating a room lease so that the rental relationship is recorded and the tenant account can be provisioned without a separate profile-creation step. | Owning landlord selects a vacant room and enters tenant identity/contact, start/end dates, rent and terms; dates/rent are valid and active leases cannot overlap; system creates/links tenant record and triggers account provisioning; room becomes `Occupied`; creation is audited. |
| **US-LEASE-02** | As a landlord or assigned tenant, I want to view lease information so that I can refer to the agreed rental period and terms. | Authorized parties see property/room, tenant, dates, rent, terms and status; drafts/internal data follow role rules; unrelated users cannot access the lease. |
| **US-LEASE-03** | As a landlord, I want to update or renew a lease record so that agreed changes and a continued tenancy are reflected in RosiHome. | Owning landlord makes validated future-effective updates/renewal without overlap; historical agreed terms remain traceable; actor/time/before-after values are audited; tenant sees approved current terms. |
| **US-LEASE-04** | As a landlord, I want to end a lease when a tenant moves out so that the room becomes available for a future tenant. | Owning landlord records actual end date/reason; lease becomes ended and room becomes `Vacant`; future billing/reminders stop while history remains; repeated/invalid actions are rejected; action is audited. |

#### F-11 — Automated Lease Renewal Reminders

- **Priority:** Should

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-LEASE-05** | As a landlord or tenant, I want advance notice of a lease expiration so that renewal or move-out can be planned. | Per property, landlord may enable any combination of 30-, 15-, and 7-day reminders; active lease parties receive mobile push at enabled times; ended leases are excluded; reruns do not duplicate an event. |
| **US-LEASE-06** | As a landlord, I want to view leases approaching expiration so that I can follow up with the correct tenants. | Landlord sees active leases in the approved upcoming window with property/room, tenant, date and authorized link; ended and foreign leases are excluded. |

#### F-12 — Maintenance Request Submission

- **Priority:** Must

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-MAINT-01** | As a tenant, I want to submit a maintenance request with photographs so that my landlord has enough information to arrange a repair. | Tenant with active lease submits required title/description for linked room plus 0–3 valid images; request records tenant, room, time and `Pending`; invalid files leave no orphan; landlord receives mobile push; unrelated users have no access. |
| **US-MAINT-02** | As a tenant, I want to view my submitted maintenance requests and current statuses so that I know whether each issue is being handled. | Tenant lists/opens only own linked requests with title, room, date, latest status and accessible photos; changed IDs cannot expose other requests/files. |

#### F-13 — Maintenance Status Tracking

- **Priority:** Must

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-MAINT-03** | As a landlord, I want to review maintenance requests for my properties so that I can decide what action is needed. | Landlord lists/filters/opens requests only for owned properties with issue, room/tenant, time and photos; viewing alone does not change status. |
| **US-MAINT-04** | As a landlord, I want to update a maintenance request's status so that the tenant can follow repair progress. | Owning landlord follows valid `Pending` → `In Progress` → `Completed` transitions; previous/new status, actor and time are audited; tenant sees update and receives one mobile push; repeat does not create false history. |
| **US-MAINT-05** | As a landlord, I want to view a room's maintenance history so that I can understand recurring issues and prior repairs. | Landlord sees owned room's current/completed requests with requester, dates, status and change history; completed/archived records remain visible; foreign rooms are inaccessible. |

### EPIC 5 — Portfolio Performance Monitoring

#### F-14 — Centralized Business Dashboard

- **Priority:** Must

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-DASH-01** | As a landlord, I want to see the number of occupied rooms compared with my total rooms so that I can understand current capacity at a glance. | Shows `occupied / total` active owned rooms; occupied means active lease; no percentage; empty portfolio shows `0 / 0`; other portfolios excluded. |
| **US-DASH-02** | As a landlord, I want to compare expected and collected monthly revenue so that I can understand current rental income. | For an identified month, expected equals applicable invoiced total and collected equals verified-paid total under consistent date/currency/rounding rules; owned data only. |
| **US-DASH-03** | As a landlord, I want to see outstanding amounts and overdue invoices so that I know which payments require follow-up. | Shows reconciled outstanding total and overdue list with tenant/room, due date, amount and authorized link; overdue means unpaid after due date; paid/foreign invoices excluded. |
| **US-DASH-04** | As a landlord, I want upcoming lease expirations on the dashboard so that I can initiate renewal or move-out discussions. | Uses the same window/rules as US-LEASE-06; shows property/room, tenant, date and authorized link; ended/foreign leases excluded. |

- **Work estimation:** ~9 hours | ~10,000,000 tokens
#### F-15 — Monthly Business Report and Analytics

- **Priority:** Should

| ID | User story | Acceptance criteria |
|---|---|---|
| **US-REPORT-01** | As a landlord, I want to generate a report for a month/year or custom date range so that I can analyze performance for a clearly defined period. | Valid month or start/end range produces owned-data report with period, generation time, timezone and landlord; invalid range is rejected; no activity returns structured zero/empty values. |
| **US-REPORT-02** | As a landlord, I want financial and debt metrics in the report so that I can compare expected cash flow with actual collections and identify unpaid amounts. | Shows expected and verified collected revenue broken into rent, electricity, water and surcharges; shows reconciled overdue debt and invoice details; applies consistent date rules; paid/foreign data excluded. |
| **US-REPORT-03** | As a landlord, I want occupancy and tenant-movement metrics in the report so that I can understand property utilization and upcoming lease risk. | Average occupancy = occupied room-days / available active room-days or `N/A`; move-ins/outs use effective dates; upcoming expirations match US-LEASE-06; owned properties only. |
| **US-REPORT-04** | As a landlord, I want maintenance metrics in the report so that I can evaluate request volume and resolution performance. | Counts submissions and completions by their respective timestamps; provides resolution rate and average resolution time or `N/A`; includes only owned-property requests. |
| **US-REPORT-05** | As a landlord, I want to export the generated business report as a PDF so that I can read, archive, or share a stable copy. | Authorized mobile export produces readable PDF with landlord, period, time, currency and all report metrics; empty values do not break layout; foreign data/export is blocked. |

## 6. Backlog Summary

| Category | Count |
|---|---:|
| Epics | 5 |
| Features | 15 |
| User stories | 51 |
| Technical/project tasks | 4 |
| Documentation tasks | 9 |
| **Total implementable/trackable items** | **64** |

User stories count toward product-story throughput. Technical, management, and documentation tasks are tracked separately.

## 7. Regulatory Pricing Notes

- Utility prices are time- and locality-dependent configuration, not permanent constants.
- Electricity seed data must record the applicable official source, locality, tariff structure, and effective dates.
- Water tariffs vary by locality; use the relevant provincial rules or require the landlord to configure a verified rate.
- Never silently use an unrelated or expired default for a billing period.
