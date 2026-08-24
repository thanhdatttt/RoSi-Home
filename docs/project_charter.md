# Project Charter – RosiHome
## 1. Project Background, Context, and Overview
### Project Title
**RosiHome – Property Management Platform for Self-Managing Landlords**
### Project Purpose
RosiHome is an educational project through which the team applies project management and software development knowledge to a real rental-management problem. The project also aims to deliver a complete, functional MVP that reduces manual billing errors, missed payment and lease deadlines, fragmented records, and overlooked maintenance requests while giving tenants clearer access to rental information.

---
# 2. Project Objectives
The project aims to:

- Apply project management, software engineering, teamwork, and deployment practices in an academic setting.
- Deliver a complete, functional MVP within the academic schedule.
- Centralize billing, payment follow-up, lease reminders, maintenance tracking, and rental records to address the proposal's main pain points for landlords and tenants.

---
# 3. Project Scope
### In Scope
- Authentication; property, room, tenant, and lease management.
- Utility calculations, invoices, VietQR generation, payment records, and reminders.
- Maintenance requests, dashboards, reporting, and notifications.
### Out of Scope
- AI analytics, payment gateways, electronic signatures, IoT meters, multi-landlord collaboration, and advanced accounting.

---
# 4. Project Management and Governance
The team consists of **three part-time backend developers and two part-time frontend developers**. The responsibilities below are role-level; detailed task ownership is defined in Section 5.

| Role                          | Name                                           | Responsibilities                                                                          |
| ----------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Project Sponsor               | University Supervisor / Lecturer               | Provides academic guidance, reviews project milestones, and approves key deliverables.    |
| Project Manager / Team Leader | **Chí**                                        | Coordinates delivery, dependencies, risks, changes, communication, and document approval. |
| Backend Developers (BE1–BE3)  | **Chí**, **Đạt**, **Minh**                     | Implement, test, review, and integrate assigned backend work.                             |
| Frontend Developers (FE1–FE2) | **Hưng**, **Quân**                             | Implement, test, and integrate assigned mobile frontend work.                             |
| Product Owner                 | Self-Managing Landlords (Representative Users) | Clarifies requirements and validates workflows and acceptance.                            |
| End Users                     | Landlords and Tenants                          | Participate in pilot validation and provide usability feedback.                           |

---
# 5. RACI Matrix — Task-to-Member Responsibility Assignment
### 5.1 Purpose
A Responsibility Assignment Matrix (RACI) maps every deliverable to the people involved in it, using four designations: **R**esponsible (does the work), **A**ccountable (owns the outcome and signs off — exactly one per row), **C**onsulted (gives input before the work is done), and **I**nformed (told after the work is done). The delivery matrix covers product features and the technical, management, and documentation tasks defined in Product Backlog.
### 5.2 Legend
| Abbreviation | Full Name | Role |
|---|---|---|
| **PM** | Trần Khôn Chí | Project Manager / Team Leader (coordination-level involvement only) |
| **Chí** | Trần Khôn Chí | Backend Developer 1 (BE1) |
| **Đạt** | Phạm Thành Đạt | Backend Developer 2 (BE2) |
| **Minh** | Nguyễn Văn Minh | Backend Developer 3 (BE3) |
| **Hưng** | Mai Xuân Hưng | Frontend Developer 1 (FE1) |
| **Quân** | Nguyễn Huy Quân | Frontend Developer 2 (FE2) |
| **SPN** | — | Project Sponsor / Lecturer |
| **LR** | — | Landlord Representatives (Product Owner group) |
| **TN** | — | Tenants (secondary end users, consulted during pilot) |

### 5.3 Delivery-Level RACI
The Project Manager receives routine task-completion updates. External stakeholders participate at relevant requirements, validation, governance, and acceptance checkpoints rather than being informed about each implementation task.

