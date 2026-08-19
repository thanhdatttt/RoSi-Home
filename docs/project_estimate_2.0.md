# Software Project Estimation Document 2.0 — RosiHome

## 1. Introduction

### 1.1 Purpose
This document provides the empirical project re-estimate (**Project Estimate 2.0**) for the RosiHome platform. It uses **actual velocity, effort, and AI token telemetry from completing Batch 1 & Batch 2 (62.8% of User Story Points)** to forecast remaining effort, calendar time, and AI token consumption.

### 1.2 Project Overview
* **Project**: RosiHome — Property Management Platform for Self-Managing Landlords.
* **Tech Stack**: React Native / Expo SDK 57 (NativeWind), Node.js 22 / Express REST API (`/api/v1`), PostgreSQL (Supabase), Drizzle ORM, Render Web Service, VietQR, EmailJS.
* **Product Scope**: 5 Epics, 15 Features, **51 User Stories = 247 Story Points (SP)**.
* **Team Capacity**: 5 students working part-time (~3.5 hours/day/member = 17.5 team-hours/day).
* **AI Tooling**: Coding agents (Claude Code, Gemini CLI, GPT-5.6 Sol) used for logic and test drafting.

### 1.3 Scope Boundaries
* **In Scope**: All 51 User Stories across 4 delivery batches, infrastructure setup, CI/CD, testing, 7-day landlord pilot, and course demo packaging.
* **Out of Scope**: Merchant payment gateways, automated bank webhooks, IoT smart meters.

---

## 2. Estimation Methodology

### 2.1 Process Workflow

```text
Product Backlog 2.0 (51 User Stories = 247 SP)
        │
        ├── 1. Initial Sizing: Planning Poker (Fibonacci scale: 1, 2, 3, 5, 8, 13)
        ├── 2. Midpoint Calibration: Measure Actuals from Batches 1 & 2 (155 SP completed)
        └── 3. Velocity Forecast: Project Remaining Scope (Batches 3 & 4 = 92 SP) + Phase 3 Pilot
```

### 2.2 Core Assumptions & Metrics
* **1 Person-Day**: 1 member working 3.5 productive hours (Team = 5 person-days/day).
* **Story Point (SP)**: Relative functional complexity and implementation risk.
* **Velocity ($V$)**: Completed SP per working day ($V = \text{Completed SP} / \text{Actual Days}$).
* **Effort Rate ($\rho$)**: Person-days per SP ($\rho = \text{Actual Person-Days} / \text{Completed SP}$).
* **Token Rate ($\tau$)**: AI tokens per SP ($\tau = \text{Actual Tokens} / \text{Completed SP}$).

---

## 3. Story Point Baseline

All 51 User Stories were sized using Planning Poker consensus based on acceptance criteria, database complexity, and API interactions.

| Delivery Batch | Scope & Features | User Stories | Batch SP | % Scope |
|---|---|:---:|:---:|:---:|
| **Batch 1 (Foundation)** | Auth (6 US: 21 SP), Profile (1 US: 2 SP), Property/Room (5 US: 15 SP), Utility/Charge (3 US: 8 SP) + Tech Setup (22 SP) | 15 US | **68 SP** *(+22 Tech)* | 27.5% |
| **Batch 2 (Core Operations)** | Tenant (2 US: 16 SP), Lease (6 US: 23 SP), Meter (3 US: 17 SP), Maintenance (5 US: 14 SP) + CI Setup (17 SP) | 16 US | **87 SP** *(+17 Tech)* | 35.2% |
| **Batch 3 (Billing & Payment)** | Invoice (4 US: 26 SP), VietQR (2 US: 16 SP), Payment/Proof (3 US: 13 SP), Reminder (2 US: 13 SP) | 11 US | **58 SP** | 23.5% |
| **Batch 4 (Reports & Dashboard)**| Dashboard (4 US: 16 SP), Financial & Operational Reports (5 US: 18 SP) | 9 US | **34 SP** | 13.8% |
| **Total Product Scope** | **15 Features across 5 Epics** | **51 US** | **247 SP** | **100.0%** |

---

## 4. Velocity-Based Empirical Calibration (Batches 1 & 2 Completed)

### 4.1 Actual Measured Data (Weeks 2–5 / 20 Working Days)

