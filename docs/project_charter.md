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

|Role|Name|Responsibilities|
|---|---|---|
|Project Sponsor|University Supervisor / Lecturer|Approves the project, provides academic guidance, reviews progress, approves final deliverables.|
|Project Manager|Project Director (Team Leader)|Plans the project, manages schedule, coordinates communication, assigns tasks, manages risks, reports project progress.|
|Development Team|Four Student Developers|Design, implement, test, document and deploy the application according to project requirements.|
|Product Owner|Self-Managing Landlords (Representative Users)|Provide business requirements, validate workflows, participate in user acceptance testing, provide feedback.|
|End Users|Landlords and Tenants|Use the system during pilot testing and evaluate usability and functionality.|

---

# 5. Stakeholder Analysis

Section 5 lists each stakeholder's role, day-to-day **responsibilities** (the work they actually perform), and how the team communicates with them and manages the associated risks. It also captures **accountability** (who is ultimately answerable if that work is not done or not done correctly — normally one person/role per item, not a group), **access** (how directly they can reach project information/decisions), and **level of influence** (how much power they have to change the direction, scope, or outcome of the project).
 
| Stakeholder | Role in Project | Responsibilities | Accountability (answerable for the outcome) | Access to Project Information/Decisions | Level of Influence | Communication Method | Risks Associated |
|---|---|---|---|---|---|---|---|
| **Project Supervisor / Lecturer** | Project Sponsor | Approves milestones, provides academic guidance, evaluates project outcomes, ensures academic standards are met. | **Accountable** for certifying the project meets academic requirements and for the final grade decision | Full — receives all deliverables, attends milestone reviews | **High** — can require rework, reject milestones, or fail the deliverable | Weekly meetings, Email | Delayed feedback or approval may impact project schedule. Changing academic requirements may require document revisions. |
| **Project Manager (Team Leader)** | Project Management | Coordinates the team, monitors schedule, manages risks, communicates with supervisor, oversees project delivery. | **Accountable** to the Supervisor for overall project delivery, schedule, and quality | Full — has access to all team artifacts, boards, and communication channels | **High** — makes day-to-day scope, priority, and process decisions within the approved charter | Daily team meetings, Discord, GG meet, GitHub Projects | Poor coordination may delay development, create scope creep, or reduce team productivity. |
| **Development Team** | System Development | Design architecture, develop features, perform testing, fix defects, maintain documentation. | Each member is **accountable** for their assigned User Stories/modules; collectively accountable to the PM for sprint commitments | Full internal access (codebase, backlog, CI); no direct access to Supervisor grading decisions | **High** — can influence technical approach and estimates, project scope | GitHub, Discord, Daily stand-up meetings | Uneven workload, technical difficulties, missed deadlines, code integration conflicts, member availability due to coursework. |
| **Self-Managing Landlords** | Primary Client / Product Owner | Provide business requirements, validate business processes, evaluate prototypes, participate in user acceptance testing. | **Not accountable** for project outcomes (they are consulted, not responsible for delivery), but their acceptance is the qualitative measure of product-market fit | Limited — receives summarized findings, prototypes, and surveys; no access to internal project management artifacts | **High for product decisions** — negative feedback on core workflows (e.g., billing, payment) can force a scope or design change; **no influence** over academic schedule or grading | Face-to-face interviews, Phone calls, Zalo, Google Forms | Limited availability, changing requirements, resistance to adopting digital systems, limited pilot participation. |
| **Tenants** | Secondary End Users | Evaluate usability, test payment workflow, submit maintenance requests, provide feedback on transparency and user experience. | Not accountable for delivery | Limited — receives only the parts of the prototype relevant to the tenant-facing app | **Low–Medium** — feedback can adjust tenant-facing UX details, but does not drive core project scope | Mobile application, Zalo, Google Forms | Limited engagement during testing, incomplete feedback, inconsistent system usage. |
| **Cloud Service Provider** | Technology Provider | Provides cloud hosting, databases, application deployment services. | Accountable only for the availability/SLA of the infrastructure it provides, not for project delivery | No access to project artifacts; interaction limited to service dashboards/support | **Low** — an outage or quota limit can constrain the team's options, but the provider does not influence project decisions | Cloud management portals, documentation, support tickets | Service outages, quota limitations, student credit expiration, infrastructure downtime. |
| **GitHub** | Development Platform | Source code repository, version control, collaboration, issue tracking, continuous integration. | Accountable only for platform availability, not project outcomes | No access to project decision-making | **Low** — service-level constraint only | GitHub platform | Repository access issues, merge conflicts, accidental code deletion, service interruption. |
| **Banking System (VietQR Standard)** | External Integration | Generates standardized QR codes for bank transfers between tenants and landlords. | Accountable only for the correctness of the standard it publishes, not for RosiHome's implementation | No access to project artifacts | **Medium** — RosiHome's payment workflow must conform to VietQR's format, so changes to the standard can force a design change, even though the bank has no direct involvement in the project | Banking applications, VietQR standard documentation | QR generation format changes, incorrect bank information entered by landlords, manual payment verification required. |
| **University** | Academic Stakeholder | Provides project environment, computing resources, academic supervision, and evaluation. | **Accountable** for setting and enforcing the academic requirements the project must satisfy | Access limited to official reporting/evaluation channels | **High** — sets the non-negotiable constraints (deadlines, assessment criteria) the whole project must operate within | Official university communication channels, meetings | Changes to assessment requirements or project deadlines may affect planning. |
 

