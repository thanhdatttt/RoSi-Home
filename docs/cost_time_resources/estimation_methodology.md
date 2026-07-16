# Cost–Time–Resources Estimation Methodology — RosiHome

## Document Control

| Field | Value |
|---|---|
| Document | Cost–Time–Resources Estimation Methodology |
| Project | RosiHome |
| Version | 0.3 (Working Draft) |
| Status | Draft for team and sponsor review |
| Last updated | 2026-07-14 |
| Estimation approach | Empirical, flow-based forecasting using Kanban |
| Measurement unit | User story accepted and deployed, supported by effort, cost, and quality measures |
| Prepared by | RosiHome project team |
| Approved by | TBD — Project Sponsor and Project Manager |
| Baseline date | TBD |
| Review frequency | After the pilot, then at least weekly during development |

## 1. Purpose

This document defines how RosiHome will estimate, validate, forecast, and control the cost, time, and resources required to deliver the Minimum Viable Product (MVP).

The methodology intentionally separates:

- the **8–10 week schedule and 4,250,000 VND budget proposed by the sponsor-facing Project Proposal**;
- the **developer forecast derived from observed delivery data**; and
- the **agreed baseline** approved after the sponsor and development team reconcile any differences.

The purpose is not to manufacture a single precise completion date before sufficient evidence exists. It is to create a traceable estimate, expose uncertainty, update the forecast with actual data, and give decision-makers clear options when scope, time, cost, quality, or resource constraints conflict.

## 2. Relationship to Other Project Documents

This methodology uses the following project documents as inputs:

- `docs/project_charter.md` for authorization, objectives, stakeholders, and high-level scope;
- `docs/vision_and_scope.md` for the current MVP boundary, in-scope capabilities, exclusions, assumptions, and risks;
- `docs/proposal.md` for the sponsor-facing schedule and preliminary budget;
- `docs/architecture.md` for the current technical solution and major technology resources; and
- the product backlog and acceptance criteria, once approved, for bottom-up estimation and measurement.

The project team has confirmed that **AI-powered product features are outside the MVP**. AI-assisted development tools remain project resources. Therefore, development-tool usage belongs in the MVP cost estimate, but runtime LLM cost for meter-photo recognition or AI-generated landlord reports does not belong in the MVP cost baseline unless a formal scope change is approved.

If two source documents conflict, the conflict must be recorded in the Statement of Work (SOW) reconciliation table and resolved before the integrated Cost–Time–Resources baseline is approved.

## 3. Estimation Objectives

The methodology must enable the team to:

1. determine the demonstrated rate at which complete user stories can be accepted and deployed;
2. forecast the remaining duration using observed data rather than AI-generated opinion alone;
3. distinguish AI execution time, end-to-end elapsed time, and human effort;
4. calculate both cash cost and the economic value of contributed labor;
5. estimate AI-tool, token, infrastructure, external-service, and recurring operational costs;
6. quantify uncertainty and present forecast confidence levels;
7. identify bottlenecks in review, testing, integration, and deployment;
8. prevent increased agent concurrency from reducing quality or creating excessive rework; and
9. provide evidence for scope, schedule, budget, or resource negotiations with the sponsor.

## 4. Core Principles

### 4.1 Evidence before extrapolation

The initial proposal is treated as a constraint and hypothesis, not proof of delivery capacity. The developer estimate will be calibrated using a representative pilot and continuously updated with actual project data.

### 4.2 Accepted and deployed work is the primary delivery unit

Generated code, lines changed, commits, pull requests, and agent sessions are operational indicators, not delivered value. A user story contributes to delivery throughput only after it satisfies the Definition of Done in Section 8.

### 4.3 Time and effort are different measures

- **Elapsed time** measures calendar or working time from start to accepted deployment.
- **AI active time** measures time during which an AI session is actively processing the story.
- **Human effort** measures person-hours spent specifying, prompting, reviewing, testing, correcting, integrating, deploying, and documenting the story.

Parallel agents may reduce elapsed time while increasing token cost, review effort, merge conflicts, or rework. All dimensions must therefore be measured together.

### 4.4 Forecasts are ranges, not single-point promises

The project will report at least P50, P80, and P90 completion forecasts when sufficient observations exist. A higher percentile represents a more conservative forecast.

