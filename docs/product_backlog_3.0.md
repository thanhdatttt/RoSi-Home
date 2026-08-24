# Product Backlog 3.0 — RosiHome
## 1. Backlog Rules
This backlog lists all work required for the RosiHome project.

Work item types:
- User Story: product work that gives value to a user.
- Technical Task: setup, infrastructure, CI/CD, or other supporting technical work.
- Project Task: project management work.
- Documentation Task: a required project document.

General rules: 
- Every work item has Priority, Status, Story Points, Tracked time/tokens, and Acceptance Criteria.
- Technical, Project, and Documentation Tasks use one combined Tracked time/token value.
- Each Product User Story shows Backend, Frontend, and Combined Tracked values. The Combined value is the Backend value plus the Frontend value.
- Product User Story Story Points come from `docs/project_estimation.md`; supporting-task Story Points use the approved task mapping.

**Definition of Done:** See `docs/quality_management.md` and `docs/software_process_definition.md`.

**Delivery Process:** See `docs/software_process_definition.md`.
## 2. Technical and Project Tasks
### 2.1 Technical Tasks
### TASK-TECH-01 — Set up backend infrastructure
- **Type:** Technical Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
**Tracked**
- Time: 3.1 hours
- Tokens: 11,000,000
**Acceptance Criteria**
- [ ] The TypeScript and Express API runs under `/api/v1` and provides `/api-docs`.
- [ ] PostgreSQL, Drizzle migrations, seed data, and environment settings can be set up again from the repository.
- [ ] Authentication, validation, error handling, role checks, ownership checks, audit events, and soft deletion work as defined.
- [ ] Private file uploads use checked file types and authorized access.
- [ ] Secrets are not committed.
### TASK-TECH-02 — Set up frontend infrastructure
- **Type:** Technical Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
**Tracked**
- Time: 3 hours
- Tokens: 22,000,000
**Acceptance Criteria**
- [ ] The Expo and React Native app runs on supported mobile development targets.
- [ ] Routes protect signed-out users and separate landlord and tenant screens.
- [ ] Shared fields, buttons, themes, API calls, and error states work across the app.
- [ ] Saved sessions use secure storage and logout clears saved tokens.
- [ ] Expo notification and EAS build profiles are configured.
### TASK-TECH-03 — Set up quality tooling
- **Type:** Technical Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 8
**Tracked**
- Time: 5.0 hours
- Tokens: 47,000
**Acceptance Criteria**
- [ ] Backend commands run unit, contract, integration, coverage, typecheck, and build checks.
- [ ] Integration tests use a disposable PostgreSQL test database.
- [ ] Coverage rules exist for the selected critical modules.
### TASK-TECH-04 — Set up continuous integration
- **Type:** Technical Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
**Tracked**
- Time: 1.9 hours
- Tokens: 15,000
**Acceptance Criteria**
- [ ] GitHub Actions runs the required backend checks for every pull request to `main`.
- [ ] The workflow uses the correct backend directory and commands.
- [ ] A failed required check blocks the merge.
### TASK-TECH-05 — Set up continuous deployment to Render
- **Type:** Technical Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
**Tracked**
- Time: 1.5 hours
- Tokens: 20,000
**Acceptance Criteria**
- [ ] A merge to `main` starts deployment to the configured Render service.
- [ ] The merged revision is deployed.
- [ ] The deployment result can be checked by the team.
### 2.2 Project Tasks
### TASK-PM-01 — Manage the team's Trello board
- **Type:** Project Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
**Tracked**
- Time: 2.1 hours
- Tokens: 0
**Acceptance Criteria**
- [ ] The board contains each active work item with its ID, owner, priority, status, and dependencies when needed.
- [ ] The columns match the project status flow.
- [ ] The board is updated after planning, review, acceptance, or blocking changes.
- [ ] Done cards link to useful code, document, test, or review evidence.

System/UAT execution, mobile preview distribution, project coordination, demonstrations, prototype work, and PoC work are supporting activities rather than separate Work Items in this backlog. They are evidenced through the related technical setup, documentation deliverables, Product User Stories, and project records.
## 3. Documentation Tasks
### TASK-DOC-01 — Write the Technical Architecture document
- **Type:** Documentation Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 8
- **Output:** `docs/architecture.md`
**Tracked**
- Time: 7 hours
- Tokens: 120,000
**Acceptance Criteria**
- [ ] The document defines the architecture style, technology stack, system parts, core data, and main design reasons.
- [ ] The architecture matches the RosiHome MVP and repository.
- [ ] The diagrams and text are clear to the team.
### TASK-DOC-02 — Write Product Backlog Version 1
- **Type:** Documentation Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 13
- **Output:** `docs/product_backlog.md`
**Tracked**
- Time: 8.0 hours
- Tokens: 100,000
**Acceptance Criteria**
- [ ] The backlog contains five epics, 15 features, and 51 user stories.
- [ ] Each story has clear scope and Acceptance Criteria.
- [ ] Story IDs, decisions, dependencies, and totals are consistent.
### TASK-DOC-03 — Write Product Backlog 2.0
- **Type:** Documentation Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 13
- **Output:** `docs/product_backlog_2.0.md`
**Tracked**
- Time: 8.0 hours
- Tokens: 350,000
**Acceptance Criteria**
- [ ] The backlog keeps all 51 product user stories.
- [ ] The backlog adds technical, project, and document work without counting it as product scope.
- [ ] The estimates and item totals match their approved sources.
- [ ] `docs/product_backlog.md` remains unchanged.
### TASK-DOC-04 — Write the Project Charter
- **Type:** Documentation Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 8
- **Output:** `docs/project_charter.md`
**Tracked**
- Time: 6 hours
- Tokens: 100,000
**Acceptance Criteria**
- [ ] The document defines the project purpose, goals, scope, governance, roles, stakeholders, risks, and assumptions.
- [ ] Named responsibilities match the current team assignments.
- [ ] The charter agrees with the proposal, scope, and backlog.
### TASK-DOC-05 — Write the Software Project Estimation document
- **Type:** Documentation Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 13
- **Output:** `docs/project_estimation.md`
**Tracked**
- Time: 10.0 hours
- Tokens: 550,000
**Acceptance Criteria**
- [ ] The document explains the approved estimation methods and assumptions.
- [ ] It lists Final Story Points for all 51 Product User Stories.
- [ ] Calculations, units, source data, and totals can be checked.
- [ ] The final estimate is clear.
### TASK-DOC-06 — Write the Project Proposal
- **Type:** Documentation Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 8
- **Output:** `docs/proposal.md`
**Tracked**
- Time: 7 hours
- Tokens: 135,000
**Acceptance Criteria**
- [ ] The proposal explains the problem, business case, stakeholders, competitors, feasibility, schedule, cost, risk, and pitch.
- [ ] Important claims have suitable evidence.
- [ ] Scope, schedule, cost, and risk statements agree.
### TASK-DOC-07 — Write the Statement of Work
- **Type:** Documentation Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 8
- **Output:** `docs/statement_of_work.md`
**Tracked**
- Time: 2.0 hours
- Tokens: 58,000
**Acceptance Criteria**
- [ ] The document defines scope, deliverables, acceptance, schedule, roles, resources, constraints, and change control.
- [ ] Each deliverable has a clear acceptance basis.
- [ ] The content agrees with the charter and backlog.
### TASK-DOC-08 — Write the Vision and Scope document
- **Type:** Documentation Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 8
- **Output:** `docs/vision_and_scope.md`
**Tracked**
- Time: 5.0 hours
- Tokens: 60,000
**Acceptance Criteria**
- [ ] The document explains the main use cases, product parts, included work, and excluded work.
- [ ] Actors and problems can be traced to the approved features.
- [ ] The scope agrees with the MVP backlog.
### TASK-DOC-09 — Write the Risk Management Plan
- **Type:** Documentation Task
- **Priority:** Must
- **Status:** Done
- **Story Points:** 8
- **Output:** `docs/risk_management.md`
**Tracked**
- Time: 5.0 hours
- Tokens: 100,000
**Acceptance Criteria**
- [ ] The document defines risk scales and lists the main project risks.
- [ ] Each risk has an owner, response, trigger, and current state.
- [ ] The risk list agrees with the charter, proposal, SOW, and backlog.
## 4. Product User Stories
## EPIC 1 — Infrastructure and User Management
### F-01 — User Registration, Authentication, and Profile Management
Purpose: Give users secure access and profile controls.
### US-AUTH-01 — Register a landlord account
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** None.
**Tracked**
- Backend: 1.3 hours / 5,000,000 tokens
- Frontend: 2.0 hours / 300,000 tokens
- Combined: 3.3 hours / 5,300,000 tokens

