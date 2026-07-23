# RosiHome Cost – Time – Resources Estimation Report

## 1. Document Control

| Field | Value |
|---|---|
| Version | 2.0 – Estimation Baseline Draft |
| Date | 22/07/2026 |
| Estimation horizon | Remaining backend, complete MVP, first pilot month |
| Scope baseline | 51 backend user stories plus frontend, integration, testing, deployment and pilot work |
| Estimation approach | Empirical Kanban forecast calibrated by completed AI-assisted work |
| Status | Provisional; pending Accepted Done and deployment evidence |

## 2. Executive Estimate

RosiHome should retain the proposal target of **8–10 calendar weeks for the complete MVP**, but the basis is refined as follows:

- AI-assisted backend implementation is expected to finish much earlier than the complete product;
- the remaining backend implementation is estimated at **9.8–19.5 recorded/agent-clock hours** and **157.6–315.2 million tokens**;
- the backend Estimate at Completion is approximately **58.2–67.9 recorded/agent-clock hours** and **407.5–565.1 million tokens**;
- the two frontend streams contain **19 module-level work packages** mapped to the same product stories, estimated at **143–266 frontend hours**, with **198 hours expected**;
- frontend AI usage is provisionally estimated at **498–927 million tokens**, with **690 million expected**, pending actual FE telemetry;
- the full MVP still requires frontend/mobile integration, human review, acceptance testing, infrastructure, deployment and pilot stabilization;
- expected gross team capacity over nine weeks is approximately **787.5 team-hours**;
- the expected cash budget for the current backlog is approximately **3.28 million VND**;
- a conservative paid-fallback envelope is **up to approximately 4.1 million VND**, subject to actual provider and infrastructure quotations.

These are planning ranges, not guarantees. The estimate must be reforecast using stories that pass review, testing and deployment.

## 3. Estimation Objective

This report answers four planning questions:

1. How much time is likely required to finish the remaining backend and the complete MVP?
2. What people, AI tools and technical resources are required?
3. What cash and economic costs should be planned?
4. How will the estimate be monitored and updated during delivery?

Historical figures are used only to calibrate rates. This document is not intended to be a progress-status report.

## 4. Scope Used for Estimation

### 4.1 Backend scope by batch

| Batch | BE1 Chí | BE2 Đạt | BE3 Minh | Total US |
|---|---|---|---|---:|
| Batch 1 – Foundation | AUTH-01→06, PROFILE-01 | PROPERTY-01→02, ROOM-01→03 | UTILITY-01→02, CHARGE-01 | 15 |
| Batch 2 – Core | TENANT-01→02, LEASE-01→06 | METER-01→03 | MAINT-01→05 | 16 |
| Batch 3 – Billing/Payment | Review, test, bug fix | INVOICE-01→04 | VIETQR-01→02, PAYMENT-01→03, REMINDER-01→02 | 11 |
| Batch 4 – Analytics | DASH-01→02 | DASH-03→04 | REPORT-01→05 | 9 |
| **Total** | **17** | **14** | **20** | **51** |

### 4.2 Frontend scope by batch

Frontend work implements the presentation and interaction layer for the same Product Backlog stories. It is therefore estimated as work packages and must **not** be added to the 51-story product count.

| Batch | FE1 MXH | FE2 Quân | Work packages |
|---|---|---|---:|
| Batch 1 – Foundation UI | Auth, Profile, Property, Room UI (4) | Design System, Navigation, Shared Components, Utility UI (4) | 8 |
| Batch 2 – Core UI | Tenant & Lease UI (2) | Meter & Maintenance UI (2) | 4 |
| Batch 3 – Billing/Payment UI | Invoice & Payment UI (2) | VietQR, Upload Proof, Notification UI (3) | 5 |
| Batch 4 – Analytics UI | Dashboard UI (1) | Report UI (1) | 2 |
| After Batch 3 | Property/Lease/Tenant integration | UI completion, testing and bug fixing | Enabling work |
| **Total estimated packages** | **9** | **10** | **19** |

The estimate also includes non-story work that is required to deliver the MVP:

- frontend/mobile implementation;
- API integration and shared contract alignment;
- infrastructure and database setup;
- automated and manual testing;
- security and authorization verification;
- CI/CD, deployment and smoke testing;
- bug fixing, documentation and pilot support.

