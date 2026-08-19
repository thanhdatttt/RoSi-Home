# Software Project Plan 2.0 — RosiHome

**Course:** Software Project Management — **Lecturer:** TS. Ngô Huy Biên  
**Project:** RosiHome — Property Management Platform for Self-Managing Landlords  
**Version:** 2.0 (Calibrated Execution Baseline — Midpoint 50% MVP)  
**Timeline:** 8.5 – 10.0 calendar weeks (~42 working days) | **Team:** 5 Students (~3.5 hrs/day/person)  
**Related Baselines:** `docs/product_backlog_2.0.md`, `docs/project_estimate_2.0.md`, `docs/project_charter.md`

---

## 1. Project Overview & The $W^5HH$ Framework

| $W^5HH$ Dimension | Project Specification |
|---|---|
| **Why (Objective)** | Centralize property, tenant, billing, VietQR payment, and maintenance for 1–30 room landlords. |
| **What (Scope)** | Full-stack MVP: **51 User Stories = 247 Story Points (SP)** across 15 features; excludes payment gateway/IoT. |
| **When (Timeline)** | **8.5–10.0 weeks (~42 working days)** across 7 Milestones (M1–M7), including a 10-day Phase 3 buffer. |
| **Who (People)** | 5 named members: **Chí** (PM / BE1), **Đạt** (BE2), **Minh** (BE3), **Hưng** (FE1), **Quân** (FE2). |
| **Where (Environment)** | Hybrid student team; Backend on **Render Cloud**, DB on **Supabase PostgreSQL**, Mobile on **Expo**. |
| **How (Method)** | **Kanban** continuous flow, **WIP = 1 task/person**, **Backend leads Frontend by 1 batch (Sashimi)**, CI/CD gates. |
| **How Much (Cost)** | **209.3 person-days (733h)**, **~77.4M AI tokens**, direct budget **~1.5 million VNĐ (~$60 USD)**. |

---

## 2. Work Breakdown Structure (WBS) & 4 Delivery Batches

```text
RosiHome MVP (51 US / 247 SP)
├── Phase 1: Inception & Technical Setup (Week 1 / 18 SP Equiv.) [Chí, Đạt, Quân]
├── Phase 2: Incremental Construction (Weeks 2–8 / 51 US / 247 SP)
│   ├── Batch 1: Foundation (15 US / 68 SP) — Auth, Profile, Property, Room, Utility [Done]
│   ├── Batch 2: Core Operations (16 US / 87 SP) — Tenant, Lease, Meter, Maintenance [Done]
│   ├── Batch 3: Billing & Payment (11 US / 58 SP) — Invoices, VietQR, Proofs, Reminders [In Progress]
│   └── Batch 4: Analytics & Reports (9 US / 34 SP) — Dashboards, Financial Reports, PDF [Planned]
└── Phase 3: Integration & Pilot (Weeks 9–10 / 10 Working Days Buffer) [All Members]
    └── E2E Regression Testing, 7-Day Pilot (2 Landlords), Final Defense Packaging
```

---

## 3. Delivery Methodology & Workflow

* **Kanban Flow:** `Backlog` $\rightarrow$ `Ready (DoR)` $\rightarrow$ `In Dev` $\rightarrow$ `PR Review` $\rightarrow$ `CI Test Gate` $\rightarrow$ `Merge & Deploy Staging` $\rightarrow$ `Mobile Integration` $\rightarrow$ `Done (DoD)`.
* **WIP Limit:** Strictly **1 active Task per developer** (each task may group multiple related User Stories within a feature module) to eliminate multitasking.
* **Sashimi Handoff:** Backend runs 1 batch ahead of Frontend $\rightarrow$ Frontend always integrates against live staging APIs.

```text
Backend:   [Setup] ──► [ BE Batch 1 (Done) ] ──► [ BE Batch 2 (Done) ] ──► [ BE Batch 3 (Active) ] ──► [ BE Batch 4 ] ──► [ E2E / Pilot ]
                               │                         │                         │                         │
                               ▼                         ▼                         ▼                         ▼
Frontend:  [Shell] ──► [ FE Batch 1 (Done) ] ──► [ FE Batch 2 (Done) ] ──► [ FE Batch 3 (Active) ] ──► [ FE Batch 4 ] ──► [ E2E / Pilot ]
```

---

## 4. Schedule, Milestones & Critical Path

