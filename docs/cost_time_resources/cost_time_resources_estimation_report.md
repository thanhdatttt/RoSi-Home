# RosiHome Cost–Time–Resources Estimation Report

## 1. Document Control

| Attribute | Value |
|---|---|
| Version | 1.0 – Estimation Baseline |
| Date | 23 July 2026 |
| Estimation horizon | Remaining backend, complete MVP, and first pilot month |
| Scope baseline | 51 backend user stories plus frontend, integration, testing, deployment, and pilot work |
| Estimation method | Empirical Kanban forecasting calibrated with AI-assisted delivery data |
| Status | Project baseline; updated after each batch or material variance |

## 2. Executive Estimate

RosiHome should retain the target of **8–10 calendar weeks for the complete MVP**, supported by the following estimates:

- AI-assisted backend implementation is expected to finish substantially earlier than the complete product;
- remaining backend work is estimated at **9.8–19.5 measured/agent-clock hours** and **157.6–315.2 million tokens**;
- the backend Estimate at Completion (EAC) is approximately **58.2–67.9 proxy hours** and **407.5–565.1 million tokens**;
- the two frontend streams contain **19 module-level work packages** mapped to the same product stories and are estimated at **143–266 frontend hours**, with an expected value of **198 hours**;
- provisional frontend AI usage is estimated at **498–927 million tokens**, with an expected value of **690 million tokens**, pending replacement with actual FE telemetry;
- the complete MVP still requires frontend/mobile integration, human review, acceptance testing, infrastructure, deployment, and pilot stabilization;
- expected gross team capacity over nine weeks is approximately **787.5 team-hours**;
- the expected cash budget for the current backlog is approximately **VND 3.28 million**;
- the conservative cash envelope is approximately **VND 4.1 million**, subject to actual provider and infrastructure quotations.

These ranges support planning and are not guaranteed commitments. The estimate is updated after every batch using actual delivery data from CI/CD, deployment, effort logs, and AI usage.

## 3. Estimation Objectives

This report answers four planning questions:

1. How much time is likely required to finish the remaining backend work and the complete MVP?
2. What human, AI, and technical resources are required?
3. What cash and economic costs should be planned?
4. How will the estimate be monitored and updated during delivery?

Historical delivery figures are used only to calibrate rates. This document is an estimation baseline rather than a retrospective status report.

## 4. Estimation Scope

### 4.1 Backend Scope by Batch

| Batch | BE1 Chí | BE2 Đạt | BE3 Minh | Total US |
|---|---|---|---|---:|
| Batch 1 – Foundation | AUTH-01→06, PROFILE-01 | PROPERTY-01→02, ROOM-01→03 | UTILITY-01→02, CHARGE-01 | 15 |
| Batch 2 – Core | TENANT-01→02, LEASE-01→06 | METER-01→03 | MAINT-01→05 | 16 |
| Batch 3 – Billing/Payment | Review, testing, and bug fixing | INVOICE-01→04 | VIETQR-01→02, PAYMENT-01→03, REMINDER-01→02 | 11 |
| Batch 4 – Analytics | DASH-01→02 | DASH-03→04 | REPORT-01→05 | 9 |
| **Total** | **17** | **14** | **20** | **51** |

### 4.2 Frontend Scope by Batch

Frontend work implements the presentation and interaction layers for the same Product Backlog stories. It is therefore estimated as work packages and **is not added to the 51-product-story count**.

| Batch | FE1 MXH | FE2 Quân | Work Packages |
|---|---|---|---:|
| Batch 1 – Foundation UI | Auth, Profile, Property, and Room UI (4) | Design System, Navigation, Shared Components, and Utility UI (4) | 8 |
| Batch 2 – Core UI | Tenant and Lease UI (2) | Meter and Maintenance UI (2) | 4 |
| Batch 3 – Billing/Payment UI | Invoice and Payment UI (2) | VietQR, Upload Proof, and Notification UI (3) | 5 |
| Batch 4 – Analytics UI | Dashboard UI (1) | Report UI (1) | 2 |
| After Batch 3 | Property/Lease/Tenant integration | UI completion, testing, and bug fixing | Enabling work |
| **Total estimated packages** | **9** | **10** | **19** |

The estimate also includes non-story work required to deliver the MVP:

