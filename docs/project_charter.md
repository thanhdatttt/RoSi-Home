# Project Charter – RosiHome

## 1. Project Background, Context, and Overview

### Project Title

**RosiHome – Property Management Platform for Self-Managing Landlords**

### Project Purpose

Vietnamese self-managing landlords commonly rely on notebooks, spreadsheets, calculators, and messaging applications such as Zalo to manage rental properties. These fragmented manual processes lead to calculation errors, payment disputes, forgotten lease renewals, and inefficient maintenance management.

RosiHome is a lightweight property management platform that centralizes rental operations into a single application. The system enables landlords to manage properties, tenants, lease agreements, utility billing, VietQR-based payments, maintenance requests, and business dashboards while allowing tenants to view invoices, payment history, lease information, and maintenance status.

This project formally authorizes the development of the RosiHome Minimum Viable Product (MVP) to satisfy the needs and expectations of its primary stakeholders.

---

# 2. Project Objectives

The project aims to:

- Develop a centralized rental management platform for self-managing landlords.
- Reduce manual administrative work through automation of rent and utility calculations.
- Improve transparency between landlords and tenants.
- Reduce payment disputes through centralized payment records.
- Improve lease and maintenance management.
- Deliver a functional MVP within the planned academic schedule.

---

# 3. Project Scope

### In Scope

- User authentication
- Property and room management
- Tenant management
- Lease management
- Utility calculation
- Monthly invoice generation
- VietQR payment generation
- Payment history
- Maintenance request management
- Dashboard and reporting
- Notifications

### Out of Scope

- AI-powered analytics
- Payment gateway integration
- Electronic signatures
- IoT smart meter integration
- Multi-landlord collaboration
- Advanced accounting features

---

# 4. Project Management and Governance

The team consists of **three part-time backend developers and two part-time frontend developers**. Work follows the batch-based Team scope recorded in `docs/estimate/Observed Delivery Inputs.md`: backend owners implement APIs and business logic, while frontend owners implement and integrate the mobile UI for the same assigned User Stories. One member, **Chí (BE1)**, also serves as **Project Manager / Team Leader**.

| Role | Name | Responsibilities |
|---|---|---|
| Project Sponsor | University Supervisor / Lecturer | Approves the project, provides academic guidance, reviews progress, approves final deliverables. |
| Project Manager / Team Leader | **Chí** | Plans and monitors the project, maintains Trello and the delivery baseline, coordinates dependencies and communication, manages risks and changes, and reports progress to the Sponsor. |
| Backend Developer 1 (BE1) | **Chí** | Backend: Auth/Profile (`US-AUTH-01→06`, `US-PROFILE-01`), Tenant/Lease (`US-TENANT-01→02`, `US-LEASE-01→06`), Batch 3 review/test/bug fixing, and Dashboard (`US-DASH-01→02`). Sets up backend and frontend infrastructure and Render CD; writes Product Backlog 2.0, Project Estimation, Project Proposal, and Vision and Scope. |
| Backend Developer 2 (BE2) | **Đạt** | Backend: Property/Room (`US-PROPERTY-01→02`, `US-ROOM-01→03`), Meter (`US-METER-01→03`), Invoice (`US-INVOICE-01→04`), and Dashboard (`US-DASH-03→04`). Sets up quality tooling and CI; writes the Technical Architecture and Project Charter. |
| Backend Developer 3 (BE3) | **Minh** | Backend: Utility/Charge (`US-UTILITY-01→02`, `US-CHARGE-01`), Maintenance (`US-MAINT-01→05`), VietQR/Payment/Reminder (`US-VIETQR-01→02`, `US-PAYMENT-01→03`, `US-REMINDER-01→02`), and Report (`US-REPORT-01→05`). Writes Product Backlog Version 1. |
| Frontend Developer 1 (FE1) | **Hưng (MXH)** | Mobile frontend: Auth/Profile (`US-AUTH-01→06`, `US-PROFILE-01`), Tenant/Lease (`US-TENANT-01→02`, `US-LEASE-01→06`), Invoice (`US-INVOICE-01→04`), and Dashboard (`US-DASH-01→04`). Writes the Statement of Work and Risk Management Plan. |
| Frontend Developer 2 (FE2) | **Quân** | Mobile frontend: Property/Room/Utility/Charge (`US-PROPERTY-01→02`, `US-ROOM-01→03`, `US-UTILITY-01→02`, `US-CHARGE-01`), Meter/Maintenance (`US-METER-01→03`, `US-MAINT-01→05`), VietQR/Payment/Reminder (`US-VIETQR-01→02`, `US-PAYMENT-01→03`, `US-REMINDER-01→02`), and Report (`US-REPORT-01→05`). |
| Product Owner | Self-Managing Landlords (Representative Users) | Provide business requirements, validate workflows, participate in user acceptance testing, provide feedback. |
| End Users | Landlords and Tenants | Use the system during pilot testing and evaluate usability and functionality. |

