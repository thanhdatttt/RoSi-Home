# Software Project Estimation Document 2.0 — RosiHome

**Course:** Software Project Management — **Lecturer:** TS. Ngô Huy Biên  
**Project:** RosiHome — Property Management Platform for Self-Managing Landlords  
**Version:** 2.0 (Calibrated Execution Baseline — Midpoint 50% MVP)  
**Date:** 24 July 2026  
**Execution Context:** Semester Weeks 1–10 | **Active Execution Window:** Weeks 5–10 (6 calendar weeks ~ 30 working days)  
**Team Capacity:** 5 students working part-time (~3.5 hours/day/member = 17.5 team-hours/day)  
**Related Baselines:** `docs/product_backlog_2.0.md`, `docs/project_plan_2.0.md`, `docs/project_charter.md`

---

## 1. Executive Summary & Calibration Context

Following the project pivot at Week 4/5 (switching from an unfeasible early concept to the RosiHome MVP), the active delivery window was fixed at **6 calendar weeks (Weeks 5 to 10 = 30 working days)**.

| Metric | Planned Value | Realized / Forecasted EAC | Status |
|---|:---:|:---:|:---:|
| **Product Scope** | 51 User Stories | **51 User Stories (100% Backlog 2.0)** | Preserved |
| **Total Story Points (Size)** | 247 SP | **247 Story Points** | Preserved |
| **Active Execution Duration** | 30 working days (6 weeks) | **30 working days (Weeks 5–10)** | On Schedule |
| **Total Labor Effort** | 150 person-days (525 hrs) | **150 person-days (525 hrs)** | On Budget |
| **AI Token Consumption** | 80.0M tokens | **~77.4M tokens (48.6M actual + 28.8M remaining)** | Within Quota |
| **Direct Cash Budget** | 1,500,000 VNĐ (~$60 USD) | **1,500,000 VNĐ (~$60 USD)** | Self-Funded |

---

## 2. Story Point Baseline (Size Breakdown)

All 51 User Stories were sized using Planning Poker consensus with the Fibonacci scale $(1, 2, 3, 5, 8, 13)$:

| Delivery Batch | Scope & Features | User Stories | Batch SP | % Scope |
|---|---|:---:|:---:|:---:|
| **Batch 1 (Foundation)** | Auth (6 US: 21 SP), Profile (1 US: 2 SP), Property/Room (5 US: 15 SP), Utility/Charge (3 US: 8 SP) + Tech Setup (22 SP) | 15 US | **68 SP** *(+22 Tech)* | 27.5% |
| **Batch 2 (Core Operations)** | Tenant (2 US: 16 SP), Lease (6 US: 23 SP), Meter (3 US: 17 SP), Maintenance (5 US: 14 SP) + CI Setup (17 SP) | 16 US | **87 SP** *(+17 Tech)* | 35.2% |
| **Batch 3 (Billing & Payment)** | Invoice (4 US: 26 SP), VietQR (2 US: 16 SP), Payment/Proof (3 US: 13 SP), Reminder (2 US: 13 SP) | 11 US | **58 SP** | 23.5% |
| **Batch 4 (Reports & Dashboard)**| Dashboard (4 US: 16 SP), Financial & Operational Reports (5 US: 18 SP) | 9 US | **34 SP** | 13.8% |
| **Total Product Scope** | **15 Features across 5 Epics** | **51 US** | **247 SP** | **100.0%** |

---

## 3. Actual Measured Performance (Batches 1 & 2 Completed)

During **Weeks 5 and 6 (10 working days = 50 person-days)**, the team executed Batches 1 and 2:

| Performance Metric | Batch 1 (Week 5) | Batch 2 (Week 6) | Combined Actuals (50% MVP) |
|---|:---:|:---:|:---:|
| **Completed Stories** | 15 US | 16 US | **31 User Stories (60.8%)** |
| **Completed Story Points** | 68 SP | 87 SP | **155 SP (62.8%)** |
| **Actual Elapsed Time** | 5 working days (1 wk) | 5 working days (1 wk) | **10 working days (2 wks)** |
| **Actual Effort Consumed** | 25 person-days (87.5 hrs) | 25 person-days (87.5 hrs) | **50 person-days (175 hrs)** |
| **Realized Coding Velocity ($V_{\text{code}}$)** | 13.6 SP / day | 17.4 SP / day | **15.5 SP / working day** |
| **Actual AI Tokens Consumed** | 21.7M tokens | 26.9M tokens | **48.6M tokens** |

### Calibration Rates:
* **Effort Rate ($\rho$)**: $\rho = \frac{50\text{ person-days}}{155\text{ SP}} \approx \mathbf{0.323\text{ person-days / SP}}$ ($\approx 1.13\text{ hours / SP}$ with AI coding agent assistance).
* **Token Consumption Rate ($\tau$)**: $\tau = \frac{48,600,000\text{ tokens}}{155\text{ SP}} = \mathbf{313,548\text{ tokens / SP}}$.

---

## 4. Forecast for Remaining Scope (Weeks 7 to 10)

### 4.1 Remaining Implementation (Batches 3 & 4 — 92 SP)
* **Scope**: Batch 3 (58 SP) + Batch 4 (34 SP) = **92 SP** (20 User Stories).
* **Estimated Coding Time**:
  $$\text{Days}_{\text{rem}} = \frac{92\text{ SP}}{15.5\text{ SP/day}} \approx \mathbf{5.94\text{ working days}} \quad (\approx \mathbf{2\text{ calendar weeks: Weeks 7 and 8}})$$
* **Remaining Implementation Effort**: $92\text{ SP} \times 0.323\text{ person-days/SP} \approx \mathbf{29.7\text{ person-days}}$ ($104\text{ hours}$).
* **Remaining AI Tokens**: $92\text{ SP} \times 313,548\text{ tokens/SP} \approx \mathbf{28.8M\text{ tokens}}$.

### 4.2 Phase 3: Integration, Pilot & Project Closure (Weeks 9 & 10)
* **Duration**: **10 working days (50 person-days = 175 hours)** reserved exclusively as a buffer for:
  * E2E regression testing across all 51 User Stories.
  * 7-day live pilot with 2 representative landlords in TP.HCM.
  * Document synchronization, video demonstration, and course defense packaging.

---

## 5. Estimate at Completion (EAC) Summary

| Project Dimension | Final Estimate at Completion (EAC) |
|---|---|
| **Total Calendar Duration** | **6 weeks (Weeks 5–10)** within the 10-week semester timeline. |
| **Total Working Days** | **30 working days** (10 days Batches 1–2 + 10 days Batches 3–4 + 10 days Phase 3 Pilot). |
| **Overall Average Velocity** | $V = \frac{247\text{ SP}}{30\text{ days}} \approx \mathbf{8.23\text{ SP / working day}}$ ($\approx 41.15\text{ SP / week}$). |
| **Total Labor Effort** | **150 person-days (525 productive hours)** across 5 team members. |
| **Total AI Token Resource** | **77.4M tokens** ($48.6\text{M actual} + 28.8\text{M forecast}$). |
| **Total Direct Cash Cost** | **1,500,000 VNĐ (~$60.00 USD)** for AI API quotas and cloud infrastructure. |
