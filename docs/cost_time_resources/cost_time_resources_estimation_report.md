# RosiHome Cost–Time–Resources Estimation Report

## 1. Document Control

| Attribute | Value |
|---|---|
| Version | 1.0 |
| Date | 23 July 2026 |
| Purpose | Estimate the time, resources, and cost required to deliver the RosiHome MVP |
| Scope | 51 backend user stories, 19 frontend work packages, integration, testing, deployment, and pilot preparation |
| Estimation method | Empirical forecasting calibrated with AI-assisted delivery data |
| Confidence | Medium overall; confidence varies by estimate component |

## 2. Executive Summary

RosiHome is estimated to require **8–10 calendar weeks** to deliver the complete MVP. The expected case is **9 weeks**, based on five part-time members working 3–4 hours per day, five days per week.

The main estimates are:

| Dimension | Expected Estimate | Estimated Range |
|---|---:|---:|
| Complete MVP duration | 9 weeks | 8–10 weeks |
| Gross team capacity | 787.5 team-hours | 600–1,000 team-hours |
| Remaining backend time | 14.6 real-time forecast hours | 9.8–19.5 hours |
| Remaining backend AI usage | 236.4M tokens | 157.6–315.2M tokens |
| Backend token Estimate at Completion | 486.3M tokens | 407.5–565.1M tokens |
| Frontend effort | 84.9 hours | 77.2–96.3 hours |
| Frontend AI usage | 414.2M tokens | 398.3–446.1M tokens |
| Full implementation AI usage | 900.5M tokens | 805.8M–1.0112B tokens |
| Development cash budget | VND 3,277,500 | VND 950,000–4,062,500 |
| Economic labor | 787.5 hours × approved shadow rate | 600–1,000 hours × shadow rate |

AI-assisted backend implementation is substantially faster than complete product delivery. Frontend implementation, integration, testing, deployment, and pilot preparation remain necessary and determine the overall 8–10 week duration.

Token volume is treated as an AI resource indicator, not as an invoice. Usage included in a free trial or subscription is not charged again using API prices.

## 3. Scope Basis

### 3.1 Backend Scope

The backend scope contains 51 user stories allocated across three members and four dependency batches.

| Batch | BE1 Chí | BE2 Đạt | BE3 Minh | Total |
|---|---|---|---|---:|
| Batch 1 – Foundation | AUTH-01→06, PROFILE-01 | PROPERTY-01→02, ROOM-01→03 | UTILITY-01→02, CHARGE-01 | 15 |
| Batch 2 – Core | TENANT-01→02, LEASE-01→06 | METER-01→03 | MAINT-01→05 | 16 |
| Batch 3 – Billing/Payment | Review, testing, and bug fixing | INVOICE-01→04 | VIETQR-01→02, PAYMENT-01→03, REMINDER-01→02 | 11 |
| Batch 4 – Analytics | DASH-01→02 | DASH-03→04 | REPORT-01→05 | 9 |
| **Total** | **17** | **14** | **20** | **51** |

The team confirmed that GitHub CI/CD is configured and that the backend user stories used as calibration data were deployed successfully.

The remaining backend scope used in this estimate is:

- BE1: DASH-01→02 — 2 stories;
- BE3: VIETQR-01→02, PAYMENT-01→03, REMINDER-01→02 — 7 stories;
- BE3: REPORT-01→05 — 5 stories.

This produces a calibration position of 37 deployed backend stories and 14 remaining backend stories.

### 3.2 Frontend Scope

Frontend work implements the user interface and interaction layer for the same Product Backlog stories. It is represented as 19 module-level work packages and is **not added to the 51-user-story product count**.