| Performance Metric | Batch 1 (Foundation) | Batch 2 (Core Ops) | Combined (Batches 1 & 2) |
|---|:---:|:---:|:---:|
| **Completed Stories** | 15 US | 16 US | **31 User Stories (60.8%)** |
| **Completed Story Points** | 68 SP | 87 SP | **155 SP (62.8%)** |
| **Actual Elapsed Time** | 10 working days (2 wks) | 10 working days (2 wks) | **20 working days (4 wks)** |
| **Actual Effort Consumed** | 50 person-days (175 hrs) | 50 person-days (175 hrs) | **100 person-days (350 hrs)** |
| **Realized Velocity ($V$)** | 6.80 SP / day | 8.70 SP / day | **7.75 SP / working day** |
| **Actual AI Tokens Used** | 21.7M tokens | 26.9M tokens | **48.6M tokens** |

### 4.2 Calibration Formulas

* **Team Velocity ($V$)**:
  $$V = \frac{155\text{ SP}}{20\text{ days}} = \mathbf{7.75\text{ SP / working day}} \quad (\approx 38.75\text{ SP / week})$$

* **Effort Rate ($\rho$)**:
  $$\rho = \frac{100\text{ person-days}}{155\text{ SP}} = \mathbf{0.645\text{ person-days / SP}} \quad (\approx 2.26\text{ hours / SP})$$

* **Token Rate ($\tau$)**:
  $$\tau = \frac{48,600,000\text{ tokens}}{155\text{ SP}} = \mathbf{313,548\text{ tokens / SP}}$$

---

## 5. Forecasting Remaining Scope (Batches 3, 4 & Phase 3)

### 5.1 Remaining Scope Breakdown
* **Remaining Implementation (Phase 2)**: Batch 3 (58 SP) + Batch 4 (34 SP) = **92 SP** (20 User Stories).
* **Phase 3 Quality & Pilot Buffer (Weeks 9–10)**: 10 working days (= 50 person-days) for E2E regression testing, 7-day landlord pilot, and documentation packaging (no new User Stories).

### 5.2 Forecast Calculations

1. **Remaining Implementation Duration (Batches 3 & 4)**:
   $$\text{Days}_{\text{rem}} = \frac{92\text{ SP}}{7.75\text{ SP/day}} = \mathbf{11.87\text{ working days}} \quad (\approx 2.4\text{ weeks})$$

2. **Remaining Effort (Phase 2 & Phase 3)**:
   * Batches 3 and 4 Effort: $92\text{ SP} \times 0.645\text{ person-days/SP} = \mathbf{59.34\text{ person-days}}$ ($207.7\text{ hrs}$).
   * Phase 3 Quality & Pilot Effort: $10\text{ days} \times 5\text{ members} = \mathbf{50.00\text{ person-days}}$ ($175.0\text{ hrs}$).
   * **Total Remaining Effort**: $59.34 + 50.00 = \mathbf{109.34\text{ person-days}}$ ($382.7\text{ hrs}$).

3. **Remaining AI Token Consumption**:
   $$\text{Tokens}_{\text{rem}} = 92\text{ SP} \times 313,548\text{ tokens/SP} = \mathbf{28,846,416\text{ tokens}} \quad (\approx \mathbf{28.8\text{M tokens}})$$
   *(Projected API/Cloud Cost: ~$30.00 – $40.00 USD, covered by free student tiers).*

---

## 6. Estimate at Completion (EAC) Summary

| Project Metric | Completed (Batches 1 & 2) | Forecast (Batches 3, 4 & Phase 3) | Total Project EAC |
|---|:---:|:---:|:---:|
| **Product User Stories** | 31 User Stories (155 SP) | 20 User Stories (92 SP) | **51 User Stories (247 SP)** |
| **Working Duration** | 20 working days | 12 days (code) + 10 days (pilot) | **42 working days (~8.5 weeks)** |
| **Buffer Reserve** | — | 3 working days | **3 working days buffer** |
| **Total Calendar Schedule** | 4.0 weeks | 4.5 – 5.0 weeks | **8.5 – 10.0 calendar weeks** |
| **Total Effort Consumed** | 100 person-days (350 hrs) | 109.3 person-days (382.7 hrs) | **209.3 person-days (732.7 hrs)** |
| **Total AI Tokens Consumed** | 48.6M tokens | 28.8M tokens | **77.4M tokens** |
| **Total Direct Cash Expense** | VND 650,000 | VND 850,000 | **VND 1,500,000 (~$60 USD)** |

---

## 7. Governance & Tracking Rules
1. **Velocity Monitoring**: Measured at each batch boundary on Trello. If velocity drops below $6.0\text{ SP/day}$, non-critical report filters will be descheduled.
2. **AI Cost Control**: Monitored via IDE logs; unit tests prevent repeated bulk code regeneration.
3. **Scope Freeze**: Locked at 51 User Stories; any change must follow formal Change Control.