### 4.5 Comparable work is required for throughput-based forecasting

Counting stories is meaningful only when stories are sliced to a reasonably consistent scale or separated into comparable work-item classes. Large, dependent, or infrastructure-heavy stories must not be treated as equivalent to small CRUD stories.

### 4.6 Quality is not traded away to improve speed metrics

Acceptance and deployment quality measures are reported beside throughput. A story completed quickly but rejected, rolled back, or heavily reworked is not evidence of sustainable capacity.

## 5. Selected Delivery and Estimation Approach

RosiHome will use **Kanban with empirical flow-based forecasting**.

Kanban is selected because AI-assisted work may complete at irregular intervals and does not need to wait for a fixed sprint boundary. The approach supports continuous pull, explicit work-in-progress (WIP) limits, measurement of cycle time and throughput, and rapid adjustment of story size or agent concurrency.

Scrum ceremonies may still be used selectively when they add value, such as a short backlog review or retrospective. However, two-week sprint velocity will not be the primary estimation unit. Waterfall may be used only for sponsor approval gates and document baselines, not as the day-to-day execution flow.

The minimum Kanban flow measures are:

- Work in Progress (WIP);
- Throughput;
- Work Item Age; and
- Cycle Time.

These are supplemented by human effort, AI usage, cost, acceptance yield, rework, and deployment-stability measures.

## 6. Work Decomposition and Story Classification

### 6.1 Backlog hierarchy

The estimation hierarchy is:

```text
MVP
└── Epic / Business capability
    └── Feature
        └── User story
            └── Implementation and verification tasks
```

Forecasting is performed at user-story level. Tasks support execution but are not independently counted as delivered throughput.

### 6.2 Initial product workstreams

The current MVP is expected to contain the following workstreams:

1. Foundation, environments, CI/CD, and shared architecture;
2. Authentication and role-based access;
3. Property and room management;
4. Tenant and lease management;
5. Utility readings, billing, and invoice generation;
6. VietQR, payment proof, manual verification, and payment history;
7. Maintenance requests and attachments;
8. Notifications;
9. Dashboard and basic reporting;
10. System integration, security, testing, deployment, and documentation.

The final list and the number of user stories remain TBD until the backlog is reviewed.

### 6.3 Work-item classes

Before enough historical data exists, stories will be tagged by dominant work type:

| Class | Typical work |
|---|---|
| A — Simple application flow | Basic form, validation, CRUD, or read-only display using established patterns |
| B — Business rule | Utility calculation, invoice state transition, permission rule, or reminder condition |
| C — Cross-layer integration | UI, API, database, storage, or multiple modules changed together |
| D — External or deployment integration | VietQR, file storage, email/notification provider, CI/CD, hosting, or environment configuration |
| E — Foundation or high-risk change | Authentication, shared schema, security, migration, architectural component, or complex refactor |

Forecasts should use throughput or cycle-time distributions within comparable classes. The project will not assume that one Class A story is equivalent to one Class E story.

### 6.4 Story slicing policy

A user story should normally:

- produce one independently verifiable user or system outcome;
- have explicit acceptance criteria;
- be implementable and testable without an unbounded dependency;
- be small enough to move from `Ready` to `Accepted Done` within a few working days during the pilot; and
- include all required layers for that outcome rather than being split only into frontend, backend, and database tasks.

If a story cannot meet these conditions, it must be split or tagged as an enabling item and forecast separately.

## 7. Kanban Workflow and Explicit Policies

The initial workflow is:

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

Blocked work remains in its current state and receives a `Blocked` flag with a recorded reason and blocked duration.

Initial WIP limits are provisional and must be adjusted using pilot evidence:

| State | Initial WIP policy |
|---|---|
| AI Implementing | No more than the number of isolated agent workspaces approved for the pilot |
| Human Review | No more than available reviewers can review within one working day |
| Testing / Acceptance | No more than available test environments and human validation capacity |
| Integration | One shared integration change at a time unless changes are demonstrably independent |
| Deployment | One controlled deployment at a time during the pilot |

Increasing agent count is permitted only when downstream queues remain within their WIP limits and quality measures do not materially deteriorate.