Setup, review and bug-fix work consumes resources but is not counted as additional user-story throughput.

### 4.3 Dependency model

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

The batch sequence is used to manage dependencies. User stories remain the unit of estimation and acceptance.

## 5. Estimation Method

### 5.1 Selected method

The project uses **Kanban with empirical flow-based forecasting** because AI-agent cycle time can be much shorter and less regular than a traditional two-week sprint.

The method is:

1. split the backlog into independently testable user stories;
2. group dependent stories into ordered batches;
3. measure time, token usage, rework and acceptance outcomes;
4. estimate remaining work using the rate of the most comparable member/model stream;
5. apply uncertainty factors for integration, review and deployment;
6. update the Estimate at Completion after every batch.

### 5.2 Core formulas

```text
Implementation rate = Measured implementation time / Implemented stories

Token rate = Measured tokens / Implemented stories

Remaining effort = Remaining comparable stories × implementation rate

Estimate at Completion = Actual to date + Estimate to Complete

Economic labor cost = Human effort hours × approved shadow hourly rate

Cash cost = subscriptions + paid usage + infrastructure
          + external services + domain/security + contingency
```

### 5.3 Confidence rules

- `High`: telemetry or invoice-backed measurement with a clear story mapping;
- `Medium`: member-reported aggregate with known scope;
- `Low`: mixed work types, unclear model identifier or no acceptance evidence.

The current estimate has **medium-to-low confidence** because the three members did not record time in the same way and the reported stories have not all been verified as deployed.

## 6. Calibration Evidence

### 6.1 Observed inputs

| Stream | Calibrated scope | Stories | Time basis | Tokens | Model/access | Confidence |
|---|---|---:|---:|---:|---|---|
| BE1 | Batch 1 + Batch 2 plus setup/test/FE/docs overhead | 15 | 35 human/reported hours | 135.0M | `Hy3`, free | Low–Medium |
| BE2 | Batch 1, Batch 2+3 and Batch 4 | 14 | 10 reported hours | 21.8M | `Hy3`, free | Medium |
| BE3 | Billing Foundation | 3 | 1h01 agent-active | 36.5M | GPT-5.6 Sol, Plus/trial | Medium |
| BE3 | MAINT-01→05 | 5 | 2h22m50 agent-active | 56.564626M | GPT-5.6 Sol, Plus/trial | High for usage; Medium for story split |

The label `Hy3` is retained exactly as reported. Its provider, exact model ID and product surface must be confirmed before a formal model comparison.

### 6.2 Rates used

| Stream | Time/story | Token/story | Forecast use |
|---|---:|---:|---|
| BE1 blended | 2.33 hours | 9.00M | Remaining BE1 Dashboard work |
| BE2 reported | 0.71 hours | 1.56M | No assigned backend story remains in the supplied data |
| BE3 Billing | 0.34 agent-hours | 12.17M | Billing-like configuration work |
| BE3 Maintenance | 0.48 agent-hours | 11.31M | CRUD/workflow/history work |
| BE3 combined | 0.42 agent-hours | 11.63M | Initial Payment/Reminder/Report forecast |

The rates are kept provider/member specific. A token used by one subscription model is not assumed to have the same monetary cost or productivity as a token reported by another model.

## 7. Backend Estimate

### 7.1 Planning position

For forecasting purposes, the supplied evidence indicates 37 of 51 backend stories have implementation output. The remaining forecast scope is:

- BE1: DASH-01→02 — 2 stories;
- BE3: VIETQR-01→02, PAYMENT-01→03, REMINDER-01→02 — 7 stories;
- BE3: REPORT-01→05 — 5 stories.

This planning position must not be presented as an Accepted Done percentage until review, test and deployment evidence is attached.

### 7.2 Estimate to Complete

The linear estimate is:

- BE1: `2 × 2.33 ≈ 4.7 hours`, approximately `18M tokens`;
- BE3: `12 × 0.42 ≈ 5.1 agent-hours`, approximately `139.6M tokens`;
- total remaining backend implementation: approximately **9.8 proxy hours and 157.6M tokens**.

Payment and Report have more cross-module and external dependencies than the average completed BE3 story. Therefore, the linear result is treated as the optimistic case.