# 6. Project Facilities and Resources

## Human Resources

- Project Supervisor
- Project Manager
- Four Software Engineering Students
- Pilot Landlords
- Pilot Tenants

## Software Resources

- Visual Studio Code
- GitHub
- React / React Native
- PostgreSQL
- Azure or AWS Cloud
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

# 7. Major Milestones

| Milestone                        | Expected Outcome                                |
| -------------------------------- | ----------------------------------------------- |
| Project Charter Approved         | Project officially authorized                   |
| Requirements & Design Complete   | Functional and technical requirements finalized |
| MVP Development Complete         | Core system features implemented                |
| System Testing Complete          | Functional and usability testing completed      |
| User Acceptance Testing          | Pilot users validate the system                 |
| Final Deployment & Demonstration | Final presentation and project submission       |

---

# 8. Impact Analysis

| Stakeholder      | Expected Impact                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Landlords        | Reduced administrative workload, improved payment tracking, better visibility into rental operations, fewer calculation errors.          |
| Tenants          | Increased transparency, easier access to invoices and payment history, better communication regarding maintenance and lease information. |
| Development Team | Practical experience in software engineering, project management, teamwork, and system deployment.                                       |
| University       | Demonstrates successful application of software engineering principles through a real-world capstone project.                            |
| Supervisor       | Oversees project quality and ensures academic learning outcomes are achieved.                                                            |

---

# 9. Assumptions

- Landlords and tenants have internet-enabled smartphones or computers.
- Landlords are willing to adopt a digital management system.
- Utility meter readings are entered accurately by landlords.
- Payments continue to occur directly between tenant and landlord using VietQR.
- Landlords manually verify payment receipts before confirming payment.
- Cloud services remain available throughout the project.
- Pilot users are available to provide feedback during testing.
- Development will be completed within the academic project timeline.


---

# 10. Project Risks (Summary)

| Risk                        | Mitigation                                          |
| --------------------------- | --------------------------------------------------- |
| Schedule delays             | Agile sprint planning and scope prioritization      |
| Scope creep                 | Freeze MVP requirements after approval              |
| Low user participation      | Recruit pilot users early                           |
| Manual payment verification | Clearly define landlord verification responsibility |
| Cloud service interruption  | Use reliable providers and maintain backups         |
| Team member availability    | Regular progress monitoring and workload balancing  |
