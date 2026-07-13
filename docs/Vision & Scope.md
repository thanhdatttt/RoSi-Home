# Vision and Scope Document

# 1. Background, Context, and Overview

Vietnam has experienced continuous growth in the number of small-scale rental properties, including boarding houses, mini apartments, and rental rooms managed by individual landlords. Unlike large property management companies, these landlords typically own between one and thirty rental units and manage every aspect of their rental business independently. Daily operations such as calculating rent and utility bills, collecting payments, tracking lease agreements, responding to maintenance requests, and monitoring business performance are often performed manually using calculators, spreadsheets, notebooks, and messaging applications such as Zalo.

Although this approach is familiar and inexpensive, it creates significant operational inefficiencies. Monthly rent calculation requires landlords to manually record electricity and water meter readings before calculating charges for every tenant individually. Payment records are often scattered across bank transactions and chat messages, making it difficult to verify completed payments or resolve disputes. Lease renewal dates rely heavily on the landlord's memory, increasing the risk of forgotten contract expirations and unexpected vacancies. Maintenance requests submitted through phone calls or messaging applications can easily be overlooked because there is no centralized tracking mechanism. As rental portfolios grow, landlords also struggle to obtain a clear overview of occupancy, revenue, expenses, and overall business performance.

RosiHome is proposed as a lightweight property management platform specifically designed for self-managing landlords. Rather than targeting enterprise property management companies, the system focuses on digitizing the everyday workflow of small landlords while remaining simple and affordable. The application consolidates room management, tenant management, automated utility calculation, QR-code-based rent payment, payment history, lease tracking, maintenance request management, and financial dashboards into a single platform accessible by both landlords and tenants.

The vision of RosiHome is to replace fragmented manual processes with a centralized digital solution that reduces administrative workload, improves transparency between landlords and tenants, minimizes human error, and enables landlords to manage their rental business more efficiently. By automating repetitive administrative tasks while providing accurate and accessible records, the system allows landlords to spend less time performing routine operations and more time making informed business decisions.

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

|Entity|Description|Relationships|
|---|---|---|
|**Landlord**|Owns and manages one or more rental properties manually.|Manages Properties, Rooms, Tenants, Payments, Contracts, and Maintenance Requests.|
|**Property**|A boarding house or apartment building owned by the landlord.|Contains multiple Rooms.|
|**Room**|Individual rental unit within a property.|Occupied by one Tenant and associated with one Lease Contract.|
|**Tenant**|Individual renting a room.|Occupies one Room, pays Rent, submits Maintenance Requests.|
|**Lease Contract**|Physical or digital document describing rental terms.|Connects a Tenant with a Room and contains rental period information.|
|**Meter Reading**|Electricity and water readings recorded manually each month.|Used to calculate Utility Charges for a Room.|
|**Invoice**|Monthly rent and utility charges calculated manually.|Generated from Rent and Meter Readings and paid by the Tenant.|
|**Payment Record**|Payment evidence stored in spreadsheets, bank applications, or chat history.|Linked to an Invoice but maintained manually.|
|**Maintenance Request**|Repair request submitted through phone calls or messaging applications.|Created by the Tenant and handled by the Landlord without centralized tracking.|

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

## 6.6 Multi-Landlord Collaboration

The system is designed for individual self-managing landlords. Collaborative management involving multiple landlords, staff members, or property management companies is excluded from the project scope.

## 6.7 Advanced Financial Management

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

# 8. Future Domain Model

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

# 9. Assumptions

The successful implementation and operation of RosiHome depends on several assumptions made during project planning and development.