* **Capacity:** 1 Person-day = 3.5h | **Calibrated Velocity:** $V = 7.75\text{ SP/day}$ ($\approx 38.75\text{ SP/week}$).
* **Critical Path:** `DB Schema` $\rightarrow$ `BE Batch 1` $\rightarrow$ `BE Batch 2` $\rightarrow$ `BE Batch 3` $\rightarrow$ `FE Batch 3` $\rightarrow$ `BE/FE Batch 4` $\rightarrow$ `E2E & Pilot`.
* **Critical Chain Buffer:** **10 working days in Phase 3** for E2E stabilization and landlord pilot.

| Milestone | Target Horizon | Deliverable Scope | Status |
|:---:|:---:|---|:---:|
| **M1** | Week 1 | Git repo, Supabase DB schema, Drizzle ORM, Vitest, CI pipeline, Expo shell ready. | ✅ Completed |
| **M2** | Week 3 | Batch 1 Live on Staging: Auth, Profile, Property, Room, Utility. | ✅ Completed |
| **M3** | Week 5 | Batch 2 Live (50% MVP): Tenant, Lease, Meter, Maintenance. Midpoint calibration. | ✅ Completed |
| **M4** | Week 7 | Batch 3 Live: Automated Billing, VietQR Napas247, Payment Proofs. | 🔄 In Progress |
| **M5** | Week 8 | Batch 4 Live (100% Backlog): Dashboards, Financial Reports, PDF Export. | ⏳ Planned |
| **M6** | Week 9 | Pilot Sign-off: 7-day live testing with 2 landlords in TP.HCM completed. | ⏳ Planned |
| **M7** | Week 10 | Final Submission: System documentation, demo video, source code acceptance. | ⏳ Planned |

---

## 5. People & Responsibility Matrix (RACI)

### 5.1 Named Team Assignments (Aligned with Project Charter)
* **Trần Khôn Chí (PM / BE1):** Backend Auth, Tenant, Lease, Dashboard 01-02; Infra Setup & Render CD.
* **Phạm Thành Đạt (BE2):** Backend Property, Room, Meter, Invoices, Dashboard 03-04; Quality & CI.
* **Nguyễn Văn Minh (BE3):** Backend Utility, Maintenance, VietQR, Payment, Reminder, Reports & PDF.
* **Mai Xuân Hưng (FE1):** Mobile UI: Auth, Tenant, Lease, Invoices, Dashboards.
* **Nguyễn Huy Quân (FE2):** Mobile UI: Property, Room, Utility, Meter, Maintenance, VietQR, Reports, Design System.
* **TS. Ngô Huy Biên (Sponsor):** Approves baselines, reviews academic milestones, evaluates final product.

### 5.2 RACI Matrix

| Workstream / Feature | Chí (BE1) | Đạt (BE2) | Minh (BE3) | Hưng (FE1) | Quân (FE2) | Sponsor |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Project Plan & Baseline Sign-off** | **A / R** | C | C | C | C | **A (Approve)** |
| **Auth & Profile (`AUTH-01→06`, `PROFILE-01`)** | **A / R** | I | I | R | C | I |
| **Property & Room (`PROPERTY-01→02`, `ROOM-01→03`)** | C | **A / R** | I | I | R | I |
| **Tenant & Lease (`TENANT-01→02`, `LEASE-01→06`)** | **A / R** | C | I | R | I | I |
| **Utility & Charges (`UTILITY-01→02`, `CHARGE-01`)** | I | I | **A / R** | I | R | I |
| **Meter Readings (`METER-01→03`)** | I | **A / R** | C | I | R | I |
| **Billing & Invoices (`INVOICE-01→04`)** | C | **A / R** | C | R | I | I |
| **VietQR, Payment & Reminders (`VIETQR`, `PAYMENT`, `REMINDER`)** | I | C | **A / R** | I | R | I |
| **Maintenance Tickets (`MAINT-01→05`)** | I | I | **A / R** | I | R | I |
| **Dashboards & Reports (`DASH-01→04`, `REPORT-01→05`)** | **A / R** | R | R | R | R | I |
| **CI/CD Pipeline & Tooling Setup** | **A / R** | R | C | I | C | I |
| **7-Day Live Landlord Pilot & Defense** | **A / R** | R | R | R | R | **A (Evaluate)** |

---

## 6. Budget & Cost Baseline

