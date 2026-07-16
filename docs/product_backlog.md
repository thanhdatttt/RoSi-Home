# Product Backlog: RosiHome Property Management System

> This backlog refines the MVP scope in `vision_and_scope.md` into a traceable hierarchy of Epic → Feature → User Story. Features preserve the product-level view; child stories are the units intended for implementation, testing, review, and deployment.

---

## 1. Backlog Conventions

### 1.1 Work-item hierarchy

| Level | Purpose | Implementation unit? |
| :--- | :--- | :---: |
| **Epic** | Groups a major product capability or workflow. | No |
| **Feature (F-xx)** | Describes a user-facing product capability and preserves the original MVP scope. | Usually no |
| **User Story (US-xxx-xx)** | Describes one independently testable user outcome within a feature. | Yes, when `Ready` |
| **Technical Task** | Describes implementation work needed to complete a story. | No user-story throughput credit |

### 1.2 Story status

| Status | Meaning |
| :--- | :--- |
| **Refined** | The story has a bounded scope and testable acceptance criteria, but still requires team review before commitment. |
| **Needs Clarification** | A product decision listed in Section 3 must be resolved before implementation. |
| **Ready** | The team has approved the story, resolved its dependencies and open decisions, and selected its delivery surface. |
| **In Progress** | Implementation has started. |
| **Done** | The Definition of Done has been satisfied. |

`Refined` does not automatically mean `Ready`. The team should move only reviewed stories to `Ready` before assigning them to a developer or coding agent.

### 1.3 Priority

- **Must Have:** Required for the MVP's core workflows.
- **Should Have:** Valuable for the MVP but may be deferred if schedule or capacity is constrained.

### 1.4 Global Definition of Done

Unless a story explicitly states otherwise, it is `Done` only when:

- All acceptance criteria pass on the delivery surface selected during planning (`Web`, `Mobile`, or `Both`).
- Authorization and ownership rules are enforced by the backend, not only hidden in the user interface.
- Relevant automated tests pass, including at least the main success path and critical validation/authorization paths.
- No unresolved severity-critical or severity-high defect remains within the story scope.
- Code has been reviewed and merged according to the team's Git workflow.
- Database migrations and configuration changes required by the story are reproducible.
- The completed behavior has been deployed to and verified in the agreed integration or pilot environment.
- User-facing and API errors do not expose passwords, tokens, private files, or another landlord's or tenant's data.

---

## 2. Workflow Mapping Reference

| Workflow | Description | Primary users |
| :--- | :--- | :--- |
| **WF-1** | Automated Monthly Billing and Payment | Landlord, Tenant |
| **WF-2** | Lease Management and Maintenance Tracking | Landlord, Tenant |
| **WF-3** | Portfolio Performance Monitoring | Landlord |
| **WF-4** | Infrastructure and Core Management | System, Landlord, Tenant |

---

## 3. Open Product Decisions

These decisions are intentionally not resolved by the backlog author. Stories referencing them remain `Needs Clarification` until the team or product owner records a decision.

| Decision | Question | Affected stories |
| :--- | :--- | :--- |
| **PD-01 Account onboarding** | Can a person freely register as either Landlord or Tenant, or must a tenant be invited/linked by a landlord? Can one account hold both roles? | US-AUTH-01, US-TENANT-03 |
| **PD-02 Password recovery** | Is password recovery included in the MVP, and if so, is the delivery channel email, SMS, or both? | US-AUTH-06 |
| **PD-03 Utility pricing** | Are rates configured per property, per room, or with property defaults plus room overrides? Is water billed per cubic metre, per tenant, or both? | US-UTILITY-01, US-UTILITY-02 |
| **PD-04 Invoice creation** | Is an invoice generated manually after meter entry, automatically on a schedule, or by both mechanisms? Is PDF export required in the MVP? | US-INVOICE-01, US-INVOICE-03 |
| **PD-05 Notification channels** | Which reminders are in-app, email, or both? Does “30 days before expiry” require exactly one notification or a configurable reminder window? | US-REMINDER-01, US-REMINDER-02, US-LEASE-05 |
| **PD-06 Corrections** | After an invoice is generated, may a landlord correct a meter reading or invoice? If yes, what audit and tenant-notification behavior is required? | US-METER-03 |
| **PD-07 Client coverage** | Which stories must be delivered on Web, Mobile, or both for the MVP? | All stories |

---

## EPIC 1: Infrastructure and User Management

> Establishes account access, role-based authorization, profile management, and tenant/landlord data isolation required by every business workflow.

### F-01 — User Registration, Authentication, and Profile Management