| Delivery Item                                              | Responsible | Accountable | Consulted             | Informed |
| ---------------------------------------------------------- | ----------- | ----------- | --------------------- | -------- |
| US-AUTH-01→06, US-PROFILE-01                               | Chí (BE1)   | Chí (BE1)   | Hưng (FE1), LR        | PM       |
| US-AUTH-01→06, US-PROFILE-01                               | Hưng (FE1)  | Hưng (FE1)  | Chí (BE1), LR         | PM       |
| US-PROPERTY-01→02, US-ROOM-01→03                           | Đạt (BE2)   | Đạt (BE2)   | Quân (FE2), LR        | PM       |
| US-PROPERTY-01→02, US-ROOM-01→03                           | Quân (FE2)  | Quân (FE2)  | Đạt (BE2), LR         | PM       |
| US-TENANT-01→02                                            | Chí (BE1)   | Chí (BE1)   | Hưng (FE1), LR, TN    | PM       |
| US-TENANT-01→02                                            | Hưng (FE1)  | Hưng (FE1)  | Chí (BE1), LR, TN     | PM       |
| US-UTILITY-01→02, US-CHARGE-01                             | Minh (BE3)  | Minh (BE3)  | Quân (FE2), LR        | PM       |
| US-UTILITY-01→02, US-CHARGE-01                             | Quân (FE2)  | Quân (FE2)  | Minh (BE3), LR        | PM       |
| US-METER-01→03                                             | Đạt (BE2)   | Đạt (BE2)   | Quân (FE2), LR        | PM       |
| US-METER-01→03                                             | Quân (FE2)  | Quân (FE2)  | Đạt (BE2), LR         | PM       |
| US-INVOICE-01→04                                           | Đạt (BE2)   | Đạt (BE2)   | Hưng (FE1), LR        | PM       |
| US-INVOICE-01→04                                           | Hưng (FE1)  | Hưng (FE1)  | Đạt (BE2), LR         | PM       |
| US-VIETQR-01→02                                            | Minh (BE3)  | Minh (BE3)  | Quân (FE2), LR        | PM       |
| US-VIETQR-01→02                                            | Quân (FE2)  | Quân (FE2)  | Minh (BE3), LR        | PM       |
| US-PAYMENT-01→03                                           | Minh (BE3)  | Minh (BE3)  | Quân (FE2), LR, TN    | PM       |
| US-PAYMENT-01→03                                           | Quân (FE2)  | Quân (FE2)  | Minh (BE3), LR, TN    | PM       |
| US-REMINDER-01→02                                          | Minh (BE3)  | Minh (BE3)  | Quân (FE2), LR        | PM       |
| US-REMINDER-01→02                                          | Quân (FE2)  | Quân (FE2)  | Minh (BE3), LR        | PM       |
| US-LEASE-01→04                                             | Chí (BE1)   | Chí (BE1)   | Hưng (FE1), LR        | PM       |
| US-LEASE-01→04                                             | Hưng (FE1)  | Hưng (FE1)  | Chí (BE1), LR         | PM       |
| US-LEASE-05→06                                             | Chí (BE1)   | Chí (BE1)   | Hưng (FE1), LR        | PM       |
| US-LEASE-05→06                                             | Hưng (FE1)  | Hưng (FE1)  | Chí (BE1), LR         | PM       |
| US-MAINT-01→02                                             | Minh (BE3)  | Minh (BE3)  | Quân (FE2), TN, LR    | PM       |
| US-MAINT-01→02                                             | Quân (FE2)  | Quân (FE2)  | Minh (BE3), TN, LR    | PM       |
| US-MAINT-03→05                                             | Minh (BE3)  | Minh (BE3)  | Quân (FE2), LR        | PM       |
| US-MAINT-03→05                                             | Quân (FE2)  | Quân (FE2)  | Minh (BE3), LR        | PM       |
| US-DASH-01→02                                              | Chí (BE1)   | Chí (BE1)   | Hưng (FE1), LR        | PM       |
| US-DASH-01→02                                              | Hưng (FE1)  | Hưng (FE1)  | Chí (BE1), LR         | PM       |
| US-DASH-03→04                                              | Đạt (BE2)   | Đạt (BE2)   | Hưng (FE1), LR        | PM       |
| US-DASH-03→04                                              | Hưng (FE1)  | Hưng (FE1)  | Đạt (BE2), LR         | PM       |
| US-REPORT-01→05                                            | Minh (BE3)  | Minh (BE3)  | Quân (FE2), LR        | PM       |
| US-REPORT-01→05                                            | Quân (FE2)  | Quân (FE2)  | Minh (BE3), LR        | PM       |
| TASK-TECH-01 Set up backend infrastructure                 | Chí         | Chí         | Đạt, Minh             | PM       |
| TASK-TECH-02 Set up frontend infrastructure                | Chí         | Chí         | Hưng, Quân            | PM       |
| TASK-TECH-03 Set up quality tooling                        | Đạt         | Đạt         | Chí, Minh, Hưng, Quân | PM       |
| TASK-TECH-04 Set up continuous integration                 | Đạt         | Đạt         | Chí, Minh, Hưng, Quân | PM       |
| TASK-TECH-05 Set up continuous deployment to Render        | Chí         | Chí         | Đạt                   | PM       |
| TASK-PM-01 Manage the team's Trello board                  | Chí         | Chí         | Dev Team              | —        |
| TASK-DOC-01 Write the Technical Architecture document      | Đạt         | Chí         | SPN                   |          |
| TASK-DOC-02 Write Product Backlog Version 1                | Minh        | Chí         | SPN                   |          |
| TASK-DOC-03 Write Product Backlog 2.0                      | Chí         | Chí         | SPN                   |          |
| TASK-DOC-04 Write the Project Charter                      | Đạt         | Chí         | SPN                   |          |
| TASK-DOC-05 Write the Software Project Estimation document | Chí         | Chí         | SPN                   |          |
| TASK-DOC-06 Write the Project Proposal                     | Chí         | Chí         | SPN                   |          |
| TASK-DOC-07 Write the Statement of Work                    | Hưng        | Chí         | SPN                   |          |
| TASK-DOC-08 Write the Vision and Scope document            | Chí         | Chí         | SPN                   |          |
| TASK-DOC-09 Write the Risk Management Plan                 | Hưng        | Chí         | SPN                   |          |
### 5.4 Shared Activities RACI

