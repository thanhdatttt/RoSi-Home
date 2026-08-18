
# Vision and Scope Document

# 1. Background, Context, and Overview

Small landlords in Vietnam often manage one to thirty rental units using notebooks, spreadsheets, calculators, Zalo, and banking applications. This fragmented workflow makes rent and utility calculation, payment tracking, lease renewal, maintenance management, and business monitoring time-consuming and error-prone.

RosiHome is a lightweight platform that centralizes these activities for landlords and tenants. It provides room and tenant management, utility billing, invoices, VietQR payment instructions, payment history, lease tracking, maintenance requests, and dashboards. The goal is to reduce administrative effort, improve transparency, and support more efficient rental management.

---

# 2. Current Business Use Cases

The following workflows describe how landlords and tenants currently manage rental operations before the implementation of RosiHome.

## Business Use Case 1 – Manual Rent and Utility Billing

**User Type:** Self-managing landlord

### Problem

Every month the landlord must manually calculate rental invoices by visiting each room to record electricity and water meter readings. Utility charges are calculated separately using a calculator before being combined with the monthly rent. When managing multiple rental units, this process becomes repetitive, time-consuming, and susceptible to calculation errors.

### Current Workflow

1. The landlord visits every rental unit to record electricity and water meter readings in a notebook.
2. Previous meter readings are retrieved from notebooks or spreadsheets.
3. Utility consumption is manually calculated for each room.
4. The landlord uses a calculator to determine electricity and water charges.
5. Monthly rent and utility charges are added together manually.
6. The landlord sends the payment amount to each tenant individually through Zalo or another messaging application.
7. If a calculation error is discovered, the landlord recalculates the invoice and sends a corrected amount.

### Result

The monthly billing process consumes several hours for each billing cycle. Manual calculations increase the likelihood of billing errors, while repeated visits and message exchanges create unnecessary administrative work for landlords.

---

## Business Use Case 2 – Payment Confirmation and Record Keeping

**User Type:** Self-managing landlord and tenant

### Problem
Payment confirmation depends on bank transfer notifications, screenshots, and chat messages. Because payment records are stored across different platforms, both landlords and tenants may disagree about whether a payment has already been completed.

### Current Workflow
1. The tenant transfers rent to the landlord's bank account.
2. The tenant sends a payment confirmation message or screenshot through Zalo.
3. The landlord checks the banking application to verify the transfer.
4. The landlord manually updates an Excel spreadsheet or notebook to record the payment.
5. If payment evidence cannot be located later, both parties search through previous chat conversations or bank transaction history.

### Result
Payment history is fragmented across spreadsheets, banking applications, and messaging platforms. This makes payment verification difficult and increases the possibility of payment disputes or missing records.

---

## Business Use Case 3 – Lease Renewal and Maintenance Management

**User Type:** Self-managing landlord and tenant

### Problem
Lease expiration dates and maintenance requests are managed informally through memory, notebooks, phone calls, or messaging applications. Important deadlines and repair requests can easily be forgotten.

### Current Workflow
1. The tenant contacts the landlord through a phone call or Zalo to report a maintenance issue or discuss lease renewal.
2. The landlord remembers the request or writes it in a notebook.
3. Lease expiration dates are checked manually by reviewing printed contracts or stored documents.
4. Maintenance work is arranged without any centralized tracking.
5. The landlord manually follows up with tenants regarding repairs or lease renewal.

### Result
Maintenance requests may be delayed or forgotten, while lease renewals may be missed entirely. These issues reduce tenant satisfaction and can lead to unnecessary rental vacancies and income loss.

---

# 3. Current Domain Model

The current rental management process is highly fragmented because no centralized information system exists. Instead, information is distributed across paper documents, spreadsheets, calculators, messaging applications, and banking applications. As a result, data is duplicated, difficult to verify, and challenging to maintain consistently.

The primary entities involved in the current domain are illustrated below.