- **Workflows:** WF-1, WF-2, WF-3, WF-4
- **Feature objective:** Users can establish and access the correct RosiHome account, manage basic profile information, and see only data permitted by their role and relationships.
- **Priority:** Must Have

#### US-AUTH-01 — Register an account

- **Status:** Needs Clarification (PD-01)
- **User story:** As a new user, I want to register an account so that I can access RosiHome with my own identity.
- **Dependencies:** None.

**Acceptance criteria:**

- [ ] The registration flow requires full name, a unique login identifier, password, and password confirmation.
- [ ] Invalid or missing values produce field-level validation errors and no account is created.
- [ ] Duplicate login identifiers are rejected without revealing sensitive account information.
- [ ] Password and confirmation must match, and the stored password is never persisted or returned as plain text.
- [ ] Successful registration creates exactly one active account under the onboarding and role rules selected in PD-01.

#### US-AUTH-02 — Log in

- **Status:** Refined
- **User story:** As a registered user, I want to log in with valid credentials so that I can access my authorized RosiHome functions.
- **Dependencies:** US-AUTH-01.

**Acceptance criteria:**

- [ ] A registered active user can log in with the supported login identifier and correct password.
- [ ] Invalid credentials return a generic authentication error and do not identify which credential was incorrect.
- [ ] Successful login establishes an authenticated session/token and returns the user's current role information.
- [ ] Passwords and authentication tokens are not exposed in logs or API responses beyond the required authentication response.

#### US-AUTH-03 — Log out

- **Status:** Refined
- **User story:** As an authenticated user, I want to log out so that another person using the device cannot continue my session.
- **Dependencies:** US-AUTH-02.

**Acceptance criteria:**

- [ ] An authenticated user can invoke logout from the selected delivery surface.
- [ ] After logout, protected screens and API operations require authentication again.
- [ ] Revisiting cached protected pages does not reveal usable private data after the session has ended.

#### US-AUTH-04 — Enforce role and data ownership

- **Status:** Refined
- **User story:** As a RosiHome user, I want access limited to my role and related rental data so that private information is protected.
- **Dependencies:** US-AUTH-02 and the relevant domain relationship (property ownership, tenant account link, or active lease).

**Acceptance criteria:**

- [ ] A tenant cannot access landlord-only operations or the business dashboard; the backend returns `403 Forbidden` for an authenticated but unauthorized request.
- [ ] A landlord can access only properties and related records owned by that landlord.
- [ ] A tenant can access only records linked to that tenant account through the approved tenant/lease relationship.
- [ ] Changing a URL, identifier, or request payload cannot bypass role or ownership checks.
- [ ] An unauthenticated request to a protected operation is rejected according to the API authentication convention.

#### US-PROFILE-01 — View and update a user profile

- **Status:** Refined
- **User story:** As an authenticated user, I want to view and update my basic profile so that my contact information remains current.
- **Dependencies:** US-AUTH-02.

**Acceptance criteria:**

- [ ] The user can view their own full name, login/contact information, and role.
- [ ] The user can update the profile fields approved as editable by the team.
- [ ] Required formats and uniqueness rules are validated before an update is saved.
- [ ] The user cannot change another user's profile or elevate their own role through the profile operation.

#### US-AUTH-06 — Recover a forgotten password

- **Status:** Needs Clarification (PD-02)
- **Priority:** Should Have
- **User story:** As a registered user who forgot my password, I want to reset it through an approved recovery channel so that I can regain access.
- **Dependencies:** US-AUTH-01 and an approved email/SMS provider if an external channel is selected.

**Acceptance criteria:**

- [ ] The recovery request does not reveal whether a submitted identifier belongs to an account.
- [ ] A time-limited, single-use recovery credential is delivered through the channel selected in PD-02.
- [ ] A valid recovery credential allows the user to set and confirm a new password that meets the password rules.
- [ ] Expired, reused, or invalid recovery credentials are rejected.
- [ ] The previous password no longer authenticates the user after a successful reset.

---

## EPIC 2: Portfolio and Property Setup

> Allows landlords to establish properties, rooms, tenants, and utility rates before operational workflows begin.

### F-02 — Property and Room Management

- **Workflows:** WF-3, WF-4
- **Feature objective:** A landlord can maintain a digital representation of owned properties and rental rooms, including current availability.
- **Priority:** Must Have

#### US-PROPERTY-01 — Create a property

- **Status:** Refined
- **User story:** As a landlord, I want to create a rental property so that I can manage its rooms in RosiHome.
- **Dependencies:** US-AUTH-04.

**Acceptance criteria:**

