# Vision and Scope Document

# 1. Vision and Scope

RosiHome is an MVP for self-managing landlords who manage roughly 10–50 rooms and their tenants. It replaces fragmented manual work with one persistent record for billing, leases, maintenance, and portfolio visibility. The system calculates invoices, generates exact-amount payment QR codes, accepts payment proof, supports landlord bank verification, sends lease reminders, and keeps requests visible.

# 2. Core Pain Points

The project addresses four core pain points identified in the Proposal:

1. Rent and utility calculation is manual, which costs time and creates billing errors.
2. Lease renewal dates are remembered manually, so missed renewals can create vacancies.
3. Maintenance requests arrive through calls and chats, so they can be forgotten or delayed.
4. Data is scattered across notebooks and spreadsheets, so landlords cannot see occupancy, late fee, or revenue quickly.

# 3. Current Business Use Cases

These cases describe the manual process using Excel + Zalo and calculator before RosiHome.

## Business Use Case 1 – Billing and Payment

**User Type:** Self-managing landlord and tenant

### Problem

Rent and utility billing depends on meter readings, a calculator, Excel, and Zalo. Re-entry and checking can produce errors and leave payment evidence disconnected.

### Current Workflow

1. The landlord reads each room's electricity and water meters and gathers recurring charges.
2. The landlord calculates rent and utilities with a calculator and Excel, then records the total.
3. The landlord sends each bill through Zalo; the tenant transfers payment and sends proof through Zalo; the landlord updates Excel.

### Result

Billing takes time, errors can undercharge or overcharge tenants, and payment evidence is split between Excel and Zalo.

## Business Use Case 2 – Lease Renewal

**User Type:** Self-managing landlord and tenant

### Problem

Lease dates are kept in paper contracts or spreadsheets and remembered manually. A missed date can leave a room vacant.

### Current Workflow

1. The landlord stores lease dates in a paper contract or Excel.
2. Near expiry, the landlord searches records or relies on memory and contacts the tenant through Zalo.
3. If the date is missed, the landlord learns after the tenant leaves and must find a replacement.

### Result

Renewal follow-up is inconsistent and a missed renewal can create vacancy.

## Business Use Case 3 – Maintenance Requests

**User Type:** Self-managing landlord and tenant

### Problem

Maintenance requests arrive through calls and chats, where they can be buried among unrelated conversations and delayed.

### Current Workflow

1. The tenant reports a problem by phone or Zalo.
2. The landlord remembers it or writes it in a notebook or spreadsheet.
3. The landlord arranges repair and follows up manually with the tenant.

### Result

There is no reliable request queue or status history, so issues can remain unresolved.

## Business Use Case 4 – Portfolio Visibility and Centralized Records

**User Type:** Self-managing landlord

### Problem

Room, lease, billing, payment, and maintenance data is scattered across notebooks, Excel, paper, and Zalo. The landlord cannot quickly see occupancy, recorded late fees, or revenue.

### Current Workflow

1. The landlord re-reads separate sources for rooms, leases, invoices, payments, and repairs.
2. The landlord uses Excel and a calculator to total occupancy, recorded late fees, and revenue when a summary is needed.
3. The landlord follows up through Zalo and rechecks the same sources because no shared record persists the full history.

### Result

Portfolio review is slow and inconsistent, and records can be difficult to verify or recover.

# 4. Future Business Use Cases

These cases describe the matching process after RosiHome is introduced.

## Business Use Case 1 – Automated Billing and Payment

**User Type:** Self-managing landlord and tenant

### Problem

The landlord needs to calculate accurate monthly amounts and a shared payment record without re-entering data across tools.

### Future Workflow

1. The landlord records meter readings and recurring charges in RosiHome.
2. RosiHome calculates rent and utilities and generates a payment QR code for the exact invoice amount.
3. The tenant views the invoice, pays through a bank application, and uploads payment proof; the landlord manually verifies the bank transfer.
4. RosiHome stores the payment history and status for both users.

### Result

The calculation and invoice source are consistent, while proof, manual verification, history, and outstanding amounts remain linked.

## Business Use Case 2 – Lease Renewal

**User Type:** Self-managing landlord and tenant

### Problem

The landlord needs a dependable way to act before lease expiry.

