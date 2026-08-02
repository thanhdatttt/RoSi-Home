# Software Project Estimation Document

## 1. Introduction

### 1.1 Purpose

This document provides the estimation for the RosiHome Property Management System project, including story points for all user stories in the Product Backlog. The estimation results are used for planning, progress tracking, and resource management throughout the MVP development lifecycle.
### 1.2 Project Overview

- **Project:** RosiHome – Property Management Platform for Self-Managing Landlords.
- **Technology stack:** React Native (mobile), Node.js/Express (backend), PostgreSQL (database), Drizzle ORM, JWT authentication, VietQR payment, GitHub Actions CI/CD.
- **Project scale:** MVP consisting of 5 Epics, 15 Features, 51 User Stories.
- **Team size:** 5 developers (full-stack, part-time).
- **Agile process:** Kanban with dependency-based delivery batches.

### 1.3 Scope

#### 1.3.1 In Scope

The estimated Epic/Module scope covers the entire Product Backlog:

- **EPIC 1:** Infrastructure and User Management (F-01)
- **EPIC 2:** Portfolio and Property Setup (F-02, F-03, F-04)
- **EPIC 3:** Automated Monthly Billing and Payment (F-05, F-06, F-07, F-08, F-09)
- **EPIC 4:** Lease Management and Maintenance Tracking (F-10, F-11, F-12, F-13)
- **EPIC 5:** Portfolio Performance Monitoring (F-14, F-15)

#### 1.3.2 Out of Scope

Items not included in this estimation:

- Technical tasks and infrastructure setup (not counted as user-story throughput)
- AI-powered analytics and features beyond MVP scope
- Payment gateway integration
- Electronic signatures
- IoT smart-meter integration
- Multi-landlord collaboration
- Advanced accounting and tax reporting

---

## 2. Estimation Methodology

### 2.1 Overall Estimation Process

```
Product Backlog
        ↓
Expert Judgment
        ↓
Story Points (User Story)
        ↓
Velocity (50% MVP)
        ↓
Most Likely (Feature)
        ↓
PERT
        ↓
Final Estimation
```

### 2.2 Assumptions

- Requirements remain stable throughout MVP development.
- Approximately 50% of MVP scope is already completed; the remainder is estimated in this document.
- Story Points use the Fibonacci sequence (1, 2, 3, 5, 8, 13).
- Team consists of 5 part-time developers (~3-4 hours/person/day).
- AI assists development and testing (Claude Code, ChatGPT, Gemini, ...).
- External services (email, push notification, file storage, PDF generation) have established baselines or development adapters.

### 2.3 Estimation Metrics

#### 2.3.1 Story Point

Story Point is a relative unit of effort measurement reflecting the complexity, workload, and technical risk of each user story. The Fibonacci sequence is used to reflect increasing uncertainty as stories grow larger.

#### 2.3.2 Velocity

Velocity is the number of story points the team can complete within a given time period (per day or per batch). Velocity is determined based on MVP performance data after actual development data becomes available.

#### 2.3.3 Effort

Effort is calculated based on velocity and total remaining story points. Formula: Effort (days) = Total SP / Velocity (SP/day).

#### 2.3.4 AI Token Consumption

AI Token Consumption estimates the number of tokens required for AI-assisted development, based on the total story points and average token consumption per story point.

---

## 3. Story Point Estimation

### 3.1 Expert Judgment

Expert Judgment is the initial estimation technique where the team lead, with AI assistance, assigns story points to each user story based on:
- **Complexity of business logic**: Number of acceptance criteria, validation rules, and edge cases
- **Technical risk**: Integration with external services, security-sensitive operations, data consistency requirements
- **Dependencies**: Number of prerequisite stories and cross-module coupling
- **Implementation effort**: Estimated lines of code, API endpoints, UI screens, and test coverage needed
- **Team familiarity**: How well the team knows the domain and technology for this story

The expert judgment provides the "Initial SP" as a starting point for team discussion during Planning Poker.

### 3.2 Planning Poker