---

# 5. RACI Matrix — Task-to-Member Responsibility Assignment

### 5.1 Purpose

A Responsibility Assignment Matrix (RACI) maps every deliverable to the people involved in it, using four designations: **R**esponsible (does the work), **A**ccountable (owns the outcome and signs off — exactly one per row), **C**onsulted (gives input before the work is done), and **I**nformed (told after the work is done). The delivery matrix covers product features and the technical, management, and documentation tasks defined in Product Backlog 2.0.

### 5.2 Legend

| Abbreviation | Full Name | Role |
|---|---|---|
| **PM** | Trần Khôn Chí | Project Manager / Team Leader (coordination-level involvement only) |
| **Chí** | Trần Khôn Chí | Backend Developer 1 (BE1) |
| **Đạt** | Phạm Thành Đạt | Backend Developer 2 (BE2) |
| **Minh** | Nguyễn Văn Minh | Backend Developer 3 (BE3) |
| **MXH** | Mai Xuân Hưng | Frontend Developer 1 (FE1) |
| **Quân** | Nguyễn Huy Quân | Frontend Developer 2 (FE2) |
| **SPN** | — | Project Sponsor / Lecturer |
| **LR** | — | Landlord Representatives (Product Owner group) |
| **TN** | — | Tenants (secondary end users, consulted during pilot) |

### 5.3 Governance-Level RACI

| Decision / Activity | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Charter approval | PM | SPN | Dev Team, LR | — |
| Scope, deadline, architecture, or budget baseline change | PM | SPN | Dev Team | LR |
| Story clarification within approved scope | Assigned member + affected API/UI owner | PM | — | SPN |
| Risk identification and mitigation planning | PM | PM | Dev Team | SPN |
| Batch/integration ownership assignment | PM | PM | Batch owners | Dev Team |
| Sponsor progress review | PM | SPN | — | Dev Team |
| Final deliverable acceptance | Dev Team | SPN | PM, LR | Dev Team |

### 5.4 Delivery-Level RACI

