# Software Project Estimation Document

## 1. Introduction

### 1.1 Purpose

This document estimates the RosiHome Property Management System using two complementary methods:

1. Expert Judgment and Planning Poker, with Story Points converted to part-time person-days.
2. Regression based on comparable completed projects and the current backlog-item count.

The estimation baseline is aligned with `docs/product_backlog_2.0.md`.

### 1.2 Project Overview

- **Project:** RosiHome — Property Management Platform for Self-Managing Landlords.
- **Technology stack:** React Native/Expo, Node.js/Express, PostgreSQL, Drizzle ORM, JWT, Supabase Storage, VietQR, and GitHub Actions.
- **Product scope:** 5 Epics, 15 Features, and 51 User Stories.
- **Supporting scope:** 6 technical/project tasks and 9 documentation tasks.
- **Total trackable backlog:** 66 items.
- **Team size:** 5 part-time members, approximately 3–4 hours per person per working day.
- **AI support:** All team members use modern coding agents; these agents are materially stronger than the chat-only AI used in most historical projects.

### 1.3 Scope

#### 1.3.1 In Scope

- All 51 product User Stories in Product Backlog 2.0.
- All 6 technical/project tasks.
- All 9 documentation tasks.
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

Story Points and regression are not interchangeable. Story Points represent the relative size of the current backlog, while regression uses the count-based unit available in the historical dataset: trackable backlog items.

### 2.2 Assumptions

- Product Backlog 2.0 is the current scope baseline: 51 User Stories plus 15 supporting tasks, or 66 items in total.
- Story Points use Fibonacci values: 1, 2, 3, 5, 8, and 13.
- The project is treated as 0% complete; no completed-work data is used.
- One person-day in this document means one member working one part-time day of approximately 3.5 hours.
- The SP-to-time conversion is calibrated from the team's known setup and authentication effort rather than assigned directly.
- Calendar working days are calculated by dividing total person-days by five team members.
- The regression estimate assumes normal work without sustained overtime.
- Historical task granularity is sufficiently comparable after qualitative productivity normalization.
- Modern coding agents reduce repetitive implementation effort but do not eliminate review, integration, testing, documentation, and coordination work.
- No risk factor is applied before the two base estimates are compared.
- The selected baseline uses a 2.0 final risk factor after the two methods are compared.

### 2.3 Estimation Metrics

#### 2.3.1 Story Point

A Story Point is a relative measure of complexity, workload, technical risk, dependencies, and uncertainty. The same scale is also applied to supporting tasks so the complete 66-item backlog has one consistent relative-size baseline.

#### 2.3.2 Part-Time Person-Day Effort

One person-day equals one 3.5-hour working day by one member. It is already a part-time unit, so it is not converted through an 8-hour workday.

```text
Team calendar working days = total person-days ÷ 5 members
```

#### 2.3.3 Risk Factor

The risk factor is applied once, only after both methods are compared and one base estimate is selected. The final factor is 2.0, covering the uncertainty from unfamiliar documentation work, VietQR and integration behavior, and the limited historical regression sample despite the team's capable AI agents and familiarity with most CRUD flows.

#### 2.3.4 Regression

Regression estimates total effort from historical project size using the simple linear-regression form presented in the course material:

```text
ŷ = a + bx

where:
x = number of backlog items/tasks
ŷ = predicted adjusted effort in person-days
a = intercept
b = slope in person-days per additional backlog item
```

---

## 3. Story Point Estimation

### 3.1 Expert Judgment

Initial SP is assigned from the Product Backlog 2.0 acceptance criteria using the existing rules:

- business-logic and validation complexity;
- technical and security risk;
- dependencies and cross-module coupling;
- implementation, testing, review, and documentation workload;
- team familiarity and uncertainty.

Supporting tasks receive Initial SP through Expert Judgment. User Stories discussed in Planning Poker use the recorded consensus as Final SP; all other items retain the Expert Judgment value.

### 3.2 Planning Poker

Planning Poker refines selected product User Stories. Supporting technical, project-management, and documentation tasks are not included in this historical Planning Poker round.

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

