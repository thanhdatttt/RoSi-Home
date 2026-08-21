# Software Project Plan 2.0 — RosiHome

**Course:** Software Project Management — **Lecturer:** TS. Ngô Huy Biên  
**Project:** RosiHome — Property Management Platform for Self-Managing Landlords  
**Version:** 2.0 (Calibrated Execution Baseline — Midpoint 50% MVP)  
**Timeline:** Academic Semester (Weeks 1–10) | **Active Execution Window:** Weeks 5–10 (6 calendar weeks ~ 30 working days)  
**Team Composition:** 5 Students (~3.5 hrs/day/person)  
**Related Baselines:** `docs/product_backlog_2.0.md`, `docs/project_estimate_2.0.md`, `docs/project_charter.md`

---

## 1. Project Overview & The $W^5HH$ Framework

| $W^5HH$ Dimension | Project Specification |
|---|---|
| **Why (Objective)** | Centralize property, tenant, billing, VietQR payment, and maintenance for 1–30 room landlords. |
| **What (Scope)** | Full-stack MVP: **51 User Stories = 247 Story Points (SP)** across 15 features; excludes payment gateway/IoT. |
| **When (Timeline)** | **Weeks 5–10 (~30 working days)** following a concept pivot at Week 4/5; 7 Milestones (M1–M7) ending at Week 10. |
| **Who (People)** | 5 named members: **Chí** (PM / BE1), **Đạt** (BE2), **Minh** (BE3), **Hưng** (FE1), **Quân** (FE2). |
| **Where (Environment)** | Hybrid student team; Backend on **Render Cloud**, DB on **Supabase PostgreSQL**, Mobile on **Expo**. |
| **How (Method)** | **Kanban** continuous flow, **WIP = 1 task/person**, **Backend leads Frontend by 1 batch (Sashimi)**, CI/CD gates. |
| **How Much (Cost)** | **150 person-days (525h)**, **~77.4M AI tokens**, direct budget **~1.5 million VNĐ (~$60 USD)**. |

---

## 2. Work Breakdown Structure (WBS) & 4 Delivery Batches

```text
RosiHome MVP (51 US / 247 SP — Weeks 5 to 10)
├── [Weeks 1–4]: Inception, Market Research & Initial Concept Pivot
├── Phase 1: Inception & Technical Setup (Week 5 / 18 SP Equiv.) [Chí, Đạt, Quân]
├── Phase 2: Incremental Construction (Weeks 5–8 / 51 US / 247 SP)
│   ├── Batch 1: Foundation (Week 5 / 15 US / 68 SP) — Auth, Profile, Property, Room, Utility [Done]
│   ├── Batch 2: Core Operations (Week 6 / 16 US / 87 SP) — Tenant, Lease, Meter, Maintenance [Done]
│   ├── Batch 3: Billing & Payment (Week 7 / 11 US / 58 SP) — Invoices, VietQR, Proofs, Reminders [In Progress]
│   └── Batch 4: Analytics & Reports (Week 8 / 9 US / 34 SP) — Dashboards, Financial Reports, PDF [Planned]
└── Phase 3: Integration & Pilot (Weeks 9–10 / 10 Working Days Buffer) [All Members]
    └── E2E Regression Testing, 7-Day Pilot (2 Landlords), Final Defense Packaging
```

---

## 3. Delivery Methodology & Workflow

* **Kanban Flow:** `Backlog` $\rightarrow$ `Ready (DoR)` $\rightarrow$ `In Dev` $\rightarrow$ `PR Review` $\rightarrow$ `CI Test Gate` $\rightarrow$ `Merge & Deploy Staging` $\rightarrow$ `Mobile Integration` $\rightarrow$ `Done (DoD)`.
* **WIP Limit:** Strictly **1 active Task per developer** (each task may group multiple related User Stories within a feature module) to eliminate multitasking.
* **Sashimi Handoff:** Backend runs 1 batch ahead of Frontend $\rightarrow$ Frontend always integrates against live staging APIs.

```text
Week:       [ W1 - W4 ] ──► [ Week 5 ] ──────────► [ Week 6 ] ──────────► [ Week 7 ] ──────────► [ Week 8 ] ──────────► [ W9 - W10 ]
Phase:      [Inception] ──► [Setup + BE B1] ───► [BE B2 + FE B1] ───► [BE B3 + FE B2] ───► [BE B4 + FE B3] ───► [ E2E / Pilot ]
                                 │                    │                    │                    │
                                 ▼                    ▼                    ▼                    ▼
Frontend:   [  Pivot  ] ──► [UI Design Mocks] ──► [ FE Batch 1 Live ] ──► [ FE Batch 2 Live ] ──► [ FE Batch 3 Live ] ──► [ FE Batch 4 ]
```