**User Story**

As a new landlord, I want to register a Landlord account so that I can manage my rental portfolio in RosiHome.
**Acceptance Criteria**
- [ ] The landlord registration flow requires full name, a unique login identifier (email), password, and password confirmation.
- [ ] Invalid or missing values produce field-level validation errors and no account is created.
- [ ] Duplicate login identifiers (emails) are rejected without revealing sensitive account information.
- [ ] Password and confirmation must match, and the stored password is never persisted or returned as plain text.
- [ ] Successful self-registration creates exactly one account with the `Landlord` role.
- [ ] The registration operation cannot assign both `Landlord` and `Tenant` roles to the same account.
### US-AUTH-02 — Log in
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-AUTH-01.
**Tracked**
- Backend: 3.3 hours / 12,000,000 tokens
- Frontend: 1.5 hours / 250,000 tokens
- Combined: 4.8 hours / 12,250,000 tokens

**User Story**

As a registered user, I want to log in with valid credentials so that I can access my authorized RosiHome functions.
**Acceptance Criteria**
- [ ] A registered active user can log in with the supported login identifier and correct password.
- [ ] Invalid credentials return a generic authentication error and do not identify which credential was incorrect.
- [ ] Successful login establishes an authenticated token (JWT) and returns the user's current role information.
- [ ] Passwords and authentication tokens are not exposed in logs or API responses beyond the required authentication response.
### US-AUTH-03 — Log out
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-AUTH-02.
**Tracked**
- Backend: 1.1 hours / 7,000,000 tokens
- Frontend: 0.5 hours / 100,000 tokens
- Combined: 1.6 hours / 7,100,000 tokens

**User Story**

As an authenticated user, I want to log out so that another person using the device cannot continue my session.
**Acceptance Criteria**
- [ ] An authenticated user can invoke logout from the mobile application.
- [ ] After logout, protected screens and API operations require authentication again.
- [ ] Revisiting cached protected pages does not reveal usable private data after the session has ended.
### US-AUTH-04 — Enforce role and data ownership
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-AUTH-02 and the relevant domain relationship (property ownership, tenant account link, or active lease).
**Tracked**
- Backend: 1.7 hours / 3,000,000 tokens
- Frontend: 2.0 hours / 350,000 tokens
- Combined: 3.7 hours / 3,350,000 tokens

**User Story**

As a RosiHome user, I want access limited to my role and related rental data so that private information is protected.
**Acceptance Criteria**
- [ ] A tenant cannot access landlord-only operations or the business dashboard; the backend returns `403 Forbidden` for an authenticated but unauthorized request.
- [ ] A landlord can access only properties and related records owned by that landlord.
- [ ] A tenant can access only records linked to that tenant account through the approved tenant/lease relationship.
- [ ] Changing a URL, identifier, or request payload cannot bypass role or ownership checks.
- [ ] An unauthenticated request to a protected operation is rejected according to the API authentication convention.
### US-AUTH-05 — Change password
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-AUTH-02.
**Tracked**
- Backend: 1.5 hours / 5,000,000 tokens
- Frontend: 2.0 hours / 350,000 tokens
- Combined: 3.5 hours / 5,350,000 tokens

**User Story**

As an authenticated user, I want to change my password so that I can replace a temporary or compromised credential.
**Acceptance Criteria**
- [ ] A user changing an established password must provide the correct current password, a new password, and password confirmation.
- [ ] The new password and confirmation must match and satisfy the approved password policy.
- [ ] The new password cannot be the same as the current password.
- [ ] A tenant who signs in with a temporary password is required to set a new password before accessing other protected product functions.
- [ ] After a successful change, the temporary/previous password no longer authenticates the user.
- [ ] The password change is recorded as a security audit event without storing either password value.
### US-PROFILE-01 — View and update a user profile
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 2
- **Dependencies:** US-AUTH-02.
**Tracked**
- Backend: 2.5 hours / 7,000,000 tokens
- Frontend: 2.0 hours / 350,000 tokens
- Combined: 4.5 hours / 7,350,000 tokens

**User Story**

As an authenticated user, I want to view and update my basic profile so that my contact information remains current.
**Acceptance Criteria**
- [ ] The user can view their own full name, login/contact information, and role.
- [ ] The user can update the profile fields approved as editable by the team.
- [ ] Required formats and uniqueness rules are validated before an update is saved.
- [ ] The user cannot change another user's profile or elevate their own role through the profile operation.
### US-AUTH-06 — Recover a forgotten password
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-AUTH-01 and an approved transactional-email provider.
**Tracked**
- Backend: 4.5 hours / 14,000,000 tokens
- Frontend: 1.5 hours / 250,000 tokens
- Combined: 6.0 hours / 14,250,000 tokens

**User Story**

As a registered user who forgot my password, I want to receive a new password by email so that I can regain access immediately.
**Acceptance Criteria**
- [ ] The recovery request does not reveal whether a submitted identifier belongs to an account.
- [ ] The backend generates a new random password that satisfies the approved password policy, stores its hash, and delivers it only to the email address associated with the account.
- [ ] The user can log in immediately with the emailed password (no reset link / second step required).
- [ ] All outstanding sessions (refresh tokens) for the account are revoked, forcing re-login on every device.
- [ ] The previous password no longer authenticates the user after the new password is issued.
- [ ] The new password is never written to application logs.
## EPIC 2 — Portfolio and Property Setup
### F-02 — Property and Room Management
Purpose: Let landlords manage properties and rooms.
### US-PROPERTY-01 — Create a property
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-AUTH-04.
**Tracked**
- Backend: 1.4 hours / 1,260,000 tokens
- Frontend: 1.8 hours / 8,000,000 tokens
- Combined: 3.2 hours / 9,260,000 tokens

