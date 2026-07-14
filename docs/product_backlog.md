# Product Backlog: RosiHome Property Management System

> Each feature is linked to the corresponding Workflow from the `vision_and_scope.md` document and includes specific, measurable Acceptance Criteria (AC).

---

## Workflow Mapping Reference

| Workflow | Description | User |
| :--- | :--- | :--- |
| **WF-1** | Automated Monthly Billing and Payment | Landlord, Tenant |
| **WF-2** | Lease Management and Maintenance Tracking | Landlord, Tenant |
| **WF-3** | Portfolio Performance Monitoring | Landlord |
| **WF-4** | Infrastructure and Core Management | System / All |

---

## EPIC 1: Infrastructure & User Management (Core)

> Foundation for all workflows. Authentication and role-based access control for both landlords and tenants.

---

### F-01 · User Registration and Authentication

- **Workflows:** WF-1, WF-2, WF-3, WF-4
- **User Story:** As a user, I want to register and log into the system using my email or phone number, so that I can access my designated rental information securely.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Registration form includes fields: Full Name, Email/Phone, Password, Confirm Password, Role (Landlord/Tenant).
- [ ] Users can successfully log in using registered credentials.
- [ ] System enforces role-based access control (RBAC): Tenants only access their own data; Landlords access all data for their managed properties.
- [ ] System prevents Tenants from accessing Landlord-specific views (e.g., business dashboard) by returning a 403 Forbidden error.
- [ ] Provide password recovery functionality via email or SMS.

---

## EPIC 2: Portfolio & Property Setup

> Prerequisite for all operational workflows. Landlords must set up their properties, rooms, and tenant profiles before operations can begin.

---

### F-02 · Property and Room Management

- **Workflows:** WF-3, WF-4
- **User Story:** As a landlord, I want to register properties and define rooms, so that I have a digital representation of my physical rental portfolio.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Landlord can create a new property with its address and basic details.
- [ ] Landlord can add multiple rooms to a property, specifying room name/number and base rent.
- [ ] Room availability status (Vacant/Occupied) is clearly displayed on the property management view.
- [ ] Status updates automatically to 'Occupied' when an active lease is tied to the room.

---

### F-03 · Tenant Profile Management

- **Workflows:** WF-1, WF-2, WF-3, WF-4
- **User Story:** As a landlord, I want to create and manage tenant profiles, so that I can assign them to rooms and manage their contact information.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Landlord can create a tenant profile including name, phone number, and identification details (e.g., ID card number).
- [ ] System prevents duplicate tenant profiles within the same landlord portfolio based on ID number.
- [ ] Tenant profiles can be linked to registered tenant user accounts to grant them dashboard access.

---

### F-04 · Utility Pricing Configuration

- **Workflows:** WF-1
- **User Story:** As a landlord, I want to configure the pricing for utilities like electricity and water, so that the system calculates monthly charges accurately based on my specific rates.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Landlord can set a price per unit (kWh) for electricity.
- [ ] Landlord can set a price per unit (m3) or per person for water.
- [ ] These utility rates are saved globally for the property or individually per room.
- [ ] The system uses these configured rates when calculating the monthly invoice.

---

## EPIC 3: Automated Monthly Billing and Payment

> Primary workflow: **WF-1**. Streamlines the calculation of utilities, rent, and payment tracking.

---

### F-05 · Utility Meter Reading & Calculation

- **Workflows:** WF-1
- **User Story:** As a landlord, I want to record monthly utility readings and have the system calculate charges, so that I avoid manual calculation errors.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Landlord can input current electricity and water meter readings for a specific room.
- [ ] System automatically retrieves the previous month's readings and displays them for reference.
- [ ] System validates that new readings are $\ge$ previous readings; displays inline error if invalid.
- [ ] System calculates utility consumption and multiplies by configured utility rates to determine total charges accurately.

---

### F-06 · Billing and Invoice Generation

- **Workflows:** WF-1
- **User Story:** As a landlord, I want the system to generate a comprehensive invoice combining rent and utilities, so that tenants receive clear and itemized billing statements.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] System automatically creates a monthly invoice on a predefined billing date.
- [ ] Invoice provides an itemized breakdown: base rent, electricity charges, water charges, and any additional fees.
- [ ] Both the landlord and the assigned tenant can view and download the invoice (as PDF) within the application.

---

### F-07 · VietQR Payment Integration