- Self-managing landlords are willing to replace their existing manual workflows with a digital property management system after a short learning period.
- Landlords have access to smartphones or computers with a stable internet connection to manage their rental properties through the application.
- Tenants possess smartphones capable of accessing the application, viewing invoices, scanning VietQR payment codes, and uploading payment receipts.
- Utility meter readings will continue to be entered manually by landlords, and these readings are assumed to be accurate.
- Payments are transferred directly between the tenant's bank account and the landlord's bank account using the VietQR standard. RosiHome does not process or hold any financial transactions.
- Landlords remain responsible for verifying uploaded payment receipts against their own banking applications before confirming payment within the system.
- Lease agreements continue to be negotiated outside the application, while RosiHome serves as a digital repository for lease information and renewal reminders.
- The MVP will be deployed for a relatively small number of landlords managing between one and thirty rental units, which aligns with the project's intended target users.
- Cloud hosting services, database infrastructure, and third-party services used by the application remain available throughout the project lifecycle.

These assumptions establish the operating environment for the MVP and define the conditions under which the proposed solution is expected to achieve its intended objectives.

# 10. Risks

Although RosiHome has been designed to address the operational challenges of self-managing landlords, several risks may affect the successful development and adoption of the system. Identifying these risks early enables appropriate mitigation strategies throughout the project lifecycle.

|Risk|Description|Mitigation Strategy|
|---|---|---|
|**Project schedule delays**|Development may be delayed due to coursework, examinations, or unforeseen technical challenges within the student team.|Prioritize core MVP features, follow an iterative development approach, and postpone non-essential functionality if necessary.|
|**Scope creep**|Additional feature requests may expand the project beyond the planned schedule and available resources.|Freeze the MVP feature set after requirements approval and place additional features in a future development roadmap.|
|**User adoption resistance**|Some landlords may prefer continuing with familiar tools such as Excel, notebooks, or Zalo instead of learning a new system.|Design a simple, intuitive interface and provide an easy onboarding process that closely matches landlords' existing workflows.|
|**Incorrect manual data entry**|Meter readings, tenant information, or payment verification may contain human errors because these processes still require manual input.|Implement input validation, confirmation dialogs, and editable records to reduce the impact of data entry mistakes.|
|**Payment verification limitations**|Since payments are transferred directly between banks, RosiHome cannot automatically verify whether a payment has been successfully completed.|Require landlords to verify uploaded payment receipts against their banking application before confirming payment within the system.|
|**Limited pilot users**|The project may not obtain enough real landlords and tenants to fully evaluate system usability during testing.|Conduct pilot testing through personal networks and gather user feedback early in the development process.|
|**Cloud service dependency**|System availability depends on third-party cloud hosting and database services.|Use reliable cloud providers with backup and recovery mechanisms to minimize service interruptions.|
|**Data privacy concerns**|The application stores tenant personal information, lease records, and payment history, which must be protected from unauthorized access.|Implement authentication, role-based access control, encrypted communication, and secure database management practices.|

Overall, the identified risks are considered manageable because they primarily relate to project management, user adoption, and operational procedures rather than fundamental technical limitations. Proper planning, scope management, and user-centered design will significantly reduce the likelihood and impact of these risks.

---

# 11. Conclusion

RosiHome addresses the operational challenges faced by self-managing landlords by replacing fragmented manual processes with a centralized property management platform. The current rental management workflow relies heavily on notebooks, spreadsheets, calculators, and messaging applications, resulting in repetitive administrative work, calculation errors, inconsistent record keeping, and limited visibility into business performance.

The proposed system streamlines the rental management process by integrating property management, tenant management, lease tracking, automated utility calculation, billing, VietQR-based payments, maintenance request management, and business reporting into a single application. By providing landlords and tenants with centralized access to rental information, the system improves operational efficiency, increases transparency, and reduces disputes caused by missing or inconsistent records.

The project scope focuses on delivering the core functionality required for a practical Minimum Viable Product while deliberately excluding advanced capabilities such as artificial intelligence, rental market benchmarking, IoT integration, and automatic payment verification. These exclusions ensure that the project remains achievable within the available resources and development timeline while establishing a solid foundation for future enhancements.

Ultimately, RosiHome demonstrates how a lightweight, localized property management solution can simplify the everyday workflow of self-managing landlords in Vietnam. By reducing administrative burden and improving access to accurate information, the system supports more efficient rental operations and lays the groundwork for future innovations that can further enhance decision-making and business performance.