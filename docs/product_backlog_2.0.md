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

Every `Items` must satisfy all items below before its status moves to `Done`. Items are grouped by delivery phase so they map onto the workflow in project plan.

- All acceptance criteria pass. Edge cases implied by the AC (empty states, invalid input, missing dependencies) are handled, not just the happy path.
- Authorization and ownership rules are enforced by the backend, not only hidden in the user interface.
- Relevant automated tests pass, including at least the main success path and critical validation/authorization paths.
- No unresolved severity-critical or severity-high defect remains within the story scope.
- Code must pass CI checks before merge. PR has been reviewed and merged according to the team's Git workflow.
- Database migrations and configuration changes required by the story are reproducible.
- The completed behavior has been deployed to and verified in the agreed development/integration environment.
- User-facing and API errors do not expose passwords, tokens, private files, or another landlord's or tenant's data.

### Work estimation basis

- Each task has one **Work estimation** line; each User Story has separate **BE estimation** and **FE estimation** lines.
- Story estimates use the assigned BE/FE workstreams and their calibrated time/token rates from `docs/estimate/Observed Delivery Inputs.md`.
- BE1 uses 2.3 hours/9.0M tokens per story as a workstream average; Lease and Dashboard work keeps the same group totals but distributes them by Final SP and acceptance-criteria complexity.
- FE1 uses 2.0 hours/1.5M tokens per story. FE2 uses the quota-planning allocation below rather than a flat per-story token rate.
- Task time uses an existing task estimate when available; otherwise it uses the approved `52 hours / 84 SP` calibration from `project_estimation.md`.
- `tokens not separately recorded` means the task was included in blended activity or no task-level token measurement exists; no token amount is invented.
- `session-history estimate` is an approximate planning value inferred from the document's size, calculation work, and repeated drafting/revision prompts; it is not measured token telemetry.

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
- **Work estimation:** ~3.1 hours | ~11.000.000 tokens
- **Acceptance criteria:**
  - [ ] The TypeScript Node.js 22/Express monolith provides `/api-docs` and versioned REST routes under `/api/v1`.
  - [ ] Central environment configuration supports PostgreSQL, JWT, Supabase Storage, email, Expo push, public URL, billing dates, and port; secrets remain uncommitted.
  - [ ] PostgreSQL connects through Drizzle; schema, migration, seed, and disposable local integration-test database commands are reproducible.
  - [ ] Zod validation, standard success/error envelopes, redacted error logging, async error handling, JWT access/refresh sessions, forced password change, role checks, and record-ownership checks are applied consistently.
  - [ ] Audit events and soft deletion are implemented for auditable records, and active queries exclude soft-deleted data.
  - [ ] Private Supabase Storage supports maintenance photos and payment proofs through validated uploads and authorized signed URLs.

### TASK-TECH-02 — Set up frontend infrastructure

- **Priority:** Must
- **Work estimation:** ~3 hours | ~22.000.000 tokens
- **Acceptance criteria:**
  - [ ] The mobile project uses Expo SDK 57, React 19, and React Native 0.86, with Android/iOS development and optional Web commands configured.
  - [ ] Expo Router provides typed auth and role-based dashboard routes, including guards for signed-out users, landlord/tenant separation, and forced temporary-password change.
  - [ ] NativeWind theme styles and reusable field/button components support consistent forms, validation messages, and loading states.
  - [ ] The shared REST client reads the configured API base URL, sends JWT authorization, and parses the backend response/error envelope.
  - [ ] Remembered sessions use Expo SecureStore on native platforms, logout clears stored tokens, and an invalid restored access token is removed.
  - [ ] Expo notifications and EAS development, preview, and production profiles are configured.

### TASK-TECH-03 — Set up quality tooling

- **Priority:** Must
- **Work estimation:** ~5.0 hours | tokens not separately recorded
- **Acceptance criteria:**
  - [ ] Backend scripts and Vitest configurations provide unit, API-contract, PostgreSQL integration, coverage, typecheck, and build commands.
  - [ ] A disposable local PostgreSQL test-database helper and integration-test configuration are available.
  - [ ] Coverage reports and thresholds are configured for the selected utility, surcharge, maintenance, and storage modules.
  - [ ] Backend testing instructions and an OpenAPI specification are stored in the repository.
  - [ ] Development interfaces or adapters exist for email, Expo push notifications, Supabase Storage, VietQR, and invoice/report PDF generation.

### TASK-TECH-04 — Set up continuous integration

- **Priority:** Must
- **Work estimation:** ~1.9 hours | ~15.000 tokens
- **Acceptance criteria:**
  - [ ] A GitHub Actions CI workflow runs the complete backend test suite for every pull request targeting `main`.
  - [ ] The workflow uses the backend project's actual working directory and dependency/test commands, and fails when any backend test fails.

### TASK-TECH-05 — Set up continuous deployment to Render

- **Priority:** Must
- **Work estimation:** ~1.5 hours | ~20.000 tokens
- **Acceptance criteria:**
  - [ ] After an approved pull request is merged into `main`, the CD workflow triggers a Render deployment.
  - [ ] The merged revision is deployed successfully to the configured Render service.

### TASK-PM-01 — Manage the team's Trello board

- **Priority:** Must
- **Work estimation:** ~2.1 hours | 0 token
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
- **Work estimation:** ~8.0 hours | tokens not separately recorded
- **Acceptance criteria:**
  - [ ] Title: **Product Backlog: RosiHome Property Management System**.
  - [ ] Includes **Backlog Conventions, Workflow Mapping Reference, Product Decision Record, Epics 1–5, Feature Summary,** and **Regulatory Pricing Notes**.
  - [ ] Defines the hierarchy, status, priority, Definition of Done, audit/deletion rules, dependencies, 15 features, and all 51 user stories with testable acceptance criteria.
  - [ ] Story IDs, scope, workflow mapping, decisions, feature totals, and regulatory references are internally consistent.

### TASK-DOC-05 — Write Product Backlog 2.0

- **Output:** `docs/product_backlog_2.0.md`
- **Priority:** Must
- **Work estimation:** ~8.0 hours | ~350.000 tokens
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
  - [ ] Includes **Project Background, Context, and Overview; Project Objectives; Project Scope; Project Management and Governance; Stakeholder Analysis; Project Facilities and Resources; Major Milestones; Impact Analysis;** and **Assumptions**.
  - [ ] States measurable objectives, in/out scope, ownership, resources, milestones, assumptions, and key risks consistently with the proposal and backlog.

### TASK-DOC-09 — Write the Software Project Estimation document

- **Output:** `docs/project_estimation.md`
- **Priority:** Must
- **Work estimation:** ~10.0 hours | ~550,000 tokens
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
- **Work estimation:** ~2.0 hours | tokens not separately recorded
- **Acceptance criteria:**
  - [ ] Title: **RosiHome Statement of Work**.
  - [ ] Includes **Document Information, Purpose and Agreement, Project Background and Objectives, Scope of Work, Deliverables and Acceptance, Schedule and Milestones, Roles and Responsibilities, Resource and Budget Baseline, Assumptions/Dependencies/Constraints,** and **Change Control**.
  - [ ] Defines verifiable deliverables, acceptance ownership, schedule, responsibilities, constraints, and a practical change process consistent with the charter and backlog.