Planning Poker is a consensus-based estimation technique where the entire team participates to refine the Initial SP into Final SP. The process:

1. **Preparation**: The Team Lead presents a user story with its acceptance criteria, dependencies, and the Initial SP from Expert Judgment.
2. **Discussion**: Team members ask clarifying questions about scope, technical approach, risks, and acceptance criteria.
3. **Voting**: Each developer independently selects a Fibonacci card (1, 2, 3, 5, 8, 13, 21) representing their estimate.
4. **Reveal**: All votes are revealed simultaneously. If consensus is reached (all votes match or within one Fibonacci step), that value becomes the Final SP.
5. **Discussion on outliers**: If estimates diverge significantly, the highest and lowest estimators explain their reasoning. The team discusses hidden complexity, unknowns, or different interpretations.
6. **Re-vote**: After discussion, the team votes again. Usually 2-3 rounds achieve consensus.
7. **Record**: The agreed Final SP is recorded in the story point table (Section 3.3).

**Planning Poker Record** :

| User Story     | Chí | Minh | Đạt | Hưng | Quân | Consensus Final SP | Notes                                                                                                  |
| -------------- | --- | ---- | --- | ---- | ---- | ------------------ | ------------------------------------------------------------------------------------------------------ |
| US-AUTH-03     | 2   | 5    | 3   | 2    | 3    | 3                  | Involve revoking refresh token and access token                                                        |
| US-ROOM-03     | 5   | 3    | 5   | 5    | 3    | 5                  | Harder than create 1 room because have to check for existing room name duplicate when generating rooms |
| US-TENANT-01   | 3   | 2    | 3   | 5    | 3    | 3                  | read and update with little validation                                                                 |
| US-TENANT-02   | 13  | 13   | 8   | 8    | 13   | 13                 | Require lease + tenant profile + tenant account creation, validation, locking, email service.          |
| US-UTILITY-01  | 2   | 2    | 3   | 3    | 2    | 2                  | Only create object, very little validation needed                                                      |
| US-UTILITY-02  | 3   | 3    | 3   | 3    | 3    | 3                  | Have audit and history management                                                                      |
| US-CHARGE-01   | 3   | 3    | 5   | 3    | 5    | 3                  | Only CRUD, little validation                                                                           |
| US-METER-01    | 1   | 1    | 2   | 1    | 2    | 1                  | Only create, little validation                                                                         |
| US-METER-02    | 13  | 8    | 13  | 13   | 8    | 13                 | Require complex logic to match Viet Nam law's for default calculation                                  |
| US-METER-03    | 3   | 3    | 3   | 3    | 5    | 3                  | Only update, but still need medium validation and recalculate invoice                                  |
| US-REMINDER-01 | 8   | 8    | 8   | 5    | 8    | 8                  | Depend on many external service (email, push notification), require cron job                           |
| US-REMINDER-02 | 5   | 5    | 3   | 8    | 5    | 5                  | Depend on email and push notification                                                                  |
| US-LEASE-03    | 5   | 3    | 5   | 3    | 5    | 5                  | Not only update but also renew lease                                                                   |
| US-LEASE-05    | 5   | 5    | 5   | 5    | 5    | 5                  | Depend on push notification                                                                            |
| US-MAINT-03    | 2   | 2    | 2   | 2    | 3    | 2                  | Similar to view submitted maintenance request                                                          |
| US-MAINT-04    | 1   | 2    | 3   | 2    | 3    | 2                  | Only update 1 field of object                                                                          |
| US-REPORT-01   | 13  | 8    | 8   | 13   | 13   | 13                 | Report require lots of calculation and need to decide what to calculate to be useful                   |
| US-REPORT-02   | 13  | 13   | 13  | 8    | 13   | 13                 | Complex analysis needed                                                                                |
| US-REPORT-04   | 5   | 5    | 8   | 5    | 8    | 5                  | Not complex calculation but still require some calculation                                             |

### 3.3 Story Point Result