- [ ] Only an authenticated landlord can create a property.
- [ ] Property name and address are required; missing or invalid values prevent creation and produce validation errors.
- [ ] The created property is associated with the authenticated landlord.
- [ ] The new property appears in that landlord's property list and is not visible to another landlord.
- [ ] Creating rooms, editing, and archiving a property are outside this story.

#### US-PROPERTY-02 — View and update owned properties

- **Status:** Refined
- **User story:** As a landlord, I want to view and update my property details so that the portfolio record stays accurate.
- **Dependencies:** US-PROPERTY-01.

**Acceptance criteria:**

- [ ] The landlord can list and open details for properties they own.
- [ ] The landlord can update editable basic details, including property name and address.
- [ ] Invalid updates are rejected without changing the stored property.
- [ ] The landlord cannot view or update another landlord's property.
- [ ] Property deletion/archival is outside this story unless separately approved.

#### US-ROOM-01 — Add a room to a property

- **Status:** Refined
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
- **User story:** As a landlord, I want to view and update room details and availability so that I can manage my rental units accurately.
- **Dependencies:** US-ROOM-01.

**Acceptance criteria:**

- [ ] The landlord can view the rooms belonging to each owned property, including room name/number, base rent, and derived occupancy status.
- [ ] The landlord can update editable room details while preserving uniqueness and monetary validation rules.
- [ ] Occupancy is shown as `Occupied` when the room has an active lease and `Vacant` otherwise.
- [ ] The landlord cannot directly override an occupancy status that conflicts with the active lease relationship.
- [ ] The landlord cannot view or update a room belonging to another landlord.

### F-03 — Tenant Profile Management

- **Workflows:** WF-1, WF-2, WF-3, WF-4
- **Feature objective:** A landlord can maintain tenant records and connect a tenant profile to the correct system account and rental relationship.
- **Priority:** Must Have

#### US-TENANT-01 — Create a tenant profile

- **Status:** Refined
- **User story:** As a landlord, I want to create a tenant profile so that I can use it in lease and rental workflows.
- **Dependencies:** US-AUTH-04.

**Acceptance criteria:**

- [ ] Only an authenticated landlord can create a tenant profile in their portfolio.
- [ ] Full name and phone/contact information are required; approved identification fields can also be recorded.
- [ ] If an identification number is supplied, a duplicate within the same landlord's portfolio is rejected.
- [ ] The created tenant profile belongs to the authenticated landlord's portfolio and is not exposed to another landlord.
- [ ] Creating a profile alone does not mark a room as occupied.

#### US-TENANT-02 — View and update a tenant profile

- **Status:** Refined
- **User story:** As a landlord, I want to view and update a tenant's contact information so that the tenant record remains current.
- **Dependencies:** US-TENANT-01.

**Acceptance criteria:**

- [ ] The landlord can list and open tenant profiles within their own portfolio.
- [ ] The landlord can update approved profile and contact fields.
- [ ] Identification uniqueness and field-validation rules are enforced on update.
- [ ] The landlord cannot view or modify another landlord's tenant profile.

#### US-TENANT-03 — Link a tenant profile to a user account

- **Status:** Needs Clarification (PD-01)
- **User story:** As a landlord, I want to link a tenant profile to the correct tenant account so that the tenant can access their own rental information.
- **Dependencies:** US-TENANT-01, US-AUTH-01, and the onboarding/linking mechanism selected in PD-01.

**Acceptance criteria:**

- [ ] A landlord can initiate or confirm a link only for a tenant profile in their portfolio.
- [ ] The system prevents linking the tenant profile to an account that does not satisfy the approved tenant onboarding rules.
- [ ] The same link cannot be created twice.
- [ ] Once linked, the tenant account can access only data associated through its approved lease/profile relationship.
- [ ] A link operation does not create or activate a lease by itself.

### F-04 — Utility Pricing Configuration

- **Workflows:** WF-1
- **Feature objective:** A landlord can maintain electricity and water pricing used consistently by the utility calculation and invoice workflows.
- **Priority:** Must Have

#### US-UTILITY-01 — Configure utility rates

- **Status:** Needs Clarification (PD-03)
- **User story:** As a landlord, I want to configure electricity and water rates so that monthly utility charges use my actual pricing rules.
- **Dependencies:** US-PROPERTY-01 and the pricing scope/method selected in PD-03.

**Acceptance criteria:**

- [ ] The landlord can configure an electricity price per kWh for an owned pricing scope.
- [ ] The landlord can configure water pricing using only the billing methods approved in PD-03.
- [ ] A rate must be a valid non-negative monetary amount and include its unit/method.
- [ ] The landlord cannot create or change rates for another landlord's property or room.
- [ ] A saved configuration identifies when and where the rate applies.

