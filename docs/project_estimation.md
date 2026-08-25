# Software Project Estimation Document
## 1. Introduction
### 1.1 Purpose
This document estimates the RosiHome Property Management System with two methods:

1. Expert Judgment and Planning Poker, converting Story Points to part-time person-days.
2. Regression from comparable completed projects and the current backlog-item count.

The baseline is `docs/product_backlog_2.0.md`.
### 1.2 Project Overview
- **Project:** RosiHome — Property Management Platform for Self-Managing Landlords.
- **Technology stack:** React Native/Expo, Node.js/Express, PostgreSQL, Drizzle ORM, JWT, Supabase Storage, VietQR, and GitHub Actions.
- **Product scope:** 5 Epics, 15 Features, and 51 User Stories.
- **Supporting scope:** 6 technical/project tasks and 9 documentation tasks.
- **Total trackable backlog:** 66 items.
- **Team size:** 5 part-time members, approximately 3–4 hours per person per working day.
- **AI support:** All members use modern coding agents, stronger than the chat-only AI used in historical projects.
### 1.3 Scope
#### 1.3.1 In Scope
- All 51 product User Stories in Product Backlog 2.0, all 6 technical/project tasks, and all 9 documentation tasks.
- Backend, mobile frontend, testing, integration, project management, and required course documentation.
#### 1.3.2 Out of Scope
- AI-powered product analytics beyond the MVP.
- Payment-gateway integration and automatic bank reconciliation.
- Electronic signatures and IoT smart-meter integration.
- Multi-landlord collaboration and advanced accounting/tax reporting.
---
## 2. Estimation Methodology
### 2.1 Overall Estimation Process
```text
Product Backlog 2.0 (66 items)
        ├── Expert Judgment + Planning Poker
        │       └── Base effort from calibrated hours/SP
        │
Historical completed projects
        └── Context normalization + regression
                └── Base regression effort

Compare both base results
        └── Select the final baseline
                └── Apply one risk factor
```
Story Points measure relative backlog size; regression uses the historical count unit: trackable backlog items.
### 2.2 Assumptions
- Product Backlog 2.0 is the scope baseline: 51 User Stories plus 15 supporting tasks, or 66 items.
- Story Points use Fibonacci values: 1, 2, 3, 5, 8, and 13.
- The project is treated as 0% complete; no completed-work data is used.
- One person-day means one member working approximately 3.5 hours.
- Calendar working days equal total person-days divided by five team members.
- The level of task detail in historical data remains comparable after accounting for productivity differences.
- Coding agents reduce repetitive implementation effort but do not remove review, integration, testing, documentation, or coordination work.
- No risk factor is applied before the two base estimates are compared.
- The selected baseline uses a 2.0 final risk factor after the two methods are compared.

---
## 3. Story Point Estimation
### 3.1 Expert Judgment
Initial SP comes from the Product Backlog 2.0 acceptance criteria. It considers:
- business logic and validation;
- technical and security risk;
- dependencies and cross-module coupling;
- team familiarity and uncertainty.

Supporting tasks also use Expert Judgment. Planning Poker stories use the recorded consensus as Final SP; other items keep the Expert Judgment value.
### 3.2 Planning Poker
Planning Poker refines selected product User Stories. Supporting technical, project-management, and documentation tasks are excluded from this round.