| Entity                  | Description                                                                  | Relationships                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Landlord**            | Owns and manages one or more rental properties manually.                     | Manages Properties, Rooms, Tenants, Payments, Contracts, and Maintenance Requests. |
| **Property**            | A boarding house or apartment building owned by the landlord.                | Contains multiple Rooms.                                                           |
| **Room**                | Individual rental unit within a property.                                    | Occupied by one or more Tenant(s) and associated with one Lease Contract.          |
| **Tenant**              | Individual renting a room.                                                   | Occupies one Room, pays Rent, submits Maintenance Requests.                        |
| **Lease Contract**      | Physical or digital document describing rental terms.                        | Connects a Tenant with a Room and contains rental period information.              |
| **Meter Reading**       | Electricity and water readings recorded manually each month.                 | Used to calculate Utility Charges for a Room.                                      |
| **Invoice**             | Monthly rent and utility charges calculated manually.                        | Generated from Rent and Meter Readings and paid by the Tenant.                     |
| **Payment Record**      | Payment evidence stored in spreadsheets, bank applications, or chat history. | Linked to an Invoice but maintained manually.                                      |
| **Maintenance Request** | Repair request submitted through phone calls or messaging applications.      | Created by the Tenant and handled by the Landlord without centralized tracking.    |

In the current domain, relationships between these entities are not maintained within a single system. Instead, landlords manually transfer information between notebooks, spreadsheets, calculators, and messaging applications whenever monthly operations are performed. This fragmented process creates inconsistencies, duplicate records, and additional administrative effort, highlighting the need for a centralized property management platform such as RosiHome.

# 4. Current Users' Problems and Objectives
RosiHome is designed to address the operational challenges experienced by both self-managing landlords and tenants. Although landlords and tenants share the same rental process, their problems and objectives differ depending on their responsibilities within the business.

## 4.1 Self-Managing Landlord
The landlord is responsible for managing the entire rental operation, including tenant records, rent calculation, payment tracking, lease management, maintenance coordination, and financial monitoring. Most of these activities are performed manually, making the management process increasingly difficult as the number of rental units grows.

|Current Problem|Objective|
|---|---|
|Monthly rent and utility bills are calculated manually using calculators and spreadsheets.|Automatically calculate rent and utility charges accurately to reduce administrative effort and calculation errors.|
|Payment records are scattered across bank applications, spreadsheets, and messaging platforms.|Maintain a centralized payment history that can be easily verified and referenced when disputes occur.|
|Lease expiration dates depend on memory or manual record checking.|Receive automatic reminders before leases expire to reduce unexpected vacancies and support timely renewals.|
|Maintenance requests are received through phone calls or messaging applications without centralized tracking.|Record, monitor, and update maintenance requests within a single system until they are completed.|
|Financial information is distributed across multiple tools, making business performance difficult to evaluate.|View occupancy, rental income, outstanding payments, and portfolio performance through a centralized dashboard.|

---

## 4.2 Tenant
Tenants currently have limited visibility into their rental information and depend on direct communication with landlords for most rental-related activities.

|Current Problem|Objective|
|---|---|
|Rent charges and utility calculations are not always transparent.|View detailed monthly invoices that clearly show rent and utility charges.|
|Payment history is difficult to verify after payments are completed.|Access a complete record of previous payments for future reference.|
|Maintenance requests can be forgotten because they are submitted through chat messages or phone calls.|Submit maintenance requests through the system and monitor their progress until completion.|
|Lease information is stored in paper contracts or shared documents that are difficult to access.|View lease information and important contract dates within the application.|

By addressing these problems, RosiHome aims to simplify rental management for landlords while providing tenants with greater transparency and confidence throughout the rental process.

---

# 5. Components and Features to be Developed
The project scope focuses on developing the core functionality required to digitize the day-to-day rental management workflow for self-managing landlords. The following components will be implemented in the Minimum Viable Product (MVP).

## 5.1 User Management
- User registration and authentication
- Role-based access for landlords and tenants
- User profile management

## 5.2 Property and Room Management
- Property registration
- Room creation and management
- Room occupancy status
- Room availability management

## 5.3 Tenant Management
- Tenant profile management
- Tenant assignment to rooms
- Tenant contact information management

## 5.4 Lease Management
- Digital lease information storage
- Lease start and end date management
- Automatic lease renewal reminders

## 5.5 Utility Management
- Monthly electricity and water meter recording
- Automatic utility consumption calculation
- Configurable utility pricing
- Automatic invoice generation

## 5.6 Billing and Payment Management
- Monthly rent invoice generation
- VietQR payment QR code generation
- Payment proof upload by tenants
- Manual payment verification by landlords
- Payment history management
- Outstanding payment tracking

