# Software Project Estimation Document — RoSi-Home

## 1. Document Information & Purpose

- **Project:** RoSi-Home — Property Management Platform for Self-Managing Landlords.
- **Delivery Team:** RoSi-Home Student Development Team (5 part-time members: Chí, Đạt, Minh, Hưng, Quân; ~3.5 hours/person/day).
- **Purpose:** This document establishes a scientific estimate of project Size, Effort, Duration, and Budget for the RoSi-Home project using **two complementary estimation methods**:
  1. **Method 1:** Story Points and Planning Poker combined with empirical through-origin time calibration.
  2. **Method 2:** Simple Linear Regression (`ŷ = a + bx`) based on trackable backlog count and normalized data from 5 completed historical student projects.

## 2. Scope Overview & Backlog Sizing

The estimation baseline directly reflects the approved Product Backlog (with granular Backend and Frontend breakdown):
- **Product Scope (User Stories):** 5 Epics, 15 Features, comprising **51 User Stories** = **247 Story Points**.
- **Supporting Scope (Tasks):** 6 Technical/Project Tasks (29 SP) + 9 Documentation Tasks (87 SP) = **15 Tasks** (116 SP).
- **Total Trackable Backlog Items:** **66 items** = **363 Story Points**.

## 3. Method 1: Story-Point-Based Effort Estimation

### 3.1. Planning Poker & Conflict Resolution
The 5 development team members conducted anonymous voting using the standard Fibonacci sequence (1, 2, 3, 5, 8, 13) to size complex User Stories. Whenever initial estimates diverged, the highest and lowest voters explained their technical rationale (Backend vs. Frontend perspective) during team discussions until consensus was reached:

| User Story | Chí (BE1) | Minh (BE3) | Đạt (BE2) | Hưng (FE1) | Quân (FE2) | Consensus Final SP | Technical Notes |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **US-AUTH-03** | 5 | 5 | 3 | 2 | 3 | **3** | Revoke refresh and access tokens safely; invalidate sessions. |
| **US-ROOM-03** | 5 | 3 | 5 | 5 | 3 | **5** | Bulk room creation with duplicate detection and database transactions. |
| **US-TENANT-01** | 3 | 2 | 3 | 5 | 3 | **3** | View and update tenant information with ownership authorization. |
| **US-TENANT-02** | 13 | 13 | 8 | 8 | 13 | **13** | Provision tenant account from lease, assign permissions, and send email. |
| **US-UTILITY-01** | 2 | 2 | 3 | 3 | 2 | **2** | Utility rate configuration with basic validation rules. |
| **US-UTILITY-02** | 3 | 3 | 3 | 3 | 3 | **3** | View and update rates with effective-date audit history. |
| **US-CHARGE-01** | 3 | 3 | 5 | 3 | 5 | **3** | Recurring property surcharge configuration and billing scope validation. |
| **US-METER-01** | 1 | 1 | 2 | 1 | 2 | **1** | Record initial meter reading with baseline input constraints. |
| **US-METER-02** | 13 | 8 | 13 | 13 | 8 | **13** | Monthly meter recording and progressive tiered rate calculations. |
| **US-METER-03** | 3 | 3 | 3 | 3 | 5 | **3** | Reading correction and draft invoice recalculation workflow. |
| **US-REMINDER-01**| 8 | 8 | 8 | 5 | 8 | **8** | Scheduled background cron job and push notification delivery. |
| **US-REMINDER-02**| 5 | 5 | 3 | 8 | 5 | **5** | Manual payment reminder with duplicate prevention control. |
| **US-LEASE-03** | 5 | 3 | 5 | 3 | 5 | **5** | Lease agreement update and renewal with historical traceability. |
| **US-LEASE-05** | 5 | 5 | 5 | 5 | 5 | **5** | Multi-window automated lease expiration reminder scheduling. |
| **US-MAINT-03** | 2 | 2 | 2 | 2 | 3 | **2** | Review and filter submitted room maintenance requests. |
| **US-MAINT-04** | 1 | 2 | 3 | 2 | 3 | **2** | Maintenance status transition and audit history logging. |
| **US-REPORT-01** | 13 | 8 | 8 | 13 | 13 | **13** | Multi-period reporting data aggregation and wide-scope statistics. |
| **US-REPORT-02** | 13 | 13 | 13 | 8 | 13 | **13** | In-depth financial analysis, cash flow, and debt reconciliation. |
| **US-REPORT-04** | 5 | 5 | 8 | 5 | 8 | **5** | Maintenance efficiency and resolution time metrics calculation. |

### 3.2. Story Point Summary by Delivery Batches

| Delivery Workstream | Story Points (SP) | Included Work Items |
| :--- | :---: | :--- |
| **Batch 1: Core Foundation** | 68 SP | AUTH (01–06), PROFILE-01, PROPERTY (01–02), ROOM (01–03), UTILITY (01–02), CHARGE-01 |
| **Batch 2: Core Operations** | 87 SP | TENANT (01–02), LEASE (01–06), METER (01–03), MAINT (01–05) |
| **Batch 3: Billing & Payments** | 58 SP | INVOICE (01–04), VIETQR (01–02), PAYMENT (01–03), REMINDER (01–02) |
| **Batch 4: Analytics & Reports**| 34 SP | DASH (01–04), REPORT (01–05) |
| **Product User Stories Subtotal (51 items)** | **247 SP** | **All product software capabilities** |
| **Technical & Documentation Tasks (15 items)** | **116 SP** | CI/CD setup, Render, Supabase, Architecture, Backlog, Plan, SOW... |
| **GRAND TOTAL (66 items)** | **363 SP** | **Complete project development baseline** |