| Delivery Item | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| F-01-BE Backend API and business logic — User Registration, Authentication, and Profile (AUTH-01→06, PROFILE-01) | Chí (BE1) | Chí (BE1) | MXH (FE1), LR | SPN |
| F-01-FE Frontend UI/UX and API integration — User Registration, Authentication, and Profile (AUTH-01→06, PROFILE-01) | MXH (FE1) | MXH (FE1) | Chí (BE1), LR | SPN |
| F-02-BE Backend API and business logic — Property and Room Management (PROPERTY-01→02, ROOM-01→03) | Đạt (BE2) | Đạt (BE2) | Quân (FE2), LR | SPN |
| F-02-FE Frontend UI/UX and API integration — Property and Room Management (PROPERTY-01→02, ROOM-01→03) | Quân (FE2) | Quân (FE2) | Đạt (BE2), LR | SPN |
| F-03-BE Backend API and business logic — Tenant Information and Account Management (TENANT-01→02) | Chí (BE1) | Chí (BE1) | MXH (FE1), LR, TN | SPN |
| F-03-FE Frontend UI/UX and API integration — Tenant Information and Account Management (TENANT-01→02) | MXH (FE1) | MXH (FE1) | Chí (BE1), LR, TN | SPN |
| F-04-BE Backend API and business logic — Utility Pricing and Property Surcharge Configuration (UTILITY-01→02, CHARGE-01) | Minh (BE3) | Minh (BE3) | Quân (FE2), LR | SPN |
| F-04-FE Frontend UI/UX and API integration — Utility Pricing and Property Surcharge Configuration (UTILITY-01→02, CHARGE-01) | Quân (FE2) | Quân (FE2) | Minh (BE3), LR | SPN |
| F-05-BE Backend API and business logic — Utility Meter Reading and Calculation (METER-01→03) | Đạt (BE2) | Đạt (BE2) | Quân (FE2), LR | SPN |
| F-05-FE Frontend UI/UX and API integration — Utility Meter Reading and Calculation (METER-01→03) | Quân (FE2) | Quân (FE2) | Đạt (BE2), LR | SPN |
| F-06-BE Backend API and business logic — Billing and Invoice Generation (INVOICE-01→04) | Đạt (BE2) | Đạt (BE2) | MXH (FE1), LR | TN, SPN |
| F-06-FE Frontend UI/UX and API integration — Billing and Invoice Generation (INVOICE-01→04) | MXH (FE1) | MXH (FE1) | Đạt (BE2), LR | TN, SPN |
| F-07-BE Backend API and business logic — VietQR Payment Integration (VIETQR-01→02) | Minh (BE3) | Minh (BE3) | Quân (FE2), LR | TN, SPN |
| F-07-FE Frontend UI/UX and API integration — VietQR Payment Integration (VIETQR-01→02) | Quân (FE2) | Quân (FE2) | Minh (BE3), LR | TN, SPN |
| F-08-BE Backend API and business logic — Payment Verification and Tracking (PAYMENT-01→03) | Minh (BE3) | Minh (BE3) | Quân (FE2), LR, TN | SPN |
| F-08-FE Frontend UI/UX and API integration — Payment Verification and Tracking (PAYMENT-01→03) | Quân (FE2) | Quân (FE2) | Minh (BE3), LR, TN | SPN |
| F-09-BE Backend API and business logic — Rent Payment Reminders (REMINDER-01→02) | Minh (BE3) | Minh (BE3) | Quân (FE2), LR | TN, SPN |
| F-09-FE Frontend UI/UX and API integration — Rent Payment Reminders (REMINDER-01→02) | Quân (FE2) | Quân (FE2) | Minh (BE3), LR | TN, SPN |
| F-10-BE Backend API and business logic — Digital Lease Tracking (LEASE-01→04) | Chí (BE1) | Chí (BE1) | MXH (FE1), LR | TN, SPN |
| F-10-FE Frontend UI/UX and API integration — Digital Lease Tracking (LEASE-01→04) | MXH (FE1) | MXH (FE1) | Chí (BE1), LR | TN, SPN |
| F-11-BE Backend API and business logic — Automated Lease Renewal Reminders (LEASE-05→06) | Chí (BE1) | Chí (BE1) | MXH (FE1), LR | TN, SPN |
| F-11-FE Frontend UI/UX and API integration — Automated Lease Renewal Reminders (LEASE-05→06) | MXH (FE1) | MXH (FE1) | Chí (BE1), LR | TN, SPN |
| F-12-BE Backend API and business logic — Maintenance Request Submission (MAINT-01→02) | Minh (BE3) | Minh (BE3) | Quân (FE2), TN, LR | SPN |
| F-12-FE Frontend UI/UX and API integration — Maintenance Request Submission (MAINT-01→02) | Quân (FE2) | Quân (FE2) | Minh (BE3), TN, LR | SPN |
| F-13-BE Backend API and business logic — Maintenance Status Tracking (MAINT-03→05) | Minh (BE3) | Minh (BE3) | Quân (FE2), LR | TN, SPN |
| F-13-FE Frontend UI/UX and API integration — Maintenance Status Tracking (MAINT-03→05) | Quân (FE2) | Quân (FE2) | Minh (BE3), LR | TN, SPN |
| F-14A-BE Backend API and business logic — Dashboard (DASH-01→02) | Chí (BE1) | Chí (BE1) | MXH (FE1), LR | SPN |
| F-14A-FE Frontend UI/UX and API integration — Dashboard (DASH-01→02) | MXH (FE1) | MXH (FE1) | Chí (BE1), LR | SPN |
| F-14B-BE Backend API and business logic — Dashboard (DASH-03→04) | Đạt (BE2) | Đạt (BE2) | MXH (FE1), LR | SPN |
| F-14B-FE Frontend UI/UX and API integration — Dashboard (DASH-03→04) | MXH (FE1) | MXH (FE1) | Đạt (BE2), LR | SPN |
| F-15-BE Backend API and business logic — Monthly Business Report and Analytics (REPORT-01→05) | Minh (BE3) | Minh (BE3) | Quân (FE2), LR | SPN |
| F-15-FE Frontend UI/UX and API integration — Monthly Business Report and Analytics (REPORT-01→05) | Quân (FE2) | Quân (FE2) | Minh (BE3), LR | SPN |
| TASK-TECH-01 Set up backend infrastructure | Chí | Chí | Đạt, Minh | SPN |
| TASK-TECH-02 Set up frontend infrastructure | Chí | Chí | MXH, Quân | SPN |
| TASK-TECH-03 Set up quality tooling | Đạt | Đạt | Chí, Minh, MXH, Quân | SPN |
| TASK-TECH-04 Set up continuous integration | Đạt | Đạt | Chí, Minh, MXH, Quân | SPN |
| TASK-TECH-05 Set up continuous deployment to Render | Chí | Chí | Đạt | SPN |
| TASK-PM-01 Manage the team's Trello board | Chí | Chí | Dev Team | SPN |
| TASK-DOC-01 Write the Technical Architecture document | Đạt | Chí | SPN | |
| TASK-DOC-03 Write Product Backlog Version 1 | Minh | Chí | SPN | |
| TASK-DOC-05 Write Product Backlog 2.0 | Chí | Chí | SPN | |
| TASK-DOC-07 Write the Project Charter | Đạt | Chí | SPN | |
| TASK-DOC-09 Write the Software Project Estimation document | Chí | Chí | SPN | |
| TASK-DOC-11 Write the Project Proposal | Chí | Chí | SPN | |
| TASK-DOC-13 Write the Statement of Work | MXH | Chí | SPN | |
| TASK-DOC-15 Write the Vision and Scope document | Chí | Chí | SPN | |
| TASK-DOC-17 Write the Risk Management Plan | MXH | Chí | SPN | |