### TASK-DOC-15 — Write the Vision and Scope document

- **Output:** `docs/vision_and_scope.md`
- **Priority:** Must
- **Work estimation:** ~5.0 hours | ~60.000
- **Acceptance criteria:**
  - [ ] Title: **Vision and Scope Document**.
  - [ ] Includes **Background, Context, and Overview; Current Business Use Cases; Current Domain Model; Current Users' Problems and Objectives; Components and Features to be Developed; Components and Features Excluded; Future Business Use Cases; Business Process Comparison; Future Domain Model; Assumptions; Risks;** and **Conclusion**.
  - [ ] Current/future workflows and domain models are distinguishable, actors and pain points are traceable to features, and exclusions match the MVP backlog.

### TASK-DOC-17 — Write the Risk Management Plan

- **Output:** `docs/risk_management_plan.md`
- **Priority:** Must
- **Work estimation:** ~5.0 hours | tokens not separately recorded
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

#### US-AUTH-01 — Register a landlord account

- **Status:** Refined
- **BE estimation (BE1):** ~1.3 hours | ~5,000,000 tokens
- **FE estimation (FE1):** ~2.0 hours | ~300,000 tokens | 1.5 Lovable credits
- **User story:** As a new landlord, I want to register a Landlord account so that I can manage my rental portfolio in RosiHome.
- **Dependencies:** None.

**Acceptance criteria:**

- [ ] The landlord registration flow requires full name, a unique login identifier (email), password, and password confirmation.
- [ ] Invalid or missing values produce field-level validation errors and no account is created.
- [ ] Duplicate login identifiers (emails) are rejected without revealing sensitive account information.
- [ ] Password and confirmation must match, and the stored password is never persisted or returned as plain text.
- [ ] Successful self-registration creates exactly one account with the `Landlord` role.
- [ ] The registration operation cannot assign both `Landlord` and `Tenant` roles to the same account.

#### US-AUTH-02 — Log in

- **Status:** Refined
- **BE estimation (BE1):** ~3.3 hours | ~12,000,000 tokens
- **FE estimation (FE1):** ~1.5 hours | ~250,000 tokens | 1.5 Lovable credits
- **User story:** As a registered user, I want to log in with valid credentials so that I can access my authorized RosiHome functions.
- **Dependencies:** US-AUTH-01.

**Acceptance criteria:**

- [ ] A registered active user can log in with the supported login identifier and correct password.
- [ ] Invalid credentials return a generic authentication error and do not identify which credential was incorrect.
- [ ] Successful login establishes an authenticated token (JWT) and returns the user's current role information.
- [ ] Passwords and authentication tokens are not exposed in logs or API responses beyond the required authentication response.

#### US-AUTH-03 — Log out

- **Status:** Refined
- **BE estimation (BE1):** ~1.1 hours | ~7,000,000 tokens
- **FE estimation (FE1):** ~0.5 hours | ~100,000 tokens | 0.1 Lovable credits
- **User story:** As an authenticated user, I want to log out so that another person using the device cannot continue my session.
- **Dependencies:** US-AUTH-02.

**Acceptance criteria:**

- [ ] An authenticated user can invoke logout from the mobile application.
- [ ] After logout, protected screens and API operations require authentication again.
- [ ] Revisiting cached protected pages does not reveal usable private data after the session has ended.

#### US-AUTH-04 — Enforce role and data ownership

- **Status:** Refined
- **BE estimation (BE1):** ~1.7 hours | ~3,000,000 tokens
- **FE estimation (FE1):** ~2.0 hours | ~350,000 tokens | 0.0 Lovable credits
- **User story:** As a RosiHome user, I want access limited to my role and related rental data so that private information is protected.
- **Dependencies:** US-AUTH-02 and the relevant domain relationship (property ownership, tenant account link, or active lease).

**Acceptance criteria:**

- [ ] A tenant cannot access landlord-only operations or the business dashboard; the backend returns `403 Forbidden` for an authenticated but unauthorized request.
- [ ] A landlord can access only properties and related records owned by that landlord.
- [ ] A tenant can access only records linked to that tenant account through the approved tenant/lease relationship.
- [ ] Changing a URL, identifier, or request payload cannot bypass role or ownership checks.
- [ ] An unauthenticated request to a protected operation is rejected according to the API authentication convention.

#### US-AUTH-05 — Change password

- **Status:** Refined
- **BE estimation (BE1):** ~1.5 hours | ~5,000,000 tokens
- **FE estimation (FE1):** ~2.0 hours | ~350,000 tokens | 1.5 Lovable credits
- **User story:** As an authenticated user, I want to change my password so that I can replace a temporary or compromised credential.
- **Dependencies:** US-AUTH-02.

**Acceptance criteria:**

- [ ] A user changing an established password must provide the correct current password, a new password, and password confirmation.
- [ ] The new password and confirmation must match and satisfy the approved password policy.
- [ ] The new password cannot be the same as the current password.
- [ ] A tenant who signs in with a temporary password is required to set a new password before accessing other protected product functions.
- [ ] After a successful change, the temporary/previous password no longer authenticates the user.
- [ ] The password change is recorded as a security audit event without storing either password value.

#### US-PROFILE-01 — View and update a user profile

- **Status:** Refined
- **BE estimation (BE1):** ~2.5 hours | ~7,000,000 tokens
- **FE estimation (FE1):** ~2.0 hours | ~350,000 tokens | 2.0 Lovable credits
- **User story:** As an authenticated user, I want to view and update my basic profile so that my contact information remains current.
- **Dependencies:** US-AUTH-02.

**Acceptance criteria:**

- [ ] The user can view their own full name, login/contact information, and role.
- [ ] The user can update the profile fields approved as editable by the team.
- [ ] Required formats and uniqueness rules are validated before an update is saved.
- [ ] The user cannot change another user's profile or elevate their own role through the profile operation.

#### US-AUTH-06 — Recover a forgotten password

- **Status:** Refined
- **Priority:** Should Have
- **BE estimation (BE1):** ~4.5 hours | ~14,000,000 tokens
- **FE estimation (FE1):** ~1.5 hours | ~250,000 tokens | 1.5 Lovable credits
- **User story:** As a registered user who forgot my password, I want to receive a new password by email so that I can regain access immediately.
- **Dependencies:** US-AUTH-01 and an approved transactional-email provider.

**Acceptance criteria:**

- [ ] The recovery request does not reveal whether a submitted identifier belongs to an account.
- [ ] The backend generates a new random password that satisfies the approved password policy, stores its hash, and delivers it only to the email address associated with the account.
- [ ] The user can log in immediately with the emailed password (no reset link / second step required).
- [ ] All outstanding sessions (refresh tokens) for the account are revoked, forcing re-login on every device.
- [ ] The previous password no longer authenticates the user after the new password is issued.
- [ ] The new password is never written to application logs.


### EPIC 2 — Portfolio and Property Setup

#### F-02 — Property and Room Management

- **Priority:** Must (US-ROOM-03 is Should)

#### US-PROPERTY-01 — Create a property

- **Status:** Refined
- **BE estimation (BE2):** ~1.4 hours | ~1,260,000 tokens
- **FE estimation (FE2):** ~1.8 hours | ~8,000,000 tokens
- **User story:** As a landlord, I want to create a rental property so that I can manage its rooms in RosiHome.
- **Dependencies:** US-AUTH-04.