- **Workflows:** WF-1
- **User Story:** As a tenant, I want to scan a VietQR code to pay my rent, so that I don't have to manually enter the landlord's bank details or transfer message.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] A unique VietQR code is automatically generated and displayed on every invoice.
- [ ] The QR code accurately encodes the landlord's registered bank account, exact invoice amount, and a generated transfer message (e.g., Room number and Month).
- [ ] The VietQR code is compatible with standard mobile banking applications.

---

### F-08 · Payment Verification and Tracking

- **Workflows:** WF-1
- **User Story:** As a landlord, I want to receive payment proofs and verify them, so that I can track outstanding balances accurately.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Tenant can upload an image file (`.png`, `.jpg`, `.jpeg`) up to 5MB as proof of payment for an invoice.
- [ ] Landlord receives an in-app notification when a payment proof is uploaded.
- [ ] Landlord can review the proof and manually mark the invoice as 'Paid' after verifying funds in their bank account.
- [ ] System automatically updates payment history and outstanding balance tracking upon verification.

---

### F-09 · Rent Payment Reminders

- **Workflows:** WF-1
- **User Story:** As a landlord and tenant, I want automated reminders for unpaid rent, so that payments are completed on time without awkward manual follow-ups.
- **Priority:** Should Have

**Acceptance Criteria:**
- [ ] System automatically identifies unpaid invoices past their due date.
- [ ] System sends a reminder notification (in-app and/or email) to the tenant for the pending payment.
- [ ] Landlord can also manually trigger a payment reminder for a specific unpaid invoice.

---

## EPIC 4: Lease Management and Maintenance Tracking

> Primary workflow: **WF-2**. Systematically manage lease lifecycles and maintenance requests.

---

### F-10 · Digital Lease Tracking

- **Workflows:** WF-2
- **User Story:** As a landlord, I want to create digital lease records, so that I can safely store rental terms and link tenants to specific rooms.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Landlord can input lease details (tenant information, assigned room, start date, end date, agreed rent amount, deposit).
- [ ] System securely stores lease information and makes it accessible to both landlord and the respective tenant.
- [ ] Room occupancy status is automatically updated to 'Occupied' upon lease creation.

---

### F-11 · Automated Lease Renewal Reminders

- **Workflows:** WF-2
- **User Story:** As a landlord and tenant, I want to receive notifications before a lease expires, so that I can plan for renewal or move-out without missing deadlines.
- **Priority:** Should Have

**Acceptance Criteria:**
- [ ] System performs a daily cron job check on all active lease expiration dates.
- [ ] System sends a reminder notification (in-app and email) to both landlord and tenant exactly 30 days before the lease expires.
- [ ] System prominently highlights upcoming expirations on the landlord's dashboard.

---

### F-12 · Maintenance Request Submission

- **Workflows:** WF-2
- **User Story:** As a tenant, I want to submit maintenance requests with photos, so that I can efficiently report issues to the landlord.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Tenant can create a maintenance request with a title, detailed description, and attach up to 3 photographs.
- [ ] Landlord receives an immediate in-app notification of the new request.
- [ ] Tenant can view their submitted requests and their current statuses.

---

### F-13 · Maintenance Status Tracking

- **Workflows:** WF-2
- **User Story:** As a landlord, I want to update the status of maintenance requests, so that tenants are kept informed of repair progress.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Landlord can review requests and update status via a dropdown (Pending, In Progress, Completed).
- [ ] Tenant receives an automated notification whenever the status changes.
- [ ] System maintains a historical log of all maintenance requests per room, accessible by the landlord.

---

## EPIC 5: Portfolio Performance Monitoring

> Primary workflow: **WF-3**. Centralized dashboards for business monitoring and quick decision-making.

---

### F-14 · Centralized Business Dashboard

- **Workflows:** WF-3
- **User Story:** As a landlord, I want a dashboard summarizing occupancy, revenue, and outstanding payments, so that I can quickly assess my rental business health.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Dashboard displays the current occupancy rate percentage (Total Occupied Rooms / Total Rooms).
- [ ] Dashboard displays a summary of monthly rental revenue showing both Expected Revenue and Collected Revenue.
- [ ] Dashboard highlights total outstanding payments dynamically.
- [ ] Dashboard lists overdue invoices with quick links to the tenant/room details.
- [ ] Dashboard lists upcoming lease expirations with quick links to the lease records.