- frontend/mobile implementation;
- API integration and shared-contract alignment;
- infrastructure and database setup;
- automated and manual testing;
- security and authorization verification;
- CI/CD, deployment, and smoke testing;
- bug fixing, documentation, and pilot support.

Setup, review, and bug-fixing work consumes resources but is not counted as additional user-story throughput.

### 4.3 Dependency Model

```text
Batch 1: Auth + Property/Room + Billing configuration
                    ↓
Batch 2: Tenant/Lease + Meter + Maintenance
                    ↓
Batch 3: Invoice + Payment + Reminder
                    ↓
Batch 4: Dashboard + Report
                    ↓
Integration → Deployment → Pilot acceptance
```

Batches manage dependencies. User stories remain the product estimation and acceptance unit.

## 5. Estimation Method

### 5.1 Selected Approach

The project uses **Kanban with empirical flow-based forecasting** because AI-agent cycle times can be substantially shorter and less regular than a traditional two-week sprint.

The estimation process is:

1. split the backlog into independently testable user stories;
2. group dependent stories into ordered batches;
3. measure time, token usage, rework, and acceptance outcomes;
4. estimate remaining work using the rate of the most comparable member/model stream;
5. apply uncertainty factors for integration, review, and deployment;
6. update the Estimate at Completion after every batch.

### 5.2 Core Formulas

```text
Implementation rate
= Measured implementation time / Implemented stories

Token rate
= Measured tokens / Implemented stories

Remaining effort
= Remaining comparable stories × Implementation rate

Estimate at Completion
= Actual to Date + Estimate to Complete

Economic labor cost
= Human effort hours × Approved shadow hourly rate

Cash cost
= Subscriptions + Paid usage + Infrastructure
 + External services + Domain/Security + Contingency
```

### 5.3 Standardized Time Measures

The following measures represent different aspects of delivery and are reported separately:

| Measure | Definition | Use |
|---|---|---|
| Human effort | Total person-hours spent directly on analysis, prompting, review, testing, correction, integration, deployment, and documentation | Resource planning and economic labor cost |
| Agent-active time | Time during which an AI agent processes a task, including reasoning and tool execution when telemetry is available | AI workflow speed and capacity comparison |
| Cycle time | Calendar time from story start to deployment/acceptance, including queue and blocked time | Completion-date and throughput forecasting |
| Gross capacity | Total member hours available during a period | Verifying that the plan does not exceed available resources |

The 35-hour and 10-hour member declarations may include multiple activity types, whereas the BE3 measurement is agent-active time. They are therefore combined only as a **time proxy for order-of-magnitude planning** and must not be described as total human effort or used directly for payroll.

From this baseline onward, every member should use a common time log containing human effort, agent-active time when exposed by the tool, start timestamp, deployment/acceptance timestamp, and blocked time.

### 5.4 Confidence Rules

- `High`: telemetry, CI/CD, or invoice-backed measurement mapped clearly to a story;
- `Medium`: member-reported aggregate with clear scope and delivery outcome;
- `Low`: mixed work types, an unclear model identifier, or missing story-level measurement.

The team has confirmed that GitHub CI/CD is configured and that the backend user stories used for calibration were deployed successfully. The **backend delivery baseline** therefore has medium-to-high confidence. The **combined time estimate** has medium confidence because the source time logs do not separate human effort, agent-active time, and cycle time. The frontend estimate has low confidence because FE1 and FE2 do not yet have actual telemetry or effort logs.

## 6. Calibration Data

### 6.1 Observed Inputs

| Stream | Calibration Scope | Stories | Time Basis | Tokens | Model/Access | Confidence |
|---|---|---:|---:|---:|---|---|
| BE1 | Batch 1 + Batch 2 plus setup/testing/FE/docs overhead | 15 | 35 member-reported hours | 135.0M | `Hy3`, free | Medium |
| BE2 | Batch 1, Batch 2+3, and Batch 4 | 14 | 10 member-reported hours | 21.8M | `Hy3`, free | Medium |
| BE3 | Billing Foundation | 3 | 1h01 agent-active | 36.5M | GPT-5.6 Sol, Plus/trial | Medium |
| BE3 | MAINT-01→05 | 5 | 2h22m50 agent-active | 56.564626M | GPT-5.6 Sol, Plus/trial | High for usage; medium for story split |

The `Hy3` label is retained exactly as reported. The provider, exact model ID, and product surface must be confirmed before a formal model comparison.