#### US-UTILITY-02 — View and update utility rates

- **Status:** Needs Clarification (PD-03)
- **User story:** As a landlord, I want to view and update utility rates so that future calculations reflect current pricing.
- **Dependencies:** US-UTILITY-01.

**Acceptance criteria:**

- [ ] The landlord can view the effective electricity and water rates for each relevant property/room.
- [ ] The landlord can update a rate after the same validation and ownership rules used at creation.
- [ ] A rate change does not silently recalculate an already finalized invoice.
- [ ] New calculations use the effective applicable rate according to the rule selected in PD-03.

---

## EPIC 3: Automated Monthly Billing and Payment

> Covers meter recording, utility calculation, invoice generation, VietQR payment, manual verification, payment history, and reminders.

### F-05 — Utility Meter Reading and Calculation

- **Workflows:** WF-1
- **Feature objective:** A landlord can record monthly meter readings and obtain reproducible electricity and water charges without manual arithmetic.
- **Priority:** Must Have

#### US-METER-01 — Record an initial meter reading

- **Status:** Refined
- **User story:** As a landlord, I want to record the first meter reading for a room so that future monthly consumption has a valid baseline.
- **Dependencies:** US-ROOM-01.

**Acceptance criteria:**

- [ ] The landlord can select a room they own and a billing period without an existing reading.
- [ ] Electricity and water readings accept only valid non-negative values in their configured units.
- [ ] The initial reading is stored as a baseline and does not create negative or invented consumption.
- [ ] The system prevents duplicate meter records for the same room, utility, and billing period.
- [ ] The landlord cannot record readings for another landlord's room.

#### US-METER-02 — Record monthly readings and calculate consumption

- **Status:** Refined
- **User story:** As a landlord, I want to enter current monthly readings and see calculated utility charges so that I can prepare an accurate invoice.
- **Dependencies:** US-METER-01 and US-UTILITY-01.

**Acceptance criteria:**

- [ ] The landlord can enter current electricity and water readings for a room and billing period.
- [ ] The system displays and uses the immediately preceding applicable readings.
- [ ] A current reading lower than its previous reading is rejected with a field-level error.
- [ ] Consumption equals current reading minus previous reading for metered utilities.
- [ ] The charge equals consumption multiplied by the effective configured rate, using the project's approved monetary rounding rule.
- [ ] The saved result retains the inputs and effective rates needed to reproduce the calculation.

#### US-METER-03 — Correct a reading used for billing

- **Status:** Needs Clarification (PD-06)
- **User story:** As a landlord, I want to correct an erroneous reading so that tenant charges can be corrected without losing accountability.
- **Dependencies:** US-METER-02 and the correction policy selected in PD-06.

**Acceptance criteria:**

- [ ] Only the landlord who owns the room can request a correction.
- [ ] The correction preserves the original value, corrected value, time, and responsible user if an audit trail is approved.
- [ ] The system revalidates reading order and recalculates affected charges consistently.
- [ ] An invoice already marked `Paid` is not silently changed.
- [ ] Any invoice update and tenant notification follow the policy selected in PD-06.

### F-06 — Billing and Invoice Generation

- **Workflows:** WF-1
- **Feature objective:** The system produces one itemized monthly invoice per applicable room/tenant using rent and calculated utility charges.
- **Priority:** Must Have

#### US-INVOICE-01 — Generate a monthly invoice

- **Status:** Needs Clarification (PD-04)
- **User story:** As a landlord, I want to generate a monthly invoice from rent and utility data so that the tenant receives one complete amount due.
- **Dependencies:** US-LEASE-01, US-METER-02, US-UTILITY-01, and the trigger selected in PD-04.

**Acceptance criteria:**

- [ ] An invoice can be generated only for an active lease and a billing period not already invoiced for that lease/room.
- [ ] Required meter readings and effective utility rates must exist before generation when those utilities apply.
- [ ] The invoice stores an itemized breakdown of base rent, electricity, water, approved additional fees, total amount, billing period, issue date, and due date.
- [ ] The total equals the sum of its stored line items using the approved monetary rounding rule.
- [ ] Repeating the same generation action does not create a duplicate invoice.
- [ ] A newly generated unpaid invoice has a consistent initial status defined by the team.

#### US-INVOICE-02 — View an invoice

- **Status:** Refined
- **User story:** As a landlord or assigned tenant, I want to view an itemized invoice so that I understand the amount charged.
- **Dependencies:** US-INVOICE-01 and US-AUTH-04.

**Acceptance criteria:**