| Batch | FE1 MXH | FE2 Quân | Packages |
|---|---|---|---:|
| Batch 1 | Auth, Profile, Property, Room UI (4) | Design System, Navigation, Shared Components, Utility UI (4) | 8 |
| Batch 2 | Tenant and Lease UI (2) | Meter and Maintenance UI (2) | 4 |
| Batch 3 | Invoice and Payment UI (2) | VietQR, Upload Proof, Notification UI (3) | 5 |
| Batch 4 | Dashboard UI (1) | Report UI (1) | 2 |
| **Total** | **9** | **10** | **19** |

Property/Lease/Tenant integration, final UI testing, and bug fixing are treated as enabling work rather than additional product stories.

### 3.3 Included Supporting Work

The estimate includes:

- API and database implementation;
- frontend/mobile implementation;
- automated and manual testing;
- API and UI integration;
- infrastructure and database setup;
- CI/CD and deployment;
- bug fixing and technical documentation;
- pilot preparation.

Major product-scope changes and production operation beyond the initial pilot are excluded.

## 4. Estimation Method and Data Quality

### 4.1 Approach

The estimate uses empirical rates from completed AI-assisted work and applies them to comparable remaining work. Because the sample is small and time records are not fully standardized, three scenarios are used:

- **Optimistic:** dependencies are ready and little rework is required;
- **Expected:** one normal review/integration iteration is required;
- **Conservative:** additional integration, provider, or infrastructure rework occurs.

Core formulas:

```text
Implementation rate
= Measured implementation time / Completed stories

Token rate
= Measured tokens / Completed stories

Estimate to Complete
= Remaining comparable work × Observed rate × Uncertainty factor

Estimate at Completion
= Actual to Date + Estimate to Complete

Economic labor cost
= Human effort × Approved shadow hourly rate
```

### 4.2 Standard Time Definitions

The available time figures do not all measure the same quantity. The report therefore distinguishes:

| Measure | Definition | Estimation Use |
|---|---|---|
| Human effort | Person-hours spent on analysis, prompting, review, testing, correction, integration, deployment, and documentation | Resource and economic labor estimation |
| Real time | Elapsed working time reported by the member for the task, including human and AI-assisted work | Delivery-effort and capacity analysis |
| Cycle time | Calendar time from story start to successful deployment, including waiting and blocked time | Completion-date forecasting |
| Gross capacity | Total member availability during a period | Feasibility check for the overall schedule |

The current BE1, BE2, and BE3 records are reported in real time. FE1 and FE2 also reported real-time ranges for Batch 1. These are planning measurements and should not be interpreted as payroll totals unless the team explicitly confirms that they represent complete human effort.

Future data collection should record human effort, agent-active time, start time, deployment time, and blocked time separately.

### 4.3 Confidence Assessment

| Estimate Component | Confidence | Reason |
|---|---|---|
| Backend delivery baseline | Medium–High | CI/CD and successful deployment confirmed |
| Backend token usage | Medium–High | Telemetry available for Maintenance; aggregates available for other work |
| Combined backend time | Medium–High | Backend records are now normalized to real-time declarations, but the sample remains small |
| Frontend effort | Medium | Batch 1 is calibrated with FE1/FE2 real-time ranges; later batches are extrapolated |
| Frontend token usage | Medium | Batch 1 token data is available; later batches are extrapolated from the measured package rate |
| Cash budget | Medium | Based on existing budget assumptions; quotations are still required |

The overall estimate is suitable for software-project-management planning. It should be updated when measurements for the remaining FE packages and standardized human-effort data become available.

## 5. Calibration Data

### 5.1 Observed Delivery Inputs