**User Story**

As a landlord, I want to create a rental property so that I can manage its rooms in RosiHome.
**Acceptance Criteria**
- [ ] Only an authenticated landlord can create a property.
- [ ] Property name and address are required (unique per landlord); missing or invalid values prevent creation and produce validation errors.
- [ ] The created property is associated with the authenticated landlord.
- [ ] The new property appears in that landlord's property list and is not visible to another landlord.
- [ ] Creating rooms, editing, and archiving a property are outside this story.
### US-PROPERTY-02 — View and update owned properties
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 2
- **Dependencies:** US-PROPERTY-01.
**Tracked**
- Backend: 1.4 hours / 1,260,000 tokens
- Frontend: 1.9 hours / 8,500,000 tokens
- Combined: 3.3 hours / 9,760,000 tokens

**User Story**

As a landlord, I want to view and update my property details so that the portfolio record stays accurate.
**Acceptance Criteria**
- [ ] The landlord can list and open details for properties they own.
- [ ] The landlord can update editable basic details, including property name and address.
- [ ] Invalid updates are rejected without changing the stored property (check unique name and address per landlord before saving).
- [ ] The landlord cannot view or update another landlord's property.
- [ ] Property deletion/archival is outside this story unless separately approved.
### US-ROOM-01 — Add a room to a property
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-PROPERTY-01.
**Tracked**
- Backend: 1.4 hours / 1,260,000 tokens
- Frontend: 1.6 hours / 7,500,000 tokens
- Combined: 3.0 hours / 8,760,000 tokens

**User Story**

As a landlord, I want to add a room to one of my properties so that it can be used in leasing and billing workflows.
**Acceptance Criteria**
- [ ] The landlord can add a room only to a property they own.
- [ ] Room name/number and base rent are required.
- [ ] Room name/number is unique within the selected property.
- [ ] Base rent must be a valid non-negative monetary amount.
- [ ] A newly created room has no active lease and is displayed as `Vacant`.
### US-ROOM-02 — View and update room information
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 2
- **Dependencies:** US-ROOM-01.
**Tracked**
- Backend: 1.4 hours / 1,260,000 tokens
- Frontend: 1.6 hours / 7,500,000 tokens
- Combined: 3.0 hours / 8,760,000 tokens

**User Story**

As a landlord, I want to view and update room details and availability so that I can manage my rental units accurately.
**Acceptance Criteria**
- [ ] The landlord can view the rooms belonging to each owned property, including room name/number, base rent, and derived occupancy status.
- [ ] The landlord can update editable room details while preserving uniqueness and monetary validation rules.
- [ ] Occupancy is shown as `Occupied` when the room has an active lease and `Vacant` otherwise.
- [ ] The landlord cannot directly override an occupancy status that conflicts with the active lease relationship.
- [ ] The landlord cannot view or update a room belonging to another landlord.
### US-ROOM-03 — Add multiple rooms to a property
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-PROPERTY-01.
**Tracked**
- Backend: 1.4 hours / 1,260,000 tokens
- Frontend: 2.0 hours / 8,500,000 tokens
- Combined: 3.4 hours / 9,760,000 tokens

**User Story**

As a landlord, I want to add multiple rooms in one operation so that I can set up a property without repeating the same form for every room.
**Acceptance Criteria**
- [ ] The landlord can add a bounded list of rooms only to a property they own.
- [ ] Each row requires a room name/number (default automatically numbering) and a valid non-negative base rent.
- [ ] Room names/numbers must be unique both within the submitted list and among active rooms in the selected property.
- [ ] Validation errors identify the affected rows before records are created.
- [ ] The operation is atomic: either every valid submitted room is created or none are created when any row fails validation.
- [ ] Every created room starts as `Vacant` and is attributable to the authenticated landlord in the audit trail.
### F-03 — Tenant Information and Account Management
Purpose: Let landlords manage tenant records and accounts.
### US-TENANT-01 — View and update tenant information created from a lease
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-LEASE-01.
**Tracked**
- Backend: 2.5 hours / 5,000,000 tokens
- Frontend: 2.5 hours / 400,000 tokens
- Combined: 5.0 hours / 5,400,000 tokens

**User Story**

As a landlord, I want to view and update tenant information captured during lease creation so that the rental contact record remains current.
**Acceptance Criteria**
- [ ] The landlord can list and open tenant information derived from leases within their own portfolio.
- [ ] The landlord can update approved profile and contact fields.
- [ ] Email, phone number, and identification-number format/uniqueness rules are enforced on update.
- [ ] An update to a login-related phone number or email follows the approved account-identity synchronization and verification rules.
- [ ] The landlord cannot view or modify tenant information associated only with another landlord.
- [ ] Archiving/removing a tenant relationship uses soft deletion and preserves lease, invoice, payment, and audit history.
### US-TENANT-02 — Provision a tenant account from a lease
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 13
- **Dependencies:** US-LEASE-01 and an approved transactional-email provider.
**Tracked**
- Backend: 4.5 hours / 12,000,000 tokens
- Frontend: 2.0 hours / 350,000 tokens
- Combined: 6.5 hours / 12,350,000 tokens

**User Story**

As a landlord, I want the system to provision a tenant account when I create the tenant's lease so that the tenant can access RosiHome without self-registering.
**Acceptance Criteria**
- [ ] Lease creation requires the tenant's full name, phone number, identification number, and email address before account provisioning.
- [ ] The system provisions exactly one account with the `Tenant` role and uses the tenant's phone number as the username.
- [ ] The same phone number, email address, tenant information record, or lease event cannot provision a duplicate account.
- [ ] The system generates a temporary password that is not exposed in application logs or stored as plain text.
- [ ] The tenant receives an email containing the username, temporary password, and mobile-app link.
- [ ] The tenant is required to replace the temporary password through US-AUTH-05 at first successful login.
- [ ] The provisioned account cannot also hold the `Landlord` role and can access only data linked through its tenant information record and lease.
### F-04 — Utility Pricing and Property Surcharges
Purpose: Set utility rates and recurring property charges.
### US-UTILITY-01 — Configure utility rates
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 2
- **Dependencies:** US-PROPERTY-01.
**Tracked**
- Backend: 2.0 hours / 750,000 tokens
- Frontend: 2.0 hours / 8,500,000 tokens
- Combined: 4.0 hours / 9,250,000 tokens

**User Story**