**Acceptance criteria:**

- [ ] Only an authenticated landlord can create a property.
- [ ] Property name and address are required (unique per landlord); missing or invalid values prevent creation and produce validation errors.
- [ ] The created property is associated with the authenticated landlord.
- [ ] The new property appears in that landlord's property list and is not visible to another landlord.
- [ ] Creating rooms, editing, and archiving a property are outside this story.

#### US-PROPERTY-02 — View and update owned properties

- **Status:** Refined
- **BE estimation (BE2):** ~1.4 hours | ~1,260,000 tokens
- **FE estimation (FE2):** ~1.9 hours | ~8,500,000 tokens
- **User story:** As a landlord, I want to view and update my property details so that the portfolio record stays accurate.
- **Dependencies:** US-PROPERTY-01.

**Acceptance criteria:**

- [ ] The landlord can list and open details for properties they own.
- [ ] The landlord can update editable basic details, including property name and address.
- [ ] Invalid updates are rejected without changing the stored property (check unique name and address per landlord before saving).
- [ ] The landlord cannot view or update another landlord's property.
- [ ] Property deletion/archival is outside this story unless separately approved.

#### US-ROOM-01 — Add a room to a property

- **Status:** Refined
- **BE estimation (BE2):** ~1.4 hours | ~1,260,000 tokens
- **FE estimation (FE2):** ~1.6 hours | ~7,500,000 tokens
- **User story:** As a landlord, I want to add a room to one of my properties so that it can be used in leasing and billing workflows.
- **Dependencies:** US-PROPERTY-01.

**Acceptance criteria:**

- [ ] The landlord can add a room only to a property they own.
- [ ] Room name/number and base rent are required.
- [ ] Room name/number is unique within the selected property.
- [ ] Base rent must be a valid non-negative monetary amount.
- [ ] A newly created room has no active lease and is displayed as `Vacant`.

#### US-ROOM-02 — View and update room information

- **Status:** Refined
- **BE estimation (BE2):** ~1.4 hours | ~1,260,000 tokens
- **FE estimation (FE2):** ~1.6 hours | ~7,500,000 tokens
- **User story:** As a landlord, I want to view and update room details and availability so that I can manage my rental units accurately.
- **Dependencies:** US-ROOM-01.

**Acceptance criteria:**

- [ ] The landlord can view the rooms belonging to each owned property, including room name/number, base rent, and derived occupancy status.
- [ ] The landlord can update editable room details while preserving uniqueness and monetary validation rules.
- [ ] Occupancy is shown as `Occupied` when the room has an active lease and `Vacant` otherwise.
- [ ] The landlord cannot directly override an occupancy status that conflicts with the active lease relationship.
- [ ] The landlord cannot view or update a room belonging to another landlord.

#### US-ROOM-03 — Add multiple rooms to a property

- **Status:** Refined
- **BE estimation (BE2):** ~1.4 hours | ~1,260,000 tokens
- **FE estimation (FE2):** ~2.0 hours | ~8,500,000 tokens
- **User story:** As a landlord, I want to add multiple rooms in one operation so that I can set up a property without repeating the same form for every room.
- **Dependencies:** US-PROPERTY-01.

**Acceptance criteria:**

- [ ] The landlord can add a bounded list of rooms only to a property they own.
- [ ] Each row requires a room name/number (default automatically numbering) and a valid non-negative base rent.
- [ ] Room names/numbers must be unique both within the submitted list and among active rooms in the selected property.
- [ ] Validation errors identify the affected rows before records are created.
- [ ] The operation is atomic: either every valid submitted room is created or none are created when any row fails validation.
- [ ] Every created room starts as `Vacant` and is attributable to the authenticated landlord in the audit trail.

#### F-03 — Tenant Information and Account Management

- **Priority:** Must

#### US-TENANT-01 — View and update tenant information created from a lease

- **Status:** Refined
- **BE estimation (BE1):** ~2.5 hours | ~5,000,000 tokens
- **FE estimation (FE1):** ~2.5 hours | ~400,000 tokens | 1.5 Lovable credits
- **User story:** As a landlord, I want to view and update tenant information captured during lease creation so that the rental contact record remains current.
- **Dependencies:** US-LEASE-01.

**Acceptance criteria:**

- [ ] The landlord can list and open tenant information derived from leases within their own portfolio.
- [ ] The landlord can update approved profile and contact fields.
- [ ] Email, phone number, and identification-number format/uniqueness rules are enforced on update.
- [ ] An update to a login-related phone number or email follows the approved account-identity synchronization and verification rules.
- [ ] The landlord cannot view or modify tenant information associated only with another landlord.
- [ ] Archiving/removing a tenant relationship uses soft deletion and preserves lease, invoice, payment, and audit history.

#### US-TENANT-02 — Provision a tenant account from a lease

- **Status:** Refined
- **BE estimation (BE1):** ~4.5 hours | ~12,000,000 tokens
- **FE estimation (FE1):** ~2.0 hours | ~350,000 tokens | 2.0 Lovable credits
- **User story:** As a landlord, I want the system to provision a tenant account when I create the tenant's lease so that the tenant can access RosiHome without self-registering.
- **Dependencies:** US-LEASE-01 and an approved transactional-email provider.

**Acceptance criteria:**

- [ ] Lease creation requires the tenant's full name, phone number, identification number, and email address before account provisioning.
- [ ] The system provisions exactly one account with the `Tenant` role and uses the tenant's phone number as the username.
- [ ] The same phone number, email address, tenant information record, or lease event cannot provision a duplicate account.
- [ ] The system generates a temporary password that is not exposed in application logs or stored as plain text.
- [ ] The tenant receives an email containing the username, temporary password, and mobile-app link.
- [ ] The tenant is required to replace the temporary password through US-AUTH-05 at first successful login.
- [ ] The provisioned account cannot also hold the `Landlord` role and can access only data linked through its tenant information record and lease.


#### F-04 — Utility Pricing and Property Surcharges

- **Priority:** Must (US-CHARGE-01 is Should)

#### US-UTILITY-01 — Configure utility rates

- **Status:** Refined
- **BE estimation (BE3):** ~2.0 hours | ~750,000 tokens
- **FE estimation (FE2):** ~2.0 hours | ~8,500,000 tokens
- **User story:** As a landlord, I want to configure electricity and water rates so that monthly utility charges use my actual pricing rules.
- **Dependencies:** US-PROPERTY-01.

**Acceptance criteria:**

- [ ] The landlord can configure one electricity price per kWh for an owned property.
- [ ] For each property, the landlord can select exactly one water billing method: `Metered per m³` or `Flat amount per tenant per month`.
- [ ] Metered water requires a valid price per cubic metre; flat water requires a valid monthly amount per tenant (for example, VND 100,000 per tenant for unlimited usage).
- [ ] Every rate must be a valid non-negative monetary amount and include its unit/method.
- [ ] The landlord cannot create or change rates for another landlord's property.
- [ ] A saved configuration identifies the property and effective time from which the rate applies.
- [ ] The `effectiveFrom` date must be strictly in the future (greater than today). Rates for the current day or past cannot be edited to protect billing history.
- [ ] There can be at most one future/upcoming rate scheduled per property. If one already exists, a new submission will overwrite it.
- [ ] When a property has no landlord-defined rate, the system can use only an applicable developer-seeded default whose source, locality, and effective date are recorded.