| User Story | Chí | Minh | Đạt | Hưng | Quân | Consensus Final SP | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| US-AUTH-03 | 5 | 5 | 3 | 2 | 3 | 3 | Revoke refresh and access sessions safely. |
| US-ROOM-03 | 5 | 3 | 5 | 5 | 3 | 5 | Bulk creation requires duplicate detection and transaction rules. |
| US-TENANT-01 | 3 | 2 | 3 | 5 | 3 | 3 | Read/update flow with moderate validation and ownership checks. |
| US-TENANT-02 | 13 | 13 | 8 | 8 | 13 | 13 | Lease, tenant profile, account provisioning, locking, and email. |
| US-UTILITY-01 | 2 | 2 | 3 | 3 | 2 | 2 | Configuration creation with limited validation. |
| US-UTILITY-02 | 3 | 3 | 3 | 3 | 3 | 3 | Includes audit and effective-date history. |
| US-CHARGE-01 | 3 | 3 | 5 | 3 | 5 | 3 | CRUD plus validation and billing applicability. |
| US-METER-01 | 1 | 1 | 2 | 1 | 2 | 1 | Baseline creation with limited validation. |
| US-METER-02 | 13 | 8 | 13 | 13 | 8 | 13 | Complex regulated-rate and consumption logic. |
| US-METER-03 | 3 | 3 | 3 | 3 | 5 | 3 | Update, audit, and draft-invoice recalculation. |
| US-REMINDER-01 | 8 | 8 | 8 | 5 | 8 | 8 | Scheduled job and external push-notification dependency. |
| US-REMINDER-02 | 5 | 5 | 3 | 8 | 5 | 5 | Manual reminder with notification and duplicate control. |
| US-LEASE-03 | 5 | 3 | 5 | 3 | 5 | 5 | Update and renewal with historical traceability. |
| US-LEASE-05 | 5 | 5 | 5 | 5 | 5 | 5 | Scheduled multi-window push notifications. |
| US-MAINT-03 | 2 | 2 | 2 | 2 | 3 | 2 | Similar to viewing submitted maintenance requests. |
| US-MAINT-04 | 1 | 2 | 3 | 2 | 3 | 2 | Status transition, audit, and notification. |
| US-REPORT-01 | 13 | 8 | 8 | 13 | 13 | 13 | Period handling and broad aggregation requirements. |
| US-REPORT-02 | 13 | 13 | 13 | 8 | 13 | 13 | Complex financial analysis and reconciliation. |
| US-REPORT-04 | 5 | 5 | 8 | 5 | 8 | 5 | Moderate calculations for maintenance metrics. |
### 3.3 Backlog Item Story Point Result
| Backlog Item   | Description                                           | Initial SP (Chí) | Initial SP (Hưng) | Initial SP (Đạt) | Final SP |
| -------------- | ----------------------------------------------------- | ---------------: | ----------------: | ---------------: | -------: |
|                | **Technical and Project Tasks**                       |                  |                   |                  |          |
| TASK-TECH-01   | Set up backend infrastructure                         |                5 |                 5 |                3 |        5 |
| TASK-TECH-02   | Set up frontend/mobile infrastructure                 |                5 |                 5 |                8 |        5 |
| TASK-TECH-03   | Set up quality tooling                                |                8 |                 8 |                5 |        8 |
| TASK-TECH-04   | Set up continuous integration                         |                5 |                 3 |                3 |        3 |
| TASK-TECH-05   | Set up continuous deployment to Render                |                3 |                 3 |                3 |        3 |
| TASK-PM-01     | Manage the team's Trello board                        |                5 |                 5 |                5 |        5 |
|                | **Technical/Project Task Subtotal (6 items)**         |           **31** |            **29** |           **27** |   **29** |
|                | **Documentation Tasks**                               |                  |                   |                  |          |
| TASK-DOC-01    | Write the Technical Architecture document             |                8 |                 8 |                13 |        8 |
| TASK-DOC-03    | Write Product Backlog Version 1                       |               13 |                13 |               8 |       13 |
| TASK-DOC-05    | Write Product Backlog 2.0                             |               13 |                13 |               13 |       13 |
| TASK-DOC-07    | Write the Project Charter                             |               13 |                 8 |                8 |        8 |
| TASK-DOC-09    | Write the Software Project Estimation document        |               8 |                13 |               13 |       13 |
| TASK-DOC-11    | Write the Project Proposal                            |                8 |                 8 |                8 |        8 |
| TASK-DOC-13    | Write the Statement of Work                           |                8 |                 8 |                8 |        8 |
| TASK-DOC-15    | Write the Vision and Scope document                   |                8 |                 8 |                8 |        8 |
| TASK-DOC-17    | Write the Risk Management Plan                        |                8 |                 8 |                8 |        8 |
|                | **Documentation Task Subtotal (9 items)**             |           **87** |            **87** |           **87** |   **87** |
|                | **EPIC 1: Infrastructure and User Management**        |                  |                   |                  |          |
| US-AUTH-01     | Register a landlord account                           |                3 |                 2 |                3 |        3 |
| US-AUTH-02     | Log in                                                |                8 |                 5 |                5 |        5 |
| US-AUTH-03     | Log out                                               |                5 |                 1 |                3 |        3 |
| US-AUTH-04     | Enforce role and data ownership                       |                5 |                 8 |                5 |        5 |
| US-AUTH-05     | Change password                                       |                3 |                 5 |                3 |        3 |
| US-PROFILE-01  | View and update a user profile                        |                1 |                 2 |                2 |        2 |
| US-AUTH-06     | Recover a forgotten password                          |                3 |                 5 |                5 |        5 |
|                | **EPIC 2: Portfolio and Property Setup**              |                  |                   |                  |          |
| US-PROPERTY-01 | Create a property                                     |                5 |                 3 |                3 |        3 |
| US-PROPERTY-02 | View and update owned properties                      |                1 |                 2 |                 2 |        2 |
| US-ROOM-01     | Add a room to a property                              |                3 |                 2 |                3 |        3 |
| US-ROOM-02     | View and update room information                      |                2 |                 2 |                3 |        2 |
| US-ROOM-03     | Add multiple rooms to a property                      |                3 |                 5 |                5 |        5 |
| US-TENANT-01   | View and update tenant information                    |                5 |                 3 |                3 |        3 |
| US-TENANT-02   | Provision a tenant account from a lease               |                8 |                 13 |                13 |       13 |
| US-UTILITY-01  | Configure utility rates                               |                2 |                 2 |                1 |        2 |
| US-UTILITY-02  | View and update utility rates                         |                3 |                 2 |                3 |        3 |
| US-CHARGE-01   | Configure recurring property surcharges               |                3 |                 3 |                2 |        3 |
|                | **EPIC 3: Automated Monthly Billing and Payment**     |                  |                   |                  |          |
| US-METER-01    | Record an initial meter reading                       |                2 |                 1 |                1 |        1 |
| US-METER-02    | Record monthly readings and calculate consumption     |               13 |                8 |               13 |       13 |
| US-METER-03    | Correct a reading used for billing                    |                3 |                 5 |                3 |        3 |
| US-INVOICE-01  | Generate a monthly invoice                            |               13 |                13 |               13 |       13 |
| US-INVOICE-02  | View an invoice                                       |                3 |                 5 |                3 |        3 |
| US-INVOICE-03  | Download an invoice document                          |                5 |                 3 |                5 |        5 |
| US-INVOICE-04  | Review and send a draft invoice                       |                8 |                 5 |                5 |        5 |
| US-VIETQR-01   | Configure landlord payment details                    |                3 |                 3 |                3 |        3 |
| US-VIETQR-02   | Generate and display an invoice VietQR code           |               13 |                13 |               13 |       13 |
| US-PAYMENT-01  | Upload payment proof                                  |                3 |                 5 |                5 |        5 |
| US-PAYMENT-02  | Verify payment manually                               |                3 |                 3 |                5 |        3 |
| US-PAYMENT-03  | View payment history and outstanding balances         |                5 |                 5 |                5 |        5 |
| US-REMINDER-01 | Receive an automatic overdue-payment reminder         |                5 |                 8 |                8 |        8 |
| US-REMINDER-02 | Send a manual payment reminder                        |                8 |                 5 |                5 |        5 |
|                | **EPIC 4: Lease Management and Maintenance Tracking** |                  |                   |                  |          |
| US-LEASE-01    | Create a digital lease                                |                5 |                 8 |                5 |        5 |
| US-LEASE-02    | View lease information                                |                2 |                 2 |                3 |        2 |
| US-LEASE-03    | Update or renew a lease                               |                5 |                 3 |                5 |        5 |
| US-LEASE-04    | End a lease and release a room                        |                3 |                 3 |                3 |        3 |
| US-LEASE-05    | Receive a lease-expiration reminder                   |                5 |                 5 |                8 |        5 |
| US-LEASE-06    | View upcoming lease expirations                       |                3 |                 3 |                3 |        3 |
| US-MAINT-01    | Submit a maintenance request                          |                5 |                 5 |                3 |        5 |
| US-MAINT-02    | View submitted maintenance requests                   |                2 |                 2 |                2 |        2 |
| US-MAINT-03    | Review maintenance requests                           |                2 |                 2 |                1 |        2 |
| US-MAINT-04    | Update maintenance status                             |                2 |                 2 |                3 |        2 |
| US-MAINT-05    | View maintenance history by room                      |                3 |                 3 |                3 |        3 |
|                | **EPIC 5: Portfolio Performance Monitoring**          |                  |                   |                  |          |
| US-DASH-01     | View occupied room count                              |                3 |                 3 |                3 |        3 |
| US-DASH-02     | View monthly revenue summary                          |                5 |                 5 |                5 |        5 |
| US-DASH-03     | View outstanding and overdue invoices                 |                5 |                 5 |                5 |        5 |
| US-DASH-04     | View upcoming lease expirations on the dashboard      |                3 |                 3 |                2 |        3 |
| US-REPORT-01   | Select a reporting period and generate a report       |                13 |                13 |                5 |       13 |
| US-REPORT-02   | Analyze financial performance and debt                |                8 |                 13 |               13 |       13 |
| US-REPORT-03   | Analyze occupancy, churn, and lease expirations       |                8 |                 8 |                8 |        8 |
| US-REPORT-04   | Analyze maintenance efficiency                        |                5 |                 3 |                8 |        5 |
| US-REPORT-05   | Export a business report as PDF                       |                5 |                 5 |                5 |        5 |
|                | **Product User Story Subtotal (51 items)**            |          **242** |           **243** |          **244** |  **247** |
|                | **Grand Total (66 items)**                            |          **360** |           **359** |          **358** |  **363** |