### 5.5 Cross-Cutting and Shared Activities RACI

These activities recur across every batch and are not tied to a single user story.

| Activity | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Pull-request review | all members |  all members | Author | PM |
| Shared API/schema decision | Chí, Đạt, Minh | Integration owner appointed for the batch | PM | MXH, Quân |
| Mobile UI integration and validation | Assigned FE owner | Assigned FE owner | Related BE owner | PM |
| Batch 3 backend review, testing, and bug fixing | Chí | Chí | Đạt, Minh, MXH, Quân | PM |
| CI workflow maintenance | Đạt | Đạt | Dev Team | PM |
| CD workflow and Render deployment maintenance | Chí | Chí | Đạt | PM |
| Documentation authoring and updates | All members, for their own or affected work | all members | — | PM |
| Documentation review and approval | All members | All members  | — | PM |

---

# 6. Stakeholder Analysis

| Stakeholder | Role in Project | Responsibilities | Accountability (answerable for the outcome) | Access to Project Information/Decisions | Level of Influence | Communication Method | Risks Associated |
|---|---|---|---|---|---|---|---|
| **Project Supervisor / Lecturer** | Project Sponsor | Approves milestones, provides academic guidance, evaluates project outcomes, ensures academic standards are met. | **Accountable** for certifying the project meets academic requirements and for the final grade decision | Full — receives all deliverables, attends milestone reviews | **High** — can require rework, reject milestones, or fail the deliverable | Weekly meetings, Email | Delayed feedback or approval may impact project schedule. Changing academic requirements may require document revisions. |
| **Project Manager (Chí, Team Leader)** | Project Management | Coordinates the team, monitors schedule, manages risks, communicates with supervisor, and oversees project delivery alongside his BE1 workstream and supporting tasks. | **Accountable** to the Supervisor for overall project delivery, schedule, and quality | Full — has access to all team artifacts, boards, and communication channels | **High** — makes day-to-day scope, priority, and process decisions within the approved charter | Daily team meetings, Discord, GG meet, GitHub Projects | Poor coordination may delay development, create scope creep, or reduce team productivity. Chí's combined PM, BE1, infrastructure, deployment, and documentation workload creates an overload risk. |
| **Development Team (Đạt, Minh, MXH, Quân)** | System Development | Implement backend or frontend work, integrate assigned batches, test, fix defects, and maintain documentation according to Section 4 and the RACI in Section 5. | Each member is **accountable** for their assigned backend or frontend workstream; collectively accountable to the PM for sprint commitments | Full internal access (codebase, backlog, CI); no direct access to Supervisor grading decisions | **High** — can influence technical approach, estimates, and project scope | GitHub, Discord, Daily stand-up meetings | Uneven workload, technical difficulties, missed deadlines, code integration conflicts, member availability due to coursework. |
| **Self-Managing Landlords** | Primary Client / Product Owner | Provide business requirements, validate business processes, evaluate prototypes, participate in user acceptance testing. | **Not accountable** for project outcomes (they are consulted, not responsible for delivery), but their acceptance is the qualitative measure of product-market fit | Limited — receives summarized findings, prototypes, and surveys; no access to internal project management artifacts | **High for product decisions** — negative feedback on core workflows (e.g., billing, payment) can force a scope or design change; **no influence** over academic schedule or grading | Face-to-face interviews, Phone calls, Zalo, Google Forms | Limited availability, changing requirements, resistance to adopting digital systems, limited pilot participation. |
| **Tenants** | Secondary End Users | Evaluate usability, test payment workflow, submit maintenance requests, provide feedback on transparency and user experience. | Not accountable for delivery | Limited — receives only the parts of the prototype relevant to the tenant-facing app | **Low–Medium** — feedback can adjust tenant-facing UX details, but does not drive core project scope | Mobile application, Zalo, Google Forms | Limited engagement during testing, incomplete feedback, inconsistent system usage. |
| **Cloud Service Provider** | Technology Provider | Provides cloud hosting, databases, application deployment services. | Accountable only for the availability/SLA of the infrastructure it provides, not for project delivery | No access to project artifacts; interaction limited to service dashboards/support | **Low** — an outage or quota limit can constrain the team's options, but the provider does not influence project decisions | Cloud management portals, documentation, support tickets | Service outages, quota limitations, student credit expiration, infrastructure downtime. |
| **GitHub** | Development Platform | Source code repository, version control, collaboration, issue tracking, continuous integration. | Accountable only for platform availability, not project outcomes | No access to project decision-making | **Low** — service-level constraint only | GitHub platform | Repository access issues, merge conflicts, accidental code deletion, service interruption. |
| **Banking System (VietQR Standard)** | External Integration | Generates standardized QR codes for bank transfers between tenants and landlords. | Accountable only for the correctness of the standard it publishes, not for RosiHome's implementation | No access to project artifacts | **Medium** — RosiHome's payment workflow must conform to VietQR's format, so changes to the standard can force a design change, even though the bank has no direct involvement in the project | Banking applications, VietQR standard documentation | QR generation format changes, incorrect bank information entered by landlords, manual payment verification required. |
| **University** | Academic Stakeholder | Provides project environment, computing resources, academic supervision, and evaluation. | **Accountable** for setting and enforcing the academic requirements the project must satisfy | Access limited to official reporting/evaluation channels | **High** — sets the non-negotiable constraints (deadlines, assessment criteria) the whole project must operate within | Official university communication channels, meetings | Changes to assessment requirements or project deadlines may affect planning. |