As a landlord, I want to configure electricity and water rates so that monthly utility charges use my actual pricing rules.
**Acceptance Criteria**
- [ ] The landlord can configure one electricity price per kWh for an owned property.
- [ ] For each property, the landlord can select exactly one water billing method: `Metered per m³` or `Flat amount per tenant per month`.
- [ ] Metered water requires a valid price per cubic metre; flat water requires a valid monthly amount per tenant (for example, VND 100,000 per tenant for unlimited usage).
- [ ] Every rate must be a valid non-negative monetary amount and include its unit/method.
- [ ] The landlord cannot create or change rates for another landlord's property.
- [ ] A saved configuration identifies the property and effective time from which the rate applies.
- [ ] The `effectiveFrom` date must be strictly in the future (greater than today). Rates for the current day or past cannot be edited to protect billing history.
- [ ] There can be at most one future/upcoming rate scheduled per property. If one already exists, a new submission will overwrite it.
- [ ] When a property has no landlord-defined rate, the system can use only an applicable developer-seeded default whose source, locality, and effective date are recorded.
### US-UTILITY-02 — View and update utility rates
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-UTILITY-01.
**Tracked**
- Backend: 2.0 hours / 700,000 tokens
- Frontend: 1.6 hours / 7,500,000 tokens
- Combined: 3.6 hours / 8,200,000 tokens

**User Story**

As a landlord, I want to view and update utility rates so that future calculations reflect current pricing.
**Acceptance Criteria**
- [ ] The landlord can view the effective electricity and water rates for each owned property.
- [ ] The landlord can update a rate after the same validation and ownership rules used at creation.
- [ ] A rate change does not silently recalculate an already finalized invoice.
- [ ] New calculations for every room in the property use the effective property-level rates.
### US-CHARGE-01 — Configure recurring property surcharges
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-PROPERTY-01.
**Tracked**
- Backend: 1.0 hours / 500,000 tokens
- Frontend: 1.4 hours / 6,500,000 tokens
- Combined: 2.4 hours / 7,000,000 tokens

**User Story**

As a landlord, I want to configure recurring property-wide surcharges so that shared services such as internet appear consistently on tenant invoices.
**Acceptance Criteria**
- [ ] The landlord can create a surcharge only for a property they own, with a name, non-negative monthly amount, effective start date, and optional end date.
- [ ] An active surcharge applies to each applicable active lease/invoice in that property for the covered billing period (for example, a VND 500,000 internet surcharge per tenant invoice).
- [ ] The surcharge appears as a separate named invoice line item rather than being merged into rent or utility consumption.
- [ ] The landlord can update or deactivate a surcharge prospectively; the change does not silently modify a `Sent` or `Paid` invoice.
- [ ] Duplicate active surcharge names within the same property and overlapping effective period are rejected.
- [ ] Deactivation uses soft deletion/status history and records the responsible landlord and time.
## EPIC 3 — Automated Monthly Billing and Payment
### F-05 — Utility Meter Reading and Calculation
Purpose: Record meter readings and calculate use.
### US-METER-01 — Record an initial meter reading
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 1
- **Dependencies:** US-ROOM-01.
**Tracked**
- Backend: 1.9 hours / 1,857,143 tokens
- Frontend: 1.5 hours / 7,000,000 tokens
- Combined: 3.4 hours / 8,857,143 tokens

**User Story**

As a landlord, I want to record the first meter reading for a room so that future monthly consumption has a valid baseline.
**Acceptance Criteria**
- [ ] The landlord can select a room they own and a billing period without an existing reading.
- [ ] Electricity and, when the property uses metered water, water readings accept only valid non-negative values in their configured units.
- [ ] The initial reading is stored as a baseline and does not create negative or invented consumption.
- [ ] The system prevents duplicate meter records for the same room, utility, and billing period.
- [ ] The landlord cannot record readings for another landlord's room.
### US-METER-02 — Record monthly readings and calculate consumption
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 13
- **Dependencies:** US-METER-01 and US-UTILITY-01.
**Tracked**
- Backend: 1.9 hours / 1,857,143 tokens
- Frontend: 2.1 hours / 9,000,000 tokens
- Combined: 4.0 hours / 10,857,143 tokens

**User Story**

As a landlord, I want to enter current monthly readings and see calculated utility charges so that I can prepare an accurate invoice.
**Acceptance Criteria**
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
### US-METER-03 — Correct a reading used for billing
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-METER-02 and US-INVOICE-01.
**Tracked**
- Backend: 1.9 hours / 1,857,143 tokens
- Frontend: 2.4 hours / 10,000,000 tokens
- Combined: 4.3 hours / 11,857,143 tokens

**User Story**

As a landlord, I want to correct an erroneous reading before sending its draft invoice so that the tenant receives an accurate bill without losing accountability.
**Acceptance Criteria**
- [ ] Only the landlord who owns the room can request a correction.
- [ ] A reading can be corrected when its generated invoice is still `Draft`; a `Sent` or `Paid` invoice is not silently changed through this operation.
- [ ] The correction preserves the original value, corrected value, change time, and responsible landlord.
- [ ] The system revalidates reading order and recalculates affected charges consistently.
- [ ] The associated draft invoice is recalculated from the corrected reading and retains exactly one invoice for the room/lease and billing period.
- [ ] The landlord can review the recalculated draft before sending it through US-INVOICE-04.
### F-06 — Billing and Invoice Generation
Purpose: Create, review, send, and download invoices.
### US-INVOICE-01 — Generate a monthly invoice
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 13
- **Dependencies:** US-LEASE-01, US-METER-02, US-UTILITY-01, US-CHARGE-01 when recurring surcharges apply, and a scheduled-job baseline.
**Tracked**
- Backend: 1.9 hours / 1,857,143 tokens
- Frontend: 5.0 hours / 900,000 tokens
- Combined: 6.9 hours / 2,757,143 tokens

**User Story**

As a landlord, I want the system to generate a scheduled draft invoice from rent and new utility readings so that I can review a complete monthly bill before sending it.
**Acceptance Criteria**
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
### US-INVOICE-02 — View an invoice
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-INVOICE-01 and US-AUTH-04.
**Tracked**
- Backend: 1.9 hours / 1,857,143 tokens
- Frontend: 4.0 hours / 700,000 tokens
- Combined: 5.9 hours / 2,557,143 tokens

**User Story**

As a landlord or assigned tenant, I want to view an itemized invoice so that I understand the amount charged.
**Acceptance Criteria**
- [ ] The landlord can view invoices for leases in owned properties.
- [ ] The assigned tenant can view only `Sent` or `Paid` invoices linked to their tenant account/lease; draft invoices are landlord-only.
- [ ] The invoice displays its billing period, line items, total, due date, and payment status.
- [ ] An unrelated landlord or tenant cannot access the invoice by changing its identifier.
### US-INVOICE-03 — Download an invoice document
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-INVOICE-02 and PDF-generation baseline.
**Tracked**
- Backend: 1.9 hours / 1,857,143 tokens
- Frontend: 4.0 hours / 800,000 tokens
- Combined: 5.9 hours / 2,657,143 tokens

**User Story**