---

## 4. Schedule, Milestones & Critical Path

* **Active Duration:** 30 working days (Weeks 5–10) | **Capacity:** 5 students $\times$ 3.5h/day = 17.5h/day.
* **Average Velocity:** $V = \frac{247\text{ SP}}{30\text{ days}} \approx \mathbf{8.23\text{ SP/day}}$ ($\approx 41.15\text{ SP/week}$).
* **Critical Path:** `Week 5 Setup & BE B1` $\rightarrow$ `Week 6 BE B2` $\rightarrow$ `Week 7 BE B3` $\rightarrow$ `Week 8 BE B4 & FE B4` $\rightarrow$ `Weeks 9–10 E2E & Pilot`.

| Milestone | Target Horizon | Deliverable Scope | Status |
|:---:|:---:|---|:---:|
| **M1** | Week 5 (Day 2) | Git repo, Supabase DB schema, Drizzle ORM, Vitest, CI pipeline, Expo shell ready. | ✅ Completed |
| **M2** | End of Week 5 | Batch 1 Live on Staging: Auth, Profile, Property, Room, Utility (68 SP). | ✅ Completed |
| **M3** | End of Week 6 | Batch 2 Live (50% MVP): Tenant, Lease, Meter, Maintenance (87 SP). Midpoint calibration. | ✅ Completed |
| **M4** | End of Week 7 | Batch 3 Live: Automated Billing, VietQR Napas247, Payment Proofs (58 SP). | 🔄 In Progress |
| **M5** | End of Week 8 | Batch 4 Live (100% Backlog): Dashboards, Financial Reports, PDF Export (34 SP). | ⏳ Planned |
| **M6** | End of Week 9 | Pilot Sign-off: 7-day live testing with 2 landlords in TP.HCM completed. | ⏳ Planned |
| **M7** | End of Week 10 | Final Submission: System documentation, demo video, source code acceptance. | ⏳ Planned |

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

* **Labor Effort (Active Window):** **150 person-days (525 productive hours)** — 5 students $\times$ 3.5h/day $\times$ 30 days (Self-managed).
* **Direct Cash Budget:** **1,500,000 VNĐ (~$60 USD)**:
  * *AI API Credits (Claude/OpenAI/Gemini):* 850,000 đ
  * *Cloud Hosting & Domain (Render/Supabase buffer):* 400,000 đ
  * *Management Contingency (15%):* 250,000 đ

---

## 7. Risk Management Mechanism (Risk Register)

$$\text{Risk Exposure} = \text{Probability (1–5)} \times \text{Impact (1–5)}$$

| ID | Risk Description | Prob. | Imp. | Exp. | Owner | Mitigation & Contingency Strategy |
|:---:|---|:---:|:---:|:---:|:---:|---|
| **R1** | **Compressed Timeline due to Week 5 Pivot:** 6-week execution window creates high delivery pressure. | 4 | 4 | **16** | Chí (PM) | Leverage AI coding agents to accelerate boilerplate; strictly enforce WIP=1 and modular ownership. |
| **R2** | **AI Code Logic Flaws:** AI generates subtly incorrect logic. | 4 | 4 | **16** | All Devs | Mandatory PR peer inspection; 100% Vitest coverage on calculation engines. |
| **R3** | **BE-FE Integration Delay:** Frontend blocked by API delays. | 3 | 4 | **12** | Chí (PM) | Backend leads by 1 batch (Sashimi); OpenAPI contracts agreed upfront. |
| **R4** | **Third-Party Outage (VietQR/Supabase/Render):** API downtime. | 2 | 4 | **8** | Minh (BE3) | Offline string-format QR fallback; mock payment demo mode. |
| **R5** | **Scope Creep (Feature Explosion):** Unapproved feature requests. | 3 | 4 | **12** | Chí (PM) | **Scope Freeze after Week 6**; route non-baseline ideas to Post-MVP. |
| **R6** | **Pilot Landlord Non-Adoption:** Landlords delay testing. | 2 | 3 | **6** | Hưng (FE1) | Provide pre-populated sample data; maintain backup test landlords. |

---

## 8. Change Management & Governance

* **Decision Hierarchy:**
  * *Level 1 (Internal Refactor):* Dev + 1 Peer Reviewer approval.
  * *Level 2 (Minor AC Clarification):* Affected Module Owners consensus.
  * *Level 3 (Baseline Scope/Deadline Change):* **100% Team Consensus + Sponsor/Lecturer Approval**.
* **Scope Freeze Policy:** Khóa cứng toàn bộ 51 User Stories sau **Tuần 6 (Milestone M3 — 50% MVP)**. Mọi ý tưởng mới chuyển sang Post-MVP.

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