---

# 7. Project Facilities and Resources

## Human Resources

- Project Supervisor
- Project Manager (Chí)
- Four additional Software Engineering Students (Đạt, Minh, Hung, Quân)
- Pilot Landlords
- Pilot Tenants

## Software Resources

- Visual Studio Code
- GitHub
- React / React Native
- PostgreSQL
- Render and Supabase
- Figma
- Postman
- Claude Code
- ChatGPT
- Gemini

## Hardware Resources

- Student laptops
- Smartphones (Android/iOS)
- Cloud servers
- Internet connection

---

# 8. Major Milestones

| Milestone                        | Expected Outcome                                |
| -------------------------------- | ----------------------------------------------- |
| Project Charter Approved         | Project officially authorized                   |
| Requirements & Design Complete   | Functional and technical requirements finalized |
| MVP Development Complete         | Core system features implemented                |
| System Testing Complete          | Functional and usability testing completed      |
| User Acceptance Testing          | Pilot users validate the system                 |
| Final Deployment & Demonstration | Final presentation and project submission       |

---

# 9. Impact Analysis

| Stakeholder      | Expected Impact                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Landlords        | Reduced administrative workload, improved payment tracking, better visibility into rental operations, fewer calculation errors.          |
| Tenants          | Increased transparency, easier access to invoices and payment history, better communication regarding maintenance and lease information. |
| Development Team | Practical experience in software engineering, project management, teamwork, and system deployment.                                       |
| University       | Demonstrates successful application of software engineering principles through a real-world capstone project.                            |
| Supervisor       | Oversees project quality and ensures academic learning outcomes are achieved.                                                            |

---

# 10. Assumptions

- Landlords and tenants have internet-enabled smartphones or computers.
- Landlords are willing to adopt a digital management system.
- Utility meter readings are entered accurately by landlords.
- Payments continue to occur directly between tenant and landlord using VietQR.
- Landlords manually verify payment receipts before confirming payment.
- Cloud services remain available throughout the project.
- Pilot users are available to provide feedback during testing.
- Development will be completed within the academic project timeline.