The expert judgment story points below represent the team lead's initial assessment with AI assistance. These serve as the baseline for velocity-based forecasting. Final SP column is populated after Planning Poker consensus.

| User Story     | Description                                           | Initial SP | Final SP |
| -------------- | ----------------------------------------------------- | ---------- | -------- |
|                | **EPIC 1: Infrastructure and User Management**        |            |          |
| US-AUTH-01     | Register a landlord account                           | 3          | 3        |
| US-AUTH-02     | Log in                                                | 5          | 5        |
| US-AUTH-03     | Log out                                               | 1          | 3        |
| US-AUTH-04     | Enforce role and data ownership                       | 5          | 5        |
| US-AUTH-05     | Change password                                       | 3          | 3        |
| US-PROFILE-01  | View and update a user profile                        | 2          | 2        |
| US-AUTH-06     | Recover a forgotten password                          | 5          | 5        |
|                | **EPIC 2: Portfolio and Property Setup**              |            |          |
| US-PROPERTY-01 | Create a property                                     | 3          | 3        |
| US-PROPERTY-02 | View and update owned properties                      | 2          | 2        |
| US-ROOM-01     | Add a room to a property                              | 3          | 3        |
| US-ROOM-02     | View and update room information                      | 2          | 2        |
| US-ROOM-03     | Add multiple rooms to a property                      | 5          | 5        |
| US-TENANT-01   | View and update tenant information                    | 3          | 3        |
| US-TENANT-02   | Provision a tenant account from a lease               | 8          | 13       |
| US-UTILITY-01  | Configure utility rates                               | 5          | 3        |
| US-UTILITY-02  | View and update utility rates                         | 3          | 3        |
| US-CHARGE-01   | Configure recurring property surcharges               | 5          | 3        |
|                | **EPIC 3: Automated Monthly Billing and Payment**     |            |          |
| US-METER-01    | Record an initial meter reading                       | 3          | 1        |
| US-METER-02    | Record monthly readings and calculate consumption     | 13         | 13       |
| US-METER-03    | Correct a reading used for billing                    | 5          | 3        |
| US-INVOICE-01  | Generate a monthly invoice                            | 13         | 13       |
| US-INVOICE-02  | View an invoice                                       | 3          | 3        |
| US-INVOICE-03  | Download an invoice document                          | 5          | 5        |
| US-INVOICE-04  | Review and send a draft invoice                       | 5          | 5        |
| US-VIETQR-01   | Configure landlord payment details                    | 3          | 3        |
| US-VIETQR-02   | Generate and display an invoice VietQR code           | 13         | 13       |
| US-PAYMENT-01  | Upload payment proof                                  | 5          | 5        |
| US-PAYMENT-02  | Verify payment manually                               | 3          | 3        |
| US-PAYMENT-03  | View payment history and outstanding balances         | 5          | 5        |
| US-REMINDER-01 | Receive an automatic overdue-payment reminder         | 5          | 8        |
| US-REMINDER-02 | Send a manual payment reminder                        | 3          | 5        |
|                | **EPIC 4: Lease Management and Maintenance Tracking** |            |          |
| US-LEASE-01    | Create a digital lease                                | 5          | 5        |
| US-LEASE-02    | View lease information                                | 2          | 2        |
| US-LEASE-03    | Update or renew a lease                               | 5          | 5        |
| US-LEASE-04    | End a lease and release a room                        | 3          | 3        |
| US-LEASE-05    | Receive a lease-expiration reminder                   | 8          | 5        |
| US-LEASE-06    | View upcoming lease expirations                       | 3          | 3        |
| US-MAINT-01    | Submit a maintenance request                          | 5          | 5        |
| US-MAINT-02    | View submitted maintenance requests                   | 2          | 2        |
| US-MAINT-03    | Review maintenance requests                           | 3          | 2        |
| US-MAINT-04    | Update maintenance status                             | 3          | 2        |
| US-MAINT-05    | View maintenance history by room                      | 3          | 3        |
|                | **EPIC 5: Portfolio Performance Monitoring**          |            |          |
| US-DASH-01     | View occupied room count                              | 3          | 3        |
| US-DASH-02     | View monthly revenue summary                          | 5          | 5        |
| US-DASH-03     | View outstanding and overdue invoices                 | 5          | 5        |
| US-DASH-04     | View upcoming lease expirations on the dashboard      | 3          | 3        |
| US-REPORT-01   | Select a reporting period and generate a report       | 5          | 13       |
| US-REPORT-02   | Analyze financial performance and debt                | 8          | 13       |
| US-REPORT-03   | Analyze occupancy, churn, and lease expirations       | 8          | 8        |
| US-REPORT-04   | Analyze maintenance efficiency                        | 5          | 5        |
| US-REPORT-05   | Export a business report as PDF                       | 5          | 5        |
|                | **Total**                                             | **236**    | **248**  |

