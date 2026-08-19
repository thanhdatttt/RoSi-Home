# Project Status Report #1 — 50% Milestone (Status Email)

- **Completion scope:** **48.18%** (119 / 247 Story Points) — 31 / 51 User Stories completed (8 / 15 Features shipped).
- **Completion date:** 128 remaining points / 59.5 points/batch = **~2.15 Batches** (~23 working days) $\rightarrow$ **Target completion: Week 10**.
- **Budget usage & Estimated final cost:** Spent: **1,900,000 VND** (44.7%) | Estimated final cost (EAC): **~3,850,000 VND** (On Budget).
- **Issues and resolutions:** 
  - Token quota exhaustion for several team members $\rightarrow$ Switched to free fallback models (BigPickle, generic chatbox AI).
  - Initial product concept was impractical $\rightarrow$ Pivoted and restarted ideation and implementation from scratch in Week 5.
- **Changes and impacts:** Migrated email delivery service sequentially from Nodemailer (SMTP) to Resend API, and finally to EmailJS to achieve stable and reliable operation.
- **Updated product backlog:**
  - *Stories completed (31 US):* US-AUTH-01→06, US-PROFILE-01, US-PROPERTY-01→02, US-ROOM-01→03, US-UTILITY-01→02, US-CHARGE-01, US-TENANT-01→02, US-LEASE-01→06, US-METER-01→03, US-MAINT-01→05.
  - *Stories added or removed:* 0 (51-story baseline preserved).
- **Updated release plan:** Release 1 (Batch 1 & 2) 100% DONE $\rightarrow$ Release 2 (Batch 3: Billing & VietQR) Week 8 $\rightarrow$ Release 3 (Batch 4: Analytics) Week 10.
- **Risks with high probability and impact:** 
  - VietQR string compatibility across banking apps $\rightarrow$ Run physical scan tests on 4 major banking apps during Batch 3.
  - Push notification delivery reliability $\rightarrow$ Monitor logs on Expo Push Service backend.
- **Working software and documentation:** Backend API deployed on Render (`/api/v1`), Mobile Expo Preview build, and reference documentation at root `docs/` (`product_backlog_2.0.md`, `project_estimation.md`, `project_plan.md`).

---

# Project Status Report #2 — 100% Milestone (Final Release Status Email)

- **Completion scope:** **100%** (247 / 247 Story Points) — **51 / 51 User Stories completed** (**15 / 15 Features shipped & accepted**).
- **Completion date:** **All product deliverables completed at Week 10 (Day 45)** $\rightarrow$ **ON TIME**.
- **Budget usage & Estimated final cost:** Total actual spend: **3,850,000 VND / 4,250,000 VND** (**90.6%** of budget) $\rightarrow$ **UNDER BUDGET (Saved ~400,000 VND)**.
- **Issues and resolutions:** 
  - Frontend UI integration errors with backend API contracts $\rightarrow$ Refactored API client adapters and unified data mapping.
  - High volume of defects requiring team overtime (OT) $\rightarrow$ Utilized the Phase 3 buffer and intensive bug-fixing sessions to stabilize the MVP before final release.
- **Changes and impacts:** 0 scope creep stories (100% adherence to the Product Backlog 2.0 51-story baseline).
- **Updated product backlog:**
  - *Stories completed (51/51 US):* 
    - Batch 1 (15 US): US-AUTH-01→06, US-PROFILE-01, US-PROPERTY-01→02, US-ROOM-01→03, US-UTILITY-01→02, US-CHARGE-01
    - Batch 2 (16 US): US-TENANT-01→02, US-LEASE-01→06, US-METER-01→03, US-MAINT-01→05
    - Batch 3 (11 US): US-INVOICE-01→04, US-VIETQR-01→02, US-PAYMENT-01→03, US-REMINDER-01→02
    - Batch 4 (9 US): US-DASH-01→04, US-REPORT-01→05
  - *Stories added or removed:* 0 stories.
- **Updated release plan:** Release 1 (100%), Release 2 (100%), Release 3 (100%) $\rightarrow$ **All 4 Delivery Batches completed; MVP ready for Final Demo and Pilot Operation**.
- **Risks with high probability and impact:** All technical and integration risks successfully mitigated and closed; system transitioned to pilot operations.
- **Working software and documentation:** Production-ready Backend API deployed on Render (`/api/v1`), complete React Native Mobile build, 100% passing CI/CD test suite, and full project documentation at root `docs/` (`product_backlog_2.0.md`, `project_estimation.md`, `project_plan.md`, `architecture.md`, `proposal.md`).
