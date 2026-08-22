# Vision and Scope Document
# 1. Vision and Scope
RosiHome is a software platform for self-managing landlords who manage roughly 10–50 rooms and their tenants. The system calculates invoices, generates exact-amount payment QR codes, sends overdue-rent reminders, accepts payment proof, lets landlords record payment status, sends lease reminders, and keeps repair requests visible.
# 2. Current Use Cases
These cases describe the manual process using Excel + Zalo and calculator before RosiHome.
## Use Case 1 – Rent and Utility Billing
**User Type:** Self-managing landlord
### Problem
Rent and utility billing depends on meter readings, a calculator, Excel, and Zalo. Re-entering charges can create incorrect invoices.
### Current Workflow
1. The landlord reads each room's electricity and water meters and gathers recurring charges.
2. The landlord calculates rent and utilities with a calculator and Excel, then records the total.
3. The landlord sends each bill separately through Zalo.
### Result
Billing takes time, and incorrect calculations can undercharge or overcharge a tenant.
## Use Case 2 – Late-Payment Follow-up and Reconciliation
**User Type:** Self-managing landlord and tenant
### Problem
Tenants may forget the deadline, while the landlord must remind them and reconcile every later payment across separate tools.
### Current Workflow
1. After the deadline, the landlord opens Excel to find invoices that are not marked paid.
2. The landlord sends a separate Zalo reminder to each late tenant.
3. For each later payment, the landlord finds the proof in Zalo, opens the banking application to confirm the transfer and full amount, and marks the invoice paid in Excel.
### Result
Following up with late tenants and reconciling payments requires repeated work across Excel, Zalo, and the banking application.
## Use Case 3 – Lease Renewal
**User Type:** Self-managing landlord and tenant
### Problem
Lease dates are kept in paper contracts or spreadsheets and remembered manually. A missed renewal can leave a room vacant.
### Current Workflow
1. The landlord stores lease dates in a paper contract or Excel.
2. Near expiry, the landlord searches records or relies on memory and contacts the tenant through Zalo.
3. If the date is missed, the landlord realizes it later and must renew the lease or find a new tenant.
### Result
Renewal follow-up is inconsistent and a missed renewal can create vacancy.
## Use Case 4 – Maintenance Requests
**User Type:** Self-managing landlord and tenant
### Problem
Maintenance requests arrive through calls and chats, where they can be buried among unrelated conversations and delayed.
### Current Workflow
1. The tenant reports a problem by phone or Zalo.
2. The landlord remembers it or writes it in a notebook or spreadsheet.
3. The landlord arranges repair and follows up manually with the tenant.
### Result
There is no reliable request list or status tracking, so the landlord may forget requests and leave issues unresolved.
## Use Case 5 – Portfolio Overview
**User Type:** Self-managing landlord
### Problem
The landlord needs a quick overview of the property's current operating situation, but Excel mainly stores detailed records rather than summary. 
### Current Workflow
1. The landlord opens Excel and reviews different sheets or records for rooms, tenants, payments, leases, and maintenance.
2. To obtain a portfolio-level summary, the landlord manually calculates totals or write excel formulas.
3. The landlord checks the results and may update the summary when underlying records change.
4. If the landlord has not prepared these calculations in advance, obtaining the required information takes additional time.
### Result
The required information exists in Excel, but it is fragmented across records and is not immediately available as an operational overview. The landlord must prepare and maintain additional calculations or summary views to get the information quickly.
# 3. Future Use Cases
These cases describe the matching process after RosiHome is introduced.
## Use Case 1 – Automated Rent and Utility Billing
**User Type:** Self-managing landlord and tenant
### Problem
The landlord needs to calculate accurate monthly amounts without re-entering charges across tools.
### Future Workflow
1. The landlord records meter readings and recurring charges in RosiHome.
2. RosiHome calculates rent and utilities and generates a payment QR code for the exact invoice amount.
3. The tenant receives and reviews the itemized invoice in RosiHome.
### Result
The calculation and invoice source are consistent, reducing repeated entry and omitted charges.
## Use Case 2 – Late-Payment Follow-up and Reconciliation
**User Type:** Self-managing landlord and tenant
### Problem
The landlord needs to remind late tenants efficiently and record payment status without searching Excel and Zalo for each case.
### Future Workflow
1. When invoices become overdue, RosiHome sends reminders to all late tenants at once.
2. A tenant opens the invoice, pays through a banking application, and uploads payment proof to RosiHome.
3. The landlord independently opens the banking application, compares the received transfer with the invoice and proof displayed in RosiHome, and manually marks the invoice paid in RosiHome.
4. RosiHome stores the proof, landlord-recorded status, and payment history; it does not access the bank account or verify the transfer.
### Result
Reminders, proof, and payment status stay linked to the invoice, while final reconciliation remains the landlord's responsibility outside RosiHome.
## Use Case 3 – Lease Renewal
**User Type:** Self-managing landlord and tenant
### Problem
The landlord needs a dependable way to act before lease expiry.
### Future Workflow
1. The landlord stores the lease terms and start and end dates in RosiHome.
2. RosiHome notifies the landlord 15 days before the lease expires.
3. The landlord discusses renewal with the tenant and updates the lease record.
### Result
The landlord has time to renew the lease or prepare a replacement tenant before a room becomes vacant.
## Use Case 4 – Maintenance Requests
**User Type:** Self-managing landlord and tenant
### Problem
The landlord and tenant need one visible repair record from submission through completion.
### Future Workflow
1. The tenant submits a request with a description and photos in RosiHome.
2. The landlord reviews it and sets its status to Pending, In Progress, or Completed.
3. The tenant sees status notifications while RosiHome preserves the request history.
### Result
Requests remain visible, follow-up is accountable, and repair history is available to both users.
## Future Use Case 5 – Dashboard Portfolio Overview
**User Type:** Self-managing landlord
### Problem
The landlord needs to understand the current state of the property quickly without manually compiling information from multiple records.
### Future Workflow
1. RosiHome automatically aggregates information from rooms, tenants, leases, invoices, payments, and maintenance records.
2. The landlord opens the dashboard and immediately sees key operational indicators, including occupancy and availability, outstanding payments, monthly revenue, upcoming lease expiries, and open maintenance requests.
3. The landlord selects an indicator or record to view the underlying details when further action is required.
### Result
The landlord gets a current operational overview in one place without building or maintaining separate Excel formulas, summary tables, or dashboards.
# 4. Components and Features to be Developed
The MVP includes:

- **User and Role Management:** authentication, profiles, and landlord/tenant access roles.
- **Property and Room:** property and room records, occupancy, and availability.
- **Tenant:** profiles, contact information, and room assignment.
- **Lease:** digital lease details, start/end dates, and reminder system for the landlord.
- **Utility:** monthly electricity and water readings, consumption calculation, and configurable rates.
- **Billing and Payment:**  invoices, exact-amount payment QR, due dates, tenant proof upload,  payment status, payment history, outstanding tracking, and late-fee visibility. 
- **Maintenance:** request submission, photos, status, and history.
- **Dashboard and Reporting:** room occupancy, availability, and occupancy rate; monthly revenue; outstanding payments; recorded late fees; upcoming leases; and open maintenance requests.
- **Notifications:** one action to remind all tenants with overdue invoices; lease and maintenance request notifications.
- **Centralized Records and Data Persistence:** linked records for properties, rooms, tenants, leases, invoices, payments, and maintenance.
# 5. Components and Features Excluded
The MVP excludes bank-account access or bank-transfer verification, payment-gateway integration, AI features, IoT meter collection, and advanced accounting such as tax.
# 6. Scope Boundary and Conclusion
RosiHome covers the five Proposal pain points for self-managing landlords and their tenants. It centralizes operational records and landlord-controlled payment status, but the landlord independently checks every received transfer in a banking application before marking an invoice paid. Bank access, bank verification, and external payment processing remain outside the MVP.