#### US-UTILITY-02 — View and update utility rates

- **Status:** Refined
- **BE estimation (BE3):** ~2.0 hours | ~700,000 tokens
- **FE estimation (FE2):** ~1.6 hours | ~7,500,000 tokens
- **User story:** As a landlord, I want to view and update utility rates so that future calculations reflect current pricing.
- **Dependencies:** US-UTILITY-01.

**Acceptance criteria:**

- [ ] The landlord can view the effective electricity and water rates for each owned property.
- [ ] The landlord can update a rate after the same validation and ownership rules used at creation.
- [ ] A rate change does not silently recalculate an already finalized invoice.
- [ ] New calculations for every room in the property use the effective property-level rates.

#### US-CHARGE-01 — Configure recurring property surcharges

- **Status:** Refined
- **BE estimation (BE3):** ~1.0 hours | ~500,000 tokens
- **FE estimation (FE2):** ~1.4 hours | ~6,500,000 tokens
- **User story:** As a landlord, I want to configure recurring property-wide surcharges so that shared services such as internet appear consistently on tenant invoices.
- **Dependencies:** US-PROPERTY-01.

**Acceptance criteria:**

- [ ] The landlord can create a surcharge only for a property they own, with a name, non-negative monthly amount, effective start date, and optional end date.
- [ ] An active surcharge applies to each applicable active lease/invoice in that property for the covered billing period (for example, a VND 500,000 internet surcharge per tenant invoice).
- [ ] The surcharge appears as a separate named invoice line item rather than being merged into rent or utility consumption.
- [ ] The landlord can update or deactivate a surcharge prospectively; the change does not silently modify a `Sent` or `Paid` invoice.
- [ ] Duplicate active surcharge names within the same property and overlapping effective period are rejected.
- [ ] Deactivation uses soft deletion/status history and records the responsible landlord and time.


### EPIC 3 — Automated Monthly Billing and Payment

#### F-05 — Utility Meter Reading and Calculation

- **Priority:** Must

#### US-METER-01 — Record an initial meter reading

- **Status:** Refined
- **BE estimation (BE2):** ~1.9 hours | ~1,857,143 tokens
- **FE estimation (FE2):** ~1.5 hours | ~7,000,000 tokens
- **User story:** As a landlord, I want to record the first meter reading for a room so that future monthly consumption has a valid baseline.
- **Dependencies:** US-ROOM-01.

**Acceptance criteria:**

- [ ] The landlord can select a room they own and a billing period without an existing reading.
- [ ] Electricity and, when the property uses metered water, water readings accept only valid non-negative values in their configured units.
- [ ] The initial reading is stored as a baseline and does not create negative or invented consumption.
- [ ] The system prevents duplicate meter records for the same room, utility, and billing period.
- [ ] The landlord cannot record readings for another landlord's room.

#### US-METER-02 — Record monthly readings and calculate consumption

- **Status:** Refined
- **BE estimation (BE2):** ~1.9 hours | ~1,857,143 tokens
- **FE estimation (FE2):** ~2.1 hours | ~9,000,000 tokens
- **User story:** As a landlord, I want to enter current monthly readings and see calculated utility charges so that I can prepare an accurate invoice.
- **Dependencies:** US-METER-01 and US-UTILITY-01.

**Acceptance criteria:**

- [ ] The landlord can enter the current electricity reading and, when the property uses `Metered per m³`, the current water reading for a room and billing period.
- [ ] The system displays and uses the immediately preceding applicable readings.
- [ ] A current reading lower than its previous reading is rejected with a field-level error.
- [ ] Consumption equals current reading minus previous reading for metered utilities.
- [ ] Electricity charge equals electricity consumption multiplied by the effective property-level electricity rate, using the approved monetary rounding rule.
- [ ] Under `Metered per m³`, water charge equals water consumption multiplied by the effective property-level water rate.
- [ ] Under `Flat amount per tenant per month`, water charge equals the configured flat amount multiplied by the active tenant count for the lease/room; water-meter consumption is not used for the charge.
- [ ] If no landlord-defined rate exists, the calculation uses the developer-seeded default applicable to the property's locality and billing-period date; it must not silently use an expired or different-locality default.
- [ ] Developer-seeded electricity defaults reference the official rules applicable to rental electricity at their effective date; metered water defaults reference the tariff approved for the relevant province/city.
- [ ] The saved result retains the inputs, billing method, rates, rate source/version, locality, and effective date needed to reproduce the calculation.

#### US-METER-03 — Correct a reading used for billing

- **Status:** Refined
- **BE estimation (BE2):** ~1.9 hours | ~1,857,143 tokens
- **FE estimation (FE2):** ~2.4 hours | ~10,000,000 tokens
- **User story:** As a landlord, I want to correct an erroneous reading before sending its draft invoice so that the tenant receives an accurate bill without losing accountability.
- **Dependencies:** US-METER-02 and US-INVOICE-01.

**Acceptance criteria:**

- [ ] Only the landlord who owns the room can request a correction.
- [ ] A reading can be corrected when its generated invoice is still `Draft`; a `Sent` or `Paid` invoice is not silently changed through this operation.
- [ ] The correction preserves the original value, corrected value, change time, and responsible landlord.
- [ ] The system revalidates reading order and recalculates affected charges consistently.
- [ ] The associated draft invoice is recalculated from the corrected reading and retains exactly one invoice for the room/lease and billing period.
- [ ] The landlord can review the recalculated draft before sending it through US-INVOICE-04.

#### F-06 — Billing and Invoice Generation

- **Priority:** Must

#### US-INVOICE-01 — Generate a monthly invoice

- **Status:** Refined
- **BE estimation (BE2):** ~1.9 hours | ~1,857,143 tokens
- **FE estimation (FE1):** ~5.0 hours | ~900,000 tokens | 1.5 Lovable credits
- **User story:** As a landlord, I want the system to generate a scheduled draft invoice from rent and new utility readings so that I can review a complete monthly bill before sending it.
- **Dependencies:** US-LEASE-01, US-METER-02, US-UTILITY-01, US-CHARGE-01 when recurring surcharges apply, and a scheduled-job baseline.

**Acceptance criteria:**

- [ ] At the configured billing schedule, the system evaluates each room with an active lease for the target billing period.
- [ ] A draft invoice is generated only when every new reading required by the property's configured billing methods exists for that room and billing period.
- [ ] Flat per-tenant water billing does not require a water reading; its charge uses the active tenant count and configured flat amount.
- [ ] If a required new reading is absent, the room is skipped without creating an incomplete invoice; the skip reason is recorded for the landlord.
- [ ] An invoice can be generated only for a billing period not already invoiced for that lease/room.
- [ ] The invoice stores an itemized breakdown of base rent, electricity, water, each applicable recurring property surcharge, total amount, billing period, issue date, and due date.
- [ ] Each surcharge is snapshotted as a separate named line item using the configuration effective for that property and billing period.
- [ ] The total equals the sum of its stored line items using the approved monetary rounding rule.
- [ ] Repeating the same generation action does not create a duplicate invoice.
- [ ] A newly generated invoice has status `Draft` and is not yet visible to the tenant.