All backend stories in the calibration dataset were deployed successfully through the team's CI/CD process. The resulting rates therefore reflect delivered backend work rather than code generation alone.

### 6.2 Applied Rates

| Stream | Time/Story | Tokens/Story | Forecast Use |
|---|---:|---:|---|
| BE1 blended | 2.33 hours | 9.00M | Remaining BE1 Dashboard work |
| BE2 reported | 0.71 hours | 1.56M | No assigned backend story remains in the supplied dataset |
| BE3 Billing | 0.34 agent-hours | 12.17M | Billing-configuration work |
| BE3 Maintenance | 0.48 agent-hours | 11.31M | CRUD/workflow/history work |
| BE3 combined | 0.42 agent-hours | 11.63M | Initial Payment/Reminder/Report forecast |

Rates remain provider- and member-specific. A token from one subscription model is not assumed to have the same monetary cost or productivity as a token reported by another model.

## 7. Backend Estimate

### 7.1 Current Planning Position

The delivery record shows that 37 of 51 backend stories were deployed successfully through CI/CD. The remaining backend forecast scope is:

- BE1: DASH-01→02 — 2 stories;
- BE3: VIETQR-01→02, PAYMENT-01→03, REMINDER-01→02 — 7 stories;
- BE3: REPORT-01→05 — 5 stories.

The 37/51 ratio is used as the deployed-backend baseline. Acceptance criteria, test results, CI runs, and deployment references for each story should remain in the delivery record for auditability.

### 7.2 Estimate to Complete

The linear estimate is:

- BE1: `2 × 2.33 ≈ 4.7 hours`, approximately `18M tokens`;
- BE3: `12 × 0.42 ≈ 5.1 agent-hours`, approximately `139.6M tokens`;
- total remaining backend implementation: approximately **9.8 proxy hours and 157.6M tokens**.

Payment and Report contain more cross-module and external dependencies than the average completed BE3 story. The linear result is therefore treated as the optimistic case.

| Scenario | Remaining Time Proxy | Remaining Tokens | Assumption |
|---|---:|---:|---|
| Optimistic | 9.8 hours | 157.6M | Dependencies ready, one pass, limited rework |
| Expected | 14.6 hours | 236.4M | One review/integration iteration; 1.5× factor |
| Conservative | 19.5 hours | 315.2M | External-service or integration rework; 2.0× factor |

### 7.3 Backend Estimate at Completion

The recorded inventory to date is approximately 48h23m50 across mixed time definitions and 249.864626M tokens. Adding the Estimate to Complete produces:

| Scenario | Backend Time EAC Proxy | Backend Token EAC |
|---|---:|---:|
| Optimistic | 58.2 hours | 407.5M |
| Expected | 63.0 hours | 486.3M |
| Conservative | 67.9 hours | 565.1M |

The time EAC supports order-of-magnitude planning only. It combines member-reported hours with agent-active hours and is not a valid payroll total. Future batches must record human effort separately.

### 7.4 Backend Completion-Date Logic

The 9.8–19.5 hours must not be divided mechanically by the number of agents. Calendar duration depends on:

- Invoice readiness before Payment;
- source-data stability before Report;
- file-storage and push-notification availability;
- review and testing capacity;
- shared schema/API conflicts;
- deployment-environment availability.

If BE1 and BE3 work in parallel and dependencies are ready, raw implementation may finish within several working days. Acceptance and deployment can take longer than code generation.

## 8. Complete MVP Estimate

### 8.1 Frontend Bottom-Up Estimate

No frontend telemetry or member time log is currently available. The frontend estimate therefore uses a bottom-up assumption of 6–10 hours per module-level work package, including screen implementation, state/validation, API integration, and component testing. A separate integration, regression, and bug-fix reserve is then applied.

| Scenario | Package Effort | Integration/Rework Reserve | Total FE Effort | Two-Person FE Calendar |
|---|---:|---:|---:|---:|
| Lean | 19 × 6 h = 114 h | 25% | 143 h | 3.6 weeks at 40 combined h/week |
| Expected | 19 × 8 h = 152 h | 30% | 198 h | 5.7 weeks at 35 combined h/week |
| Conservative | 19 × 10 h = 190 h | 40% | 266 h | 8.9 weeks at 30 combined h/week |