- [ ] The landlord can view invoices for leases in owned properties.
- [ ] The assigned tenant can view only invoices linked to their tenant account/lease.
- [ ] The invoice displays its billing period, line items, total, due date, and payment status.
- [ ] An unrelated landlord or tenant cannot access the invoice by changing its identifier.

#### US-INVOICE-03 — Download an invoice document

- **Status:** Needs Clarification (PD-04)
- **Priority:** Should Have
- **User story:** As a landlord or assigned tenant, I want to download an invoice document so that I can retain or share a billing record outside RosiHome.
- **Dependencies:** US-INVOICE-02 and approval of PDF/document export in PD-04.

**Acceptance criteria:**

- [ ] An authorized landlord or tenant can download a document for an accessible invoice.
- [ ] The downloaded document contains the same billing identity, line items, total, due date, and status shown in the application.
- [ ] The document does not expose data from another property, lease, tenant, or invoice.
- [ ] An unauthorized download request is rejected by the backend.

### F-07 — VietQR Payment Integration

- **Workflows:** WF-1
- **Feature objective:** Each payable invoice provides a VietQR code directing the tenant's bank transfer to the landlord without RosiHome holding or moving money.
- **Priority:** Must Have

#### US-VIETQR-01 — Configure landlord payment details

- **Status:** Refined
- **User story:** As a landlord, I want to maintain the bank details used for VietQR so that tenants transfer payment to the correct account.
- **Dependencies:** US-PROFILE-01.

**Acceptance criteria:**

- [ ] The landlord can enter and update the bank identifier, account number, and approved account-holder information required by the VietQR generator.
- [ ] Required fields are validated before the configuration is saved.
- [ ] The landlord can view and change only their own payment configuration.
- [ ] Bank details are not displayed to unrelated users and are not exposed in application logs.

#### US-VIETQR-02 — Generate and display an invoice VietQR code

- **Status:** Refined
- **User story:** As an assigned tenant, I want to scan a VietQR code for my invoice so that I do not have to type the landlord's transfer details manually.
- **Dependencies:** US-INVOICE-01 and US-VIETQR-01.

**Acceptance criteria:**

- [ ] A QR code is generated for an authorized, payable invoice.
- [ ] The payload uses the invoice landlord's configured bank account, exact invoice amount, and a deterministic transfer description identifying the invoice/room and billing period.
- [ ] The encoded amount and transfer description match the values displayed beside the QR code.
- [ ] The QR payload follows the selected VietQR specification and is verified with at least one supported banking/QR validation method before the story is accepted.
- [ ] Generating or scanning the QR code does not mark the invoice as paid and does not cause RosiHome to hold or transfer money.

### F-08 — Payment Verification and Tracking

- **Workflows:** WF-1
- **Feature objective:** A tenant can submit payment evidence, a landlord can verify it manually, and both parties can see an authoritative payment history and outstanding balance.
- **Priority:** Must Have

#### US-PAYMENT-01 — Upload payment proof

- **Status:** Refined
- **User story:** As an assigned tenant, I want to upload proof for an unpaid invoice so that the landlord can verify my bank transfer.
- **Dependencies:** US-INVOICE-02 and file storage baseline.

**Acceptance criteria:**

- [ ] The assigned tenant can upload one of the approved image formats (`.png`, `.jpg`, `.jpeg`) up to 5 MB for an accessible unpaid invoice.
- [ ] Unsupported, oversized, empty, or invalid uploads are rejected without attaching a file.
- [ ] The proof is associated with the tenant, invoice, upload time, and a verification-pending state.
- [ ] Another tenant cannot view, replace, or submit proof for the invoice.
- [ ] The owning landlord can access the proof through an authorized request.

#### US-PAYMENT-02 — Verify payment manually

- **Status:** Refined
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
- **User story:** As a landlord or tenant, I want to view the relevant payment history and unpaid balances so that I can resolve payment questions from a shared record.
- **Dependencies:** US-INVOICE-01, US-PAYMENT-02, and US-AUTH-04.

**Acceptance criteria:**

- [ ] A landlord can view invoice/payment history and outstanding balances for owned properties.
- [ ] A tenant can view only their own invoice/payment history and outstanding balances.
- [ ] Each history entry identifies the invoice, amount, billing period, payment status, and verification date when paid.
- [ ] Outstanding totals include unpaid amounts and exclude amounts already verified as paid.
- [ ] Unrelated users cannot access the history by changing request parameters or identifiers.

### F-09 — Rent Payment Reminders

- **Workflows:** WF-1
- **Feature objective:** Tenants are reminded about overdue invoices, and landlords can trigger an appropriate follow-up without leaving RosiHome.
- **Priority:** Should Have