---
## 4. Story-Point-Based Effort Estimation
### 4.1 Base Effort
Because the project is treated as not started, the SP-to-time conversion uses familiar work. Each time range uses its midpoint:

| Calibration Item | Final SP | Known Time | Midpoint | Hours/SP |
|---|---:|---:|---:|---:|
| TASK-TECH-01 — Backend setup | 5 | 2–3 hours | 2.5 hours | 0.50 |
| TASK-TECH-02 — Frontend setup | 5 | 2–3 hours | 2.5 hours | 0.50 |
| US-AUTH-01 — Registration | 3 | 1–2 hours | 1.5 hours | 0.50 |
| US-AUTH-02 — Login with JWT, access token, and refresh token | 5 | 4–5 hours | 4.5 hours | 0.90 |

A through-origin fit keeps zero SP at zero implementation time:

```text
Hours per SP = Σ(SP × midpoint hours) ÷ Σ(SP²)
             = 52 ÷ 84
             = 0.619 ≈ 0.62 hour/SP

Therefore:
1 SP ≈ 0.62 hour
3 SP ≈ 1.86 hours
5 SP ≈ 3.10 hours

Complete backlog Final SP = 363 SP
Base effort hours = 363 × (52 ÷ 84) = 224.7 hours
Base effort = 224.7 ÷ 3.5 = 64.20 ≈ 64.2 person-days
```
### 4.2 Base Method Result
| Result | Value |
|---|---:|
| Calibrated rate | 0.619 hour/SP |
| **Base effort for comparison** | **64.2 person-days** |