As a landlord or assigned tenant, I want to download an invoice document so that I can retain or share a billing record outside RosiHome.
**Acceptance Criteria**
- [ ] An authorized landlord can download a PDF for an owned invoice; an assigned tenant can download a PDF only after the invoice has been sent.
- [ ] The downloaded document contains the same billing identity, line items, total, due date, and status shown in the application.
- [ ] The document does not expose data from another property, lease, tenant, or invoice.
- [ ] An unauthorized download request is rejected by the backend.
### US-INVOICE-04 — Review and send a draft invoice
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-INVOICE-01 and US-METER-03 when a correction is required.
**Tracked**
- Backend: 1.9 hours / 1,857,143 tokens
- Frontend: 2.0 hours / 300,000 tokens
- Combined: 3.9 hours / 2,157,143 tokens

**User Story**

As a landlord, I want to review and explicitly send a generated draft invoice so that the tenant receives only a bill I have confirmed.
**Acceptance Criteria**
- [ ] The landlord can open and review a draft invoice only for a lease in an owned property.
- [ ] The draft displays the readings, effective rates, line items, total, billing period, and due date used in its calculation.
- [ ] Sending changes the invoice status from `Draft` to `Sent` exactly once and records the sender and sent time.
- [ ] After sending, the assigned tenant can view the invoice and receives a mobile push notification linking to it.
- [ ] An invoice with missing required data or a status other than `Draft` cannot be sent through this operation.
- [ ] Sending does not mark the invoice as paid; payment still requires the verification workflow.
### F-07 — VietQR Payment Integration
Purpose: Add VietQR payment details to invoices.
### US-VIETQR-01 — Configure landlord payment details
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-PROFILE-01.
**Tracked**
- Backend: 2.0 hours / 10,000,000 tokens
- Frontend: 1.6 hours / 7,500,000 tokens
- Combined: 3.6 hours / 17,500,000 tokens

**User Story**

As a landlord, I want to maintain the bank details used for VietQR so that tenants transfer payment to the correct account.
**Acceptance Criteria**
- [ ] The landlord can enter and update the bank identifier, account number, and approved account-holder information required by the VietQR generator.
- [ ] Required fields are validated before the configuration is saved.
- [ ] The landlord can view and change only their own payment configuration.
- [ ] Bank details are not displayed to unrelated users and are not exposed in application logs.
### US-VIETQR-02 — Generate and display an invoice VietQR code
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 13
- **Dependencies:** US-INVOICE-01 and US-VIETQR-01.
**Tracked**
- Backend: 2.0 hours / 12,000,000 tokens
- Frontend: 2.2 hours / 9,000,000 tokens
- Combined: 4.2 hours / 21,000,000 tokens

**User Story**

As an assigned tenant, I want to scan a VietQR code for my invoice so that I do not have to type the landlord's transfer details manually.
**Acceptance Criteria**
- [ ] A QR code is generated for an authorized, payable invoice.
- [ ] The payload uses the invoice landlord's configured bank account, exact invoice amount, and a deterministic transfer description identifying the invoice/room and billing period.
- [ ] The encoded amount and transfer description match the values displayed beside the QR code.
- [ ] The QR payload follows the selected VietQR specification and is verified with at least one supported banking/QR validation method before the story is accepted.
- [ ] Generating or scanning the QR code does not mark the invoice as paid and does not cause RosiHome to hold or transfer money.
### F-08 — Payment Verification and Tracking
Purpose: Record proof, verify payments, and show balances.
### US-PAYMENT-01 — Upload payment proof
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-INVOICE-02 and file storage baseline.
**Tracked**
- Backend: 1.5 hours / 800,000 tokens
- Frontend: 3.0 hours / 12,000,000 tokens
- Combined: 4.5 hours / 12,800,000 tokens

**User Story**

As an assigned tenant, I want to upload proof for an unpaid invoice so that the landlord can verify my bank transfer.
**Acceptance Criteria**
- [ ] The assigned tenant can upload one of the approved image formats (`.png`, `.jpg`, `.jpeg`) up to 5 MB for an accessible unpaid invoice.
- [ ] Unsupported, oversized, empty, or invalid uploads are rejected without attaching a file.
- [ ] The proof is associated with the tenant, invoice, upload time, and a verification-pending state.
- [ ] Another tenant cannot view, replace, or submit proof for the invoice.
- [ ] The owning landlord can access the proof through an authorized request.
- [ ] A successful upload sends the owning landlord a mobile push notification linking to the pending proof.
### US-PAYMENT-02 — Verify payment manually
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-PAYMENT-01.
**Tracked**
- Backend: 1.0 hours / 600,000 tokens
- Frontend: 2.4 hours / 9,500,000 tokens
- Combined: 3.4 hours / 10,100,000 tokens

**User Story**

As a landlord, I want to review payment proof and confirm a received bank transfer so that the invoice and outstanding balance are accurate.
**Acceptance Criteria**
- [ ] The landlord can list pending proofs only for invoices in owned properties.
- [ ] The landlord can open the submitted proof and relevant invoice information before deciding.
- [ ] Confirming payment creates or updates a payment record and marks the invoice `Paid` exactly once.
- [ ] A repeated confirmation does not duplicate the payment amount or history entry.
- [ ] The system records who verified the payment and when.
- [ ] RosiHome does not claim automatic bank verification; confirmation remains a landlord action.
### US-PAYMENT-03 — View payment history and outstanding balances
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-INVOICE-01, US-PAYMENT-02, and US-AUTH-04.
**Tracked**
- Backend: 1.0 hours / 400,000 tokens
- Frontend: 1.9 hours / 8,000,000 tokens
- Combined: 2.9 hours / 8,400,000 tokens

**User Story**

As a landlord or tenant, I want to view the relevant payment history and unpaid balances so that I can resolve payment questions from a shared record.
**Acceptance Criteria**
- [ ] A landlord can view invoice/payment history and outstanding balances for owned properties.
- [ ] A tenant can view only their own invoice/payment history and outstanding balances.
- [ ] Each history entry identifies the invoice, amount, billing period, payment status, and verification date when paid.
- [ ] Outstanding totals include unpaid amounts and exclude amounts already verified as paid.
- [ ] Unrelated users cannot access the history by changing request parameters or identifiers.
### F-09 — Rent Payment Reminders
Purpose: Remind tenants about overdue payments.
### US-REMINDER-01 — Receive an automatic overdue-payment reminder
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 8
- **Dependencies:** US-INVOICE-04 and a mobile push-notification service.
**Tracked**
- Backend: 0.8 hours / 400,000 tokens
- Frontend: 1.2 hours / 5,500,000 tokens
- Combined: 2.0 hours / 5,900,000 tokens

**User Story**