### 3.3. Empirical Time Calibration & Base Effort
The conversion rate from Story Points to labor hours is derived from 4 benchmark items that the team directly implemented and calibrated:
- `TASK-TECH-01` (Backend setup): 5 SP, 2–3 hours (midpoint = 2.5 hours) → 0.50 h/SP
- `TASK-TECH-02` (Frontend setup): 5 SP, 2–3 hours (midpoint = 2.5 hours) → 0.50 h/SP
- `US-AUTH-01` (Landlord registration): 3 SP, 1–2 hours (midpoint = 1.5 hours) → 0.50 h/SP
- `US-AUTH-02` (JWT & refresh login): 5 SP, 4–5 hours (midpoint = 4.5 hours) → 0.90 h/SP

Using a through-origin linear least-squares fit:
- **Hours per SP** = Σ(SP_i × Hours_i) ÷ Σ(SP_i²) = 52.0 ÷ 84.0 ≈ **0.619 hour/SP** (~37 minutes/SP).
- **Part-time Person-Day Definition:** 1 person-day = **3.5 working hours** (student part-time standard).

**Calculation of Story Point Base Effort:**
- Total labor hours = 363 SP × 0.619 hour/SP = **224.7 hours**.
- **Base Effort (Method 1):** 224.7 hours ÷ 3.5 hours/day = **64.2 person-days**.

## 4. Method 2: Linear Regression Effort Estimation

### 4.1. Historical Dataset & Productivity Normalization
The regression model utilizes historical effort data from 5 completed student projects. Each raw effort figure (E_i) is adjusted by a Comparability Factor (k_i) to normalize for technology, experience, and the modern AI coding assistants utilized by RoSi-Home:

| Historical Project | Tasks (x_i) | Team Size | Raw Effort (E_i) | Comparability Factor (k_i) | Adjusted Effort (y_i) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **FilmForum** | 24 | 5 | 77 person-days | 0.55 | 42.35 person-days |
| **Auctiz** | 27 | 5 | 69 person-days | 0.70 | 48.30 person-days |
| **BidWise** | 29 | 4 | 68 person-days | 0.70 | 47.60 person-days |
| **Domini Shop** | 33 | 5 | 50 person-days | 0.90 | 45.00 person-days |
| **Java Chatbox** | 54 | 2 | 70 person-days | 0.75 | 52.50 person-days |
| **Total / Mean** | **x̄ = 33.4** | — | — | — | **ȳ = 47.15** |

### 4.2. Fitted Linear Regression Model: ŷ = a + bx
- **Sample size (n):** 5 projects
- **Slope (b):** b = Σ[(x_i − x̄)(y_i − ȳ)] ÷ Σ[(x_i − x̄)²] = 146.85 ÷ 573.20 ≈ **0.2562 person-day/task**.
- **Intercept (a):** a = ȳ − bx̄ = 47.15 − (0.256193 × 33.4) ≈ **38.593 person-days**.

Fitted regression equation:
`ŷ = 38.593 + 0.2562x`

### 4.3. Effort Prediction for RoSi-Home
Substituting the RoSi-Home trackable backlog size (x = 66 items):
- `ŷ_RoSi-Home = 38.593 + (0.2562 × 66) = 38.593 + 16.909 = 55.5 person-days`.
- **Base Effort (Method 2):** **55.5 person-days**.

## 5. Method Comparison & Baseline Selection

Comparison of base estimates before risk adjustment:

| Estimation Method | Base Effort | Basis of Calculation |
| :--- | :---: | :--- |
| **1. Story Points & Planning Poker** | **64.2 person-days** | Derived from 66 actual backlog items and internal empirical time calibration. |
| **2. Linear Regression Model** | **55.5 person-days** | Derived from statistical line fit across 5 normalized historical projects. |
| **Variance** | **8.7 person-days** | Story Point estimate is 15.7% higher than linear regression. |

### Baseline Decision:
The development team selects the **64.2 person-days (Story Point method)** as the official **Base Effort** because:
1. It directly reflects the concrete requirements and complexity of the 51 RoSi-Home User Stories.
2. The conversion rate is calibrated from modules directly implemented by the 5 team members.
3. It provides a prudent, conservative baseline (higher than the historical regression result).

## 6. Risk Adjustment & Schedule Commitment

### 6.1. Final Risk Adjustment (Risk Factor = 2.0)
To safeguard against delivery uncertainties (parallel documentation authoring, exam periods, VietQR third-party formatting, and complex progressive utility calculations), a single **Risk Factor (RF = 2.0)** is applied to the selected Base Effort:

- **Final Committed Effort** = 64.2 person-days × 2.0 = **128.4 person-days** (~450 labor hours).

### 6.2. Team Calendar Duration
Dividing the total committed effort across the **5 team members** working concurrently:

- **Team Calendar Working Days** = 128.4 person-days ÷ 5 members = 25.68 ≈ **26 working days**.

### 6.3. Conclusion & Baseline Commitment
- **Total Project Effort:** **128.4 person-days** (~450 hours of student labor).
- **Planned Team Duration:** **26 working days** (equivalent to **5.2 to 6 execution weeks**).
- **Semester Schedule Alignment:** Perfectly matches the **Weeks 5–10 (6 Execution Weeks)** window committed in the Software Project Plan and Statement of Work.