Although the team's stated theoretical maximum is 13 concurrent agent sessions, the pilot will not begin at that limit. The initial implementation WIP limit is **five stories, with no more than one active implementation story per team member**. Concurrency may be increased in controlled steps only after review, testing, integration, and deployment queues remain stable. This prevents theoretical tool concurrency from being mistaken for demonstrated delivery capacity.

## 8. Definition of Ready and Definition of Done

### 8.1 Definition of Ready (DoR)

A story may enter `Ready for Agent` only when:

- the user, business value, and expected outcome are stated;
- acceptance criteria are specific and testable;
- dependencies and affected modules are identified;
- relevant UI/API/data constraints are available;
- required test data and environment access are available;
- security and authorization expectations are stated where applicable;
- the story is assigned a work-item class; and
- unresolved ambiguity is small enough that implementation can proceed without changing the agreed scope.

### 8.2 Definition of Done (DoD)

A story is `Accepted Done` only when:

- all acceptance criteria pass;
- code is reviewed and approved by a human team member;
- relevant unit, integration, and end-to-end tests pass;
- static checks, build, and CI pass;
- database changes are reversible or have an approved recovery procedure;
- security and role-based access behavior are verified where relevant;
- changes are integrated without unresolved conflicts;
- the target environment deployment succeeds;
- post-deployment smoke tests pass;
- required technical or user documentation is updated; and
- no open severity-1 or severity-2 defect is attributable to the story.

Stories failing any condition remain in progress or are returned for rework. They do not contribute to accepted throughput.

## 9. Empirical Pilot Design

### 9.1 Pilot objective

The pilot will determine how much representative RosiHome work can reach `Accepted Done` using the intended people, AI models, tools, environments, and quality controls.

### 9.2 Duration

The preferred pilot duration is **five working days**. A one-day dry run may be performed first to verify instrumentation and workflow, but it must not be used alone as the final project forecast.

### 9.3 Pilot sample

The sample size is TBD after backlog review. It must include multiple work-item classes and should not contain only easy CRUD stories. At minimum, the sample should exercise:

- an established application pattern;
- a business rule;
- a cross-layer change;
- authentication or authorization behavior;
- automated tests; and
- a real deployment to the selected pilot environment.

### 9.4 Controlled conditions

The following must be recorded and kept as stable as practical:

- repository revision at pilot start;
- model and model version/identifier;
- AI access method: subscription, API, or other plan;
- agent count and concurrency;
- prompts, skills, repository instructions, and context provided;
- development and test environment;
- reviewer identities and availability;
- CI/CD and deployment target; and
- Definition of Ready and Definition of Done versions.

Changes during the pilot must be logged because tool or process changes can invalidate direct comparison.

### 9.5 Parallel work policy

Agents may work in parallel only on stories with sufficiently independent file, schema, and API boundaries. Each modifying agent must use an isolated branch or worktree. Shared contracts must be agreed before parallel implementation begins.

Authentication may be implemented early because many later stories depend on identity and role behavior. This sequencing decision does not require converting the modular monolith into microservices.

The pilot will use a staged concurrency experiment where backlog independence permits:

| Stage | Maximum active agent sessions | Purpose |
|---|---:|---|
| C1 | Up to 5 | Establish one-session-per-member reference throughput and integration behavior |
| C2 | Up to 8 | Test whether additional parallel sessions improve accepted throughput without overloading review and testing |
| C3 | Up to 13 | Test the stated theoretical maximum only if C2 remains stable and account limits permit |

Moving to the next stage requires no material deterioration in acceptance yield, rework ratio, deployment success rate, or blocked time. A stage may be skipped if the selected stories are not independent enough for a valid comparison.

### 9.6 Pilot validity checks

The pilot result must disclose:

- stories carried over or excluded and why;
- environment setup time;
- incidents or service outages;
- unusually easy or difficult stories;
- work completed before the measurement window;
- missing token or effort data;
- reviewer or test-environment bottlenecks; and
- any scope or acceptance criteria changed after implementation began.

## 10. Data Collection Schema

Each pilot and production story must record the following fields where applicable:

| Category | Required data |
|---|---|
| Identity | Story ID, feature, workstream, class, owner, agent/session ID |
| Scope | Acceptance criteria count, affected components, dependency IDs |
| Time | Ready time, start time, code-complete time, review-complete time, deploy time, accepted time |
| AI usage | Provider, model, input tokens, output tokens, cache-write tokens, cache-read tokens, API/agent active duration, estimated and billed cost |
| Human effort | Analysis/prompting, review, test, correction, integration, deployment, and documentation hours by role |
| Flow | Queue time, active time, blocked time, cycle time, number of workflow returns |
| Quality | Tests added, test result, acceptance result, review findings, defects, severity, rework hours |
| Delivery | PR/merge identifier, CI attempts, deployment attempts, deployment result, rollback/hotfix |
| Result | Accepted Done, failed, split, cancelled, or carried over |

Authoritative billing data should be used when available. Locally displayed AI cost is treated as an estimate and must be labeled accordingly.

## 11. Measures and Formulas

### 11.1 Flow and delivery measures

```text
Cycle Time = Accepted timestamp − Work-start timestamp

Throughput = Number of Accepted Done stories / Measurement period

Work Item Age = Current timestamp − Work-start timestamp

Acceptance Yield = Stories accepted on first submission / Stories submitted for acceptance

Deployment Success Rate = Successful deployments / Total deployment attempts

Rework Ratio = Rework human-hours / Total human-hours

Carry-over Rate = Stories not Accepted Done by period end / Stories started in period
```

Throughput will be reported by work-item class as well as in total.

### 11.2 Human productivity and effort measures

```text
Human Touch Time per Story = Total human-hours / Accepted Done stories

Review Effort per Story = Review and correction hours / Accepted Done stories

Human Capacity per Period = Σ(Available hours × Focus factor) by role
```

The focus factor accounts for coursework, meetings, administration, interruptions, and other non-delivery time. Its value is TBD and must be supported by team availability data.

### 11.3 AI usage and concurrency measures

```text
Tokens per Accepted Story = Total measured tokens / Accepted Done stories

AI Cost per Accepted Story = Total AI usage cost / Accepted Done stories

Concurrency Efficiency = Observed throughput with N agents
                         / (N × single-agent reference throughput)
```

Concurrency efficiency must not be assumed to equal 100%. It is measured only when sufficiently comparable trials exist.

### 11.4 Cost measures

```text
Labor Economic Cost = Σ(Hours by role × Shadow hourly rate by role)

AI Token Cost = Σ[(Input tokens × input rate)
                + (Output tokens × output rate)
                + (Cache-write tokens × cache-write rate)
                + (Cache-read tokens × cache-read rate)]

Infrastructure Cost = Fixed plan cost + Usage-based cost + Overage cost

Total Cash Cost = Paid tools + AI/API + Infrastructure + External services
                + Domain/security + Other cash expenses + Contingency

Total Economic Project Cost = Total Cash Cost + Labor Economic Cost
                              + Donated/credited resource value

Total Cost of Ownership = Initial build cost
                        + Recurring operating cost over the selected horizon
                        + Maintenance, support, and upgrade cost
```

All token rates must be normalized to the provider's billing unit, normally price per one million tokens, before calculation.

## 12. Time Forecasting Method

### 12.1 Initial forecast after the pilot

The initial forecast will stratify remaining stories by work-item class and apply demonstrated class-specific throughput or cycle time.

```text
Class Duration Estimate = Remaining stories in class
                        / Demonstrated accepted throughput for that class
```

Class estimates must then be adjusted for dependencies and constrained resources. Durations must not simply be added when work can proceed independently, and must not simply be divided by agent count when work shares reviewers, environments, schemas, APIs, or integration paths.

Separate allowances are required for:

- system integration;
- end-to-end regression testing;
- security and privacy checks;
- User Acceptance Testing (UAT);
- defect correction and stabilization;
- deployment preparation;
- project documentation; and
- final demonstration and handover.

### 12.2 Probabilistic forecast

When enough cycle-time or throughput observations exist, the team will use resampling or Monte Carlo simulation to produce:

- P50 — balanced planning forecast;
- P80 — recommended internal commitment forecast; and
- P90 — conservative sponsor-facing forecast when schedule risk is material.

With only one week of sparse data, confidence will be low and must be disclosed. Forecasts will be updated weekly as observations accumulate.

### 12.3 Sponsor reconciliation

The Project Proposal's 8–10 weeks remains the sponsor constraint until formally changed. After the pilot, the comparison will be documented as:

| Item | Sponsor constraint | Developer forecast | Variance | Proposed resolution | Agreed baseline |
|---|---:|---:|---:|---|---:|
| Scope | Current MVP | TBD | TBD | TBD | TBD |
| Duration | 8–10 weeks | TBD | TBD | Reduce scope, add capacity, extend time, or accept risk | TBD |
| Cash budget | 4,250,000 VND | TBD | TBD | Reallocate, fund, remove cost, or change solution | TBD |
| Quality | High-level requirements | DoD and acceptance measures | TBD | Agree measurable acceptance | TBD |

## 13. Resource Estimation Method

Resources are estimated in four groups.

### 13.1 Human resources

- Project Manager / team lead;
- software developers;
- reviewer or technical lead function;
- QA/test function;
- deployment/operations owner;
- sponsor/supervisor availability;
- pilot landlords and tenants for UAT.

One person may perform multiple roles, but capacity must not be double-counted. The Resource Plan will record availability by week, skills, role, maximum committed hours, leave/exam constraints, and assignment.

The current team profile is:

| Resource | Quantity | Current profile | Capacity status |
|---|---:|---|---|
| Full-stack student developers | 5 | Basic-to-intermediate full-stack capability; no specialist role assigned | 15–20 hours/member/week; 75–100 gross team-hours/week |
| Human reviewers/testers | 5 potential, drawn from the same developers | Peer review and acceptance work must be scheduled separately from implementation | Drawn from the same 75–100 team-hours; must not be added again |
| Project management/coordination | Performed by a team member | Must not be counted as full development availability at the same time | Assignment and hours TBD |

The team expects AI agents to generate approximately 90% of code. This is recorded as an **operating hypothesis**, not as a verified productivity or quality factor. Human accountability remains required for requirements, architecture, review, testing, security, integration, deployment, and acceptance. The pilot will measure generated-code rework and human touch time before this hypothesis is used in forecasting.

### 13.2 AI resources

- provider and plan;
- models used by task type;
- maximum concurrent agents;
- token/rate limits;
- subscription seats;
- API spend limits;
- required skills, prompts, tools, and context;
- isolated worktrees or execution environments.

The current planned AI resource configuration is:

| Provider/product | Team members | Accounts | Machines | Planned model | Stated sessions per member | Theoretical concurrent sessions | Cash-cost treatment |
|---|---:|---:|---:|---|---:|---:|---|
| ChatGPT Plus with Codex desktop/CLI | 2 | 2 | 2 | GPT-5.6 Sol | 2 | 4 | Two paid subscriptions plus any purchased usage credits |
| Google AI Pro student access with Antigravity | 3 | 3 | 3 | Gemini 3.1 Pro | 3 | 9 | Zero incremental subscription cash cost while student benefit remains valid; record credited value and expiry risk |
| **Total** | **5** | **5** | **5** | Mixed-model pool | — | **13 theoretical** | Subject to plan limits and actual usage |

This configuration is a planning assumption as of 2026-07-14. GPT-5.6 Sol availability may vary by rollout and account, Gemini 3.1 Pro is currently documented as a preview model, and both providers apply usage limits that may change. The team must record the exact selectable model, product surface, usage allowance, and reset behavior observed on each account at pilot start.

The mixed-model pool requires provider-specific reporting. Results must not be combined without retaining provider/model labels because capability, latency, limits, and work quality may differ. At minimum, pilot results will report accepted throughput, cycle time, rework, and cost separately for the ChatGPT/Codex and Gemini cohorts before a team-wide total is presented.

#### Subscription measurement rules

- ChatGPT Plus is a fixed cash cost for included usage. If Codex usage credits are purchased after included limits are reached, those credits are recorded as a separate variable cost. The Codex Usage panel is the preferred usage record for these accounts.
- Google AI Pro student access has zero incremental cash cost only while the benefit remains active. Its normal paid or fallback cost must be included in the conservative scenario.
- If a subscription surface does not expose raw input/output token counts, the team must not invent token values. It will record the available unit instead, such as credits, tasks, sessions, prompts, active duration, usage-limit events, and accepted stories.
- API token formulas apply only when token counts and rates are actually available. Subscription and API usage must never be double-counted.

### 13.3 Technical resources

- developer laptops and test phones;
- source control and CI/CD;
- development, test, and pilot environments;
- database and file storage;
- domain and TLS;
- monitoring, logging, backup, and recovery;
- notification/email service;
- test data and security tools.