#### US-INVOICE-02 — View an invoice

- **Status:** Refined
- **BE estimation (BE2):** ~1.9 hours | ~1,857,143 tokens
- **FE estimation (FE1):** ~4.0 hours | ~700,000 tokens | 1.5 Lovable credits
- **User story:** As a landlord or assigned tenant, I want to view an itemized invoice so that I understand the amount charged.
- **Dependencies:** US-INVOICE-01 and US-AUTH-04.

**Acceptance criteria:**

- [ ] The landlord can view invoices for leases in owned properties.
- [ ] The assigned tenant can view only `Sent` or `Paid` invoices linked to their tenant account/lease; draft invoices are landlord-only.
- [ ] The invoice displays its billing period, line items, total, due date, and payment status.
- [ ] An unrelated landlord or tenant cannot access the invoice by changing its identifier.

#### US-INVOICE-03 — Download an invoice document

- **Status:** Refined
- **Priority:** Must Have
- **BE estimation (BE2):** ~1.9 hours | ~1,857,143 tokens
- **FE estimation (FE1):** ~4.0 hours | ~800,000 tokens | 1.5 Lovable credits
- **User story:** As a landlord or assigned tenant, I want to download an invoice document so that I can retain or share a billing record outside RosiHome.
- **Dependencies:** US-INVOICE-02 and PDF-generation baseline.

**Acceptance criteria:**

- [ ] An authorized landlord can download a PDF for an owned invoice; an assigned tenant can download a PDF only after the invoice has been sent.
- [ ] The downloaded document contains the same billing identity, line items, total, due date, and status shown in the application.
- [ ] The document does not expose data from another property, lease, tenant, or invoice.
- [ ] An unauthorized download request is rejected by the backend.

#### US-INVOICE-04 — Review and send a draft invoice

- **Status:** Refined
- **BE estimation (BE2):** ~1.9 hours | ~1,857,143 tokens
- **FE estimation (FE1):** ~2.0 hours | ~300,000 tokens | 2.0 Lovable credits
- **User story:** As a landlord, I want to review and explicitly send a generated draft invoice so that the tenant receives only a bill I have confirmed.
- **Dependencies:** US-INVOICE-01 and US-METER-03 when a correction is required.

**Acceptance criteria:**

- [ ] The landlord can open and review a draft invoice only for a lease in an owned property.
- [ ] The draft displays the readings, effective rates, line items, total, billing period, and due date used in its calculation.
- [ ] Sending changes the invoice status from `Draft` to `Sent` exactly once and records the sender and sent time.
- [ ] After sending, the assigned tenant can view the invoice and receives a mobile push notification linking to it.
- [ ] An invoice with missing required data or a status other than `Draft` cannot be sent through this operation.
- [ ] Sending does not mark the invoice as paid; payment still requires the verification workflow.

#### F-07 — VietQR Payment Integration

- **Priority:** Must

#### US-VIETQR-01 — Configure landlord payment details

- **Status:** Refined
- **BE estimation (BE3):** ~2.0 hours | ~10,000,000 tokens
- **FE estimation (FE2):** ~1.6 hours | ~7,500,000 tokens
- **User story:** As a landlord, I want to maintain the bank details used for VietQR so that tenants transfer payment to the correct account.
- **Dependencies:** US-PROFILE-01.

**Acceptance criteria:**

- [ ] The landlord can enter and update the bank identifier, account number, and approved account-holder information required by the VietQR generator.
- [ ] Required fields are validated before the configuration is saved.
- [ ] The landlord can view and change only their own payment configuration.
- [ ] Bank details are not displayed to unrelated users and are not exposed in application logs.

#### US-VIETQR-02 — Generate and display an invoice VietQR code

- **Status:** Refined
- **BE estimation (BE3):** ~2.0 hours | ~12,000,000 tokens
- **FE estimation (FE2):** ~2.2 hours | ~9,000,000 tokens
- **User story:** As an assigned tenant, I want to scan a VietQR code for my invoice so that I do not have to type the landlord's transfer details manually.
- **Dependencies:** US-INVOICE-01 and US-VIETQR-01.

**Acceptance criteria:**

- [ ] A QR code is generated for an authorized, payable invoice.
- [ ] The payload uses the invoice landlord's configured bank account, exact invoice amount, and a deterministic transfer description identifying the invoice/room and billing period.
- [ ] The encoded amount and transfer description match the values displayed beside the QR code.
- [ ] The QR payload follows the selected VietQR specification and is verified with at least one supported banking/QR validation method before the story is accepted.
- [ ] Generating or scanning the QR code does not mark the invoice as paid and does not cause RosiHome to hold or transfer money.


#### F-08 — Payment Verification and Tracking

- **Priority:** Must

#### US-PAYMENT-01 — Upload payment proof

- **Status:** Refined
- **BE estimation (BE3):** ~1.5 hours | ~800,000 tokens
- **FE estimation (FE2):** ~3.0 hours | ~12,000,000 tokens
- **User story:** As an assigned tenant, I want to upload proof for an unpaid invoice so that the landlord can verify my bank transfer.
- **Dependencies:** US-INVOICE-02 and file storage baseline.

**Acceptance criteria:**

- [ ] The assigned tenant can upload one of the approved image formats (`.png`, `.jpg`, `.jpeg`) up to 5 MB for an accessible unpaid invoice.
- [ ] Unsupported, oversized, empty, or invalid uploads are rejected without attaching a file.
- [ ] The proof is associated with the tenant, invoice, upload time, and a verification-pending state.
- [ ] Another tenant cannot view, replace, or submit proof for the invoice.
- [ ] The owning landlord can access the proof through an authorized request.
- [ ] A successful upload sends the owning landlord a mobile push notification linking to the pending proof.

#### US-PAYMENT-02 — Verify payment manually

- **Status:** Refined
- **BE estimation (BE3):** ~1.0 hours | ~600,000 tokens
- **FE estimation (FE2):** ~2.4 hours | ~9,500,000 tokens
- **User story:** As a landlord, I want to review payment proof and confirm a received bank transfer so that the invoice and outstanding balance are accurate.
- **Dependencies:** US-PAYMENT-01.

**Acceptance criteria:**

- [ ] The landlord can list pending proofs only for invoices in owned properties.
- [ ] The landlord can open the submitted proof and relevant invoice information before deciding.
- [ ] Confirming payment creates or updates a payment record and marks the invoice `Paid` exactly once.
- [ ] A repeated confirmation does not duplicate the payment amount or history entry.
- [ ] The system records who verified the payment and when.
- [ ] RosiHome does not claim automatic bank verification; confirmation remains a landlord action.

#### US-PAYMENT-03 — View payment history and outstanding balances

- **Status:** Refined
- **BE estimation (BE3):** ~1.0 hours | ~400,000 tokens
- **FE estimation (FE2):** ~1.9 hours | ~8,000,000 tokens
- **User story:** As a landlord or tenant, I want to view the relevant payment history and unpaid balances so that I can resolve payment questions from a shared record.
- **Dependencies:** US-INVOICE-01, US-PAYMENT-02, and US-AUTH-04.

**Acceptance criteria:**