| Scenario | Remaining time proxy | Remaining tokens | Assumption |
|---|---:|---:|---|
| Optimistic | 9.8 hours | 157.6M | Dependencies ready, one pass, little rework |
| Expected | 14.6 hours | 236.4M | One review/integration iteration; 1.5× factor |
| Conservative | 19.5 hours | 315.2M | External-service or integration rework; 2.0× factor |

### 7.3 Backend Estimate at Completion

Recorded inventory to date is approximately 48h23m50 across mixed time definitions and 249.864626M tokens. Adding the Estimate to Complete gives:

| Scenario | Backend time EAC proxy | Backend token EAC |
|---|---:|---:|
| Optimistic | 58.2 hours | 407.5M |
| Expected | 63.0 hours | 486.3M |
| Conservative | 67.9 hours | 565.1M |

The time EAC is useful for order-of-magnitude planning only. It combines member-reported hours and agent-active hours, so it is not a valid payroll total. From the next batch onward, the team must record human touch time separately.

### 7.4 Backend completion date logic

The 9.8–19.5 hours must not be divided mechanically by the number of agents. Calendar duration depends on:

- Invoice readiness before Payment;
- source-data stability before Report;
- file storage and push-notification availability;
- review and test capacity;
- shared schema/API conflicts;
- deployment availability.

If BE1 and BE3 work in parallel and dependencies are ready, raw implementation can plausibly finish within several working days. Acceptance and deployment may take longer than code generation.

## 8. Complete MVP Time Estimate

### 8.1 Frontend bottom-up estimate

No frontend telemetry or member time log was supplied. The frontend estimate therefore uses a bottom-up planning assumption of 6–10 hours per module-level work package, including screen implementation, state/validation, API integration and component tests. Integration, regression and bug-fix reserve is then added separately.

| Scenario | Package effort | Integration/rework reserve | Total FE effort | Two-person FE calendar |
|---|---:|---:|---:|---:|
| Lean | 19 × 6 h = 114 h | 25% | 143 h | 3.6 weeks at 40 h/week combined |
| Expected | 19 × 8 h = 152 h | 30% | 198 h | 5.7 weeks at 35 h/week combined |
| Conservative | 19 × 10 h = 190 h | 40% | 266 h | 8.9 weeks at 30 h/week combined |

For token capacity planning only, the two reported `Hy3` streams provide a blended rate of approximately `156.8M tokens / 45 hours = 3.48M tokens/hour`. Applying that provisional rate to frontend effort gives:

| Scenario | Estimated FE tokens | Confidence |
|---|---:|---|
| Lean | 498M | Low |
| Expected | 690M | Low |
| Conservative | 927M | Low |

This token estimate must be replaced as soon as FE1 and FE2 provide actual telemetry. It is not an API bill and is not used to calculate subscription cash cost.

Combining backend EAC with the provisional frontend estimate produces an implementation-wide AI usage envelope of approximately **905.5M–1.492B tokens**, with **1.176B tokens expected**. This excludes token usage for later documentation, support or unmeasured tools.

### 8.2 Calendar scenarios

| Scenario | Calendar duration | Gross team capacity | Conditions |
|---|---:|---:|---|
| Lean | 8 weeks | 600 team-hours | 75 h/week; free tiers stable; limited rework |
| Expected | 9 weeks | 787.5 team-hours | 87.5 h/week midpoint; normal integration and pilot feedback |
| Conservative | 10 weeks | 1,000 team-hours | Up to 100 h/week capacity envelope; deployment/rework reserve |

Gross capacity is not the same as coding effort. It includes planning, prompting, review, testing, integration, documentation, deployment and project management.

### 8.3 Expected phase plan

| Phase | Calendar allocation | Main outputs |
|---|---:|---|
| Scope/architecture baseline | Week 1 | Backlog, SOW, API/schema contracts, DoR/DoD |
| Backend and core frontend | Weeks 2–4 | Batch 1–2 integrated vertical flows |
| Billing/payment/mobile integration | Weeks 4–6 | Batch 3 end-to-end flow |
| Dashboard/report and system integration | Weeks 6–7 | Batch 4 and cross-module verification |
| Acceptance, deployment and pilot | Weeks 8–9 | CI, deploy, smoke test, pilot feedback |
| Contingency | Week 10 when required | Rework, provider/infrastructure issue, demo stabilization |