### 13.4 External resources

- cloud and SaaS providers;
- VietQR standard or QR-generation component;
- app-store accounts if public mobile distribution is approved;
- university credits or student plans;
- pilot-user recruitment and support.

## 14. Cost Estimation Method

### 14.1 Cost views

The project must maintain three views:

| View | Purpose | Includes contributed student labor? |
|---|---|---|
| Cash budget | Determines money the team must actually fund | No, unless paid |
| Economic project cost | Shows the full value of resources consumed | Yes, using shadow rates |
| Operating TCO | Forecasts cost to run and maintain the product | Includes recurring labor and services |

This prevents the phrase “no labor cost” from being misinterpreted as “development requires no valuable labor.”

### 14.2 Labor rates

Shadow hourly rates are TBD. Rates may be established using one of the following, with the chosen basis documented:

- actual compensation, if applicable;
- an approved internal/student-project rate;
- a relevant market-rate benchmark; or
- scenario rates for low, expected, and high cases.

The same basis must be applied consistently. Rates and hours must be reported separately so the estimate remains auditable.

### 14.3 AI development cost

AI development cost must distinguish:

- fixed subscription/seat cost;
- usage credits or API overage;
- input, output, cache-write, and cache-read token cost;
- cost caused by concurrent agents;
- failed/repeated agent runs;
- automated web search or other paid tool calls; and
- any gateway, observability, or telemetry cost.

Subscription usage included in a fixed plan is still recorded as a paid tool cost and, where possible, measured as usage for productivity analysis. It must not also be charged as API usage unless an actual additional API charge occurred.

### 14.4 Infrastructure and external-service cost

The estimate must consider:

- web/API compute;
- managed PostgreSQL;
- file and image storage;
- bandwidth/egress;
- backups and point-in-time recovery;
- monitoring, logs, and error tracking;
- CI/CD minutes and artifact storage;
- email or notification delivery;
- domain registration and renewal;
- TLS where not included;
- mobile distribution fees;
- taxes, card charges, and foreign-exchange variance;
- security scanning and secret management;
- support, maintenance, and incident response.

Free tiers and student credits are recorded both as zero cash outflow and as a dependency with an expiry date, quota, and fallback paid cost.

### 14.5 Time horizons and scenarios

Costs will be reported for:

- pilot week;
- MVP development period;
- first month of pilot operation;
- 12-month operation; and
- a longer horizon if requested by the sponsor.

At least three scenarios will be shown:

- Lean/free-tier;
- Expected pilot; and
- Conservative/paid fallback.

### 14.6 Contingency and management reserve

Known-unknown risks such as token overage, rework, and additional test usage are covered by cost contingency associated with identified risks. Unknown-unknowns may be represented by a separately controlled management reserve if approved.

Contingency must not be used to hide an underestimated baseline. Its calculation basis and owner must be recorded.

## 15. Baseline, Monitoring, and Change Control

### 15.1 Baseline approval

The integrated Cost–Time–Resources baseline may be approved only when:

- MVP scope and exclusions are consistent across governing documents;
- the backlog is sufficiently decomposed and acceptance criteria exist;
- pilot data has been reviewed for validity;
- developer forecasts and sponsor constraints have been reconciled;
- resource availability is confirmed;
- cost rates, price dates, currency, and assumptions are documented; and
- key risks and contingency are included.

### 15.2 Weekly control cycle

Each week, the team will:

1. update actual throughput, cycle time, work-item age, WIP, effort, usage, cost, and quality;
2. compare actuals with the current forecast;
3. identify the largest bottleneck or source of variation;
4. update the completion and cost forecast;
5. record corrective actions; and
6. raise a change request when agreed tolerance is exceeded.

Tolerance thresholds are TBD and will be approved in the SOW or Project Management Plan.

### 15.3 Change triggers

A formal review is required when any of the following occurs:

- an in-scope feature or acceptance condition materially changes;
- AI product features are proposed for inclusion in the MVP;
- the P80 forecast exceeds the agreed completion date;
- expected cash cost exceeds the approved budget or contingency;
- required human or technical capacity becomes unavailable;
- deployment failure or rework materially reduces demonstrated throughput;
- a provider price, quota, or service assumption changes materially.

## 16. Required Outputs