| Backlog Item | Description | Initial SP | Initial SP (Hưng) | Initial SP (Đạt) | Final SP |
|---|---|---:|---:|---:|---:|
| | **Technical and Project Tasks** | | | | |
| TASK-TECH-01 | Set up backend infrastructure | 5 | 5 | 5 | 5 |
| TASK-TECH-02 | Set up frontend/mobile infrastructure | 5 | 5 | 5 | 5 |
| TASK-TECH-03 | Set up quality tooling | 8 | 8 | 8 | 8 |
| TASK-TECH-04 | Set up continuous integration | 3 | 3 | 3 | 3 |
| TASK-TECH-05 | Set up continuous deployment to Render | 3 | 3 | 3 | 3 |
| TASK-PM-01 | Manage the team's Trello board | 5 | 5 | 5 | 5 |
| | **Technical/Project Task Subtotal (6 items)** | **29** | **29** | **29** | **29** |
| | **Documentation Tasks** | | | | |
| TASK-DOC-01 | Write the Technical Architecture document | 8 | 8 | 8 | 8 |
| TASK-DOC-03 | Write Product Backlog Version 1 | 13 | 13 | 13 | 13 |
| TASK-DOC-05 | Write Product Backlog 2.0 | 13 | 13 | 13 | 13 |
| TASK-DOC-07 | Write the Project Charter | 8 | 8 | 8 | 8 |
| TASK-DOC-09 | Write the Software Project Estimation document | 13 | 13 | 13 | 13 |
| TASK-DOC-11 | Write the Project Proposal | 8 | 8 | 8 | 8 |
| TASK-DOC-13 | Write the Statement of Work | 8 | 8 | 8 | 8 |
| TASK-DOC-15 | Write the Vision and Scope document | 8 | 8 | 8 | 8 |
| TASK-DOC-17 | Write the Risk Management Plan | 8 | 8 | 8 | 8 |
| | **Documentation Task Subtotal (9 items)** | **87** | **87** | **87** | **87** |
| | **EPIC 1: Infrastructure and User Management** | | | | |
| US-AUTH-01 | Register a landlord account | 3 | 3 | 3 | 3 |
| US-AUTH-02 | Log in | 5 | 5 | 5 | 5 |
| US-AUTH-03 | Log out | 1 | 2 | 3 | 3 |
| US-AUTH-04 | Enforce role and data ownership | 5 | 5 | 5 | 5 |
| US-AUTH-05 | Change password | 3 | 3 | 3 | 3 |
| US-PROFILE-01 | View and update a user profile | 2 | 2 | 2 | 2 |
| US-AUTH-06 | Recover a forgotten password | 5 | 5 | 5 | 5 |
| | **EPIC 2: Portfolio and Property Setup** | | | | |
| US-PROPERTY-01 | Create a property | 3 | 3 | 3 | 3 |
| US-PROPERTY-02 | View and update owned properties | 2 | 2 | 2 | 2 |
| US-ROOM-01 | Add a room to a property | 3 | 3 | 3 | 3 |
| US-ROOM-02 | View and update room information | 2 | 2 | 2 | 2 |
| US-ROOM-03 | Add multiple rooms to a property | 5 | 5 | 5 | 5 |
| US-TENANT-01 | View and update tenant information | 3 | 5 | 3 | 3 |
| US-TENANT-02 | Provision a tenant account from a lease | 8 | 8 | 8 | 13 |
| US-UTILITY-01 | Configure utility rates | 5 | 3 | 3 | 2 |
| US-UTILITY-02 | View and update utility rates | 3 | 3 | 3 | 3 |
| US-CHARGE-01 | Configure recurring property surcharges | 5 | 3 | 5 | 3 |
| | **EPIC 3: Automated Monthly Billing and Payment** | | | | |
| US-METER-01 | Record an initial meter reading | 3 | 1 | 2 | 1 |
| US-METER-02 | Record monthly readings and calculate consumption | 13 | 13 | 13 | 13 |
| US-METER-03 | Correct a reading used for billing | 5 | 3 | 3 | 3 |
| US-INVOICE-01 | Generate a monthly invoice | 13 | 13 | 13 | 13 |
| US-INVOICE-02 | View an invoice | 3 | 3 | 3 | 3 |
| US-INVOICE-03 | Download an invoice document | 5 | 5 | 5 | 5 |
| US-INVOICE-04 | Review and send a draft invoice | 5 | 5 | 5 | 5 |
| US-VIETQR-01 | Configure landlord payment details | 3 | 3 | 3 | 3 |
| US-VIETQR-02 | Generate and display an invoice VietQR code | 13 | 13 | 13 | 13 |
| US-PAYMENT-01 | Upload payment proof | 5 | 5 | 5 | 5 |
| US-PAYMENT-02 | Verify payment manually | 3 | 3 | 3 | 3 |
| US-PAYMENT-03 | View payment history and outstanding balances | 5 | 5 | 5 | 5 |
| US-REMINDER-01 | Receive an automatic overdue-payment reminder | 5 | 5 | 8 | 8 |
| US-REMINDER-02 | Send a manual payment reminder | 3 | 8 | 3 | 5 |
| | **EPIC 4: Lease Management and Maintenance Tracking** | | | | |
| US-LEASE-01 | Create a digital lease | 5 | 5 | 5 | 5 |
| US-LEASE-02 | View lease information | 2 | 2 | 2 | 2 |
| US-LEASE-03 | Update or renew a lease | 5 | 3 | 5 | 5 |
| US-LEASE-04 | End a lease and release a room | 3 | 3 | 3 | 3 |
| US-LEASE-05 | Receive a lease-expiration reminder | 8 | 5 | 5 | 5 |
| US-LEASE-06 | View upcoming lease expirations | 3 | 3 | 3 | 3 |
| US-MAINT-01 | Submit a maintenance request | 5 | 5 | 5 | 5 |
| US-MAINT-02 | View submitted maintenance requests | 2 | 2 | 2 | 2 |
| US-MAINT-03 | Review maintenance requests | 3 | 2 | 2 | 2 |
| US-MAINT-04 | Update maintenance status | 3 | 2 | 3 | 2 |
| US-MAINT-05 | View maintenance history by room | 3 | 3 | 3 | 3 |
| | **EPIC 5: Portfolio Performance Monitoring** | | | | |
| US-DASH-01 | View occupied room count | 3 | 3 | 3 | 3 |
| US-DASH-02 | View monthly revenue summary | 5 | 5 | 5 | 5 |
| US-DASH-03 | View outstanding and overdue invoices | 5 | 5 | 5 | 5 |
| US-DASH-04 | View upcoming lease expirations on the dashboard | 3 | 3 | 3 | 3 |
| US-REPORT-01 | Select a reporting period and generate a report | 5 | 13 | 8 | 13 |
| US-REPORT-02 | Analyze financial performance and debt | 8 | 8 | 13 | 13 |
| US-REPORT-03 | Analyze occupancy, churn, and lease expirations | 8 | 8 | 8 | 8 |
| US-REPORT-04 | Analyze maintenance efficiency | 5 | 5 | 8 | 5 |
| US-REPORT-05 | Export a business report as PDF | 5 | 5 | 5 | 5 |
| | **Product User Story Subtotal (51 items)** | **236** | **237** | **243** | **247** |
| | **Grand Total (66 items)** | **352** | **353** | **359** | **363** |