No risk factor is applied here; 64.2 person-days carries unchanged to Section 6.

---
## 5. Regression-Based Total Effort Estimation
### 5.1 Historical Data and Adjustment
Regression uses five completed projects to estimate the effort for RosiHome's 66-item backlog. Historical effort is measured in person-days, then adjusted with a comparability factor for RosiHome's stronger experience and agent-assisted workflow.

| Project | Tasks | Members | Raw Effort (person-days) | RosiHome Comparability Factor | Adjusted Effort (person-days) |
|---|---:|---:|---:|---:|---:|
| FilmForum | 24 | 5 | 77 | 0.55 | 42.35 |
| Auctiz | 27 | 5 | 69 | 0.70 | 48.30 |
| BidWise | 29 | 4 | 68 | 0.70 | 47.60 |
| Domini Shop | 33 | 5 | 50 | 0.90 | 45.00 |
| Java Chatbox | 54 | 2 | 70 | 0.75 | 52.50 |

Factor rationale:
- **FilmForum — 0.55:** little software experience, no web/app system, and much weaker chat-only AI approximately 1.5 years earlier.
- **Auctiz and BidWise — 0.70:** basic backend, frontend, database, and security knowledge with chat-only AI approximately one year earlier.
- **Domini Shop — 0.90:** closest reference; the team used coding agents without overtime, so only a modest reduction is applied because RosiHome's agents are stronger.
- **Java Chatbox — 0.75:** Java and chat-only AI increased complexity. Its two-member team used substantial overtime, so its factor is not reduced as aggressively as FilmForum's.
### 5.2 Linear Regression Model
The goal is to estimate total effort from backlog size. The model is `ŷ = a + bx`.
Here, 
- `x` and `xᵢ` are backlog-item counts
- `y` and `yᵢ` are adjusted historical effort
- `ŷ` is predicted effort. 
- `a` is the intercept, or fitted baseline effort when the item count is zero. 
- `b` is the slope, or added person-days for each additional backlog item.