Applying this methodology will produce:

1. Approved and classified MVP backlog;
2. AI-Assisted Development Pilot Plan;
3. Pilot Measurement Log;
4. Pilot Results and Forecast Report;
5. Resource Management Plan;
6. Project Schedule and Time Estimate;
7. Project Cost Estimate and Total Cost of Ownership;
8. Integrated Cost–Time–Resources Baseline;
9. Statement of Work reconciliation and approval table; and
10. Software Development Agreement or internal team agreement, as applicable.

## 17. Methodology Acceptance Criteria

This methodology is ready for approval when:

- the sponsor and development team agree that sponsor constraints and developer forecasts are distinct;
- the MVP AI scope conflict is resolved;
- DoR and DoD are accepted;
- the pilot duration, sample-selection approach, roles, and environments are approved;
- all mandatory measurement fields have an owner and collection mechanism;
- the labor-rate basis and cost views are agreed;
- reporting percentiles and update frequency are agreed; and
- SOW reconciliation and change-control responsibilities are assigned.

## 18. Open Decisions and Data Required

| ID | Required decision/data | Owner | Needed by | Status |
|---|---|---|---|---|
| TBD-01 | Approved MVP backlog and acceptance criteria | Product Owner / Project Manager | Before pilot selection | Open |
| TBD-02 | Runtime AI features excluded from MVP | Sponsor / Project Manager | Confirmed 2026-07-14 | Resolved |
| TBD-03 | Five full-stack members at 15–20 hours/member/week identified; named assignments and PM allocation still required | Project Manager | Before final resource baseline | Partially resolved |
| TBD-04 | Pilot start date and five-day working calendar | Project Manager | Before pilot | Open |
| TBD-05 | Codex desktop/CLI and Antigravity selected; confirm selectable model identifiers, usage allowances, and spend limits on each pilot account | Technical owner | Before pilot | Partially resolved |
| TBD-06 | Five machines and theoretical 13 sessions identified; validate isolated workspaces and staged concurrency C1–C3 | Technical owner | During pilot setup | Partially resolved |
| TBD-07 | Selected hosting, database, storage, and deployment target | Architecture owner | Before infrastructure estimate | Open |
| TBD-08 | Human shadow-rate basis | Sponsor / Project Manager | Before economic cost estimate | Open |
| TBD-09 | VND/USD conversion source and baseline date | Cost owner | Before cost baseline | Open |
| TBD-10 | Pilot reviewers, test owner, and deployment owner | Project Manager | Before pilot | Open |
| TBD-11 | Schedule and cost tolerance thresholds | Sponsor / Project Manager | Before baseline approval | Open |
| TBD-12 | Pilot and UAT landlord/tenant availability | Product Owner | Before validation planning | Open |

## 19. References

- Kanban Guide, flow measures: <https://kanbanguide.pl/en/>
- Official Guide to the Kanban Method, lead time, delivery rate, and WIP: <https://kanban.university/kanban-guide/>
- Scrum Guide 2020, Sprint length and inspection/adaptation: <https://scrumguides.org/scrum-guide.html>
- DORA software delivery performance metrics: <https://dora.dev/guides/dora-metrics/>
- U.S. GAO Cost Estimating and Assessment Guide: <https://www.gao.gov/products/gao-20-195g>
- FAR 37.602, measurable performance work statements: <https://www.acquisition.gov/far/37.602>
- Claude Code cost management and usage tracking: <https://code.claude.com/docs/en/costs>
- Claude Code monitoring and telemetry: <https://code.claude.com/docs/en/monitoring-usage>
- Claude Code subagents and isolated worktrees: <https://code.claude.com/docs/en/sub-agents>
- OpenAI, GPT-5.6 availability by ChatGPT plan and Codex surface: <https://help.openai.com/en/articles/20001354-gpt-56-in-chatgpt/>
- OpenAI, Codex use with ChatGPT plans and shared usage limits: <https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan>
- OpenAI, Codex credit and token-based rate card: <https://help.openai.com/en/articles/20001106>
- Google AI Pro benefits and developer-tool access: <https://support.google.com/googleone/answer/14534406>
- Google, Gemini Apps usage limits: <https://support.google.com/gemini/answer/16275805>
- Google, Gemini 3.1 Pro Preview model documentation: <https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview>