| Activity | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Pull-request review | all members | Batch integration owner appointed for the batch | Author | PM |
| Shared API/schema decision | Chí, Đạt, Minh | Integration owner appointed for the batch | PM | Hưng, Quân |
| Mobile UI integration and validation | Assigned FE owner | Assigned FE owner | Related BE owner | PM |
| Batch 3 backend review, testing, and bug fixing | Chí | Chí | Đạt, Minh, Hưng, Quân | PM |
| CI workflow maintenance | Đạt | Đạt | Dev Team | PM |
| CD workflow and Render deployment maintenance | Chí | Chí | Đạt | PM |
| Documentation authoring and updates | Assigned member | Chí (PM / Team Leader) | Related member(s) | SPN |
| Task completion notification | Assigned member | Chí (PM / Team Leader) | Related member(s) | Dev Team |
| Documentation review and approval | Chí (PM / Team Leader) | Chí (PM / Team Leader) | Document author and related member(s) | SPN |
# 6. Stakeholder Analysis
## 6.1. Stakeholder Contact Matrix
| Stakeholder / Member                     | Contact method                                             | Purpose and escalation path                                                                          |
| ---------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Project Supervisor / Lecturer            | University email, class periods, scheduled review meetings | Review deliverables and academic questions; unresolved issues are raised in scheduled reviews.       |
| Project Manager / Team Leader (Chí)      | Messenger, class periods, weekly meetings, Google Meet     | Coordinate priorities, risks, and blockers; escalate academic issues to the Supervisor.              |
| Chí (BE1)                                | Messenger, class periods, weekly meetings, Google Meet     | Coordinate assigned backend work; raise blockers to related owners.                                  |
| Đạt (BE2)                                | Messenger, class periods, weekly meetings, Google Meet     | Coordinate assigned backend work; raise blockers to related owners.                                  |
| Minh (BE3)                               | Messenger, class periods, weekly meetings, Google Meet     | Coordinate assigned backend work; raise blockers to related owners.                                  |
| Hưng (FE1)                               | Messenger, class periods, weekly meetings, Google Meet     | Coordinate assigned frontend work; raise blockers to related owners.                                 |
| Quân (FE2)                               | Messenger, class periods, weekly meetings, Google Meet     | Coordinate assigned frontend work; raise blockers to related owners.                                 |
| Self-Managing Landlords / Product Owner  | Face-to-face interviews, phone calls, Zalo, Google Forms   | Validate requirements and workflows; unresolved decisions go to the PM.                              |
| Tenants / Pilot End Users                | Face-to-face interviews, Zalo, Google Forms                | Provide pilot feedback; access or workflow issues go to the PM.                                      |
| Cloud Service Provider (Render/Supabase) | Cloud management portals, documentation, support tickets   | Monitor service issues; escalate unresolved incidents to provider support.                           |
| GitHub                                   | GitHub platform                                            | Manage repository and CI issues; escalate unresolved incidents to the team administrator or support. |
| University                               | Official university communication channels, meetings       | Communicate academic updates; unresolved administrative issues use official channels.                |
## 6.2. Risk Assessment
Detailed risk descriptions, scores, mitigations, contingencies, and rankings are maintained in the [Risk Management Plan](risk_management.md), which is the source of truth for project risk control.

This charter specifically refers to **RP-01 through RP-17**. These cover schedule and workload, AI-assisted delivery, scope, adoption, privacy, competition, technical integration and performance, external-service dependency, team knowledge, user access, and operational cost ownership.

---
# 7. Impact Analysis
- Landlords and tenants gain simpler workflows and clearer rental information.
- The team gains practical experience, while the university and supervisor can assess the application of course knowledge.

---
# 8. Assumptions
- Landlords and tenants have internet access and can use the system.
- Landlords enter accurate meter readings and adopt the digital workflow.
- Payments remain direct; landlords verify transfers before confirmation.
- The team completes the MVP within the academic timeline.