The expected frontend estimate is approximately 5.7 working weeks and therefore becomes a more plausible implementation critical path than raw backend generation. Integration, acceptance and pilot stabilization justify retaining the complete MVP range of 8–10 weeks.

## 9. Resource Estimate

### 9.1 Human resources

The project baseline is five part-time members at 3–4 hours/day, five days/week.

| Resource | Planned quantity | Responsibility |
|---|---:|---|
| Backend-focused developers | 3 | Domain APIs, schema, tests and integration |
| Frontend/mobile-focused developers | 2 | UI, mobile flows and API integration |
| Integration owner | 1 rotating named owner | Shared schema/API merge and release control |
| Reviewer/QA | At least 1 reviewer per story | Independent acceptance and regression checks |
| Deployment owner | 1 named owner | CI/CD, environment and smoke test |
| Project/data owner | 1 named owner | Kanban, metrics, forecast and cost log |

One person may hold multiple roles, but the same hour cannot be counted twice.

### 9.2 AI resources

| Resource | Planning assumption | Risk/control |
|---|---|---|
| GPT-5.6 Sol through ChatGPT Plus/trial | BE3 coding stream | Track expiry, included usage and purchased overage separately |
| `Hy3` free access | BE1/BE2 coding streams | Confirm exact model, quota and paid fallback |
| Concurrent agent sessions | Start at maximum 1 active implementation story/member | Increase only if review/test queues remain stable |
| Telemetry | Per-turn token and agent-active time for Codex | Replicate a common format for all members/models |

The theoretical number of concurrent sessions is not converted into “virtual employees”. Human review and integration remain the limiting resource.

### 9.3 Technical/external resources

The estimate must reserve capacity or budget for:

- API/web compute and managed PostgreSQL;
- image/file storage and bandwidth;
- backup and recovery;
- transactional email and mobile push notifications;
- PDF generation and VietQR validation;
- CI/CD, artifacts, monitoring and logs;
- domain, DNS and TLS;
- mobile distribution and pilot-user support.

## 10. Cost Estimate

### 10.1 Cost views

The project maintains three different cost views:

| View | Purpose | Labor treatment |
|---|---|---|
| Cash budget | Money the student team/sponsor must pay | Excludes unpaid contributed labor |
| Economic project cost | Full value of consumed resources | Includes all human effort at a shadow rate |
| Operating TCO | Cost to operate and maintain after delivery | Includes recurring service and support cost |

### 10.2 Development cash scenarios

| Cost category | Lean/free-tier | Expected current backlog | Conservative paid fallback |
|---|---:|---:|---:|
| AI development tools | 0 while benefits remain | 1,600,000 | 1,600,000 |
| Cloud infrastructure | 0 using approved credits | 800,000 | 1,200,000 |
| Domain/security | 450,000 | 450,000 | 450,000 |
| Contingency | 500,000 | 427,500 (15% of base) | 812,500 (25% of base) |
| **Estimated cash total** | **950,000** | **3,277,500** | **4,062,500** |

The conservative estimate increases cloud capacity and holds a 25% contingency for expired AI benefits, provider variance, infrastructure overage and additional test usage. Approximately **4.1 million VND** is a planning ceiling, not approved spend.

### 10.3 AI usage cost treatment

- Free/trial and subscription-included token usage has zero incremental usage charge unless an actual overage is purchased.
- Token volume is still recorded for capacity and fallback planning.
- Subscription usage must not be multiplied by API prices and charged again.
- If paid APIs are introduced, input, output, cache-read and cache-write usage must be costed separately using the rate card valid on the usage date.
- Provider/model results remain separately labeled.

### 10.4 Economic labor estimate

The complete MVP economic labor cost is estimated from the gross capacity range:

```text
Economic labor estimate = 600–1,000 team-hours × approved shadow rate
```

| Shadow rate | Lean: 600 h | Expected: 787.5 h | Conservative: 1,000 h |
|---:|---:|---:|---:|
| 30,000 VND/h | 18,000,000 | 23,625,000 | 30,000,000 |
| 50,000 VND/h | 30,000,000 | 39,375,000 | 50,000,000 |
| 100,000 VND/h | 60,000,000 | 78,750,000 | 100,000,000 |