- [ ] A landlord can view invoice/payment history and outstanding balances for owned properties.
- [ ] A tenant can view only their own invoice/payment history and outstanding balances.
- [ ] Each history entry identifies the invoice, amount, billing period, payment status, and verification date when paid.
- [ ] Outstanding totals include unpaid amounts and exclude amounts already verified as paid.
- [ ] Unrelated users cannot access the history by changing request parameters or identifiers.


#### F-09 — Rent Payment Reminders

- **Priority:** Should

#### US-REMINDER-01 — Receive an automatic overdue-payment reminder

- **Status:** Refined
- **BE estimation (BE3):** ~0.8 hours | ~400,000 tokens
- **FE estimation (FE2):** ~1.2 hours | ~5,500,000 tokens
- **User story:** As a tenant, I want to receive a reminder when my invoice is overdue so that I can act on an outstanding payment.
- **Dependencies:** US-INVOICE-04 and a mobile push-notification service.

**Acceptance criteria:**

- [ ] The system identifies an invoice as overdue only when its due date has passed and it is not paid.
- [ ] A reminder identifies the relevant invoice, amount due, and due date without exposing another tenant's information.
- [ ] A paid invoice is not included in a subsequent overdue-reminder run.
- [ ] The landlord can configure the mobile reminder schedule allowed by the product.
- [ ] Re-running a scheduled job does not create duplicate reminders outside the configured reminder frequency.
- [ ] Delivery uses mobile push notification only and records delivery status where supported.

#### US-REMINDER-02 — Send a manual payment reminder

- **Status:** Refined
- **BE estimation (BE3):** ~1.2 hours | ~550,000 tokens
- **FE estimation (FE2):** ~1.5 hours | ~6,500,000 tokens
- **User story:** As a landlord, I want to send a reminder for a specific unpaid invoice so that I can follow up without composing a separate message.
- **Dependencies:** US-INVOICE-02 and a mobile push-notification service.

**Acceptance criteria:**

- [ ] The landlord can trigger a reminder only for an unpaid invoice in an owned property.
- [ ] The tenant receives a mobile push notification containing the invoice reference, outstanding amount, and due date
- [ ] The action records the trigger time and responsible landlord.
- [ ] The operation is rejected if the invoice is already paid or does not belong to the landlord.


### EPIC 4 — Lease Management and Maintenance Tracking

#### F-10 — Digital Lease Tracking

- **Priority:** Must

#### US-LEASE-01 — Create a digital lease

- **Status:** Refined
- **BE estimation (BE1):** ~3.0 hours | ~11,700,000 tokens
- **FE estimation (FE1):** ~6.0 hours | ~1,200,000 tokens | 3.0 Lovable credits
- **User story:** As a landlord, I want to enter tenant information while creating a room lease so that the rental relationship is recorded and the tenant account can be provisioned without a separate profile-creation step.
- **Dependencies:** US-ROOM-01 and an approved transactional-email provider for subsequent account provisioning.

**Acceptance criteria:**

- [ ] The landlord can select only a room within their own portfolio and enters the tenant's full name, phone number, identification number, and mandatory email address as part of the lease flow.
- [ ] Email, phone number, and identification number are validated and checked against active tenant/account records before the lease is created.
- [ ] Start date, end date, agreed rent, and deposit are required and validated; end date must be after start date.
- [ ] The system rejects a lease whose active period conflicts with another lease for the same room.
- [ ] Successful submission atomically creates the tenant information record and lease; there is no standalone “create tenant profile” prerequisite.
- [ ] Creating a currently active lease causes the room's derived status to be `Occupied`.
- [ ] The lease stores the tenant, room, period, agreed rent, deposit, creator, and current status.
- [ ] Successful lease creation triggers tenant-account provisioning through US-TENANT-02; a retryable email failure does not create a duplicate tenant account or lease.
- [ ] This feature stores lease information only; legally binding electronic signing is outside the current product development scope.

#### US-LEASE-02 — View lease information

- **Status:** Refined
- **BE estimation (BE1):** ~1.2 hours | ~4,700,000 tokens
- **FE estimation (FE1):** ~2.0 hours | ~300,000 tokens | 2.0 Lovable credits
- **User story:** As a landlord or assigned tenant, I want to view lease information so that I can refer to the agreed rental period and terms.
- **Dependencies:** US-LEASE-01 and US-TENANT-02 for tenant access.

**Acceptance criteria:**

- [ ] A landlord can view leases belonging to owned properties.
- [ ] A linked tenant can view only leases associated with their tenant information record/account.
- [ ] The view shows the room, lease period, agreed rent, deposit, and status.
- [ ] Unrelated landlords and tenants cannot access the lease by changing its identifier.

#### US-LEASE-03 — Update or renew a lease

- **Status:** Refined
- **BE estimation (BE1):** ~3.0 hours | ~11,700,000 tokens
- **FE estimation (FE1):** ~2.0 hours | ~350,000 tokens | 1.5 Lovable credits
- **User story:** As a landlord, I want to update or renew a lease record so that agreed changes and a continued tenancy are reflected in RosiHome.
- **Dependencies:** US-LEASE-01.

**Acceptance criteria:**

- [ ] The landlord can update an owned lease's approved editable terms or record a renewal period.
- [ ] Updated/renewed dates and monetary values follow the same validation rules as lease creation.
- [ ] The system prevents a changed or renewed period from overlapping another lease for the room.
- [ ] The tenant can view the updated current lease information after it is saved.
- [ ] The operation records the latest update time and responsible landlord.

#### US-LEASE-04 — End a lease and release a room

- **Status:** Refined
- **BE estimation (BE1):** ~1.8 hours | ~7,100,000 tokens
- **FE estimation (FE1):** ~4.0 hours | ~800,000 tokens | 1.0 Lovable credits
- **User story:** As a landlord, I want to end a lease when a tenant moves out so that the room becomes available for a future tenant.
- **Dependencies:** US-LEASE-01.

**Acceptance criteria:**

- [ ] Only the owning landlord can end the lease.
- [ ] The operation records an actual end date and an ended/expired status transition without deleting historical lease information; any later archive operation uses soft deletion.
- [ ] A room with no other active lease is displayed as `Vacant` after the lease ends.
- [ ] A room is not released if another valid active lease still applies.
- [ ] Ending a lease does not delete historical invoices, payments, readings, or maintenance records.


#### F-11 — Automated Lease Renewal Reminders

- **Priority:** Should

#### US-LEASE-05 — Receive a lease-expiration reminder

- **Status:** Refined
- **BE estimation (BE1):** ~3.0 hours | ~11,700,000 tokens
- **FE estimation (FE1):** ~3.0 hours | ~500,000 tokens | 1.0 Lovable credits
- **User story:** As a landlord or tenant, I want advance notice of a lease expiration so that renewal or move-out can be planned.
- **Dependencies:** US-LEASE-01 and a mobile push-notification service.

**Acceptance criteria:**

- [ ] A scheduled process evaluates active lease expiration dates at least daily.
- [ ] Only the owning landlord and assigned tenant receive a reminder for the lease.
- [ ] The reminder identifies the relevant room and expiration date.
- [ ] An ended or already expired lease does not receive a future-expiration reminder.
- [ ] For each owned property, the landlord can enable any combination of reminders at exactly 30, 15, and 7 days before lease expiration.
- [ ] A property's reminder configuration applies only to active leases in that property.
- [ ] Each enabled reminder is delivered as a mobile push notification to the owning landlord and assigned tenant.
- [ ] Re-running the scheduled process does not duplicate a reminder already sent for the same lease and configured reminder time.