As a tenant, I want to receive a reminder when my invoice is overdue so that I can act on an outstanding payment.
**Acceptance Criteria**
- [ ] The system identifies an invoice as overdue only when its due date has passed and it is not paid.
- [ ] A reminder identifies the relevant invoice, amount due, and due date without exposing another tenant's information.
- [ ] A paid invoice is not included in a subsequent overdue-reminder run.
- [ ] The landlord can configure the mobile reminder schedule allowed by the product.
- [ ] Re-running a scheduled job does not create duplicate reminders outside the configured reminder frequency.
- [ ] Delivery uses mobile push notification only and records delivery status where supported.
### US-REMINDER-02 — Send a manual payment reminder
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-INVOICE-02 and a mobile push-notification service.
**Tracked**
- Backend: 1.2 hours / 550,000 tokens
- Frontend: 1.5 hours / 6,500,000 tokens
- Combined: 2.7 hours / 7,050,000 tokens

**User Story**

As a landlord, I want to send a reminder for a specific unpaid invoice so that I can follow up without composing a separate message.
**Acceptance Criteria**
- [ ] The landlord can trigger a reminder only for an unpaid invoice in an owned property.
- [ ] The tenant receives a mobile push notification containing the invoice reference, outstanding amount, and due date
- [ ] The action records the trigger time and responsible landlord.
- [ ] The operation is rejected if the invoice is already paid or does not belong to the landlord.
## EPIC 4 — Lease Management and Maintenance Tracking
### F-10 — Digital Lease Tracking
Purpose: Create, view, update, renew, and end leases.
### US-LEASE-01 — Create a digital lease
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-ROOM-01 and an approved transactional-email provider for subsequent account provisioning.
**Tracked**
- Backend: 3.0 hours / 11,700,000 tokens
- Frontend: 6.0 hours / 1,200,000 tokens
- Combined: 9.0 hours / 12,900,000 tokens

**User Story**

As a landlord, I want to enter tenant information while creating a room lease so that the rental relationship is recorded and the tenant account can be provisioned without a separate profile-creation step.
**Acceptance Criteria**
- [ ] The landlord can select only a room within their own portfolio and enters the tenant's full name, phone number, identification number, and mandatory email address as part of the lease flow.
- [ ] Email, phone number, and identification number are validated and checked against active tenant/account records before the lease is created.
- [ ] Start date, end date, agreed rent, and deposit are required and validated; end date must be after start date.
- [ ] The system rejects a lease whose active period conflicts with another lease for the same room.
- [ ] Successful submission atomically creates the tenant information record and lease; there is no standalone “create tenant profile” prerequisite.
- [ ] Creating a currently active lease causes the room's derived status to be `Occupied`.
- [ ] The lease stores the tenant, room, period, agreed rent, deposit, creator, and current status.
- [ ] Successful lease creation triggers tenant-account provisioning through US-TENANT-02; a retryable email failure does not create a duplicate tenant account or lease.
- [ ] This feature stores lease information only; legally binding electronic signing is outside the current product development scope.
### US-LEASE-02 — View lease information
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 2
- **Dependencies:** US-LEASE-01 and US-TENANT-02 for tenant access.
**Tracked**
- Backend: 1.2 hours / 4,700,000 tokens
- Frontend: 2.0 hours / 300,000 tokens
- Combined: 3.2 hours / 5,000,000 tokens

**User Story**

As a landlord or assigned tenant, I want to view lease information so that I can refer to the agreed rental period and terms.
**Acceptance Criteria**
- [ ] A landlord can view leases belonging to owned properties.
- [ ] A linked tenant can view only leases associated with their tenant information record/account.
- [ ] The view shows the room, lease period, agreed rent, deposit, and status.
- [ ] Unrelated landlords and tenants cannot access the lease by changing its identifier.
### US-LEASE-03 — Update or renew a lease
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-LEASE-01.
**Tracked**
- Backend: 3.0 hours / 11,700,000 tokens
- Frontend: 2.0 hours / 350,000 tokens
- Combined: 5.0 hours / 12,050,000 tokens

**User Story**

As a landlord, I want to update or renew a lease record so that agreed changes and a continued tenancy are reflected in RosiHome.
**Acceptance Criteria**
- [ ] The landlord can update an owned lease's approved editable terms or record a renewal period.
- [ ] Updated/renewed dates and monetary values follow the same validation rules as lease creation.
- [ ] The system prevents a changed or renewed period from overlapping another lease for the room.
- [ ] The tenant can view the updated current lease information after it is saved.
- [ ] The operation records the latest update time and responsible landlord.
### US-LEASE-04 — End a lease and release a room
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-LEASE-01.
**Tracked**
- Backend: 1.8 hours / 7,100,000 tokens
- Frontend: 4.0 hours / 800,000 tokens
- Combined: 5.8 hours / 7,900,000 tokens

**User Story**

As a landlord, I want to end a lease when a tenant moves out so that the room becomes available for a future tenant.
**Acceptance Criteria**
- [ ] Only the owning landlord can end the lease.
- [ ] The operation records an actual end date and an ended/expired status transition without deleting historical lease information; any later archive operation uses soft deletion.
- [ ] A room with no other active lease is displayed as `Vacant` after the lease ends.
- [ ] A room is not released if another valid active lease still applies.
- [ ] Ending a lease does not delete historical invoices, payments, readings, or maintenance records.
### F-11 — Automated Lease Renewal Reminders
Purpose: Show and send lease expiry reminders.
### US-LEASE-05 — Receive a lease-expiration reminder
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-LEASE-01 and a mobile push-notification service.
**Tracked**
- Backend: 3.0 hours / 11,700,000 tokens
- Frontend: 3.0 hours / 500,000 tokens
- Combined: 6.0 hours / 12,200,000 tokens

**User Story**

As a landlord or tenant, I want advance notice of a lease expiration so that renewal or move-out can be planned.
**Acceptance Criteria**
- [ ] A scheduled process evaluates active lease expiration dates at least daily.
- [ ] Only the owning landlord and assigned tenant receive a reminder for the lease.
- [ ] The reminder identifies the relevant room and expiration date.
- [ ] An ended or already expired lease does not receive a future-expiration reminder.
- [ ] For each owned property, the landlord can enable any combination of reminders at exactly 30, 15, and 7 days before lease expiration.
- [ ] A property's reminder configuration applies only to active leases in that property.
- [ ] Each enabled reminder is delivered as a mobile push notification to the owning landlord and assigned tenant.
- [ ] Re-running the scheduled process does not duplicate a reminder already sent for the same lease and configured reminder time.
### US-LEASE-06 — View upcoming lease expirations
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-LEASE-01.
**Tracked**
- Backend: 1.8 hours / 7,100,000 tokens
- Frontend: 2.0 hours / 400,000 tokens
- Combined: 3.8 hours / 7,500,000 tokens

**User Story**

As a landlord, I want to view leases approaching expiration so that I can follow up with the correct tenants.
**Acceptance Criteria**
- [ ] The landlord can view active leases expiring within the team's approved upcoming-expiration window.
- [ ] Each item shows the property/room, tenant, and expiration date and links to the accessible lease record.
- [ ] Results contain only leases in the landlord's portfolio.
- [ ] Ended leases are not presented as upcoming expirations.
### F-12 — Maintenance Request Submission
Purpose: Let tenants submit and view maintenance requests.
### US-MAINT-01 — Submit a maintenance request
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-TENANT-02, an active lease, and file storage baseline.
**Tracked**
- Backend: 2.0 hours / 11,000,000 tokens
- Frontend: 3.0 hours / 12,000,000 tokens
- Combined: 5.0 hours / 23,000,000 tokens