## 5.7 Maintenance Management
- Maintenance request submission
- Photo attachment for maintenance issues
- Request status tracking
- Maintenance history management

## 5.8 Dashboard and Reporting
- Monthly revenue summary
- Occupancy statistics
- Outstanding payment overview
- Basic financial dashboard

## 5.9 Notifications
- Rent payment reminders
- Lease expiration reminders
- Maintenance status notifications

Collectively, these components establish a centralized property management platform that replaces the fragmented manual workflow currently used by self-managing landlords.

---

# 6. Components and Features Excluded
To ensure that the project remains achievable within the allocated development schedule, several advanced features are intentionally excluded from the MVP. These features may be considered for future versions of RosiHome but will not be implemented as part of the current project.

## 6.1 Artificial Intelligence Features
The project will not include AI-powered capabilities such as:

- AI-generated business insights and recommendations
- Predictive vacancy forecasting
- Rent pricing recommendations
- Abnormal utility usage detection
- Automatic identification of overdue payments
- Personalized landlord decision support

These capabilities align with RosiHome's long-term vision but require substantial historical data and additional machine learning infrastructure beyond the scope of the MVP.

## 6.2 Rental Market Benchmarking
The system will not collect or analyze anonymized market-wide rental data for benchmarking purposes. Features such as comparing rental prices, occupancy rates, maintenance trends, or payment behavior across similar properties are outside the current project scope.

## 6.3 Online Payment Gateway Integration
RosiHome will generate VietQR payment codes only. It will not integrate directly with banking systems or payment gateways to automatically verify or process financial transactions.

## 6.4 Legally Binding Electronic Contracts
The application will store lease information digitally but will not provide legally binding electronic signatures or electronic contract execution.

## 6.5 Internet of Things (IoT) Integration
Automatic collection of electricity or water meter readings through smart devices will not be supported. Meter readings will continue to be entered manually by landlords.

## 6.6 Advanced Financial Management
The application will not include comprehensive accounting features such as tax reporting, expense management, payroll, or financial auditing. The dashboard will focus on operational metrics relevant to rental property management.

These exclusions ensure that development effort remains focused on delivering a stable and usable MVP that addresses the primary pain points identified during the requirements analysis, while leaving opportunities for future expansion beyond the scope of this project.

# 7. Future Business Use Cases
The following business use cases describe how rental management activities will be performed after the implementation of RosiHome. These workflows demonstrate how the system improves efficiency, transparency, and communication between landlords and tenants by replacing fragmented manual processes with a centralized platform.

## Business Use Case 1 – Automated Monthly Billing and Payment

**User Type:** Self-managing landlord and tenant

### Problem
The landlord needs an efficient method to calculate monthly rent and utility charges while ensuring tenants receive accurate invoices and can make payments conveniently without manual communication.

### Future Workflow
1. The landlord logs into RosiHome and records the latest electricity and water meter readings for each occupied room.
2. RosiHome automatically calculates utility consumption based on the previous month's readings and the configured utility rates.
3. The system generates a monthly invoice that combines rent and utility charges for each tenant.
4. A VietQR payment code is automatically generated using the landlord's registered bank account information.
5. The tenant logs into the application, reviews the invoice, and scans the QR code using their preferred banking application to complete the payment.
6. The tenant uploads the payment receipt through RosiHome.
7. The landlord verifies the payment against their bank account and marks the invoice as paid.
8. The payment history is automatically stored and becomes accessible to both landlord and tenant.

### Result

The monthly billing process becomes faster and more accurate because rent and utility calculations are automated. Both landlords and tenants have access to a centralized payment history, reducing disputes caused by missing or inconsistent payment records.

---

## Business Use Case 2 – Lease Management and Maintenance Tracking

**User Type:** Self-managing landlord and tenant

### Problem
Lease renewals and maintenance requests must be managed systematically to prevent forgotten deadlines, delayed repairs, and tenant dissatisfaction.

### Future Workflow
1. When a new tenant moves in, the landlord creates a digital lease record within RosiHome, including the lease period and rental terms.
2. The system continuously monitors lease expiration dates.
3. Before the lease expires, RosiHome automatically sends reminder notifications to both the landlord and the tenant.
4. If the tenant wishes to renew the lease, both parties discuss the renewal and the landlord updates the lease information in the system.
5. If the tenant encounters a maintenance issue, they submit a maintenance request through the application, including a description and supporting photographs.
6. The landlord reviews the request, updates its status (e.g., Pending, In Progress, Completed), and arranges the necessary repairs.
7. The tenant receives notifications whenever the maintenance request status changes until the issue is resolved.