These values show the economic value of student effort; they are not necessarily cash salaries. The SOW must select one shadow-rate basis before approval.

### 10.5 First-month operating estimate

The supplied data does not include provider quotations or invoices for operating services. Therefore, first-month operating TCO is represented as a formula:

```text
Monthly operating TCO
= compute + database + storage + bandwidth + backup
 + email/push + monitoring/logging + domain amortization
 + support/maintenance labor + taxes/FX variance
```

The infrastructure owner must replace each term with an invoice or official rate-card estimate before the pilot deployment gate.

## 11. Planning Baseline

### 11.1 Delivery workflow

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

### 11.2 Initial WIP policy

- maximum five active implementation stories across the team;
- maximum one active implementation story per member;
- maximum three stories waiting for review;
- maximum three stories in testing/acceptance;
- one shared integration change at a time;
- one controlled deployment at a time.

An additional agent is started only when it can work independently and downstream queues are stable.

### 11.3 Definition of Done used by the estimate

A story contributes to delivery throughput only when:

- every acceptance criterion passes;
- a human reviewer approves it;
- relevant automated tests and CI pass;
- authorization/security behavior is verified;
- integration has no unresolved conflict;
- the target environment deployment succeeds;
- post-deployment smoke tests pass;
- documentation is updated;
- no severity-1 or severity-2 defect remains.

Until then, the item is implementation complete or in validation, not Accepted Done.

## 12. Monitoring and Reforecasting

### 12.1 Required measures

| Area | Measure |
|---|---|
| Time | Cycle time, agent-active time, human touch time, blocked time |
| Delivery | Accepted Done stories/week, work-item age, carry-over |
| Quality | Acceptance yield, test pass rate, defect and rework ratio |
| AI resources | Model, provider, token, task/turn, quota/rate-limit events |
| Cost | Subscription, paid usage, infrastructure, external services, shadow labor |
| Deployment | CI/deploy attempts, success rate, rollback and smoke-test result |

### 12.2 Forecast update rule

At the end of every batch:

1. replace planned rates with actual Accepted Done rates;
2. recalculate remaining story count by work class;
3. update expected and conservative scenarios;
4. update cost Estimate at Completion from actual invoices and effort logs;
5. document variance and corrective action;
6. obtain sponsor approval if scope, deadline or budget baseline changes.

Recommended control triggers:

- cycle time exceeds twice the median for a comparable story;
- token/story exceeds twice the stream median without a complexity reason;
- rework exceeds 30% of human effort;
- a story is blocked for more than one working day;
- two consecutive CI/deployment failures occur;
- review/testing queue exceeds three stories;
- expected forecast exceeds the SOW deadline or budget contingency.

### 12.3 Telemetry demonstration

After completing one Codex user story:

```powershell
& "$HOME\codex-telemetry\Complete-US.cmd" US-<MODULE>-<NUMBER>
```

Evidence produced:

- `C:/Users/admin/codex-telemetry/data/codex-otel.json` — raw telemetry;
- `C:/Users/admin/codex-telemetry/task-map.csv` — story/turn mapping;
- `C:/Users/admin/codex-telemetry/reports/usage-by-turn.csv` — detailed usage;
- `C:/Users/admin/codex-telemetry/reports/usage-by-conversation.csv` — conversation aggregate;
- `C:/Users/admin/codex-telemetry/reports/index.html` — readable dashboard.

Telemetry demonstrates AI usage and agent-active time. Test, CI, review, deployment and smoke-test records are separately required to demonstrate Accepted Done.

## 13. Statement of Work Reconciliation

The Statement of Work converts sponsor expectations and the developer estimate into an approved delivery baseline. It defines scope, deliverables, acceptance criteria, responsibilities, milestones, budget, assumptions, dependencies and change control.