#### US-REMINDER-01 — Receive an automatic overdue-payment reminder

- **Status:** Needs Clarification (PD-05)
- **User story:** As a tenant, I want to receive a reminder when my invoice is overdue so that I can act on an outstanding payment.
- **Dependencies:** US-INVOICE-01 and the notification channel/schedule selected in PD-05.

**Acceptance criteria:**

- [ ] The system identifies an invoice as overdue only when its due date has passed and it is not paid.
- [ ] A reminder identifies the relevant invoice, amount due, and due date without exposing another tenant's information.
- [ ] A paid invoice is not included in a subsequent overdue-reminder run.
- [ ] Re-running a scheduled job does not create duplicate reminders outside the approved reminder frequency.
- [ ] Delivery uses only the channel(s) approved in PD-05 and records delivery status where supported.

#### US-REMINDER-02 — Send a manual payment reminder

- **Status:** Needs Clarification (PD-05)
- **User story:** As a landlord, I want to send a reminder for a specific unpaid invoice so that I can follow up without composing a separate message.
- **Dependencies:** US-INVOICE-02 and the channel selected in PD-05.

**Acceptance criteria:**

- [ ] The landlord can trigger a reminder only for an unpaid invoice in an owned property.
- [ ] The tenant receives the invoice reference, outstanding amount, and due date through the approved channel.
- [ ] The action records the trigger time and responsible landlord.
- [ ] The operation is rejected if the invoice is already paid or does not belong to the landlord.

---

## EPIC 4: Lease Management and Maintenance Tracking

> Manages the digital lease lifecycle and tracks tenant maintenance requests from submission through completion.

### F-10 — Digital Lease Tracking

- **Workflows:** WF-2
- **Feature objective:** A landlord can create and maintain a digital lease record connecting the correct tenant and room while the tenant can view their lease information.
- **Priority:** Must Have

#### US-LEASE-01 — Create a digital lease

- **Status:** Refined
- **User story:** As a landlord, I want to create a lease connecting a tenant to a room so that the rental relationship and terms are recorded.
- **Dependencies:** US-ROOM-01 and US-TENANT-01.

**Acceptance criteria:**

- [ ] The landlord can select only a tenant profile and room within their own portfolio.
- [ ] Start date, end date, agreed rent, and deposit are required and validated; end date must be after start date.
- [ ] The system rejects a lease whose active period conflicts with another lease for the same room.
- [ ] Creating a currently active lease causes the room's derived status to be `Occupied`.
- [ ] The lease stores the tenant, room, period, agreed rent, deposit, creator, and current status.
- [ ] This feature stores lease information only; legally binding electronic signing is outside the MVP.

#### US-LEASE-02 — View lease information

- **Status:** Refined
- **User story:** As a landlord or assigned tenant, I want to view lease information so that I can refer to the agreed rental period and terms.
- **Dependencies:** US-LEASE-01 and US-TENANT-03 for tenant access.

**Acceptance criteria:**

- [ ] A landlord can view leases belonging to owned properties.
- [ ] A linked tenant can view only leases associated with their tenant profile/account.
- [ ] The view shows the room, lease period, agreed rent, deposit, and status.
- [ ] Unrelated landlords and tenants cannot access the lease by changing its identifier.

#### US-LEASE-03 — Update or renew a lease

- **Status:** Refined
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
- **User story:** As a landlord, I want to end a lease when a tenant moves out so that the room becomes available for a future tenant.
- **Dependencies:** US-LEASE-01.

**Acceptance criteria:**

- [ ] Only the owning landlord can end the lease.
- [ ] The operation records an actual end date and an ended/expired status without deleting historical lease information.
- [ ] A room with no other active lease is displayed as `Vacant` after the lease ends.
- [ ] A room is not released if another valid active lease still applies.
- [ ] Ending a lease does not delete historical invoices, payments, readings, or maintenance records.

### F-11 — Automated Lease Renewal Reminders

- **Workflows:** WF-2
- **Feature objective:** Landlords and tenants receive advance notice of lease expiration and landlords can identify upcoming expirations.
- **Priority:** Should Have

#### US-LEASE-05 — Receive a lease-expiration reminder

- **Status:** Needs Clarification (PD-05)
- **User story:** As a landlord or tenant, I want advance notice of a lease expiration so that renewal or move-out can be planned.
- **Dependencies:** US-LEASE-01 and the notification schedule/channel selected in PD-05.

**Acceptance criteria:**