* **Labor Effort:** **209.3 person-days (733 productive hours)** — 5 students $\times$ 3.5h/day $\times$ 42 days (Self-managed).
* **Direct Cash Budget:** **1,500,000 VNĐ (~$60 USD)**:
  * *AI API Credits (Claude/OpenAI/Gemini):* 850,000 đ
  * *Cloud Hosting & Domain (Render/Supabase buffer):* 400,000 đ
  * *Management Contingency (15%):* 250,000 đ

---

## 7. Risk Management Mechanism (Risk Register)

$$\text{Risk Exposure} = \text{Probability (1–5)} \times \text{Impact (1–5)}$$

| ID | Risk Description | Prob. | Imp. | Exp. | Owner | Mitigation & Contingency Strategy |
|:---:|---|:---:|:---:|:---:|:---:|---|
| **R1** | **AI Code Logic Flaws:** AI generates subtly incorrect logic. | 4 | 4 | **16** | All Devs | Mandatory PR peer inspection; 100% Vitest coverage on calculation engines. |
| **R2** | **BE-FE Integration Delay:** Frontend blocked by API delays. | 3 | 4 | **12** | Chí (PM) | Backend leads by 1 batch (Sashimi); OpenAPI contracts agreed upfront. |
| **R3** | **Third-Party Outage (VietQR/Supabase/Render):** API downtime. | 2 | 4 | **8** | Minh (BE3) | Offline string-format QR fallback; mock payment demo mode. |
| **R4** | **Student Exam / Illness Availability:** Part-time hour drops. | 3 | 3 | **9** | Chí (PM) | Strict modular ownership + WIP=1; absorb via 10-day Phase 3 buffer. |
| **R5** | **Scope Creep (Feature Explosion):** Unapproved feature requests. | 3 | 4 | **12** | Chí (PM) | **Scope Freeze after Week 5**; route non-baseline ideas to Post-MVP. |
| **R6** | **Pilot Landlord Non-Adoption:** Landlords delay testing. | 2 | 3 | **6** | Hưng (FE1) | Provide pre-populated sample data; maintain backup test landlords. |

---

## 8. Change Management & Governance

* **Decision Hierarchy:**
  * *Level 1 (Internal Refactor):* Dev + 1 Peer Reviewer approval.
  * *Level 2 (Minor AC Clarification):* Affected Module Owners consensus.
  * *Level 3 (Baseline Scope/Deadline Change):* **100% Team Consensus + Sponsor/Lecturer Approval**.
* **Scope Freeze Policy:** Khóa cứng toàn bộ 51 User Stories sau **Tuần 5 (Milestone M3 — 50% MVP)**. Mọi ý tưởng mới chuyển sang Post-MVP.

---

## 9. Quality Management & Verification Gates

```text
[ Gate 1: DoR ] ──► [ Gate 2: Local Test ] ──► [ Gate 3: PR Review ] ──► [ Gate 4: CI Gate ] ──► [ Gate 5: Mobile E2E ] ──► [ Gate 6: DoD ]
```

1. **Gate 1 (DoR):** User Story có AC rõ ràng dạng Gherkin, DB schema và API contract đã chốt.
2. **Gate 2 (Local Test):** TypeScript strict mode, chạy pass Vitest trên máy cá nhân.
3. **Gate 3 (PR Review):** Bắt buộc ít nhất 1 thành viên khác review và approve PR trên GitHub.
4. **Gate 4 (CI Gate):** GitHub Actions tự động kiểm tra: Compile $\rightarrow$ DB Migration $\rightarrow$ Vitest API suite.
5. **Gate 5 (Mobile E2E):** Test tính năng trên thiết bị thật qua Expo kết nối backend Render staging.
6. **Gate 6 (DoD):** Pass toàn bộ AC, zero blocker bug, deploy thành công, cập nhật tài liệu.

---

## 10. Baseline Sign-off

| Role | Member Name | Decision / Status |
|---|---|:---:|
| **Project Manager / BE1 Lead** | **Trần Khôn Chí** | *APPROVED (Signed)* |
| **Backend Developer 2** | **Phạm Thành Đạt** | *APPROVED (Signed)* |
| **Backend Developer 3** | **Nguyễn Văn Minh** | *APPROVED (Signed)* |
| **Frontend Developer 1** | **Mai Xuân Hưng** | *APPROVED (Signed)* |
| **Frontend Developer 2** | **Nguyễn Huy Quân** | *APPROVED (Signed)* |
| **Project Sponsor / Lecturer** | **TS. Ngô Huy Biên** | *SUBMITTED FOR BASELINE APPROVAL* |