| Stream | Calibrated Scope | Stories | Time Basis | Tokens | Model/Access |
|---|---|---:|---:|---:|---|
| BE1 | Batch 1 + Batch 2 plus setup/testing/FE/docs overhead | 15 | 35 real-time hours | 135.0M | `Hy3`, free |
| BE2 | Batch 1 | 5 | 7 real-time hours | 6.3M | `Hy3`, free |
| BE2 | Batch 2 + Batch 3 | 7 | 13 real-time hours | 13.0M | `Hy3`, free |
| BE2 | Batch 4 | 2 | 2 real-time hours | 2.5M | `Hy3`, free |
| FE1 | Batch 1 frontend work | 4 packages | 13–15 real-time hours | 10.5M | Gemini 3.1 Pro, student subscription free for 1 year |
| FE2 | Batch 1 frontend work | 4 packages | 13–14 real-time hours | 118.0M | GPT-5.6 Sol High, Plus subscription |
| BE3 | Billing Foundation | 3 | 1h01 real-time | 36.5M | GPT-5.6 Sol, Plus/trial |
| BE3 | MAINT-01→05 | 5 | 2h22m50 real-time | 56.564626M | GPT-5.6 Sol, Plus/trial |

The `Hy3` label is retained exactly as reported. The provider, exact model identifier, and product surface should be confirmed before formal model-efficiency comparison.

### 5.2 Derived Rates

| Stream | Time/Story | Tokens/Story | Forecast Application |
|---|---:|---:|---|
| BE1 blended | 2.33 hours | 9.00M | Remaining BE1 Dashboard work |
| BE2 combined | 1.57 real-time hours | 1.56M | Reference only; no BE2 backend story remains |
| BE3 Billing | 0.34 real-time hours | 12.17M | Billing-configuration work |
| BE3 Maintenance | 0.48 real-time hours | 11.31M | CRUD, workflow, and history work |
| BE3 combined | 0.42 real-time hours | 11.63M | Payment, Reminder, and Report forecast |
| FE1 Batch 1 | 3.25–3.75 real-time hours/package | 2.625M/package | FE1's remaining five packages |
| FE2 Batch 1 | 3.25–3.50 real-time hours/package | 29.50M/package | FE2's remaining six packages |

The substantial difference in tokens per story does not by itself prove that one model is more efficient. Story complexity, context size, caching, parallel agents, rework, and measurement method differ between streams.

## 6. Time and AI-Usage Estimate

### 6.1 Remaining Backend

The linear estimate is:

- BE1: `2 stories × 2.33 hours ≈ 4.7 hours` and approximately `18M tokens`;
- BE3: `12 stories × 0.42 hours ≈ 5.1 real-time hours` and approximately `139.6M tokens`;
- combined optimistic baseline: **9.8 real-time forecast hours and 157.6M tokens**.

Payment and Report have more cross-module dependencies than the completed BE3 stories. Uncertainty factors are therefore applied:

| Scenario | Remaining Time | Remaining Tokens | Factor |
|---|---:|---:|---:|
| Optimistic | 9.8 hours | 157.6M | 1.0× |
| Expected | 14.6 hours | 236.4M | 1.5× |
| Conservative | 19.5 hours | 315.2M | 2.0× |

### 6.2 Backend Estimate at Completion

Recorded work to date is approximately 60h23m50 in real time and 249.864626M tokens.

| Scenario | Backend Time EAC (real-time forecast) | Backend Token EAC |
|---|---:|---:|
| Optimistic | 70.2 hours | 407.5M |
| Expected | 75.0 hours | 486.3M |
| Conservative | 79.9 hours | 565.1M |

Time EAC is an order-of-magnitude planning value and not a payroll total.

### 6.3 Frontend Estimate

FE1 and FE2 have now supplied separate Batch 1 measurements. FE1 completed four assigned packages using 10.5M tokens in 13–15 real-time hours; FE2 completed four assigned packages using 118.0M tokens in 13–14 real-time hours. The remaining five FE1 packages and six FE2 packages are forecast separately from each member's own measured rate and include an integration/rework reserve. No FE1/FE2 average is used to calculate either member's estimate.

| Scenario | FE1 effort / tokens | FE2 effort / tokens | Combined total (sum only) |
|---|---:|---:|---:|
| Lean | 36.6 h / 29.5M | 40.6 h / 368.8M | 77.2 h / 398.3M |
| Expected | 41.0 h / 30.7M | 43.9 h / 383.5M | 84.9 h / 414.2M |
| Conservative | 47.3 h / 33.1M | 49.0 h / 413.0M | 96.3 h / 446.1M |

