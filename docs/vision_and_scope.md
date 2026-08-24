# Vision and Scope Document
# 1. Vision and Scope
RosiHome supports self-managing landlords with roughly 10–50 rooms and their tenants. It centralizes invoices, overdue follow-up, leases, maintenance, and property monitoring while keeping bank-transfer checking outside the system.
# 2. Use Cases
## UC-01 Generate & Send Invoice
**User:** Landlord
**Goal:** Create a complete, correct monthly invoice and deliver it to the tenant.
**Current Workflow:**
1. Read electricity and water meters and gather recurring charges.
2. Calculate charges with a calculator and Excel.
3. Record the total and send the bill through Zalo.
**Current Goal Achievement:** **Partially.** The invoice is delivered, but repeated entry can miscalculate charges.
**Future Workflow (RosiHome):**
1. Enter meter readings and recurring charges.
2. RosiHome calculates and stores an itemized invoice with an exact-amount QR.
3. The tenant receives the invoice in RosiHome.
**Future Goal Achievement:** **Yes.** One stored calculation produces the invoice and delivery record; payment follow-up belongs to UC-02.
## UC-02 Follow Up Overdue Payment
**User:** Landlord and tenant
**Goal:** Collect overdue rent and link each received payment to the correct invoice.
**Current Workflow:**
1. Find unpaid invoices in Excel and send each tenant a separate Zalo reminder.
2. The tenant pays through a banking application and sends proof through Zalo.
3. The landlord checks the transfer and full amount, then marks the invoice paid in Excel.
**Current Goal Achievement:** **Partially.** Payment can be confirmed, but follow-up and records are repeated across Excel, Zalo, and the bank app.
**Future Workflow (RosiHome):**
1. RosiHome sends reminders to all overdue tenants at once.
2. The tenant pays externally and uploads proof to the invoice.
3. The landlord independently checks the banking application and manually records payment status in RosiHome.
**Future Goal Achievement:** **Partially.** Reminders, proof, and status are linked, but RosiHome does not access or verify bank transfers.
## UC-03 Manage Lease & Renewal
**User:** Landlord, with tenant participation
**Goal:** Identify leases approaching expiry and decide renewal or departure before a room becomes unexpectedly vacant.
**Current Workflow:**
1. Store lease dates in paper contracts or Excel.
2. Search the records or rely on memory near expiry.
3. Contact the tenant through Zalo and update the record if action is taken.
**Current Goal Achievement:** **Partially.** Renewal can be handled when the date is noticed, but a missed date can cause vacancy.
**Future Workflow (RosiHome):**
1. Store lease dates in the lease record.
2. RosiHome reminds the landlord 15 days before expiry.
3. The landlord discusses the decision with the tenant and updates the lease.
**Future Goal Achievement:** **Yes.** The reminder makes the lease visible in time.
## UC-04 — Track and Follow Up Maintenance
**Users:** Tenant and landlord
**Goal:**  
Ensure reported maintenance issues remain visible and are followed up until resolution, reducing the risk of requests being overlooked or delayed.
**Current Workflow:**
1. The tenant reports the problem by call or Zalo.
2. The landlord records the request in a notebook, Excel, or memory.
3. The landlord arranges the repair and follows up manually.
**Current Goal Achievement:** **Partially.**  A repair may eventually be completed, but reported issues are not visible and might not be followed up until completion.
**Future Workflow (RosiHome):**
4. The tenant submits a maintenance request with a description and photos.
5. RosiHome stores the request as a centralized record.
6. The landlord reviews the request and sets its status: **Pending → In Progress → Completed**.
7. The tenant can see the request status and receive relevant updates.
8. The landlord can review outstanding requests and identify those that remain unresolved.
9. The request remains in the system with its status and history until marked Completed.
**Future Goal Achievement:** **Yes.**  RosiHome provides a persistent record and visible status for each maintenance request, making unresolved issues easier to identify and follow up.
## UC-05 Monitor Property Operations
**User:** Landlord
**Goal:** See the property's current operating state, detect an issue, and act on the correct record quickly.
**Current Workflow:**
1. **View:** Review Excel summaries and supporting paper, Zalo, and banking records.
2. **Detect:** Compare totals, dates, and statuses to find an unpaid invoice, expiring lease, vacancy, or open repair.
3. **Open:** Search for the related spreadsheet row, contract, message, or transaction.
4. **Act:** Send a reminder, contact a tenant, arrange a repair, or update the separate records.
**Current Goal Achievement:** **Partially.** The landlord can act after compiling the information, but the view and update may be slow or outdated.
**Future Workflow (RosiHome):**
1. **View:** Open dashboard indicators for occupancy, payments, revenue, leases, and maintenance.
2. **Detect:** Select an outstanding payment, upcoming expiry, available room, or open request.
3. **Open:** Go directly to the linked invoice, lease, room, or maintenance record.
4. **Act:** Send reminders or update the relevant record and follow-up status.
**Future Goal Achievement:** **Yes.** The dashboard connects overview, issue detection, records, and actions without a separate Excel summary.
# 3. Components and Features to be Developed
| Component | MVP features |
|---|---|
| User and Role Management | Authentication, profiles, and landlord/tenant permissions. |
| Property and Room | Property and room records, occupancy, and availability. |
| Tenant | Tenant profiles, contact information, and room assignment. |
| Lease | Digital details, start/end dates, and a landlord reminder 15 days before expiry. |
| Utility | Electricity/water readings, consumption calculation, and configurable rates. |
| Billing and Payment | Itemized invoices, exact-amount QR, due dates, proof upload, landlord-controlled status, history, outstanding tracking, and recorded late-fee visibility. |
| Maintenance | Requests, photos, status, notifications, and history. |
| Dashboard and Reporting | Occupancy, payments, recorded late fees, revenue, upcoming leases, and open requests. |
| Notifications | Bulk overdue-rent reminders plus lease and maintenance notifications. |
| Centralized Records | Linked property, room, tenant, lease, invoice, payment, and maintenance records. |
# 4. Components and Features Excluded
The MVP excludes bank-account access or bank-transfer verification, payment-gateway integration, AI features, IoT meter collection, and advanced accounting such as tax management.
# 5. Scope Boundary and Conclusion
The five use cases cover the Proposal pain areas and define the MVP workflow scope. RosiHome stores proof and landlord-recorded payment status, but the landlord independently checks the bank before marking an invoice paid.
