# Statement of Work (SOW) — RoSi-Home

## 1. Document Information & Purpose

- **Project:** RoSi-Home — Property management platform for self-managed landlords.
- **Client / Project Sponsor:** Course Lecturer / Faculty Supervisor.
- **Delivery Team:** RoSi-Home Student Development Team (5 members: Chí, Đạt, Minh, Hưng, Quân).
- **Project Manager:** Team Leader (Chí).
- **Planning Horizon:** 8–10 calendar weeks (Academic Semester).
- **Purpose:** This Statement of Work (SOW) establishes the formal commitment baseline between the Project Sponsor and the Development Team regarding project objectives, scope boundaries, key deliverables, acceptance criteria, milestone schedule, resource assumptions, and change control.

## 2. Project Background & Objectives

### 2.1. Background (Why)
Self-managing landlords (operating 10–50 rooms) in Vietnam commonly rely on paper notebooks, manual spreadsheets, and scattered Zalo messaging. These fragmented manual processes cause recurring calculation errors, delayed payment collections, forgotten lease expirations, and payment disputes with tenants.

### 2.2. MVP Objectives (What)
Deliver a functional, deployable Minimum Viable Product (MVP) that accomplishes 5 core objectives:
1. Centralize properties, rooms, tenants, and lease agreements in a single platform.
2. Automate monthly utility consumption calculations (electricity and water rates).
3. Generate standardized monthly invoices with dynamic VietQR payment instructions.
4. Track maintenance requests and room maintenance history.
5. Provide visual dashboards (occupancy, collected revenue, debt) and exportable financial PDF reports.

## 3. Scope of Work

### 3.1. In-Scope Product Capabilities
The Development Team commits to delivering all **51 User Stories (247 Story Points)** defined in the Product Backlog, structured across **4 sequential Delivery Batches** in **3 Execution Phases**:

| Phase & Timeline | Batch | Workstream | Size | Core User Stories | Scope Summary |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Phase 1: Core Foundation**<br/>*(Weeks 5–6)* | **Batch 1** | **Foundation** | 68 SP | AUTH (01–06), PROFILE-01, PROPERTY (01–02), ROOM (01–03), UTILITY (01–02), CHARGE-01 | Authentication/JWT, role-based access control, property & room setup, and utility rate configurations. |
| | **Batch 2** | **Core Operations** | 87 SP | TENANT (01–02), LEASE (01–06), METER (01–03), MAINT (01–05) | Tenant profiling, lease agreement lifecycle, monthly utility meter recording, and maintenance tracking. |
| **Phase 2: Advanced Features**<br/>*(Weeks 7–8)* | **Batch 3** | **Billing & Payments** | 58 SP | INVOICE (01–04), VIETQR (01–02), PAYMENT (01–03), REMINDER (01–02) | Automated invoice calculation, PDF export, dynamic VietQR generation, payment verification, and payment reminders. |
| | **Batch 4** | **Analytics & Reports**| 34 SP | DASH (01–04), REPORT (01–05) | Visual dashboard (occupancy rate, collected revenue, outstanding debt), and financial PDF reports. |
| **Phase 3: Pilot & Closure**<br/>*(Weeks 9–10)* | — | **Pilot & Final Release** | — | End-to-End Testing, Production Deployment, User Documentation | Operational system validated with 2 real landlords, handover documentation, and final demo video. |

### 3.2. Out-of-Scope (Explicit Exclusions)
The following capabilities are strictly excluded from the academic MVP baseline:
- Direct payment-gateway processing, holding user escrow funds, or automated bank webhook reconciliation.
- Legal electronic digital signatures.
- IoT hardware smart-meter integration.
- Multi-landlord enterprise chains and corporate accounting/tax systems.
- Production scaling beyond the academic pilot evaluation.

## 4. Key Deliverables & Acceptance Criteria

The Development Team commits to delivering the following 5 formal deliverable items:

| ID | Deliverable Item | Description & Technical Format | Acceptance Criteria |
| :---: | :--- | :--- | :--- |
| **D1** | **Source Code & CI/CD** | GitHub repository containing Node.js/Express backend, React Native mobile app, and GitHub Actions workflow. | Automated CI pipeline passes 100% of Lint, TypeCheck, Database Migration, Unit, and API Integration tests on the main branch. |
| **D2** | **Backend REST API** | Cloud-hosted backend deployed on Render with PostgreSQL database on Supabase. | All 45+ REST endpoints respond with correct status codes, enforced JWT authentication, and ownership authorization. |
| **D3** | **Mobile Application** | React Native (Expo) application for Android/iOS test devices. | All landlord and tenant mobile screens load cleanly and interact reliably with the Staging backend API. |
| **D4** | **Operational Workflows** | Complete business features: Auth, Rooms, Tenants, Leases, Invoices/VietQR, Maintenance, and Dashboard. | All 51 User Stories satisfy their respective Acceptance Criteria and pass the Universal Definition of Done (DoD). |
| **D5** | **Pilot Package** | Real-world trial dataset with 2 self-managing landlords, synthetic test accounts, and trial feedback records. | Deployed system verified under real-world usage scenarios with zero Critical or High severity defects. |

### 4.1. General Acceptance Conditions
A deliverable item is formally accepted when:
1. It satisfies the acceptance criteria of each User Story and complies fully with the **Universal Definition of Done (DoD)** (refer to Section 1.4 of the Product Backlog document or Section 5 of the Software Process Definition document).
2. It passes all automated CI validation gates and demonstrates stable functionality live on the deployed Staging environment without unresolved Critical or High severity defects.

## 5. Project Schedule & Milestones

The project operates on an **8–10 calendar week horizon**, structured into **Weeks 1–4 (Ideation & Scoping)** and **Weeks 5–10 (6 Execution Weeks)** across 5 formal Milestones:

| Milestone | Target Window | Phase | Goal & Deliverables | Exit Criteria |
| :--- | :---: | :--- | :--- | :--- |
| **M0** | Weeks 1–4 | **Initiation & Scoping** | Confirm RoSi-Home topic & 51-Story Backlog | Project proposal & Product Backlog formally approved by the Sponsor. |
| **M1** | Weeks 5–6 | **Phase 1: Core Foundation** | Complete Batch 1 (Foundation) & Batch 2 (Core Ops) | Auth, Rooms, Tenants, Leases, and Meters running on Staging & Mobile. |
| **M2** | Weeks 7–8 | **Phase 2: Advanced Features**| Complete Batch 3 (Billing) & Batch 4 (Analytics) | Automated invoicing, VietQR scanning, and Dashboard/Reports operational. |
| **M3** | Week 9 | **Phase 3: Integration & QA** | Comprehensive E2E testing & Code Freeze | All 51 stories pass test suite; zero Critical/High severity defects remain. |
| **M4** | Week 10 | **Project Closure & Pilot** | Real-world Pilot and Final Package | Successful trial with 2 landlords; final presentation & demo ready. |

## 6. Team Organization & Budget Baseline

### 6.1. Team Responsibilities
- **Chí:** Project Manager / Backend Developer (BE1)
- **Đạt:** Backend Developer (BE2)
- **Minh:** Backend Developer (BE3)
- **Hưng:** Frontend Developer (FE1)
- **Quân:** Frontend Developer (FE2)

For detailed domain ownership, module assignments, and infrastructure responsibilities, refer to Section 4 of the Software Project Plan document.

### 6.2. Resource & Budget Baseline
- **Team Labor Capacity:** 5 part-time student developers (~3–4 hours/day, totaling ~600–750 person-hours over the academic semester). Unpaid academic labor.
- **Cash Budget Baseline:** Estimated at **1,500,000 – 3,277,500 VND** covering:
  - Cloud server hosting (Render) & Database storage (Supabase).
  - Domain, security, and mobile testing runtime facilities.
  - Subscriptions and quotas for AI coding assistance tools.

## 7. Change Control & Governance

Change control under this SOW follows the unified, streamlined procedure of the project (refer to Section 7.2 of the Software Project Plan document).

When a change request arises (API adjustments, UI enhancements, or business logic tweaks):
1. **Proposal:** Raised during in-person discussions or directly posted to the team **Messenger** group chat.
2. **Discussion & Consensus:** The team briefly evaluates the impact on scope and schedule; a change is approved and executed only upon reaching **100% unanimous consensus** among all 5 members.