---

## 4. Velocity-Based Estimation

*This section will be populated after Planning Poker consensus (Section 3.3 Final SP column) is completed. Velocity calculation requires Final Story Points per user story to determine remaining SP and forecast completion time.*

### 4.1 MVP Performance Data

| Metric                  | Value |
| ----------------------- | ----- |
| Completed Story Points  |       |
| Completed User Stories  |       |
| Actual Development Time |       |
| AI Tokens Used          |       |


### 4.2 Velocity Calculation

| Stream          | Time/Story | Tokens/Story |
| --------------- | ---------- | ------------ |
| BE1 blended     |            |              |
| BE2 combined    |            |              |
| BE3 Billing     |            |              |
| BE3 Maintenance |            |              |
| BE3 combined    |            |              |
| FE1 Batch 1     |            |              |
| FE2 Batch 1     |            |              |

**Overall backend velocity:**
**Overall backend token rate:**

### 4.3 Remaining Work Estimation

**Remaining backend scope:** (to be determined after Final SP)

| Scenario | Remaining Backend Time | Remaining Backend Tokens | Factor |
|---|---|---|---|
| Optimistic | | | 1.0× |
| Expected | | | 1.5× |
| Conservative | | | 2.0× |

**Remaining frontend scope:** (to be determined after Final SP)

| Scenario | FE1 Remaining | FE2 Remaining | Combined Remaining |
|---|---|---|---|
| Lean | | | |
| Expected | | | |
| Conservative | | | |

---

## 5. Three-Point Estimation (PERT)

### 5.1 Estimation Factors

Effort Complexity Factors used to evaluate each Feature:

| Factor | Description |
|---|---|
| Complex business logic | Multi-step calculations, state machines, validation rules, edge cases |
| Third-party API integration | External payment (VietQR), email/push providers, file storage, PDF services |
| Security-sensitive functionality | Authentication, authorization, payment data, personal data, encryption |
| AI-generated unfamiliar code | New patterns, libraries, or domains where AI assistance is less reliable |
| Performance optimization | Large dataset aggregation, report generation, query optimization, caching |
| Requirement ambiguity | Unclear acceptance criteria, pending stakeholder decisions, evolving scope |

Complexity Score = count of factors present per feature (0–6).

Conversion rules (applied to Most Likely M):
| Complexity Score | O | P |
|---|---|---|
| 0–2 | 0.90M | 1.20M |
| 3–5 | 0.85M | 1.40M |
| 6–8 | 0.80M | 1.70M |
| >8 | 0.70M | 2.00M |

> **Most Likely (M)** derived from MVP velocity (1.9 SP/hour from 37 stories / 115 SP in 60.4h); only **O** and **P** adjusted by Complexity Score.

#### Feature Complexity Scoring