With two frontend members providing a combined 30–40 hours per week, this equals approximately:

- 2.6 weeks in the lean case;
- 2.8 weeks in the expected case;
- 3.2 weeks in the conservative case.

For AI-capacity planning only, the measured Batch 1 data provides separate rates:

```text
FE1: 10.5M tokens / 4 packages = 2.625M tokens/package
FE2: 118.0M tokens / 4 packages = 29.50M tokens/package
```

The combined FE values above are sums of the separately calculated FE1 and FE2 forecasts. They are not based on a blended average and remain forecasts, not API charges.

### 6.4 Complete MVP Duration

| Scenario | Duration | Gross Team Capacity | Main Assumption |
|---|---:|---:|---|
| Lean | 8 weeks | 600 hours | Stable free tiers and limited rework |
| Expected | 9 weeks | 787.5 hours | Normal integration and pilot feedback |
| Conservative | 10 weeks | 1,000 hours | Additional integration and deployment reserve |

The expected frontend effort produces a critical path of approximately 5.7 working weeks. When integration, testing, deployment, and pilot preparation are included, the complete MVP estimate remains **8–10 weeks**.

## 7. Resource Estimate

### 7.1 Human Resources

The team consists of five part-time members, each available for approximately 3–4 hours per day, five days per week.

| Resource | Quantity | Estimated Responsibility |
|---|---:|---|
| Backend-focused members | 3 | APIs, schemas, business logic, tests, and integration |
| Frontend/mobile-focused members | 2 | UI, state handling, API integration, and frontend testing |
| Integration responsibility | Shared among the team | API/schema alignment and integration fixes |
| Testing responsibility | Shared among the team | Automated/manual testing and regression checks |
| Deployment responsibility | Shared through GitHub CI/CD | Environment configuration and deployment verification |

One member may perform several activities, but the same hour must not be counted more than once.

### 7.2 AI Resources

| Resource | Current Basis | Estimation Treatment |
|---|---|---|
| GPT-5.6 Sol | ChatGPT Plus/trial | Record agent-active time and token usage |
| `Hy3` | Free access as reported | Record time/tokens; confirm exact model and benefit expiry |
| Concurrent agent sessions | Multiple sessions may be available | Do not convert directly into employee equivalents |
| AI usage data | Detailed for BE3; aggregate for other streams | Maintain provider/model labels |

Free or trial access has zero incremental usage charge while active but creates expiry, quota, and paid-fallback risk.

### 7.3 Technical and External Resources

The MVP may require:

- API/web hosting and managed PostgreSQL;
- file/image storage and bandwidth;
- database backup and recovery;
- transactional email and mobile push notifications;
- PDF generation and VietQR validation;
- GitHub CI/CD, artifact storage, monitoring, and logs;
- domain, DNS, and TLS;
- mobile distribution and pilot support.

The infrastructure estimate should be replaced with provider quotations before production-scale deployment.

## 8. Cost Estimate

### 8.1 Cost Views

| View | Purpose | Labor Treatment |
|---|---|---|
| Cash budget | Money the team or sponsor must fund | Excludes unpaid student labor |
| Economic cost | Full value of resources used to build the MVP | Includes labor at a shadow rate |
| Operating TCO | Cost to operate and maintain the system | Includes recurring services and support |

### 8.2 Development Cash Scenarios

| Category | Lean/Free Tier | Expected | Conservative |
|---|---:|---:|---:|
| AI development tools | 0 while benefits remain active | 1,600,000 | 1,600,000 |
| Cloud infrastructure | 0 with approved credits | 800,000 | 1,200,000 |
| Domain/security | 450,000 | 450,000 | 450,000 |
| Contingency | 500,000 | 427,500 | 812,500 |
| **Estimated total (VND)** | **950,000** | **3,277,500** | **4,062,500** |