#### US-LEASE-06 — View upcoming lease expirations

- **Status:** Refined
- **BE estimation (BE1):** ~1.8 hours | ~7,100,000 tokens
- **FE estimation (FE1):** ~2.0 hours | ~400,000 tokens | 1.5 Lovable credits
- **User story:** As a landlord, I want to view leases approaching expiration so that I can follow up with the correct tenants.
- **Dependencies:** US-LEASE-01.

**Acceptance criteria:**

- [ ] The landlord can view active leases expiring within the team's approved upcoming-expiration window.
- [ ] Each item shows the property/room, tenant, and expiration date and links to the accessible lease record.
- [ ] Results contain only leases in the landlord's portfolio.
- [ ] Ended leases are not presented as upcoming expirations.


#### F-12 — Maintenance Request Submission

- **Priority:** Must

#### US-MAINT-01 — Submit a maintenance request

- **Status:** Refined
- **BE estimation (BE3):** ~2.0 hours | ~11,000,000 tokens
- **FE estimation (FE2):** ~3.0 hours | ~12,000,000 tokens
- **User story:** As a tenant, I want to submit a maintenance request with photographs so that my landlord has enough information to arrange a repair.
- **Dependencies:** US-TENANT-02, an active lease, and file storage baseline.

**Acceptance criteria:**

- [ ] A tenant with an applicable active lease can submit a request for the associated room.
- [ ] Title and detailed description are required.
- [ ] The tenant can attach zero to three photographs using the approved image formats and file-size limit selected by the team.
- [ ] Invalid files are rejected without creating inaccessible/orphaned attachments.
- [ ] A successful request records the tenant, room, submission time, and initial `Pending` status.
- [ ] The owning landlord can access the new request; unrelated users cannot.
- [ ] A successful submission sends the owning landlord a mobile push notification linking to the request.

#### US-MAINT-02 — View submitted maintenance requests

- **Status:** Refined
- **BE estimation (BE3):** ~2.0 hours | ~10,000,000 tokens
- **FE estimation (FE2):** ~1.8 hours | ~7,000,000 tokens
- **User story:** As a tenant, I want to view my submitted maintenance requests and current statuses so that I know whether each issue is being handled.
- **Dependencies:** US-MAINT-01.

**Acceptance criteria:**

- [ ] The tenant can list and open only requests submitted through their own tenant relationship.
- [ ] Each item shows the title, room, submission date, current status, and available photographs.
- [ ] The displayed status matches the latest landlord status update.
- [ ] Changing an identifier cannot expose another tenant's request or attachment.


#### F-13 — Maintenance Status Tracking

- **Priority:** Must

#### US-MAINT-03 — Review maintenance requests

- **Status:** Refined
- **BE estimation (BE3):** ~2.0 hours | ~10,000,000 tokens
- **FE estimation (FE2):** ~2.0 hours | ~7,500,000 tokens
- **User story:** As a landlord, I want to review maintenance requests for my properties so that I can decide what action is needed.
- **Dependencies:** US-MAINT-01.

**Acceptance criteria:**

- [ ] The landlord can list requests for owned properties and filter or group them by status.
- [ ] The landlord can open the description, room/tenant context, submission time, and accessible photographs.
- [ ] Requests from another landlord's properties are not returned or accessible.
- [ ] Reviewing a request alone does not silently mark it completed.

#### US-MAINT-04 — Update maintenance status

- **Status:** Refined
- **BE estimation (BE3):** ~3.0 hours | ~15,000,000 tokens
- **FE estimation (FE2):** ~2.5 hours | ~10,000,000 tokens
- **User story:** As a landlord, I want to update a maintenance request's status so that the tenant can follow repair progress.
- **Dependencies:** US-MAINT-03.

**Acceptance criteria:**

- [ ] The owning landlord can change the status among `Pending`, `In Progress`, and `Completed` according to allowed transitions approved by the team.
- [ ] The system records the previous status, new status, change time, and responsible landlord.
- [ ] The assigned tenant sees the new status and receives a mobile push notification of the change; no Web notification is created.
- [ ] A landlord cannot update a request belonging to another landlord's property.
- [ ] Repeating the same status update does not create misleading duplicate history entries or notifications.

#### US-MAINT-05 — View maintenance history by room

- **Status:** Refined
- **BE estimation (BE3):** ~3.0 hours | ~13,000,000 tokens
- **FE estimation (FE2):** ~1.8 hours | ~7,500,000 tokens
- **User story:** As a landlord, I want to view a room's maintenance history so that I can understand recurring issues and prior repairs.
- **Dependencies:** US-MAINT-01 and US-MAINT-04.

**Acceptance criteria:**

- [ ] The landlord can view historical maintenance requests for a room in an owned property.
- [ ] Each history item shows its title, tenant/requester, submission date, current status, and status-change history.
- [ ] Completed requests remain visible in history.
- [ ] The landlord cannot view history for another landlord's room.


### EPIC 5 — Portfolio Performance Monitoring

#### F-14 — Centralized Business Dashboard

- **Priority:** Must

#### US-DASH-01 — View occupied room count

- **Status:** Refined
- **BE estimation (BE1):** ~1.7 hours | ~6,750,000 tokens
- **FE estimation (FE1):** ~4.0 hours | ~700,000 tokens | 2.5 Lovable credits
- **User story:** As a landlord, I want to see the number of occupied rooms compared with my total rooms so that I can understand current capacity at a glance.
- **Dependencies:** US-ROOM-02 and US-LEASE-04.

**Acceptance criteria:**

- [ ] The dashboard displays occupancy as `occupied rooms / total rooms` (for example, `12 / 15 rooms occupied`) for the authenticated landlord's portfolio.
- [ ] The occupied-room count includes only rooms with a currently active lease; the total-room count includes active rooms in owned properties.
- [ ] The dashboard does not display an occupancy percentage for this summary.
- [ ] A landlord with no rooms sees `0 / 0 rooms occupied` without a calculation error.
- [ ] No room belonging to another landlord contributes to the summary.

#### US-DASH-02 — View monthly revenue summary

- **Status:** Refined
- **BE estimation (BE1):** ~2.9 hours | ~11,250,000 tokens
- **FE estimation (FE1):** ~2.0 hours | ~300,000 tokens | 1.0 Lovable credits
- **User story:** As a landlord, I want to compare expected and collected monthly revenue so that I can understand current rental income.
- **Dependencies:** US-INVOICE-01 and US-PAYMENT-02.

**Acceptance criteria:**

- [ ] The landlord can select or view an identified reporting month.
- [ ] Expected revenue equals the total invoiced amount for the landlord in that month under the approved reporting-date rule.
- [ ] Collected revenue includes only amounts verified as paid under the approved reporting-date rule.
- [ ] Amounts use a consistent currency and monetary rounding/display convention.
- [ ] Data from another landlord is excluded.

#### US-DASH-03 — View outstanding and overdue invoices

- **Status:** Refined
- **BE estimation (BE2):** ~1.0 hour | ~1,250,000 tokens
- **FE estimation (FE1):** ~2.5 hours | ~400,000 tokens | 1.5 Lovable credits
- **User story:** As a landlord, I want to see outstanding amounts and overdue invoices so that I know which payments require follow-up.
- **Dependencies:** US-PAYMENT-03.