- [ ] A scheduled process evaluates active lease expiration dates at the approved frequency.
- [ ] Only the owning landlord and assigned tenant receive a reminder for the lease.
- [ ] The reminder identifies the relevant room and expiration date.
- [ ] An ended or already expired lease does not receive a future-expiration reminder.
- [ ] Re-running the scheduled process does not create duplicate reminders outside the approved reminder policy.

#### US-LEASE-06 — View upcoming lease expirations

- **Status:** Refined
- **User story:** As a landlord, I want to view leases approaching expiration so that I can follow up with the correct tenants.
- **Dependencies:** US-LEASE-01.

**Acceptance criteria:**

- [ ] The landlord can view active leases expiring within the team's approved upcoming-expiration window.
- [ ] Each item shows the property/room, tenant, and expiration date and links to the accessible lease record.
- [ ] Results contain only leases in the landlord's portfolio.
- [ ] Ended leases are not presented as upcoming expirations.

### F-12 — Maintenance Request Submission

- **Workflows:** WF-2
- **Feature objective:** A tenant can report a maintenance issue with supporting photographs and track the submitted request.
- **Priority:** Must Have

#### US-MAINT-01 — Submit a maintenance request

- **Status:** Refined
- **User story:** As a tenant, I want to submit a maintenance request with photographs so that my landlord has enough information to arrange a repair.
- **Dependencies:** US-TENANT-03, an active lease, and file storage baseline.

**Acceptance criteria:**

- [ ] A tenant with an applicable active lease can submit a request for the associated room.
- [ ] Title and detailed description are required.
- [ ] The tenant can attach zero to three photographs using the approved image formats and file-size limit selected by the team.
- [ ] Invalid files are rejected without creating inaccessible/orphaned attachments.
- [ ] A successful request records the tenant, room, submission time, and initial `Pending` status.
- [ ] The owning landlord can access the new request; unrelated users cannot.

#### US-MAINT-02 — View submitted maintenance requests

- **Status:** Refined
- **User story:** As a tenant, I want to view my submitted maintenance requests and current statuses so that I know whether each issue is being handled.
- **Dependencies:** US-MAINT-01.

**Acceptance criteria:**

- [ ] The tenant can list and open only requests submitted through their own tenant relationship.
- [ ] Each item shows the title, room, submission date, current status, and available photographs.
- [ ] The displayed status matches the latest landlord status update.
- [ ] Changing an identifier cannot expose another tenant's request or attachment.

### F-13 — Maintenance Status Tracking

- **Workflows:** WF-2
- **Feature objective:** A landlord can triage and update maintenance work while both parties retain a useful history of the request.
- **Priority:** Must Have

#### US-MAINT-03 — Review maintenance requests

- **Status:** Refined
- **User story:** As a landlord, I want to review maintenance requests for my properties so that I can decide what action is needed.
- **Dependencies:** US-MAINT-01.

**Acceptance criteria:**

- [ ] The landlord can list requests for owned properties and filter or group them by status.
- [ ] The landlord can open the description, room/tenant context, submission time, and accessible photographs.
- [ ] Requests from another landlord's properties are not returned or accessible.
- [ ] Reviewing a request alone does not silently mark it completed.

#### US-MAINT-04 — Update maintenance status

- **Status:** Refined
- **User story:** As a landlord, I want to update a maintenance request's status so that the tenant can follow repair progress.
- **Dependencies:** US-MAINT-03.

**Acceptance criteria:**

- [ ] The owning landlord can change the status among `Pending`, `In Progress`, and `Completed` according to allowed transitions approved by the team.
- [ ] The system records the previous status, new status, change time, and responsible landlord.
- [ ] The assigned tenant sees the new status and receives an in-app notification of the change.
- [ ] A landlord cannot update a request belonging to another landlord's property.
- [ ] Repeating the same status update does not create misleading duplicate history entries or notifications.

#### US-MAINT-05 — View maintenance history by room

- **Status:** Refined
- **User story:** As a landlord, I want to view a room's maintenance history so that I can understand recurring issues and prior repairs.
- **Dependencies:** US-MAINT-01 and US-MAINT-04.

**Acceptance criteria:**

- [ ] The landlord can view historical maintenance requests for a room in an owned property.
- [ ] Each history item shows its title, tenant/requester, submission date, current status, and status-change history.
- [ ] Completed requests remain visible in history.
- [ ] The landlord cannot view history for another landlord's room.

---

## EPIC 5: Portfolio Performance Monitoring

> Aggregates operational data into a landlord-only dashboard for occupancy, revenue, outstanding payments, and upcoming lease expirations.

### F-14 — Centralized Business Dashboard

- **Workflows:** WF-3
- **Feature objective:** A landlord can quickly assess the current state of their rental portfolio and navigate to records requiring attention.
- **Priority:** Must Have