The expected contingency is 15% of the cost baseline. The conservative contingency is 25% and covers benefit expiry, provider variation, infrastructure overage, and additional testing usage.

These values are estimates, not approved expenditures. Actual invoices and provider quotations should replace assumptions when available.

### 8.3 AI Cost Treatment

- Token usage included in free/trial or subscription access has zero incremental charge unless overage is purchased.
- Subscription usage must not be multiplied by API prices and charged again.
- If paid APIs are introduced, input, output, cache-read, and cache-write usage should be costed using the applicable rate card.
- Token usage should remain separated by provider and model.

### 8.4 Economic Labor

```text
Economic labor estimate
= Gross team-hours × Approved shadow hourly rate
```

| Shadow Rate | Lean: 600 h | Expected: 787.5 h | Conservative: 1,000 h |
|---:|---:|---:|---:|
| VND 30,000/h | 18,000,000 | 23,625,000 | 30,000,000 |
| VND 50,000/h | 30,000,000 | 39,375,000 | 50,000,000 |
| VND 100,000/h | 60,000,000 | 78,750,000 | 100,000,000 |

This represents the economic value of contributed labor and is separate from the cash budget.

### 8.5 Operating-Cost Formula

The available inputs do not include complete operating-service quotations. First-month operating TCO is therefore represented as:

```text
Monthly operating TCO
= Compute + Database + Storage + Bandwidth + Backup
 + Email/Push + Monitoring/Logging + Domain amortization
 + Support/Maintenance labor + Tax/FX variance
```

## 9. Assumptions and Estimation Risks

### 9.1 Assumptions

- the 51-story backend scope and 19 frontend work packages remain materially stable;
- deployed backend modules do not require major redesign;
- team availability remains 3–4 hours per member per day, five days per week;
- external services are available when dependent work begins;
- trial/student AI benefits remain active during the immediate development period;
- CI/CD remains available for subsequent deployments.

### 9.2 Main Estimation Risks

| Risk | Estimate Impact | Treatment |
|---|---|---|
| Different time definitions | Distorts effort and productivity comparison | Separate human effort, agent time, and cycle time |
| Missing FE measurements | Reduces frontend-estimate confidence | Use bottom-up range and replace with actual data |
| AI benefit expiry or quota | Increases cash cost or delays work | Maintain conservative paid fallback |
| Cross-module dependency | Increases backend and integration duration | Apply 1.5×–2.0× uncertainty factors |
| Infrastructure quotation variance | Changes cash budget | Keep 15%–25% contingency |
| Backlog growth | Increases all estimates | Re-estimate added scope separately |

### 9.3 Required Inputs for Higher Confidence

1. exact provider/model/product surface behind `Hy3`;
2. standardized human-effort and cycle-time logs;
3. FE1/FE2 time and token measurements for the remaining work packages;
4. rework and blocked-time records;
5. subscription invoices and benefit-expiry dates;
6. cloud, database, storage, email, and notification quotations;
7. an approved shadow labor rate.

## 10. Recommended Estimation Baseline

| Dimension | Recommended Baseline |
|---|---|
| Complete MVP duration | 9 weeks expected; 8–10 week range |
| Gross team capacity | 787.5 hours expected; 600–1,000 hour range |
| Remaining backend | 14.6 real-time forecast hours and 236.4M tokens expected |
| Backend token EAC | 486.3M expected; 407.5–565.1M range |
| Frontend effort | 84.9 hours expected; 77.2–96.3 hour range |
| Frontend AI usage | 414.2M expected; 398.3–446.1M range |
| Full implementation AI usage | 900.5M expected; 805.8M–1.0112B range |
| Development cash budget | VND 3,277,500 expected |
| Conservative cash ceiling | Approximately VND 4,062,500 |
| Economic labor | 787.5 hours × approved shadow rate |

This baseline is appropriate for the Software Project Management course context. It provides a concise, evidence-based estimate while clearly separating measured data, assumptions, and uncertainty.