| Item | Sponsor/proposal baseline | Developer estimate | Required agreement |
|---|---|---|---|
| Complete MVP duration | 8–10 weeks | Retain 8–10 weeks until an Accepted Done pilot supports a change | Approve calendar baseline and milestone gates |
| Backend remaining | Not separately estimated | 9.8–19.5 proxy hours; 157.6–315.2M tokens | Treat as implementation estimate, not delivery promise |
| Frontend | Not separately estimated by work package | 143–266 hours; 498–927M provisional tokens | Validate package sizes with FE1/FE2 telemetry |
| Cash budget | Existing proposal requires revision | 3.28M expected; approximately 4.1M conservative | Confirm infrastructure quotations and contingency |
| Economic labor | Excluded from cash budget | 600–1,000 hours × shadow rate | Select shadow rate and reporting view |
| Free AI access | Implicit | Expiry/quota/fallback risk | Record benefit expiry and paid fallback |
| Acceptance | Deployable MVP | Current evidence is mainly implementation/usage | Name reviewers and deployment owner |

If sponsor and developer values differ, the variance and chosen resolution are recorded here rather than silently replacing one estimate with the other.

## 14. Viva Presentation Guide

### Software Project Estimation

> We decomposed the product into 51 backend user stories and 19 frontend work packages mapped to the same stories. Backend rates are calibrated from measured or declared work; frontend is estimated bottom-up until FE telemetry becomes available. We forecast optimistic, expected and conservative scenarios without double-counting product stories.

### Software Project Planning

> We use four dependency batches and a Kanban workflow. Stories can run in parallel only when their dependencies and shared contracts are ready. WIP is limited by human review, testing and deployment capacity rather than theoretical agent count.

### Software Project Monitoring and Control

> We collect token and agent-active time through telemetry, human effort through time logs, quality through tests and review, and delivery through CI/deployment evidence. After each batch we compare actuals with the Estimate at Completion and reforecast.

### Statement of Work

> The SOW is the agreement boundary between sponsor expectations and the developer forecast. It records the accepted scope, milestone, budget, acceptance evidence and the action to take when actual results exceed tolerance.

### Demonstration

1. Select one user story and show its acceptance criteria.
2. Show the Codex task and run `Complete-US.cmd`.
3. Open the per-turn CSV and HTML usage dashboard.
4. Show automated tests, CI, PR review and deployment result.
5. Move the story to Accepted Done only after all gates pass.
6. Update the remaining forecast using the newly observed rate.

## 15. Assumptions, Exclusions and Required Inputs

### Assumptions

- the 51-story backend scope remains stable;
- completed modules are reusable and do not require major redesign;
- team availability remains 3–4 hours/day/member, five days/week;
- external baselines become available before dependent acceptance tests;
- trial/student AI benefits remain available during the immediate development period.

### Exclusions from firm cost commitment

- legal/commercial production support obligations;
- unknown paid provider overage;
- production scale beyond the pilot;
- major backlog changes after SOW approval.

### Inputs required to raise confidence

1. exact provider/model/product surface behind `Hy3`;
2. common human time-log definitions for all members;
3. Accepted Done and deployment evidence per story;
4. FE1/FE2 time and token telemetry by work package;
5. rework, defect and blocked-time logs;
6. actual subscription invoices and benefit expiry dates;
7. cloud, database, storage, email and push quotations;
8. approved shadow labor rate;
9. signed SOW baseline.

## 16. Recommended Baseline

Pending stronger acceptance evidence, the recommended planning baseline is:

| Dimension | Recommended baseline |
|---|---|
| Complete MVP calendar | 9 weeks expected; 8–10 week range |
| Gross team capacity | 787.5 hours expected; 600–1,000 hour range |
| Remaining backend implementation | 14.6 proxy hours expected; 9.8–19.5 range |
| Remaining backend AI usage | 236.4M tokens expected; 157.6–315.2M range |
| Backend token EAC | 486.3M expected; 407.5–565.1M range |
| Frontend implementation | 198 hours expected; 143–266 hour range |
| Frontend AI usage | 690M provisional expected; 498–927M range |
| Full implementation AI usage | 1.176B expected; 905.5M–1.492B range |
| Current-scope cash budget | 3.2775M VND expected |
| Conservative cash envelope | Up to approximately 4.1M VND |
| Economic labor | 787.5 hours × approved shadow rate |
| Reforecast frequency | Every batch and every material variance trigger |

This baseline emphasizes the complete delivery system. Fast code generation reduces implementation time, but the project is considered complete only when accepted stories are integrated, deployed and verified.