**User Story**

As a tenant, I want to submit a maintenance request with photographs so that my landlord has enough information to arrange a repair.
**Acceptance Criteria**
- [ ] A tenant with an applicable active lease can submit a request for the associated room.
- [ ] Title and detailed description are required.
- [ ] The tenant can attach zero to three photographs using the approved image formats and file-size limit selected by the team.
- [ ] Invalid files are rejected without creating inaccessible/orphaned attachments.
- [ ] A successful request records the tenant, room, submission time, and initial `Pending` status.
- [ ] The owning landlord can access the new request; unrelated users cannot.
- [ ] A successful submission sends the owning landlord a mobile push notification linking to the request.
### US-MAINT-02 — View submitted maintenance requests
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 2
- **Dependencies:** US-MAINT-01.
**Tracked**
- Backend: 2.0 hours / 10,000,000 tokens
- Frontend: 1.8 hours / 7,000,000 tokens
- Combined: 3.8 hours / 17,000,000 tokens

**User Story**

As a tenant, I want to view my submitted maintenance requests and current statuses so that I know whether each issue is being handled.
**Acceptance Criteria**
- [ ] The tenant can list and open only requests submitted through their own tenant relationship.
- [ ] Each item shows the title, room, submission date, current status, and available photographs.
- [ ] The displayed status matches the latest landlord status update.
- [ ] Changing an identifier cannot expose another tenant's request or attachment.
### F-13 — Maintenance Status Tracking
Purpose: Let landlords review and update maintenance work.
### US-MAINT-03 — Review maintenance requests
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 2
- **Dependencies:** US-MAINT-01.
**Tracked**
- Backend: 2.0 hours / 10,000,000 tokens
- Frontend: 2.0 hours / 7,500,000 tokens
- Combined: 4.0 hours / 17,500,000 tokens

**User Story**

As a landlord, I want to review maintenance requests for my properties so that I can decide what action is needed.
**Acceptance Criteria**
- [ ] The landlord can list requests for owned properties and filter or group them by status.
- [ ] The landlord can open the description, room/tenant context, submission time, and accessible photographs.
- [ ] Requests from another landlord's properties are not returned or accessible.
- [ ] Reviewing a request alone does not silently mark it completed.
### US-MAINT-04 — Update maintenance status
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 2
- **Dependencies:** US-MAINT-03.
**Tracked**
- Backend: 3.0 hours / 15,000,000 tokens
- Frontend: 2.5 hours / 10,000,000 tokens
- Combined: 5.5 hours / 25,000,000 tokens

**User Story**

As a landlord, I want to update a maintenance request's status so that the tenant can follow repair progress.
**Acceptance Criteria**
- [ ] The owning landlord can change the status among `Pending`, `In Progress`, and `Completed` according to allowed transitions approved by the team.
- [ ] The system records the previous status, new status, change time, and responsible landlord.
- [ ] The assigned tenant sees the new status and receives a mobile push notification of the change; no Web notification is created.
- [ ] A landlord cannot update a request belonging to another landlord's property.
- [ ] Repeating the same status update does not create misleading duplicate history entries or notifications.
### US-MAINT-05 — View maintenance history by room
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-MAINT-01 and US-MAINT-04.
**Tracked**
- Backend: 3.0 hours / 13,000,000 tokens
- Frontend: 1.8 hours / 7,500,000 tokens
- Combined: 4.8 hours / 20,500,000 tokens

**User Story**

As a landlord, I want to view a room's maintenance history so that I can understand recurring issues and prior repairs.
**Acceptance Criteria**
- [ ] The landlord can view historical maintenance requests for a room in an owned property.
- [ ] Each history item shows its title, tenant/requester, submission date, current status, and status-change history.
- [ ] Completed requests remain visible in history.
- [ ] The landlord cannot view history for another landlord's room.
## EPIC 5 — Portfolio Performance Monitoring
### F-14 — Centralized Business Dashboard
Purpose: Show key property data on one dashboard.
### US-DASH-01 — View occupied room count
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-ROOM-02 and US-LEASE-04.
**Tracked**
- Backend: 1.7 hours / 6,750,000 tokens
- Frontend: 4.0 hours / 700,000 tokens
- Combined: 5.7 hours / 7,450,000 tokens

**User Story**

As a landlord, I want to see the number of occupied rooms compared with my total rooms so that I can understand current capacity at a glance.
**Acceptance Criteria**
- [ ] The dashboard displays occupancy as `occupied rooms / total rooms` (for example, `12 / 15 rooms occupied`) for the authenticated landlord's portfolio.
- [ ] The occupied-room count includes only rooms with a currently active lease; the total-room count includes active rooms in owned properties.
- [ ] The dashboard does not display an occupancy percentage for this summary.
- [ ] A landlord with no rooms sees `0 / 0 rooms occupied` without a calculation error.
- [ ] No room belonging to another landlord contributes to the summary.
### US-DASH-02 — View monthly revenue summary
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-INVOICE-01 and US-PAYMENT-02.
**Tracked**
- Backend: 2.9 hours / 11,250,000 tokens
- Frontend: 2.0 hours / 300,000 tokens
- Combined: 4.9 hours / 11,550,000 tokens

**User Story**

As a landlord, I want to compare expected and collected monthly revenue so that I can understand current rental income.
**Acceptance Criteria**
- [ ] The landlord can select or view an identified reporting month.
- [ ] Expected revenue equals the total invoiced amount for the landlord in that month under the approved reporting-date rule.
- [ ] Collected revenue includes only amounts verified as paid under the approved reporting-date rule.
- [ ] Amounts use a consistent currency and monetary rounding/display convention.
- [ ] Data from another landlord is excluded.
### US-DASH-03 — View outstanding and overdue invoices
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-PAYMENT-03.
**Tracked**
- Backend: 1.0 hours / 1,250,000 tokens
- Frontend: 2.5 hours / 400,000 tokens
- Combined: 3.5 hours / 1,650,000 tokens

**User Story**

As a landlord, I want to see outstanding amounts and overdue invoices so that I know which payments require follow-up.
**Acceptance Criteria**
- [ ] The dashboard displays the current total outstanding amount for the authenticated landlord.
- [ ] It lists overdue invoices with tenant/room context, due date, outstanding amount, and a link to the authorized invoice detail.
- [ ] A paid invoice is excluded from outstanding and overdue results.
- [ ] An unpaid invoice is considered overdue only after its due date has passed.
- [ ] Data from another landlord is excluded.
### US-DASH-04 — View upcoming lease expirations on the dashboard
- **Type:** User Story
- **Priority:** Must
- **Status:** Done
- **Story Points:** 3
- **Dependencies:** US-LEASE-06.
**Tracked**
- Backend: 1.0 hours / 1,250,000 tokens
- Frontend: 3.0 hours / 450,000 tokens
- Combined: 4.0 hours / 1,700,000 tokens