For token-capacity planning only, the two reported `Hy3` streams provide a blended rate of:

```text
156.8M tokens / 45 hours ≈ 3.48M tokens/hour
```

Applying this provisional rate to frontend effort produces:

| Scenario | Estimated FE Tokens | Confidence |
|---|---:|---|
| Lean | 498M | Low |
| Expected | 690M | Low |
| Conservative | 927M | Low |

This token estimate must be replaced when FE1 and FE2 provide actual telemetry. It is not an API bill and is not used to calculate subscription cash cost.

Combining backend EAC with the provisional frontend estimate produces an implementation-wide AI usage envelope of approximately **905.5M–1.492B tokens**, with an expected value of **1.176B tokens**. This excludes usage for later documentation, support, or unmeasured tools.

### 8.2 Calendar Scenarios

| Scenario | Calendar Duration | Gross Team Capacity | Conditions |
|---|---:|---:|---|
| Lean | 8 weeks | 600 team-hours | 75 h/week; stable free tiers; limited rework |
| Expected | 9 weeks | 787.5 team-hours | 87.5 h/week; normal integration and pilot feedback |
| Conservative | 10 weeks | 1,000 team-hours | Up to 100 h/week; deployment/rework reserve |

Gross capacity is not coding effort. It includes planning, prompting, review, testing, integration, documentation, deployment, and project management.

### 8.3 Expected Phase Plan

| Phase | Calendar Allocation | Main Outputs |
|---|---:|---|
| Scope/architecture baseline | Week 1 | Backlog, SOW, API/schema contracts, and DoR/DoD |
| Backend and core frontend | Weeks 2–4 | Integrated Batch 1–2 vertical flows |
| Billing/payment/mobile integration | Weeks 4–6 | Batch 3 end-to-end flow |
| Dashboard/report and system integration | Weeks 6–7 | Batch 4 and cross-module verification |
| Acceptance, deployment, and pilot | Weeks 8–9 | CI, deployment, smoke testing, and pilot feedback |
| Contingency | Week 10 when required | Rework, provider/infrastructure issues, and demo stabilization |

The expected frontend estimate is approximately 5.7 working weeks and is therefore a more plausible implementation critical path than raw backend generation. Integration, acceptance, and pilot stabilization support retaining the complete MVP range of 8–10 weeks.

## 9. Resource Estimate

### 9.1 Human Resources

The project baseline is five part-time members, each available for 3–4 hours per day, five days per week.

| Resource | Planned Quantity | Responsibility |
|---|---:|---|
| Backend-focused developers | 3 | Domain APIs, schemas, tests, and integration |
| Frontend/mobile-focused developers | 2 | UI, mobile flows, and API integration |
| Integration owner | 1 named, potentially rotating owner | Shared schema/API merges and release control |
| Reviewer/QA | At least 1 reviewer per story | Independent acceptance and regression checks |
| Deployment owner | 1 named owner | CI/CD, environments, and smoke testing |
| Project/data owner | 1 named owner | Kanban, metrics, forecasts, and cost logs |

One person may hold multiple roles, but the same hour must not be counted twice.

### 9.2 AI Resources

| Resource | Planning Assumption | Risk/Control |
|---|---|---|
| GPT-5.6 Sol through ChatGPT Plus/trial | BE3 coding stream | Track benefit expiry, included usage, and purchased overage separately |
| Free `Hy3` access | Member-reported coding streams | Confirm the exact model, quota, and paid fallback |
| Concurrent agent sessions | Begin with no more than one active implementation story per member | Increase only while review/testing queues remain stable |
| Telemetry | Per-turn tokens and agent-active time where available | Apply one common reporting format across members and models |

The theoretical number of sessions is not converted into “virtual employees.” Human review and integration remain the limiting resources.

### 9.3 Technical and External Resources

The estimate must reserve capacity or budget for:

- API/web compute and managed PostgreSQL;
- image/file storage and bandwidth;
- backup and recovery;
- transactional email and mobile push notifications;
- PDF generation and VietQR validation;
- CI/CD, artifacts, monitoring, and logs;
- domain, DNS, and TLS;
- mobile distribution and pilot-user support.

## 10. Cost Estimate

### 10.1 Cost Views