---

## 4. Story-Point-Based Effort Estimation

### 4.1 Base Effort

Because the project is treated as not started, the SP-to-time conversion is inferred from work the team already understands well. Each time range is represented by its midpoint:

| Calibration Item | Final SP | Known Time | Midpoint | Hours/SP |
|---|---:|---:|---:|---:|
| TASK-TECH-01 — Backend setup | 5 | 2–3 hours | 2.5 hours | 0.50 |
| TASK-TECH-02 — Frontend setup | 5 | 2–3 hours | 2.5 hours | 0.50 |
| US-AUTH-01 — Registration | 3 | 1–2 hours | 1.5 hours | 0.50 |
| US-AUTH-02 — Login with JWT, access token, and refresh token | 5 | 4–5 hours | 4.5 hours | 0.90 |

A through-origin fit is used so that zero SP corresponds to zero implementation time:

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

No risk factor is applied in this section. The 64.2-person-day result is carried unchanged into the method comparison in Section 6.

---

## 5. Regression-Based Total Effort Estimation

### 5.1 Historical Dataset and Context Normalization

The supplied historical effort is measured in person-days. Each value is multiplied by a comparability factor to express the corresponding effort under RosiHome's stronger experience and Agent-assisted workflow.

| Project | Tasks | Members | Raw Effort (person-days) | RosiHome Comparability Factor | Adjusted Effort (person-days) |
|---|---:|---:|---:|---:|---:|
| FilmForum | 24 | 5 | 77 | 0.55 | 42.35 |
| Auctiz | 27 | 5 | 69 | 0.70 | 48.30 |
| BidWise | 29 | 4 | 68 | 0.70 | 47.60 |
| Domini Shop | 33 | 5 | 50 | 0.90 | 45.00 |
| Java Chatbox | 54 | 2 | 70 | 0.75 | 52.50 |