### Result
Lease renewals are handled before contracts expire, reducing unexpected vacancies. Maintenance requests are tracked from submission to completion, ensuring better communication, improved response times, and increased tenant satisfaction.

## Business Use Case 3 – Portfolio Performance Monitoring

**User Type:** Self-managing landlord

### Problem
The landlord needs a clear overview of the rental business to monitor occupancy, revenue, outstanding payments, and overall property performance without manually compiling information from multiple sources.

### Future Workflow
1. The landlord logs into RosiHome and opens the dashboard.
2. The system automatically aggregates data from properties, rooms, invoices, lease records, and payment history.
3. The dashboard displays key performance indicators, including occupancy rate, monthly rental income, outstanding payments, and upcoming lease expirations.
4. The landlord reviews the information to identify vacant rooms, overdue payments, or leases approaching expiration.
5. If necessary, the landlord navigates directly from the dashboard to the corresponding property, invoice, or lease record to perform follow-up actions.

### Result
The landlord gains an up-to-date overview of the rental business without manually compiling information from spreadsheets or notebooks. This enables faster decision-making, improves financial visibility, and helps identify operational issues before they become significant problems.

---

# 8. Business Process Comparison

## 8.1 Business Process Comparison with Competitors

The competitors identified in the Proposal (EasyTro, Resident, Quản lý trọ – CL Team) are not just alternative feature sets — they encode different business processes for the same rental-management activities. The table below compares the monthly billing process, the leading operational workflow for a landlord, at the process-step level.

| Process Step | EasyTro (Zalo Mini App)| Quản lý trọ – CL Team (Android app) | RosiHome |
|---|---|---|---|
| Where the process runs | Inside Zalo, as a Mini App | Native Android app only | Mobile app (landlord) + mobile app (tenant), accessible cross-platform |
| Meter reading capture | Manual entry inside Zalo Mini App | Manual entry in-app | Manual entry in-app |
| Invoice generation & delivery | Automatic invoice with VietQR, delivered inside Zalo | Automatic invoice generated in-app, but no dedicated tenant delivery channel — landlord still has to relay it | Automatic invoice generated and delivered directly to the tenant's own account/app |
| Payment confirmation | VietQR paid, but confirmation still generally relies on the landlord checking the bank side | Manual — landlord checks bank app/SMS and updates status themselves | Landlord confirms against invoice-linked bank reference inside RosiHome; both parties see the same status |
| Tenant visibility into the process | Limited - no tenant miniapp| No tenant-facing surface; tenant is outside the system entirely | Tenant has a first-class account with visibility into invoices, payment history, lease, and maintenance status |
| Process ownership if something goes wrong | Landlord must resolve inside Zalo's UI constraints | Landlord resolves manually outside the app (calls/Zalo), since the app has no bidirectional workflow | Both landlord and tenant can see and act on the same record inside RosiHome, reducing "he said / she said" disputes |

**Interpretation.** EasyTro's process is efficient for the landlord but keeps the tenant outside the system. CL Team's process barely differs from a fully manual one because the app is a single-user record-keeper, not a workflow tool. RosiHome's business process is deliberately scoped between these two extremes: fully digital and two-sided like Resident, but with the reduced step-count and setup effort of a tool built specifically for small self-managing landlords.

## 8.2 Business Process Comparison with Manual Combination of Existing Tools

This compares RosiHome's future billing process (Section 7, Use Case 1) against the *current* manual process described in Section 2, Use Case 1 — i.e., what happens if a landlord keeps using notebook/Excel + calculator + Zalo + personal memory instead of adopting any product.