**User Story**

As a landlord, I want upcoming lease expirations on the dashboard so that I can initiate renewal or move-out discussions.
**Acceptance Criteria**
- [ ] The dashboard shows the landlord's upcoming lease expirations using the same window and eligibility rules as US-LEASE-06.
- [ ] Each item identifies the property/room, tenant, and expiration date.
- [ ] Each item links to the authorized lease record.
- [ ] Ended leases and leases from another landlord are excluded.
### F-15 — Monthly Business Report and Analytics
Purpose: Create and export business reports.
### US-REPORT-01 — Select a reporting period and generate a report
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 13
- **Dependencies:** US-AUTH-04 and the source-data stories referenced by US-REPORT-02 through US-REPORT-04.
**Tracked**
- Backend: 2.0 hours / 13,000,000 tokens
- Frontend: 2.1 hours / 9,000,000 tokens
- Combined: 4.1 hours / 22,000,000 tokens

**User Story**

As a landlord, I want to generate a report for a month/year or custom date range so that I can analyze performance for a clearly defined period.
**Acceptance Criteria**
- [ ] The landlord can select a specific month/year or a custom start and end date.
- [ ] The start date must not be after the end date; invalid or incomplete periods do not generate a report.
- [ ] The generated report records its reporting period, generation time, timezone, and authenticated landlord.
- [ ] Only data belonging to the authenticated landlord and falling under the defined metric date rules contributes to the report.
- [ ] A valid period with no matching activity returns a structured zero/empty-state report rather than an error.
### US-REPORT-02 — Analyze financial performance and debt
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 13
- **Dependencies:** US-REPORT-01, US-INVOICE-01, US-PAYMENT-02, US-PAYMENT-03, and US-CHARGE-01.
**Tracked**
- Backend: 3.0 hours / 13,500,000 tokens
- Frontend: 2.1 hours / 9,000,000 tokens
- Combined: 5.1 hours / 22,500,000 tokens

**User Story**

As a landlord, I want financial and debt metrics in the report so that I can compare expected cash flow with actual collections and identify unpaid amounts.
**Acceptance Criteria**
- [ ] The report displays Expected Revenue and Actual Collected Revenue for the selected period.
- [ ] Both metrics are broken down into Base Rent, Electricity, Water, and Additional Fees/Property Surcharges.
- [ ] Expected Revenue reconciles to applicable invoice line items under the approved reporting-date rule; Actual Collected Revenue includes only verified payments under that rule.
- [ ] The report displays Total Outstanding Debt and lists the contributing overdue invoices with tenant/room context, due date, and outstanding amount.
- [ ] Paid invoices are excluded from outstanding debt, and data from another landlord is excluded from all financial metrics.
### US-REPORT-03 — Analyze occupancy, churn, and lease expirations
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 8
- **Dependencies:** US-REPORT-01, US-ROOM-02, US-LEASE-01, US-LEASE-04, and US-LEASE-06.
**Tracked**
- Backend: 2.4 hours / 11,000,000 tokens
- Frontend: 1.9 hours / 8,000,000 tokens
- Combined: 4.3 hours / 19,000,000 tokens

**User Story**

As a landlord, I want occupancy and tenant-movement metrics in the report so that I can understand property utilization and upcoming lease risk.
**Acceptance Criteria**
- [ ] Average Occupancy Rate for the selected period is calculated as occupied room-days divided by available active room-days, expressed as a percentage.
- [ ] When the period has no available room-days, average occupancy is shown as `N/A` rather than producing a divide-by-zero result.
- [ ] Move-ins count leases whose effective start date falls within the selected period.
- [ ] Move-outs count leases whose actual end/move-out date falls within the selected period.
- [ ] The report lists active leases approaching expiration using the same eligibility/window rules as US-LEASE-06.
- [ ] All occupancy, churn, and lease results include only the authenticated landlord's properties.
### US-REPORT-04 — Analyze maintenance efficiency
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-REPORT-01 and US-MAINT-01 through US-MAINT-05.
**Tracked**
- Backend: 1.6 hours / 8,000,000 tokens
- Frontend: 1.7 hours / 7,000,000 tokens
- Combined: 3.3 hours / 15,000,000 tokens

**User Story**

As a landlord, I want maintenance metrics in the report so that I can evaluate request volume and resolution performance.
**Acceptance Criteria**
- [ ] The report displays the number of maintenance requests submitted during the selected period.
- [ ] The report displays the number completed during the selected period, including requests submitted before the period when they were completed inside it.
- [ ] New and completed counts use submission/completion timestamps respectively and are not inferred from the request's current status alone.
- [ ] The report displays a resolution rate and average resolution time when sufficient completed-request data exists; otherwise the metric is shown as `N/A`.
- [ ] Maintenance metrics include only requests associated with the authenticated landlord's properties.
### US-REPORT-05 — Export a business report as PDF
- **Type:** User Story
- **Priority:** Should
- **Status:** Done
- **Story Points:** 5
- **Dependencies:** US-REPORT-01 through US-REPORT-04 and a PDF-generation baseline.
**Tracked**
- Backend: 1.0 hours / 700,000 tokens
- Frontend: 1.3 hours / 5,300,000 tokens
- Combined: 2.3 hours / 6,000,000 tokens

**User Story**

As a landlord, I want to export the generated business report as a PDF so that I can read, archive, or share a stable copy.
**Acceptance Criteria**
- [ ] The landlord can export an authorized generated report from the mobile application as a readable PDF.
- [ ] The PDF identifies the landlord/report, selected period, generation time, and currency.
- [ ] The PDF contains the same financial, debt, occupancy/churn, lease-expiration, and maintenance metrics as the generated report.
- [ ] Empty or unavailable metrics are represented consistently and do not break the document layout.
- [ ] The export does not contain data belonging to another landlord, and an unauthorized export request is rejected by the backend.
## 5. Backlog Summary
| Work Item Type       |  Items |                    Story Points |                    Tracked Time |                            Tracked Tokens |
| -------------------- | -----: | ------------------------------: | -----------------------------: | ------------------------------------------: |
| Product User Stories |     51 |                             247 |                    215.5 hours |                                 535,300,001 |
| Technical Tasks      |      5 |                              24 |                     14.5 hours |                            33,082,000 |
| Project Tasks        |      1 |                               5 |                      2.1 hours |                                     0 |
| Documentation Tasks  |      9 |                              87 |                     58.0 hours |                             1,573,000 |
| **Total**            | **66** |                         **363** |                    **290.1 hours** |                         **569,955,001** |

Product User Story tracked totals:

- BE total time: 100.1 hours
- BE total tokens: 295,700,001
- FE total time: 115.4 hours
- FE total tokens: 239,600,000
- Combined time: 215.5 hours
- Combined tokens: 535,300,001

Story Points total all 66 work items: 51 Product User Stories, 5 Technical Tasks, 1 Project Task, and 9 Documentation Tasks. All tracked time/token values are recorded.