Factor rationale:

- **FilmForum — 0.55:** the team had almost no software-development experience, had never built a web/app system, and used a much weaker chat-only AI approximately 1.5 years earlier.
- **Auctiz and BidWise — 0.70:** the team knew only basic backend, frontend, database, and security concepts and still used chat-only AI approximately one year earlier.
- **Domini Shop — 0.90:** this is the closest reference because the team used coding agents and did not rely on overtime; only a modest reduction is applied because RosiHome's agents are stronger.
- **Java Chatbox — 0.75:** Java increased implementation complexity and the project used chat-only AI. Its two-member team also relied on substantial overtime, which can compress elapsed duration and partially hide sustainable effort; therefore, its factor is not reduced as aggressively as FilmForum's.

These factors are judgment-based calibration coefficients. They make the historical projects more comparable, but they are not measured causal productivity ratios.

### 5.2 Linear Regression Model

The course model `ŷ = a + bx` is used, with one independent variable:

- `xᵢ`: number of tasks in historical project `i`;
- `yᵢ`: adjusted effort of historical project `i`;
- `ŷ`: effort predicted by the fitted regression line.

Members is not included as a second independent variable because the dataset has only five observations and member count is confounded with technology, experience, overtime, and AI capability. Members is used only after estimation to convert total person-days into team working days.

#### Step 1 — Calculate adjusted effort for every historical project

For project `i`:

```text
yᵢ = Eᵢ × kᵢ

where:
Eᵢ = raw historical effort in person-days
kᵢ = RosiHome comparability factor from Section 5.1
yᵢ = adjusted effort used as the regression dependent variable
```

Substituting each project's values:

```text
FilmForum:    y₁ = 77 × 0.55 = 42.35 person-days
Auctiz:       y₂ = 69 × 0.70 = 48.30 person-days
BidWise:      y₃ = 68 × 0.70 = 47.60 person-days
Domini Shop:  y₄ = 50 × 0.90 = 45.00 person-days
Java Chatbox: y₅ = 70 × 0.75 = 52.50 person-days
```

#### Step 2 — Calculate the sample means

```text
n = 5

Σxᵢ = 24 + 27 + 29 + 33 + 54 = 167
x̄ = Σxᵢ ÷ n = 167 ÷ 5 = 33.4 tasks

Σyᵢ = 42.35 + 48.30 + 47.60 + 45.00 + 52.50 = 235.75
ȳ = Σyᵢ ÷ n = 235.75 ÷ 5 = 47.15 person-days
```

#### Step 3 — Calculate the slope `b`

The simple linear-regression slope is:

```text
b = Σ[(xᵢ − x̄)(yᵢ − ȳ)] ÷ Σ[(xᵢ − x̄)²]
```

Every component is calculated below:

| Project | xᵢ | yᵢ | xᵢ − x̄ | yᵢ − ȳ | (xᵢ − x̄)(yᵢ − ȳ) | (xᵢ − x̄)² |
|---|---:|---:|---:|---:|---:|---:|
| FilmForum | 24 | 42.35 | -9.4 | -4.80 | 45.12 | 88.36 |
| Auctiz | 27 | 48.30 | -6.4 | 1.15 | -7.36 | 40.96 |
| BidWise | 29 | 47.60 | -4.4 | 0.45 | -1.98 | 19.36 |
| Domini Shop | 33 | 45.00 | -0.4 | -2.15 | 0.86 | 0.16 |
| Java Chatbox | 54 | 52.50 | 20.6 | 5.35 | 110.21 | 424.36 |
| **Total** | | | **0** | **0** | **146.85** | **573.20** |

Substitute the two totals:

```text
b = 146.85 ÷ 573.20
  = 0.256193...
  ≈ 0.2562 person-day per additional task
```

#### Step 4 — Calculate the intercept `a`

```text
a = ȳ − bx̄
  = 47.15 − (0.256193 × 33.4)
  = 47.15 − 8.556856
  = 38.593144
  ≈ 38.593 person-days
```

#### Step 5 — Write the fitted regression line

```text
ŷ = a + bx
ŷ = 38.593 + 0.2562x
```

The intercept represents the fitted baseline project effort, while the slope adds approximately 0.2562 person-day for each additional backlog item within the model.

#### Step 6 — Substitute the RosiHome backlog size

RosiHome contains 66 trackable items:

```text
ŷ_RosiHome = 38.593 + (0.2562 × 66)
           = 38.593 + 16.9092
           = 55.5022
           ≈ 55.5 person-days
```

The regression base result carried into Section 6 is therefore **55.5 person-days**, before any risk factor.

#### Model fit

The coefficient of determination is included as a descriptive check:

```text
SSE = 20.188
SST = 57.810
R² = 1 − (SSE ÷ SST)
   = 1 − (20.188 ÷ 57.810)
   = 0.651
```

With only five historical observations, this fit is useful for estimation and visualization but remains too limited for a high-confidence prediction.
### 5.3 RosiHome Regression Result

```text
RosiHome backlog size = 66 items
Fitted line: ŷ = 38.593 + 0.2562x

Regression point estimate = 38.593 + (0.2562 × 66)
                          = 55.5022
                          ≈ 55.5 person-days
```

| Result | Value |
|---|---:|
| **Base effort for comparison** | **55.5 person-days** |

No risk factor is applied in this section. The 55.5-person-day result is carried unchanged into the method comparison in Section 6.

#### Scatter Plot and Fitted-Line Data

The following values can be copied directly into a spreadsheet or charting tool:

| Project | x: Tasks | Actual y: Adjusted Effort | Fitted ŷ = 38.593 + 0.2562x |
|---|---:|---:|---:|
| FilmForum | 24 | 42.35 | 44.74 |
| Auctiz | 27 | 48.30 | 45.51 |
| BidWise | 29 | 47.60 | 46.02 |
| Domini Shop | 33 | 45.00 | 47.05 |
| Java Chatbox | 54 | 52.50 | 52.43 |
| **RosiHome prediction** | **66** | — | **55.50** |

![[chart.png]]

### 5.4 Interpretation and Recalibration

- The regression estimates the complete 66-item backlog from historical project counts.
- The 55.5-person-day result represents normalized historical productivity before any risk factor.
- The five historical observations are insufficient for a stable prediction and differ in technology, experience, AI support, team size, and overtime behavior.
- The model does not assume overtime. Overtime may shorten calendar duration temporarily but does not remove total work and can increase rework risk.

---

## 6. Final Estimation Summary

### 6.1 Base Method Comparison

No risk factor is included in this comparison.

| Method | Base Effort | Evidence |
|---|---:|---|
| Story Points + Expert Judgment | **64.2 person-days** | Current 66-item backlog and time-calibrated SP |
| Linear regression | **55.5 person-days** | Fitted line from five normalized historical projects |
| Difference | **8.7 person-days** | The SP result is 15.7% higher than regression |

### 6.2 Final Baseline Selection

The **64.2-person-day Story Point result** is selected as the final base estimate because:

- it is derived from the current RosiHome backlog rather than only task counts;
- the SP-to-time rate is calibrated from backend setup, frontend setup, registration, and token-based login work familiar to the team;
- the regression sample contains only five heterogeneous projects and is retained as an independent reasonableness check;
- the selected SP result is also the higher of the two unadjusted estimates.

No factor has been applied to either method before this selection.

### 6.3 Final Risk Adjustment

After selecting 64.2 person-days, one 2.0 risk factor is applied.

Factors that limit risk:

- all members use capable AI coding agents;
- most RosiHome functions are CRUD flows or familiar authentication, billing, and reporting patterns.

Risks covered by the factor:

- implementation and project documentation must be produced in parallel;
- the team is less familiar with formal software-project documentation;
- VietQR and some notification/integration behavior are less familiar than ordinary CRUD work.

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

The methods are compared before risk adjustment: Story Points estimate 64.2 person-days and linear regression estimates 55.5 person-days. The project-specific and higher Story Point result is selected, then multiplied once by 2.0. The final RosiHome estimate is therefore **128.4 part-time person-days**, equivalent to approximately **26 working days** for five members.

---

## Appendix

### A. Feature Mapping

| Epic | Feature | User Stories |
|---|---|---|
| EPIC 1 | F-01: User Registration, Authentication, and Profile | US-AUTH-01→06, US-PROFILE-01 (7) |
| EPIC 2 | F-02: Property and Room Management | US-PROPERTY-01→02, US-ROOM-01→03 (5) |
| EPIC 2 | F-03: Tenant Information and Account Management | US-TENANT-01→02 (2) |
| EPIC 2 | F-04: Utility Pricing and Property Surcharges | US-UTILITY-01→02, US-CHARGE-01 (3) |
| EPIC 3 | F-05: Utility Meter Reading and Calculation | US-METER-01→03 (3) |
| EPIC 3 | F-06: Billing and Invoice Generation | US-INVOICE-01→04 (4) |
| EPIC 3 | F-07: VietQR Payment Integration | US-VIETQR-01→02 (2) |
| EPIC 3 | F-08: Payment Verification and Tracking | US-PAYMENT-01→03 (3) |
| EPIC 3 | F-09: Rent Payment Reminders | US-REMINDER-01→02 (2) |
| EPIC 4 | F-10: Digital Lease Tracking | US-LEASE-01→04 (4) |
| EPIC 4 | F-11: Automated Lease Renewal Reminders | US-LEASE-05→06 (2) |
| EPIC 4 | F-12: Maintenance Request Submission | US-MAINT-01→02 (2) |
| EPIC 4 | F-13: Maintenance Status Tracking | US-MAINT-03→05 (3) |
| EPIC 5 | F-14: Centralized Business Dashboard | US-DASH-01→04 (4) |
| EPIC 5 | F-15: Monthly Business Report and Analytics | US-REPORT-01→05 (5) |

### B. Linear Regression Calculation Details

| Project | xᵢ | yᵢ | xᵢ − x̄ | yᵢ − ȳ | Product | Squared x deviation | Fitted ŷ |
|---|---:|---:|---:|---:|---:|---:|---:|
| FilmForum | 24 | 42.35 | -9.4 | -4.80 | 45.12 | 88.36 | 44.74 |
| Auctiz | 27 | 48.30 | -6.4 | 1.15 | -7.36 | 40.96 | 45.51 |
| BidWise | 29 | 47.60 | -4.4 | 0.45 | -1.98 | 19.36 | 46.02 |
| Domini Shop | 33 | 45.00 | -0.4 | -2.15 | 0.86 | 0.16 | 47.05 |
| Java Chatbox | 54 | 52.50 | 20.6 | 5.35 | 110.21 | 424.36 | 52.43 |
| **Total / Mean** | **x̄ = 33.4** | **ȳ = 47.15** | **0** | **0** | **146.85** | **573.20** | |

```text
b = 146.85 ÷ 573.20 = 0.256193
a = 47.15 − (0.256193 × 33.4) = 38.593144

Fitted line:
ŷ = 38.593 + 0.2562x

RosiHome:
ŷ = 38.593 + (0.2562 × 66)
  = 55.5022
  ≈ 55.5 person-days
```