| Feature | Factors Present | Complexity Score |
|---|---|---|
| F-01: Auth & Profile | Security-sensitive, Complex business logic, Requirement ambiguity (roles) | 3 |
| F-02: Property | — | 0 |
| F-03: Room | Complex business logic (multi-room) | 1 |
| F-04: Tenant & Utility | Complex business logic (provisioning, rates, surcharges), Requirement ambiguity | 2 |
| F-05: Meter | Complex business logic (consumption calc, corrections) | 1 |
| F-06: Invoice | Complex business logic (generation, state machine), AI-generated unfamiliar code (PDF), Performance optimization | 3 |
| F-07: VietQR | Third-party API integration, Security-sensitive, Complex business logic (QR payload) | 3 |
| F-08: Payment | Security-sensitive, Complex business logic (verification, history), Requirement ambiguity | 3 |
| F-09: Reminder | Complex business logic (scheduling), AI-generated unfamiliar code (cron/jobs) | 2 |
| F-10: Lease | Complex business logic (lifecycle, renewals), Requirement ambiguity | 2 |
| F-11: Maintenance | Complex business logic (workflow, status transitions) | 1 |
| F-12: Dashboard | Performance optimization (aggregations), Complex business logic | 2 |
| F-13: Report | Complex business logic (multi-analysis), Performance optimization, AI-generated unfamiliar code (PDF export), Requirement ambiguity | 4 |

### 5.2 PERT Estimation Result

Most Likely (M) = Feature SP ÷ 1.9 SP/hour (empirical velocity from MVP)

| Feature | SP | M (hours) | Complexity Score | O (hours) | P (hours) | Expected = (O+4M+P)/6 (hours) |
|---|---:|---:|---:|---:|---:|---:|
| F-01: Auth & Profile | 24 | 12.6 | 3 | 10.7 | 17.7 | **13.1** |
| F-02: Property | 5 | 2.6 | 0 | 2.4 | 3.2 | **2.7** |
| F-03: Room | 10 | 5.3 | 1 | 4.7 | 6.3 | **5.3** |
| F-04: Tenant & Utility | 24 | 12.6 | 2 | 11.4 | 15.2 | **12.8** |
| F-05: Meter | 21 | 11.1 | 1 | 9.9 | 13.3 | **11.1** |
| F-06: Invoice | 26 | 13.7 | 3 | 11.6 | 19.2 | **14.2** |
| F-07: VietQR | 16 | 8.4 | 3 | 7.2 | 11.8 | **8.8** |
| F-08: Payment | 13 | 6.8 | 3 | 5.8 | 9.6 | **7.1** |
| F-09: Reminder | 8 | 4.2 | 2 | 3.8 | 5.1 | **4.3** |
| F-10: Lease | 26 | 13.7 | 2 | 12.3 | 16.4 | **13.8** |
| F-11: Maintenance | 16 | 8.4 | 1 | 7.6 | 10.1 | **8.5** |
| F-12: Dashboard | 16 | 8.4 | 2 | 7.6 | 10.1 | **8.5** |
| F-13: Report | 31 | 16.3 | 4 | 13.9 | 22.8 | **16.8** |
| **Total** | **236** | **124.1** | — | **108.8** | **160.6** | **127.0** |

### 5.3 Estimation Validation

| Method | Estimated Time (hours) | Estimated Token (M) |
|---|---:|---:|
| Velocity (Expected) | TBD (after Final SP) | TBD |
| PERT (Expected) | 127.0 | ~860M (extrapolated) |

- Compare results between two methods.
- Analyze if significant variance exists.
- PERT total (127h) aligns with velocity-based backend (60h done + ~15h remaining = 75h) + frontend (~75h) ≈ 150h when including integration, testing, deployment overhead.

---

## 6. Final Estimation Summary

### 6.1 Overall Estimation

| Item | Expected Value | Range |
|---|---|---|
| Total Story Points (backend) | 236 | - |
| Completed Story Points (backend) | TBD (after Final SP) | - |
| Remaining Story Points (backend) | TBD (after Final SP) | - |
| Backend Velocity | ~0.61 stories/hour | - |
| Backend Token Rate | ~6.75M tokens/story | - |
| **PERT Total Expected Time** | **127.0 hours** | 108.8–160.6 hours |
| PERT Backend Expected Time | ~75 hours | 65–95 hours |
| PERT Frontend Expected Time | ~52 hours | 44–62 hours |
| Full Implementation AI Usage EAC | ~860M tokens | 770–960M tokens |
| Complete MVP Duration | 9 weeks | 8–10 weeks |
| Gross Team Capacity | 787.5 hours | 600–1,000 hours |
| Development Cash Budget | VND 3,277,500 | VND 950,000–4,062,500 |
| Economic Labor | 787.5h × shadow rate | 600–1,000h × shadow rate |