The `x` and adjusted `y` values come directly from the Section 5.1 historical table; no further adjustment is made here.
First calculate the average historical project size and average adjusted effort.
```text
n = 5

Σxᵢ = 24 + 27 + 29 + 33 + 54 = 167
x̄ = Σxᵢ ÷ n = 167 ÷ 5 = 33.4 tasks

Σyᵢ = 42.35 + 48.30 + 47.60 + 45.00 + 52.50 = 235.75
ȳ = Σyᵢ ÷ n = 235.75 ÷ 5 = 47.15 person-days
```
The slope estimates the added effort for each extra backlog item. It uses each project's distance from the two averages:
```text
b = Σ[(xᵢ − x̄)(yᵢ − ȳ)] ÷ Σ[(xᵢ − x̄)²]
```
The components are:

| Project | xᵢ | yᵢ | xᵢ − x̄ | yᵢ − ȳ | (xᵢ − x̄)(yᵢ − ȳ) | (xᵢ − x̄)² |
|---|---:|---:|---:|---:|---:|---:|
| FilmForum | 24 | 42.35 | -9.4 | -4.80 | 45.12 | 88.36 |
| Auctiz | 27 | 48.30 | -6.4 | 1.15 | -7.36 | 40.96 |
| BidWise | 29 | 47.60 | -4.4 | 0.45 | -1.98 | 19.36 |
| Domini Shop | 33 | 45.00 | -0.4 | -2.15 | 0.86 | 0.16 |
| Java Chatbox | 54 | 52.50 | 20.6 | 5.35 | 110.21 | 424.36 |
| **Total** | | | **0** | **0** | **146.85** | **573.20** |
Using the two totals:
```text
b = 146.85 ÷ 573.20
  = 0.256193...
  ≈ 0.2562 person-day per additional task
```
The intercept is the fitted baseline effort when the item count is zero:
```text
a = ȳ − bx̄
  = 47.15 − (0.256193 × 33.4)
  = 47.15 − 8.556856
  = 38.593144
  ≈ 38.593 person-days
```
The fitted line combines the intercept and slope:
```text
ŷ = a + bx
ŷ = 38.593 + 0.2562x
```
RosiHome has 66 trackable items. Substitute 66 into the fitted line:
```text
ŷ_RosiHome = 38.593 + (0.2562 × 66)
           = 38.593 + 16.9092
           = 55.5022
           ≈ 55.5 person-days
```
The regression estimate is **55.5 person-days** before risk. In plain terms, normalized historical productivity suggests that the complete backlog needs about 55.5 part-time person-days.
#### Model fit
R² shows how closely the fitted line follows the historical results:
```text
SSE = 20.188
SST = 57.810
R² = 1 − (SSE ÷ SST)
   = 1 − (20.188 ÷ 57.810)
   = 0.651
```
R² = 0.651 means the model explains about 65.1% of the variation in adjusted historical effort. With only five projects, this is a rough reasonableness check rather than a high-confidence prediction.
The model assumes no sustained overtime. Overtime may shorten calendar duration, but it does not remove the work and may increase rework risk.
### 5.3 Regression Result and Fitted-Line Data
| Result | Value |
|---|---:|
| **Base effort for comparison** | **55.5 person-days** |
No risk factor is applied here; 55.5 person-days carries unchanged to Section 6.
#### Scatter Plot and Fitted-Line Data
These values can be copied into a spreadsheet or charting tool:

| Project | x: Tasks | Actual y: Adjusted Effort | Fitted ŷ = 38.593 + 0.2562x |
|---|---:|---:|---:|
| FilmForum | 24 | 42.35 | 44.74 |
| Auctiz | 27 | 48.30 | 45.51 |
| BidWise | 29 | 47.60 | 46.02 |
| Domini Shop | 33 | 45.00 | 47.05 |
| Java Chatbox | 54 | 52.50 | 52.43 |
| **RosiHome prediction** | **66** | — | **55.50** |

![[chart.png]]
## 6. Final Estimation Summary
### 6.1 Base Method Comparison
No risk factor is included here.

| Method                         |          Base Effort | Evidence                                             |
| ------------------------------ | -------------------: | ---------------------------------------------------- |
| Story Points + Expert Judgment | **64.2 person-days** | Current 66-item backlog and time-calibrated SP       |
| Linear regression              | **55.5 person-days** | Fitted line from five normalized historical projects |
| Difference                     |  **8.7 person-days** | The SP result is 15.7% higher than regression        |
### 6.2 Final Baseline Selection
The **64.2-person-day Story Point result** is selected because:

- it uses the current RosiHome backlog, not only task counts;
- its rate is calibrated from familiar backend/frontend setup, registration, and token-based login work;
- the regression sample has only five projects;
- effort days and number of tasks' records are not reliably accurate;
### 6.3 Final Risk Adjustment
After selecting 64.2 person-days, apply one 2.0 risk factor.

Factors that limit risk:
- capable AI coding agents;
- familiar CRUD, authentication, billing, and reporting patterns.

Risks covered by the factor:
- implementation and project documentation run in parallel;
- limited familiarity with formal software-project documentation;
- less familiar VietQR and notification/integration behavior.

```text
Selected base effort = 64.20 person-days
Final risk factor = 2.0
Final project effort = 64.20 × 2.0 = 128.40 ≈ 128.4 person-days
Team calendar duration = 128.40 ÷ 5 = 25.68 ≈ 26 working days
```

| Item | Final Value |
|---|---:|
| Total backlog items | 66 |
| Complete backlog Final SP | 363 SP |
| Selected base effort | 64.2 person-days |
| Final risk factor | 2.0 |
| **Final project effort** | **128.4 person-days** |
| **Planned team duration** | **26 working days** |
### 6.4 Conclusion
Before risk, Story Points estimate 64.2 person-days and regression estimates 55.5 person-days. Select the higher, project-specific Story Point result and multiply it once by 2.0. The final estimate is **128.4 part-time person-days**, or approximately **26 working days** for five members.