| Process Step | Manual Combination (current state) | RosiHome (future state) |
|---|---|---|
| Number of tools/surfaces touched per billing cycle | At least four: notebook (readings), calculator (charges), Excel or memory (record), Zalo (communication) | One: RosiHome |
| Who performs the calculation | Landlord, by hand or excel function, per room, per month | System, automatically, from stored rates and the previous reading |
| Who propagates data between steps | Landlord manually re-types/re-reads values between notebook → calculator → Zalo message | System — a single stored record flows through invoice generation, QR payment, and history without re-entry |
| Failure mode when a step is skipped or mistyped | Silent — an error is only caught if the tenant notices and disputes it | Reduced — the calculation is deterministic from a single source of the previous reading and rate configuration |
| Where payment status "lives" | Landlord's memory + scattered bank/Zalo messages, not visible to the tenant | A shared invoice/payment record visible to both landlord and tenant |
| Effort trend as the number of rooms grows | Scales roughly linearly with manual, per-room work each month | Scales with data entry (meter readings) only; calculation, invoicing, and history do not add manual effort per room |

**Interpretation.** The manual process is not "worse" because any individual step is hard — recording a meter reading or typing a Zalo message is trivial in isolation. It is worse because the *landlord is the connective tissue between steps*, and that connective work (i) does not scale as rooms are added, (ii) is invisible to the tenant, and (iii) has no audit trail when a dispute happens. RosiHome's future business process removes the landlord from the role of manual data-router between tools; this is the same underlying finding as the feature-level comparison in Proposal Section 4.5, now shown at the process/workflow level as required for this document.

---

# 9. Future Domain Model

After the implementation of RosiHome, all rental management information is centralized within a single integrated information system. Instead of relying on multiple disconnected tools, landlords and tenants interact with a unified platform that maintains consistent relationships between business entities.

Compared with the current domain model, the future domain introduces several new system-managed entities that automate rental operations and improve information consistency.

|Entity|Description|Relationships|
|---|---|---|
|**Landlord**|Manages rental properties through the RosiHome platform.|Owns Properties, manages Rooms, Leases, Invoices, Payments, and Maintenance Requests.|
|**Tenant**|Uses the application to access invoices, payment history, lease information, and maintenance services.|Occupies a Room, receives Invoices, submits Maintenance Requests, and uploads Payment Proof.|
|**Property**|A rental property owned by a landlord.|Contains multiple Rooms.|
|**Room**|Individual rental unit within a property.|Assigned to one Tenant through an active Lease.|
|**Lease**|Digital record containing lease details and rental period.|Connects a Tenant and a Room while generating renewal reminders.|
|**Meter Reading**|Monthly electricity and water readings entered by the landlord.|Used to calculate Utility Charges.|
|**Invoice**|Automatically generated monthly bill containing rent and utility charges.|Generated for a Tenant and associated with a Payment.|
|**Payment**|Record of payment verification and uploaded payment proof.|Linked to one Invoice and maintained within the system.|
|**Maintenance Request**|Digital repair request submitted by a tenant.|Contains request details, photographs, and current status.|
|**Notification**|System-generated reminder or update sent to users.|Triggered by lease renewals, invoice generation, payment reminders, and maintenance status changes.|
|**Dashboard**|Aggregated business information presented to landlords.|Displays data derived from Properties, Rooms, Invoices, Payments, and Leases.|

Unlike the current domain model, the future domain centralizes all business information within RosiHome, eliminating duplicated records across notebooks, spreadsheets, and messaging applications. Relationships between entities are maintained automatically by the system, enabling consistent data management, simplified business processes, and improved operational transparency.

---

# 10. Intended Business Plan

RosiHome is expected to generate revenue primarily from landlords through the following possible plans:

- **Monthly subscription:** recurring payment for access to the core property-management features.
- **Annual subscription:** discounted yearly payment for landlords who commit to longer-term use.
- **Premium lifetime plan:** one-time payment for permanent access to a defined feature set, subject to reasonable service and infrastructure limitations.
- **Optional paid add-ons:** additional storage, advanced reports, or future automation features.

Tenants are not expected to pay for basic access. The final pricing and plan limits will be determined after the MVP pilot validates willingness to pay and operating costs. RosiHome will not generate revenue by holding tenant funds or charging a fee for processing bank transfers.

---

# 11. Conclusion

RosiHome replaces fragmented rental-management tasks with one centralized platform for billing, payments, leases, maintenance, and reporting. This improves operational efficiency and transparency for landlords and tenants.

The MVP deliberately excludes advanced features such as AI analytics, market benchmarking, IoT integration, and automatic payment verification so that the project remains achievable within the available resources and timeline. These exclusions leave a clear foundation for future development.