*Velocity-based remaining work estimates (Section 4) to be populated after Planning Poker Final SP.*

### 6.2 Conclusion

The **PERT three-point estimation** (Section 5) provides the primary risk-adjusted forecast: **127 hours expected** (109–161 hour range) for full MVP implementation across all 13 features. This translates to **~9 weeks** with 5 part-time developers at 3–4 hours/day.

The PERT estimate integrates:
- **Feature-level complexity scoring** across 6 risk factors (business logic, third-party APIs, security, AI unfamiliarity, performance, ambiguity)
- **Empirical velocity baseline** (1.9 SP/hour from 37 deployed backend stories)
- **Asymmetric uncertainty** via Optimistic/Pessimistic bounds per complexity tier
- **Cross-method validation**: PERT total (127h) aligns with velocity-based EAC (75h backend + 75h frontend ≈ 150h with integration/testing overhead)

The velocity-based estimation (Section 4) will be finalized after Planning Poker consensus populates Final SP. Both methods will be reconciled before baseline approval per the Cost–Time–Resources Estimation Methodology.

---

## Appendix

### A. Velocity Calculation Details

| Stream | Completed Stories | Real-Time Hours | Tokens | Hours/Story | Tokens/Story |
|---|---|---|---|---|---|
| BE1 (Batch 1+2) | 15 | 35 | 135.0M | 2.33 | 9.00M |
| BE2 (Batch 1) | 5 | 7 | 6.3M | 1.40 | 1.26M |
| BE2 (Batch 2+3) | 7 | 13 | 13.0M | 1.86 | 1.86M |
| BE2 (Batch 4) | 2 | 2 | 2.5M | 1.00 | 1.25M |
| BE3 (Billing Foundation) | 3 | 1.01 | 36.5M | 0.34 | 12.17M |
| BE3 (MAINT-01→05) | 5 | 2.38 | 56.56M | 0.48 | 11.31M |
| **Backend Total** | **37** | **60.39** | **249.86M** | **1.63** | **6.75M** |
| FE1 (Batch 1) | 4 pkg | 13–15 | 10.5M | 3.25–3.75 | 2.625M |
| FE2 (Batch 1) | 4 pkg | 13–14 | 118.0M | 3.25–3.50 | 29.50M |

### B. Feature Mapping

| Epic | Feature | User Stories |
|---|---|---|
| EPIC 1 | F-01: Auth & Profile | US-AUTH-01→06, US-PROFILE-01 (7) |
| EPIC 2 | F-02: Property | US-PROPERTY-01→02 (2) |
| EPIC 2 | F-03: Room | US-ROOM-01→03 (3) |
| EPIC 2 | F-04: Tenant & Utility | US-TENANT-01→02, US-UTILITY-01→02, US-CHARGE-01 (5) |
| EPIC 3 | F-05: Meter | US-METER-01→03 (3) |
| EPIC 3 | F-06: Invoice | US-INVOICE-01→04 (4) |
| EPIC 3 | F-07: VietQR | US-VIETQR-01→02 (2) |
| EPIC 3 | F-08: Payment | US-PAYMENT-01→03 (3) |
| EPIC 3 | F-09: Reminder | US-REMINDER-01→02 (2) |
| EPIC 4 | F-10: Lease | US-LEASE-01→06 (6) |
| EPIC 4 | F-11: Maintenance | US-MAINT-01→05 (5) |
| EPIC 5 | F-12: Dashboard | US-DASH-01→04 (4) |
| EPIC 5 | F-13: Report | US-REPORT-01→05 (5) |

### C. PERT Calculation Details

*To be populated after feature-level complexity scoring is completed by the team.*