### Future Workflow

1. The landlord stores the lease terms and start and end dates in RosiHome.
2. RosiHome notifies the landlord 15 days before the lease expires.
3. The landlord discusses renewal with the tenant and updates the lease record.

### Result

The landlord has time to renew the lease or prepare a replacement tenant before a room becomes vacant.

## Business Use Case 3 – Maintenance Requests

**User Type:** Self-managing landlord and tenant

### Problem

The landlord and tenant need one visible repair record from submission through completion.

### Future Workflow

1. The tenant submits a request with a description and photos in RosiHome.
2. The landlord reviews it and sets its status to Pending, In Progress, or Completed.
3. The tenant sees status notifications while RosiHome preserves the request history.

### Result

Requests remain visible, follow-up is accountable, and repair history is available to both users.

## Business Use Case 4 – Portfolio Visibility and Centralized Records

**User Type:** Self-managing landlord

### Problem

The landlord needs a quick, consistent view of the rental business and records that persist beyond one device.

### Future Workflow

1. RosiHome persistently links properties, rooms, tenants, leases, invoices, payments, and maintenance requests.
2. The dashboard shows occupancy, monthly revenue, outstanding payments, recorded late fees, and upcoming lease expiries.
3. The landlord opens the relevant record from the dashboard for follow-up.

### Result

The landlord can review the portfolio quickly while the connected history remains available for verification and continuity.

# 5. Illustrative Business Case

**Modelled scenario, not proven savings:** Mr. Tuấn manages a 12-room boarding house. The scenario assigns 400,000 VND to two omitted Wi-Fi charges, 3,500,000 VND to a missed Room 7 renewal and one-month vacancy, and 800,000 VND to damage from an untracked Room 5 leak. The total projected-addressed loss is **4,700,000 VND**.

RosiHome's exact invoice and exact-amount QR, 15-day landlord reminder, maintenance status, and centralized records address these exposure points. The 4,700,000 VND is illustrative and modelled; it is not a measured or guaranteed saving.

# 6. Traceability Matrix

| Pain point | Current → future case | Required components |
|---|---|---|
| P1 Billing errors | 1 Billing and Payment → 1 Automated Billing and Payment | Utility; Billing & Payment; Centralized Records; User and Role Management |
| P2 Missed renewals | 2 Lease Renewal → 2 Lease Renewal | Lease; Notifications; Centralized Records |
| P3 Delayed maintenance | 3 Maintenance Requests → 3 Maintenance Requests | Maintenance; Notifications; Centralized Records |
| P4 Scattered data | 4 Portfolio Visibility → 4 Portfolio Visibility | Property & Room; Tenant; Lease; Billing & Payment; Maintenance; Dashboard & Reporting; Centralized Records |

# 7. Components and Features to be Developed

The MVP includes:

- **User and Role Management:** authentication, profiles, and landlord/tenant access roles.
- **Property and Room:** property and room records, occupancy, and availability.
- **Tenant:** profiles, contact information, and room assignment.
- **Lease:** digital lease details, start/end dates, and a 15-day reminder to the landlord.
- **Utility:** monthly electricity and water readings, consumption calculation, and configurable rates.
- **Billing and Payment:** rent-and-utility invoices, exact-amount payment QR, tenant proof upload, landlord manual bank verification, payment history, outstanding tracking, and recorded late-fee visibility.
- **Maintenance:** request submission, photos, status, and history.
- **Dashboard and Reporting:** occupancy, monthly revenue, outstanding payments, recorded late fees, and upcoming leases.
- **Notifications:** payment, lease, and maintenance-status notifications.
- **Centralized Records and Data Persistence:** linked records for properties, rooms, tenants, leases, invoices, payments, and maintenance.

# 8. Components and Features Excluded

The MVP excludes AI features, rental-market benchmarking, payment-gateway integration or automatic payment verification, legally binding electronic signatures, IoT meter collection, and advanced accounting such as tax, expense, payroll, or audit management.

# 9. Scope Boundary and Conclusion

RosiHome focuses on the four proposal pain points for self-managing landlords and their tenants. It provides manual bank verification and persistent operational records while leaving advanced automation, financial administration, and external payment processing outside the MVP.