#### US-DASH-01 — View occupancy summary

- **Status:** Refined
- **User story:** As a landlord, I want to see current room occupancy so that I can identify available units quickly.
- **Dependencies:** US-ROOM-02 and US-LEASE-04.

**Acceptance criteria:**

- [ ] The dashboard shows total rooms, occupied rooms, vacant rooms, and occupancy rate for the authenticated landlord's portfolio.
- [ ] Occupancy rate equals occupied rooms divided by total rooms using current active-lease status.
- [ ] The zero-room case is displayed without a divide-by-zero or misleading percentage.
- [ ] No room belonging to another landlord contributes to the summary.

#### US-DASH-02 — View monthly revenue summary

- **Status:** Refined
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
- **User story:** As a landlord, I want upcoming lease expirations on the dashboard so that I can initiate renewal or move-out discussions.
- **Dependencies:** US-LEASE-06.

**Acceptance criteria:**

- [ ] The dashboard shows the landlord's upcoming lease expirations using the same window and eligibility rules as US-LEASE-06.
- [ ] Each item identifies the property/room, tenant, and expiration date.
- [ ] Each item links to the authorized lease record.
- [ ] Ended leases and leases from another landlord are excluded.

---

## 4. Dependency and Suggested Delivery Order

The order below is a dependency guide, not a fixed sprint plan. Independent stories may be implemented in parallel after their prerequisites are available.

1. **Technical baseline:** repository conventions, environments, database migration workflow, CI, deployment, test baseline, and file storage.
2. **Identity and authorization:** US-AUTH-01 through US-AUTH-04 and US-PROFILE-01.
3. **Portfolio setup:** US-PROPERTY-01, US-ROOM-01, US-TENANT-01, then their view/update stories.
4. **Tenant access and leasing:** US-TENANT-03 and US-LEASE-01 through US-LEASE-04.
5. **Utility and billing:** US-UTILITY-01, US-METER-01, US-METER-02, US-INVOICE-01, and US-INVOICE-02.
6. **Payment:** US-VIETQR-01, US-VIETQR-02, US-PAYMENT-01 through US-PAYMENT-03.
7. **Maintenance:** US-MAINT-01 through US-MAINT-05 can proceed in parallel once identity, tenant linking, leases, and file storage are available.
8. **Monitoring and reminders:** dashboard stories, lease reminders, and payment reminders after their source data and notification baseline exist.

Technical baseline items should be tracked as technical tasks/enablers. They are necessary work, but they should not be counted as completed user stories when measuring user-story throughput.

---

## 5. Refinement and Agent Handoff Rules

Before moving a story from `Refined` or `Needs Clarification` to `Ready`, the team must:

- Resolve every referenced product decision and record the result in the appropriate product document or issue.
- Select the delivery surface (`Web`, `Mobile`, or `Both`) and confirm that the story is small enough for one pull request or an explicitly bounded implementation cycle.
- Confirm that dependencies are complete or available in the target branch/environment.
- Review acceptance criteria with the person responsible for product decisions.
- Add story-specific technical notes only when architecture and repository context do not already provide them.
- Identify the assignee/reviewer in the team's issue tracker or Kanban board rather than embedding temporary ownership in this product document.

The coding agent should receive the story as its primary specification together with links to the parent feature, approved architecture, repository conventions, and relevant existing code/tests. The agent must not resolve a `Needs Clarification` decision by silently choosing a product behavior.

---

## 6. Feature Summary

| Feature | Description | Priority | Child stories |
| :--- | :--- | :---: | ---: |
| **F-01** | User Registration, Authentication, and Profile Management | Must Have | 6 |
| **F-02** | Property and Room Management | Must Have | 4 |
| **F-03** | Tenant Profile Management | Must Have | 3 |
| **F-04** | Utility Pricing Configuration | Must Have | 2 |
| **F-05** | Utility Meter Reading and Calculation | Must Have | 3 |
| **F-06** | Billing and Invoice Generation | Must Have | 3 |
| **F-07** | VietQR Payment Integration | Must Have | 2 |
| **F-08** | Payment Verification and Tracking | Must Have | 3 |
| **F-09** | Rent Payment Reminders | Should Have | 2 |
| **F-10** | Digital Lease Tracking | Must Have | 4 |
| **F-11** | Automated Lease Renewal Reminders | Should Have | 2 |
| **F-12** | Maintenance Request Submission | Must Have | 2 |
| **F-13** | Maintenance Status Tracking | Must Have | 3 |
| **F-14** | Centralized Business Dashboard | Must Have | 4 |
|  | **Total** |  | **43** |