**Acceptance criteria:**

- [ ] The dashboard displays the current total outstanding amount for the authenticated landlord.
- [ ] It lists overdue invoices with tenant/room context, due date, outstanding amount, and a link to the authorized invoice detail.
- [ ] A paid invoice is excluded from outstanding and overdue results.
- [ ] An unpaid invoice is considered overdue only after its due date has passed.
- [ ] Data from another landlord is excluded.

#### US-DASH-04 — View upcoming lease expirations on the dashboard

- **Status:** Refined
- **BE estimation (BE2):** ~1.0 hour | ~1,250,000 tokens
- **FE estimation (FE1):** ~3.0 hours | ~450,000 tokens | 0.0 Lovable credits
- **User story:** As a landlord, I want upcoming lease expirations on the dashboard so that I can initiate renewal or move-out discussions.
- **Dependencies:** US-LEASE-06.

**Acceptance criteria:**

- [ ] The dashboard shows the landlord's upcoming lease expirations using the same window and eligibility rules as US-LEASE-06.
- [ ] Each item identifies the property/room, tenant, and expiration date.
- [ ] Each item links to the authorized lease record.
- [ ] Ended leases and leases from another landlord are excluded.

#### F-15 — Monthly Business Report and Analytics

- **Priority:** Should

#### US-REPORT-01 — Select a reporting period and generate a report

- **Status:** Refined
- **BE estimation (BE3):** ~2.0 hours | ~13,000,000 tokens
- **FE estimation (FE2):** ~2.1 hours | ~9,000,000 tokens
- **User story:** As a landlord, I want to generate a report for a month/year or custom date range so that I can analyze performance for a clearly defined period.
- **Dependencies:** US-AUTH-04 and the source-data stories referenced by US-REPORT-02 through US-REPORT-04.

**Acceptance criteria:**

- [ ] The landlord can select a specific month/year or a custom start and end date.
- [ ] The start date must not be after the end date; invalid or incomplete periods do not generate a report.
- [ ] The generated report records its reporting period, generation time, timezone, and authenticated landlord.
- [ ] Only data belonging to the authenticated landlord and falling under the defined metric date rules contributes to the report.
- [ ] A valid period with no matching activity returns a structured zero/empty-state report rather than an error.

#### US-REPORT-02 — Analyze financial performance and debt

- **Status:** Refined
- **BE estimation (BE3):** ~3.0 hours | ~13,500,000 tokens
- **FE estimation (FE2):** ~2.1 hours | ~9,000,000 tokens
- **User story:** As a landlord, I want financial and debt metrics in the report so that I can compare expected cash flow with actual collections and identify unpaid amounts.
- **Dependencies:** US-REPORT-01, US-INVOICE-01, US-PAYMENT-02, US-PAYMENT-03, and US-CHARGE-01.

**Acceptance criteria:**

- [ ] The report displays Expected Revenue and Actual Collected Revenue for the selected period.
- [ ] Both metrics are broken down into Base Rent, Electricity, Water, and Additional Fees/Property Surcharges.
- [ ] Expected Revenue reconciles to applicable invoice line items under the approved reporting-date rule; Actual Collected Revenue includes only verified payments under that rule.
- [ ] The report displays Total Outstanding Debt and lists the contributing overdue invoices with tenant/room context, due date, and outstanding amount.
- [ ] Paid invoices are excluded from outstanding debt, and data from another landlord is excluded from all financial metrics.

#### US-REPORT-03 — Analyze occupancy, churn, and lease expirations

- **Status:** Refined
- **BE estimation (BE3):** ~2.4 hours | ~11,000,000 tokens
- **FE estimation (FE2):** ~1.9 hours | ~8,000,000 tokens
- **User story:** As a landlord, I want occupancy and tenant-movement metrics in the report so that I can understand property utilization and upcoming lease risk.
- **Dependencies:** US-REPORT-01, US-ROOM-02, US-LEASE-01, US-LEASE-04, and US-LEASE-06.

**Acceptance criteria:**

- [ ] Average Occupancy Rate for the selected period is calculated as occupied room-days divided by available active room-days, expressed as a percentage.
- [ ] When the period has no available room-days, average occupancy is shown as `N/A` rather than producing a divide-by-zero result.
- [ ] Move-ins count leases whose effective start date falls within the selected period.
- [ ] Move-outs count leases whose actual end/move-out date falls within the selected period.
- [ ] The report lists active leases approaching expiration using the same eligibility/window rules as US-LEASE-06.
- [ ] All occupancy, churn, and lease results include only the authenticated landlord's properties.

#### US-REPORT-04 — Analyze maintenance efficiency

- **Status:** Refined
- **BE estimation (BE3):** ~1.6 hours | ~8,000,000 tokens
- **FE estimation (FE2):** ~1.7 hours | ~7,000,000 tokens
- **User story:** As a landlord, I want maintenance metrics in the report so that I can evaluate request volume and resolution performance.
- **Dependencies:** US-REPORT-01 and US-MAINT-01 through US-MAINT-05.

**Acceptance criteria:**

- [ ] The report displays the number of maintenance requests submitted during the selected period.
- [ ] The report displays the number completed during the selected period, including requests submitted before the period when they were completed inside it.
- [ ] New and completed counts use submission/completion timestamps respectively and are not inferred from the request's current status alone.
- [ ] The report displays a resolution rate and average resolution time when sufficient completed-request data exists; otherwise the metric is shown as `N/A`.
- [ ] Maintenance metrics include only requests associated with the authenticated landlord's properties.

#### US-REPORT-05 — Export a business report as PDF

- **Status:** Refined
- **BE estimation (BE3):** ~1.0 hours | ~700,000 tokens
- **FE estimation (FE2):** ~1.3 hours | ~5,300,000 tokens
- **User story:** As a landlord, I want to export the generated business report as a PDF so that I can read, archive, or share a stable copy.
- **Dependencies:** US-REPORT-01 through US-REPORT-04 and a PDF-generation baseline.

**Acceptance criteria:**

- [ ] The landlord can export an authorized generated report from the mobile application as a readable PDF.
- [ ] The PDF identifies the landlord/report, selected period, generation time, and currency.
- [ ] The PDF contains the same financial, debt, occupancy/churn, lease-expiration, and maintenance metrics as the generated report.
- [ ] Empty or unavailable metrics are represented consistently and do not break the document layout.
- [ ] The export does not contain data belonging to another landlord, and an unauthorized export request is rejected by the backend.


## 6. Backlog Summary

| Category | Count |
|---|---:|
| Epics | 5 |
| Features | 15 |
| User stories | 51 |
| Technical/project tasks | 6 |
| Documentation tasks | 9 |
| **Total implementable/trackable items** | **66** |

User stories count toward product-story throughput. Technical, management, and documentation tasks are tracked separately.

## 7. Regulatory Pricing Notes

- Utility prices are time- and locality-dependent configuration, not permanent constants.
- Electricity seed data must record the applicable official source, locality, tariff structure, and effective dates.
- Water tariffs vary by locality; use the relevant provincial rules or require the landlord to configure a verified rate.
- Never silently use an unrelated or expired default for a billing period.