| View | Purpose | Labor Treatment |
|---|---|---|
| Cash budget | Money the team or sponsor must fund | Excludes unpaid contributed labor |
| Economic project cost | Full value of consumed resources | Includes human effort at a shadow rate |
| Operating TCO | Post-delivery operating and maintenance cost | Includes recurring services and support |

### 10.2 Development Cash Scenarios

| Category | Lean/Free Tier | Expected Current Backlog | Conservative Paid Fallback |
|---|---:|---:|---:|
| AI development tools | 0 while benefits remain active | 1,600,000 | 1,600,000 |
| Cloud infrastructure | 0 with approved credits | 800,000 | 1,200,000 |
| Domain/security | 450,000 | 450,000 | 450,000 |
| Contingency | 500,000 | 427,500 (15% of base) | 812,500 (25% of base) |
| **Estimated cash total** | **950,000** | **3,277,500** | **4,062,500** |

The conservative scenario increases cloud capacity and holds a 25% contingency for expired AI benefits, provider variance, infrastructure overage, and additional test usage. Approximately **VND 4.1 million** is a planning ceiling rather than approved expenditure.

### 10.3 AI Usage Cost Treatment

- Usage within free/trial access or an included subscription has zero incremental usage cost unless the team purchases overage.
- Token volume is still recorded for capacity and paid-fallback planning.
- Subscription token usage must not be multiplied by API rates and charged again.
- If paid APIs are introduced, input, output, cache-read, and cache-write usage must be costed separately using the rate card valid on the usage date.
- Results must retain their provider/model labels.

### 10.4 Economic Labor Estimate

The complete MVP economic labor cost is estimated from gross capacity:

```text
Economic labor estimate
= 600–1,000 team-hours × Approved shadow rate
```

| Shadow Rate | Lean: 600 h | Expected: 787.5 h | Conservative: 1,000 h |
|---:|---:|---:|---:|
| VND 30,000/h | 18,000,000 | 23,625,000 | 30,000,000 |
| VND 50,000/h | 30,000,000 | 39,375,000 | 50,000,000 |
| VND 100,000/h | 60,000,000 | 78,750,000 | 100,000,000 |

These values represent the economic value of student effort and are not necessarily cash salaries. The SOW must select a shadow-rate basis before approval.

### 10.5 First-Month Operating Estimate

The available inputs do not include operating-service quotations or invoices. First-month operating TCO is therefore represented by:

```text
Monthly operating TCO
= Compute + Database + Storage + Bandwidth + Backup
 + Email/Push + Monitoring/Logging + Domain amortization
 + Support/Maintenance labor + Tax/FX variance
```

The infrastructure owner must replace each term with an invoice or official rate-card estimate before the pilot deployment gate.

## 11. Planning Baseline

### 11.1 Delivery Workflow

```text
Backlog
→ Ready for Agent
→ AI Implementing
→ Human Review
→ Testing / Acceptance
→ Integration
→ Deployment
→ Accepted Done
```

### 11.2 Initial WIP Policy

- no more than five active implementation stories across the team;
- no more than one active implementation story per member;
- no more than three stories waiting for review;
- no more than three stories in testing/acceptance;
- one shared integration change at a time;
- one controlled deployment at a time.

An additional agent is started only when it can work independently and downstream queues remain stable.

### 11.3 Definition of Done Used by the Estimate

A story contributes to delivery throughput only when:

- every acceptance criterion passes;
- a human reviewer approves it;
- relevant automated tests and CI pass;
- authorization and security behavior is verified;
- integration has no unresolved conflicts;
- target-environment deployment succeeds;
- post-deployment smoke tests pass;
- documentation is updated;
- no severity-1 or severity-2 defect remains.

Before these conditions are met, the item is implementation-complete or under validation rather than `Accepted Done`.

## 12. Monitoring and Reforecasting

### 12.1 Required Measures

| Area | Measures |
|---|---|
| Time | Cycle time, agent-active time, human touch time, and blocked time |
| Delivery | Accepted Done stories/week, work-item age, and carry-over |
| Quality | Acceptance yield, test pass rate, defects, and rework ratio |
| AI resources | Model, provider, tokens, task/turn, and quota/rate-limit events |
| Cost | Subscriptions, paid usage, infrastructure, external services, and shadow labor |
| Deployment | CI/deployment attempts, success rate, rollback, and smoke-test results |

### 12.2 Forecast Update Rules

At the end of every batch:

1. replace planned rates with actual `Accepted Done` rates;
2. recalculate remaining stories by work class;
3. update expected and conservative scenarios;
4. update cost EAC from actual invoices and effort logs;
5. document variance and corrective action;
6. obtain sponsor approval if scope, deadline, or budget baselines change.

Recommended control triggers:

- cycle time exceeds twice the median for a comparable story;
- tokens/story exceed twice the stream median without a complexity explanation;
- rework exceeds 30% of human effort;
- a story remains blocked for more than one working day;
- two consecutive CI/deployment failures occur;
- the review/testing queue exceeds three stories;
- the expected forecast exceeds the SOW deadline or budget contingency.

## 13. Statement of Work Reconciliation

The Statement of Work converts sponsor expectations and the developer estimate into an approved delivery baseline. It defines scope, deliverables, acceptance criteria, responsibilities, milestones, budget, assumptions, dependencies, and change control.

| Item | Sponsor/Proposal Baseline | Developer Estimate | Required Agreement |
|---|---|---|---|
| Complete MVP duration | 8–10 weeks | Retain 8–10 weeks until an Accepted Done pilot supports a change | Approve the calendar baseline and milestone gates |
| Remaining backend | Not estimated separately | 9.8–19.5 proxy hours; 157.6–315.2M tokens | Treat as an implementation estimate, not a delivery promise |
| Frontend | Not estimated separately by work package | 143–266 hours; 498–927M provisional tokens | Validate package sizes using FE1/FE2 telemetry |
| Cash budget | No formally approved baseline | VND 3.28M expected; approximately VND 4.1M conservative | Confirm infrastructure quotations and contingency |
| Economic labor | Excluded from cash budget | 600–1,000 hours × shadow rate | Select the shadow rate and reporting view |
| Free AI access | In use | Expiry, quota, and fallback risk | Record expiry dates and paid fallback |
| Acceptance | Deployable MVP | CI/CD is configured and backend stories in the calibration dataset were deployed successfully | Maintain traceability from stories to tests, CI runs, and deployments |

When sponsor and developer values differ, the variance and resolution are recorded here rather than silently replacing one estimate with the other.

## 14. Assumptions, Exclusions, and Required Inputs

### 14.1 Assumptions

- the 51-story backend scope remains materially stable;
- completed modules remain reusable and do not require major redesign;
- team availability remains 3–4 hours per member per day, five days per week;
- external baselines are available before dependent acceptance tests;
- trial/student AI benefits remain active during the immediate development period.

### 14.2 Exclusions from Firm Cost Commitment

- legal or commercial production-support obligations;
- unknown paid-provider overage;
- production scale beyond the pilot;
- major backlog changes after SOW approval.

### 14.3 Inputs Required to Increase Confidence

1. the exact provider, model, and product surface behind `Hy3`;
2. a common human time-log definition for all members;
3. traceability from each story to its acceptance result, CI run, and deployment;
4. FE1/FE2 time and token telemetry by work package;
5. rework, defect, and blocked-time logs;
6. subscription invoices and benefit expiry dates;
7. cloud, database, storage, email, and push quotations;
8. an approved shadow labor rate;
9. a signed SOW baseline.

## 15. Recommended Baseline

The following planning baseline applies to the next delivery period and is reforecast after every batch:

| Dimension | Recommended Baseline |
|---|---|
| Complete MVP calendar | 9 weeks expected; 8–10 week range |
| Gross team capacity | 787.5 hours expected; 600–1,000 hour range |
| Remaining backend implementation | 14.6 proxy hours expected; 9.8–19.5 hour range |
| Remaining backend AI usage | 236.4M tokens expected; 157.6–315.2M range |
| Backend token EAC | 486.3M expected; 407.5–565.1M range |
| Frontend implementation | 198 hours expected; 143–266 hour range |
| Frontend AI usage | 690M provisional expected; 498–927M range |
| Full implementation AI usage | 1.176B expected; 905.5M–1.492B range |
| Current-scope cash budget | VND 3,277,500 expected |
| Conservative cash envelope | Up to approximately VND 4.1 million |
| Economic labor | 787.5 hours × approved shadow rate |
| Reforecast frequency | After every batch and material variance trigger |

This baseline covers the complete delivery system. Fast code generation reduces implementation time, but the project is complete only when accepted stories are integrated, deployed, and verified.
