# Risk Management Plan — RosiHome

**Project:** RosiHome – Property Management Platform for Self-Managing Landlords <br>
**Version:** 2.0 <br>
**Date:** 2026-07-28 <br>
**Prepared by:** RosiHome Development Team

---

## Table of Contents

1. [Objectives](#1-objectives)
2. [Risk Identification](#2-risk-identification)
3. [Risk Analysis](#3-risk-analysis)
4. [Risk Prioritization](#4-risk-prioritization)
5. [Risk Responses](#5-risk-responses)
6. [Decision Trees (Response Analysis)](#6-decision-trees-response-analysis)
7. [Risk Management Plan per Risk Item](#7-risk-management-plan-per-risk-item)
8. [Risk Monitoring](#8-risk-monitoring)

---

## 1. Objectives

- To identify all significant risks to the RosiHome MVP delivery.
- To analyze and quantify the probability and impact of each identified risk.
- To prioritize risks by their Risk Exposure (RE = Probability × Impact).
- To propose and select appropriate risk responses for each risk.
- To create actionable risk management plans following IEEE Std 1540-2001.
- To monitor and track risks throughout the project lifecycle using transition indicators and the Agile risk cycle.

---

## 2. Risk Identification

### 2.1 Why Projects Fail — RosiHome Context

All software projects are unique undertakings with **known unknowns** between planned scope and actual delivery. The project plan explicitly acknowledges an 8–10 week delivery window with five part-time students (3–4 hours/person/day), an AI-assisted Kanban process, and a sequential 4-batch dependency chain. Each of these characteristics introduces distinct failure modes that must be proactively managed.

Informed by the **Software Risk Checklist** from the course slides and cross-referenced against every RosiHome project document (charter, proposal, architecture, product backlog, assignments, project plan, SOW, estimation report, and resource capacity baseline), the following checklist items are directly applicable:

| Checklist Item | Direct Evidence in RosiHome Documents |
|---|---|
| Not enough time | 8–10 week deadline; 127h PERT expected effort (109–161h range); students work part-time ~3–4h/day |
| Unclear requirements | Product Backlog contains items still in "Needs Clarification" status; PD-03 utility pricing decisions were only recently resolved |
| Too many requirement changes | Pilot landlord feedback during UAT may surface new workflow requirements |
| Unrealistic schedules | PERT conservative case = 161h; team capacity = 75–100h/week (total, not coding only); dependency batches must complete sequentially |
| Working on new technology | React Native (mobile), Drizzle ORM, Supabase Storage, Resend email, Expo push, VietQR payload generation, PDF export, cron scheduling |
| Manpower attrition | Five student developers with academic commitments; no specialist DevOps or QA role |
| Slow performance | REPORT-01 to REPORT-05 involve aggregation queries across invoices, payments, leases, and maintenance — complexity score = 4 |
| Problems found too late | Backend-first sequential batch model means frontend issues with earlier batches emerge late |
| Lack of leadership | PM role relies on the team leader; no formal escalation path if the PM is unavailable |
| The indispensable "hero" | Each batch owner controls a non-overlapping domain: Chí (auth/lease), Dat (property/meter/invoice), Minh (maintenance/payment/report) — no cross-coverage by default |
| Iteration abuse | Kanban with no formal sprint boundaries may cause work to drift if WIP limits are not enforced |
| Big, useless meetings | Google Meet + Discord + Messenger coordination overhead identified in project plan Section 10 |

### 2.2 Risk Taxonomy — Identified Risk Categories

Risk identification followed the standard taxonomy:

| Category | RosiHome-Specific Scope |
|---|---|
| **Technical Risks** | Architecture (monolithic Node.js/Express), technology choices (React Native, Drizzle, Supabase), VietQR integration, PDF/push/email external services, CI/CD (GitHub Actions), sequential batch dependencies |
| **Management Risks** | Kanban WIP discipline, dependency-batch sequencing, change control, cross-module API/schema conflicts, documentation completeness |
| **Financial Risks** | AI API token budget (862M token EAC vs. 960M conservative), cloud/hosting costs, Supabase free-tier quotas, student credit expiry |
| **User Acceptance Risks** | Pilot landlord recruitment, digital literacy of the target user (small self-managing landlords), tenant app engagement, UAT coverage |
| **Maintainability Risks** | Post-project ownership, technical debt from AI-generated code, no dedicated DevOps/QA role |
| **Legal / Compliance Risks** | Vietnamese data privacy (tenant PII), VietQR standard compliance (EMVCo format), payment proof liability, US AI service access from Vietnam |

### 2.3 Risk Identification Methods Applied

- **Brainstorming** — Team and AI-assisted identification from prior class issues (not enough time, unclear requirements, lack of leadership, no status reporting).
- **Past Projects Comparison** — Directly cited in the Agile Risk Management slides as the most reliable heuristic: "Previous Classes' Issues."
- **Risk Taxonomies** — Technical, management, financial, user acceptance, maintainability, legal.
- **Assumption Analysis** — Each assumption in the SOW (Section 9) and Project Charter (Section 9) reviewed as a potential risk source.
- **Stakeholder Analysis** — All eight stakeholder risk entries from the Project Charter (Section 5) reviewed and mapped.
- **Resource Capacity Baseline Analysis** — Section 7 of `resource_capacity_baseline.md` explicitly lists six capacity-specific risks.
- **Project Plan Risk Register** — Section 7.2 of `project_plan.md` provides an initial 12-item risk register that has been refined and expanded here.
- **PEST Analysis** — Political, Economic, Social, Technological factors for the Vietnamese rental market.
- **SWOT Analysis** — Project strengths, weaknesses, opportunities, and threats.

### 2.4 PEST Analysis

| Factor | RosiHome-Specific Considerations |
|---|---|
| **Political** | Vietnamese data privacy law applies to tenant PII (ID, phone, payment history); VietQR is a national standard administered by NAPAS — changes require no notice; US AI service export restrictions could restrict Codex/ChatGPT access from Vietnam (explicitly noted in project_plan.md Section 7.2). |
| **Economic** | Cash budget = VND 3,277,500 (expected) to VND 4,062,500 (max); AI token EAC = 862M tokens with a conservative upper bound of 960M; Google student AI access and Supabase free tier are zero-cost but carry expiry and quota risks; no commercial revenue to fund overruns. |
| **Social** | Self-managing landlords (the target users) have variable digital literacy; >40% still rely on manual tools; landlord availability for pilot testing is not guaranteed; tenants may not engage with a new app if their landlord doesn't actively push adoption. |
| **Technological** | React Native introduces platform-specific build issues (iOS vs. Android); VietQR QR payload must conform precisely to EMVCo/NAPAS specifications; Supabase free tier has 500MB database, 1GB storage, and 50,000 monthly active user limits; cron-based scheduled invoicing (PD-04) requires a persistent job runner that may not be available on free-tier hosting (Render/Railway spin-down). |

### 2.5 SWOT Analysis

| | Helpful | Harmful |
|---|---|---|
| **Internal (Strengths / Weaknesses)** | **Strengths:** Five full-stack developers; empirical velocity baseline (1.9 SP/hour from 37 deployed backend stories); AI coding tools (Claude Code, Codex, Gemini); well-documented requirements with 51 user stories, 8 product decisions, and 4 sequential batches; GitHub CI/CD already configured; 37 backend stories already deployed. | **Weaknesses:** All five members are part-time students (3–4h/day); no specialist DevOps or QA; each batch owner is the sole expert in their domain module; academic deadline is non-negotiable; free-tier AI tools carry quota/expiry risk; cron scheduling and PDF export are classified as "AI-generated unfamiliar code" in the complexity scoring. |
| **External (Opportunities / Threats)** | **Opportunities:** Real unmet landlord pain points (>40% using manual tools); VietQR is open standard with no licensing cost; student cloud credits reduce infrastructure costs; growing Vietnamese rental property market; established competitor EasyTro has UI/UX weaknesses the team can target. | **Threats:** US AI service restrictions from Vietnam (low probability, high impact); VietQR NAPAS format change; Supabase/Render/Railway free-tier quota exhaustion or policy change; pilot landlords unavailable or disengaged; AI-generated code introduces security vulnerabilities in auth or payment modules. |

---

## 3. Risk Analysis

### 3.1 Risk Characterization Scales

**Probability Scale:**

| Range | Label |
|---|---|
| 0% – 20% | Remote |
| 21% – 40% | Unlikely |
| 41% – 70% | Likely |
| 71% – 90% | Highly Likely |
| 91% – 100% | Nearly Certain |

**Impact Scale (on cost, schedule, or project viability):**

| Description | Impact Level |
|---|---|
| < 10% of total budget or schedule | Minimal |
| < 15% | Small, acceptable |
| < 50% | Moderate |
| < 60% | Significant |
| >= 60% | Project failure risk |

**Time of Occurrence:**
- **Near-term:** Within the next 2 weeks (Batch 1 / current sprint)
- **Mid-term:** 2–6 weeks from now (Batch 2–3)
- **Long-term:** 6+ weeks / post-delivery

### 3.2 Risk Register

The following 20 risks are derived from cross-analysis of all project documents and the course slide framework.

| ID | Risk Title | Category | Probability (%) | Prob. Label | Cost/Schedule Impact | Time | Source Documents |
|---|---|---|---|---|---|---|---|
| R01 | Academic workload and exam conflicts reduce team availability | Management | 80% | Highly Likely | High (+1–2 weeks delay) | Near | Project Charter, Project Plan §7.2, Resource Baseline §7 |
| R02 | React Native mobile application takes longer than estimated | Technical | 65% | Likely | High (+1–2 weeks) | Near | Architecture, Estimation Report (FE EAC 75h; frontend is critical path) |
| R03 | Frontend becomes the sequential critical-path bottleneck | Management | 60% | Likely | High (blocks integration) | Near | Project Plan §4, §7.2; BE leads FE by one batch |
| R04 | Cross-module API/schema conflict between batch owners | Technical | 60% | Likely | High (+1 week rework) | Near | Project Plan §7.2; Assignments §2–3; three BE owners with non-overlapping domains |
| R05 | Team over-relies on AI-generated code without adequate review | Technical | 60% | Likely | High (defects, security) | Near | Project Plan §7.2, Resource Baseline §3; "AI generates 90% of code" hypothesis (H5) |
| R06 | Cron/scheduled job and email/push notification infrastructure fails or is unavailable | Technical | 55% | Likely | High (blocks INVOICE-01, REMINDER-01, LEASE-05) | Mid | SOW Dependencies; Project Plan §7.2 ("External storage/email/notification service unavailable"); PD-04, PD-05 |
| R07 | Unclear or shifting requirements from pilot landlords during development | Management | 55% | Likely | Medium (+0.5–1 week) | Near | Proposal §8.1; Project Charter §9 (assumptions); Backlog (items in "Needs Clarification") |
| R08 | Scope creep — team adds features beyond the approved Product Backlog | Management | 50% | Likely | Medium (+1 week) | Near | Project Plan §7.2, §8; SOW §4.4 |
| R09 | A batch owner (Chí, Dat, or Minh) becomes unavailable — knowledge silo risk | Management | 45% | Likely | High (critical path broken) | Near | Assignments §2; Project Plan §7.2; Resource Baseline §3, §7 |
| R10 | AI tool quota (tokens/session) exhausted or free plan expires mid-project | Financial | 45% | Likely | Medium (slows delivery) | Near | Resource Baseline §4, §6–7; SOW §8; Project Plan §7.2; EAC = 862M tokens, conservative = 960M |
| R11 | Cannot recruit sufficient pilot landlords for UAT | User Acceptance | 50% | Likely | Medium (+1 week to demo) | Mid | Proposal §8.1; Project Charter §5; Project Plan §7.2 |
| R12 | VietQR QR payload is incorrectly generated or the NAPAS/EMVCo format changes | Technical | 25% | Unlikely | Medium (blocks payment) | Near | Architecture; Backlog US-VIETQR-02 (complexity score 3); Proposal §8.1 |
| R13 | Report and dashboard performance is unacceptable with realistic data volumes | Technical | 40% | Likely | Medium (+1 week) | Mid | Estimation (REPORT complexity score 4); Backlog US-REPORT-02/03; SOW D5 |
| R14 | CI/CD pipeline (GitHub Actions) failure or deployment environment instability | Technical | 40% | Likely | Medium (+0.5 week) | Near | Project Plan §7.2; SOW §4.3; Architecture (Render/Railway free-tier spin-down risk) |
| R15 | Supabase free-tier storage or database quota reached during pilot | Financial | 30% | Unlikely | Medium (blocks file uploads, maintenance photos, payment proofs) | Mid | Architecture §2; Resource Baseline §4; SOW §9 (external service dependency) |
| R16 | Tenant provisions and account onboarding flow (PD-01) is too complex and fails during UAT | User Acceptance | 35% | Unlikely | Medium (core onboarding blocked) | Mid | Backlog PD-01, US-TENANT-02 (SP=8, highest in tenant module); Proposal §4.4 |
| R17 | Fake payment proof screenshot uploaded by tenant — manual verification gap | User Acceptance | 35% | Unlikely | Low (design risk, known limitation) | Long | Proposal §8.1; Architecture §3; Backlog US-PAYMENT-02; Project Charter §10 |
| R18 | US-based AI service (Codex/ChatGPT) becomes inaccessible from Vietnam due to policy changes | Legal / Technical | 20% | Remote | High (loses one cohort's implementation capacity) | Near | Project Plan §7.2 (explicitly noted) |
| R19 | Data privacy violation — tenant PII exposed via API or storage misconfiguration | Legal | 20% | Remote | High (pilot suspended, reputational) | Mid | Backlog Global DoD; Project Charter §5; Proposal §5.4 |
| R20 | No team member agrees to maintain the application after the course ends | Maintainability | 70% | Highly Likely | Low (post-delivery) | Long | Proposal §5.1, §8.1; SOW §4.4 |

---

## 4. Risk Prioritization

### 4.1 Risk Exposure Formula

> **Risk Exposure (RE) = Probability × Impact (Cost/Schedule in VND or equivalent weeks)**

Risk Exposure is the average expected loss. Higher RE = higher priority. Time of occurrence is used as a tiebreaker — near-term risks of equal RE rank higher.

### 4.2 Quantified Impact Reference

The project's total cash budget is VND 3,277,500 and total schedule is 9 weeks (63 working days). The impact values below are estimated from these baselines.

| ID | Risk | Probability (P) | Impact (C, VND) | RE = P × C | Time | Priority |
|---|---|---|---|---|---|---|
| R01 | Academic workload reduces availability | 0.80 | 500,000 | **400,000** | Near | High |
| R02 | React Native mobile overrun | 0.65 | 600,000 | **390,000** | Near | High |
| R03 | Frontend is critical-path bottleneck | 0.60 | 600,000 | **360,000** | Near | High |
| R04 | Cross-module API/schema conflict | 0.60 | 550,000 | **330,000** | Near | High |
| R05 | Over-reliance on AI code without review | 0.60 | 500,000 | **300,000** | Near | High |
| R06 | Cron/email/push infrastructure unavailable | 0.55 | 500,000 | **275,000** | Mid | High |
| R09 | Batch owner unavailable — knowledge silo | 0.45 | 600,000 | **270,000** | Near | High |
| R07 | Unclear / shifting requirements | 0.55 | 400,000 | **220,000** | Near | Medium |
| R10 | AI token quota exhausted / plan expires | 0.45 | 400,000 | **180,000** | Near | Medium |
| R08 | Scope creep | 0.50 | 300,000 | **150,000** | Near | Medium |
| R13 | Report/dashboard performance | 0.40 | 350,000 | **140,000** | Mid | Medium |
| R14 | CI/CD or deployment failure | 0.40 | 300,000 | **120,000** | Near | Medium |
| R11 | No pilot landlords for UAT | 0.50 | 200,000 | **100,000** | Mid | Medium |
| R16 | Tenant onboarding flow fails UAT | 0.35 | 250,000 | **87,500** | Mid | Medium |
| R15 | Supabase quota reached | 0.30 | 200,000 | **60,000** | Mid | Low |
| R12 | VietQR format incorrect or changes | 0.25 | 250,000 | **62,500** | Near | Low |
| R17 | Fake payment screenshots | 0.35 | 0 (design) | **0** | Long | Low |
| R18 | US AI service inaccessible from Vietnam | 0.20 | 500,000 | **100,000** | Near | Medium |
| R19 | Data privacy / tenant PII violation | 0.20 | 400,000 | **80,000** | Mid | Low |
| R20 | No post-project owner | 0.70 | 0 (post-delivery) | **0** | Long | Noted |

### 4.3 Risk Matrix

|  | LOW IMPACT | MEDIUM IMPACT | HIGH IMPACT |
|---|---|---|---|
| **HIGHLY LIKELY (71–90%)** | R20 | — | R01 |
| **LIKELY (41–70%)** | R08, R11 | R07, R10, R13, R14 | R02, R03, R04, R05, R06, R09 |
| **UNLIKELY (21–40%)** | R17 | R12, R15, R16 | — |
| **REMOTE (0–20%)** | — | — | R18, R19 |

> **High-priority zone (top-right):** R01, R02, R03, R04, R05, R06, R09 — these seven risks are the critical management targets for this project.

---

## 5. Risk Responses

### 5.1 Response Strategy Options

| Strategy | Definition |
|---|---|
| **Acceptance** | Acknowledge the risk; take no preemptive action; develop contingency plan for when the risk occurs. |
| **Avoidance** | Eliminate the conditions that allow the risk — most frequently by removing the task, scope item, or dependency. |
| **Deflection** | Transfer the risk (in whole or part) to another organization, individual, or entity (e.g., vendor SLAs, supervisor escalation). |
| **Mitigation** | Minimize the probability of occurrence or the impact should the risk occur. |

### 5.2 Selected Response per Risk

| ID | Risk | Strategy | Primary Response |
|---|---|---|---|
| **R01** | Academic workload | **Mitigation** | Maintain 8–10 week range; use Week 10 as schedule contingency (not additional scope); daily stand-ups; PM rebalances assignments when a member is constrained. |
| **R02** | Mobile overrun | **Mitigation** | Build a walking-skeleton mobile vertical slice (login → invoice view → QR scan) in first mobile sprint; detect surprises at Week 4 before they consume the whole schedule. |
| **R03** | Frontend bottleneck | **Mitigation** | Build shared UI components and navigation in parallel with backend Batch 1; integrate each batch incrementally rather than waiting for all backend work; FE1 and FE2 begin UI scaffolding before APIs are stable using API contracts. |
| **R04** | API/schema conflict | **Mitigation** | Agree and document data contracts before each batch implementation starts; affected-owner mandatory review on all shared schema/API changes; one integration lane at a time. |
| **R05** | AI code over-reliance | **Mitigation** | Every PR requires: author explanation of business/security logic, one non-author reviewer approval, and relevant tests that pass; Dev 4 (Security/external-service owner per assignments) performs security-sensitive story review. |
| **R06** | Cron/email/push unavailable | **Mitigation** | Define interfaces and development adapters (stubs) for email, push, cron, and PDF before Batch 3 begins; isolate provider configuration so the service can be swapped; test with real external service before REMINDER-01 and LEASE-05 reach Done. |
| **R07** | Unclear requirements | **Mitigation** | Resolve all "Needs Clarification" stories before their batch starts; hold a requirements workshop with at least one landlord representative before Batch 2; use experience and logic to make bounded assumptions and document them. |
| **R08** | Scope creep | **Avoidance** | Formal change control per Project Plan §8 and SOW §10; no feature added without PM + Sponsor approval and team consensus; all new ideas go to a "later" list. |
| **R09** | Batch owner unavailable | **Mitigation** | Mandatory documentation of each batch owner's module; cross-review so at least one other member reviews every story; PM assigns backup module owners before Batch 1 starts. |
| **R10** | AI quota exhaustion | **Mitigation + Acceptance** | Monitor weekly usage against the 862M token EAC; switch to lower-cost or free-tier models when credits approach 80% of budget; the VND contingency covers moderate overruns. |
| **R11** | No pilot landlords | **Mitigation** | Start landlord outreach in Week 1 via personal networks, Zalo landlord groups, Facebook communities; target minimum 3 confirmed landlords by Week 6. |
| **R12** | VietQR format issue | **Mitigation** | Implement against official VietQR EMVCo specification; automated format check in CI; test with Vietcombank, Techcombank, and MBBank apps before VIETQR-02 is marked Done. |
| **R13** | Report performance | **Mitigation** | Design dashboard and report queries to use indexed foreign keys from the start; add pagination and date-range filtering to REPORT-01; conduct performance testing with representative data volume before Batch 4 acceptance. |
| **R14** | CI/CD failure | **Mitigation** | Retain previous deployable revision; fix failed checks before merge/deployment per project plan §9.2; maintain local dev environment as demo fallback. |
| **R15** | Supabase quota | **Mitigation + Acceptance** | Monitor Supabase dashboard weekly; compress uploaded images client-side before upload; delete test/duplicate files during development; upgrade plan or switch provider if quota is reached — the contingency budget covers a one-month upgrade. |
| **R16** | Tenant onboarding fails UAT | **Mitigation** | Early usability walkthrough of the tenant provisioning flow (PD-01) with at least one proxy user before UAT; ensure the email delivery of temporary passwords (US-TENANT-02) is tested end-to-end before Batch 2 acceptance. |
| **R17** | Fake payment screenshots | **Acceptance** | Known design limitation, explicitly documented in the Project Charter and Proposal. Include a clear UI disclaimer. Landlord is responsible for verifying payment in their own banking app before confirming. |
| **R18** | US AI service inaccessible | **Mitigation** | Prepare alternative providers (Google Gemini, Claude); maintain local project context and backlog so any model can be substituted; OpenAI cohort has documented fallback to Antigravity (per resource baseline §4); prioritize critical-path stories. |
| **R19** | Data privacy violation | **Mitigation** | Use synthetic test data during development; HTTPS on all API endpoints; JWT authorization enforced per story DoD; never log or expose passwords, tokens, or cross-tenant data; basic privacy notice before pilot. |
| **R20** | No post-project owner | **Avoidance / Acceptance** | Decide explicitly with supervisor before Week 8: Option A (clean archive at demo day) or Option B (one volunteer maintains post-graduation). Document the decision. Default to Option A if unresolved. |

---

## 6. Decision Trees (Response Analysis)

Decision trees evaluate the expected cost of acceptance vs. mitigation for the three highest-RE risks.

### 6.1 R01 — Academic Workload Schedule Slip (P = 80%, Loss = 500,000 VND)

```
R01: Schedule Slip
+-- Acceptance (no action)
|   +-- Slip occurs     (80%) --> Loss = 500,000 VND
|   +-- No slip         (20%) --> Loss = 0 VND
|   Expected Value = 0.80 x 500,000 = 400,000 VND
|
+-- Mitigation: Daily stand-ups + Week 10 as contingency + rebalancing
    Mitigation cost = ~50,000 VND (coordination effort)
    +-- Slip still occurs  (25%) --> Loss = 500,000 + 50,000 = 550,000 VND
    +-- Slip averted       (75%) --> Loss = 50,000 VND
    Expected Value = 0.25 x 550,000 + 0.75 x 50,000 = 175,000 VND

Mitigation preferred: 175,000 VND < 400,000 VND
Risk Reduction Leverage (RRL) = (400,000 - 175,000) / 50,000 = 4.5
(Every 1 VND spent on mitigation saves 4.5 VND in expected loss)
```

### 6.2 R04 — Cross-Module API/Schema Conflict (P = 60%, Loss = 550,000 VND)

```
R04: API/Schema Conflict
+-- Acceptance (no contract agreement)
|   Expected Value = 0.60 x 550,000 = 330,000 VND
|
+-- Mitigation A: Pre-batch data contract review (Cost = ~60,000 VND)
|   +-- Conflict still occurs  (20%) --> Loss = 550,000 + 60,000 = 610,000 VND
|   +-- Conflict averted       (80%) --> Loss = 60,000 VND
|   Expected Value = 0.20 x 610,000 + 0.80 x 60,000 = 122,000 + 48,000 = 170,000 VND
|   RRL = (330,000 - 170,000) / 60,000 = 2.67
|
+-- Mitigation B: Contract review + integration owner per batch (Cost = ~100,000 VND)
    +-- Conflict still occurs  (8%)  --> Loss = 550,000 + 100,000 = 650,000 VND
    +-- Conflict averted       (92%) --> Loss = 100,000 VND
    Expected Value = 0.08 x 650,000 + 0.92 x 100,000 = 52,000 + 92,000 = 144,000 VND
    RRL = (330,000 - 144,000) / 100,000 = 1.86

Mitigation A preferred for cost-benefit: RRL = 2.67 (lower cost, better leverage)
Mitigation B preferred if integration quality is a top concern (lowest expected value)
```

### 6.3 R06 — Cron/Email/Push Infrastructure (P = 55%, Loss = 500,000 VND)

```
R06: External Service Unavailable
+-- Acceptance (no interface design)
|   Expected Value = 0.55 x 500,000 = 275,000 VND
|
+-- Mitigation: Define interfaces + development adapters before Batch 3
    Cost = ~80,000 VND (interface design + stub implementation)
    +-- Service still unavailable  (15%) --> Loss = 500,000 + 80,000 = 580,000 VND
    +-- Risk averted               (85%) --> Loss = 80,000 VND
    Expected Value = 0.15 x 580,000 + 0.85 x 80,000 = 87,000 + 68,000 = 155,000 VND
    RRL = (275,000 - 155,000) / 80,000 = 1.5

Mitigation preferred: 155,000 VND < 275,000 VND
```

---

## 7. Risk Management Plan per Risk Item

Each plan follows the IEEE Std 1540-2001 format: **Why, What, When, Who, Where, How, How Much.**

---

### RP-01 — Academic Workload Reduces Availability

| Field | Detail |
|---|---|
| **Risk** | R01 — Schedule slips due to academic workload, exams, and coursework conflicts |
| **Priority** | High (RE = 400,000 VND) |
| **Why (Objective)** | Deliver the MVP within the 8–10 week window without sacrificing quality or deferring demo-day commitments. |
| **What (Deliverables)** | Daily stand-up log; sprint burndown (per batch); scope cut list if velocity drops. |
| **When (Milestones)** | Reviewed daily at stand-up; full assessment at each batch boundary (Weeks 2–3, 5, 7, 8). |
| **Who** | PM monitors velocity; all five members report blockers and availability changes. |
| **How (Approach)** | Maintain 8–10 week range as the schedule baseline; treat Week 10 as contingency, not automatic additional scope. Daily 10-minute async stand-up. Rebalance assignments when a member signals reduced availability. Cut non-essential stories (notifications, PDF export, analytics) before cutting the deadline. |
| **How Much** | ~50,000 VND in coordination overhead; within existing budget. |
| **Transition Indicator** | Any batch burndown shows > 30% tasks incomplete by the batch midpoint. |
| **Contingency** | PM escalates to supervisor; remove lowest-priority backlog items (REPORT-04, REPORT-05, US-REMINDER-02) from scope; extend pilot phase rather than delay demo. |

---

### RP-02 — React Native Mobile Overrun

| Field | Detail |
|---|---|
| **Risk** | R02 — Mobile app (React Native + Expo) takes longer than estimated |
| **Priority** | High (RE = 390,000 VND) |
| **Why (Objective)** | Keep mobile delivery within the planned 2-batch FE window (Weeks 3–8) without blocking system integration testing. |
| **What (Deliverables)** | Walking-skeleton mobile app (login → invoice view → QR) by end of FE Batch 1; feature-complete by FE Batch 3. |
| **When (Milestones)** | Walking skeleton: end of Week 5; fully integrated: end of Week 8. |
| **Who** | FE1 (MXH) and FE2 (Quân); PM monitors weekly. |
| **How (Approach)** | Build a thin end-to-end vertical slice in the first FE sprint to surface React Native/Expo surprises early. Use AI tools to scaffold screens from the shared design system. Reuse API business logic via the shared REST API. Begin UI scaffolding in parallel with BE Batch 1 using agreed contracts. |
| **How Much** | ~80,000 VND in extra planning; within existing budget. |
| **Transition Indicator** | Walking skeleton not functional or not integrated with development API by end of Week 5. |
| **Contingency** | Reduce tenant-facing features to read-only (view invoices, lease info) for MVP; defer REPORT-02/03 and maintenance history UI to post-pilot. |

---

### RP-03 — Frontend Critical-Path Bottleneck

| Field | Detail |
|---|---|
| **Risk** | R03 — Frontend consistently lags one-batch behind backend, becoming the delivery bottleneck |
| **Priority** | High (RE = 360,000 VND) |
| **Why (Objective)** | Prevent the sequential BE-leads-FE batch model from creating a frontend backlog that delays MVP candidate status. |
| **What (Deliverables)** | Integrated and verified FE batch per batch boundary (not "all FE at once"). |
| **When (Milestones)** | FE Batch 1 integrated: Week 5; FE Batch 2: Week 7; FE Batch 3: Week 8; FE Batch 4: Week 9. |
| **Who** | FE1 (MXH), FE2 (Quân); batch integration owner appointed at each boundary. |
| **How (Approach)** | Build shared UI components and navigation during BE Batch 1 (FE pre-work). Define API contracts before BE implementation so FE can use mocks. Integrate each batch rather than building all FE screens then integrating all at once. |
| **How Much** | No additional cash cost; time management discipline. |
| **Transition Indicator** | Two consecutive batches show FE integration pending at BE batch completion. |
| **Contingency** | Add a dedicated integration sprint (Week 9 already planned for system integration testing); PM temporarily shifts one BE member to support FE integration if blocked. |

---

### RP-04 — Cross-Module API/Schema Conflict

| Field | Detail |
|---|---|
| **Risk** | R04 — API or database schema changes by one batch owner break another owner's dependent module |
| **Priority** | High (RE = 330,000 VND) |
| **Why (Objective)** | Prevent merge conflicts and rework caused by incompatible schema or API changes, especially across the three non-overlapping BE domains (Chí: auth/lease; Dat: property/meter/invoice; Minh: maintenance/payment/report). |
| **What (Deliverables)** | Pre-batch API and data contract agreements; mandatory affected-owner PR review for shared schema changes. |
| **When (Milestones)** | Contract agreement completed before each batch starts (before Weeks 2, 4, 6, 8). |
| **Who** | Batch integration owner (named per batch per Project Plan §6.3); PM resolves conflicts. |
| **How (Approach)** | Hold a pre-batch contract meeting; document API contracts and Drizzle schema changes in the PR before merge; all changes to shared database tables require approval from every affected module owner. Use separate feature branches/worktrees per story to isolate merge conflicts. |
| **How Much** | ~60,000 VND in planning meeting effort; within budget. |
| **Transition Indicator** | More than one merge conflict involving shared schema or API types in the same batch. |
| **Contingency** | Named integration owner resolves the conflict with both affected owners immediately; block the dependent story until the conflict is resolved; do not merge partial fixes. |

---

### RP-05 — Over-Reliance on AI-Generated Code

| Field | Detail |
|---|---|
| **Risk** | R05 — Team accepts AI-generated code without adequate review, introducing security vulnerabilities, business logic errors, or unmanageable technical debt |
| **Priority** | High (RE = 300,000 VND) |
| **Why (Objective)** | Ensure every merged story meets the Global Definition of Done, including authorization, ownership, and security requirements, regardless of whether code was AI-generated. |
| **What (Deliverables)** | PR review checklist; author explanation of business/security logic; CI test coverage. |
| **When (Milestones)** | Review policy in place before Batch 1 coding begins. |
| **Who** | All five developers; reviewer is always a non-author; Dev 4 (security/external-service owner) reviews auth, JWT, payment, and PII-handling stories. |
| **How (Approach)** | Every PR must include: (1) author comment explaining AI-generated business or security logic, (2) non-author reviewer approval, (3) automated tests covering the main success and authorization paths. Follow the project plan's Implementation Procedure (§3.3). Weekly team code walkthrough for complex modules. |
| **How Much** | No additional cash cost; built into team review overhead (~25% of capacity per resource baseline). |
| **Transition Indicator** | A merged PR contains AI-generated business or authorization logic with no test coverage and no author explanation. |
| **Contingency** | Revert the merge; pair-program with the author to rewrite and understand the affected section; add missing tests before re-merging. |

---

### RP-06 — Cron/Email/Push/PDF Infrastructure Unavailable

| Field | Detail |
|---|---|
| **Risk** | R06 — External services required for scheduled invoice generation, lease/payment reminders, and PDF export are unavailable, misconfigured, or behave differently in production |
| **Priority** | High (RE = 275,000 VND) |
| **Why (Objective)** | Prevent Batch 3 (INVOICE-01, VIETQR-02, REMINDER-01/02) and Batch 4 (REPORT-05 PDF export) from being blocked by an unready external integration. |
| **What (Deliverables)** | Provider interface definitions; development adapters (stubs); end-to-end tests with real providers before batch acceptance. |
| **When (Milestones)** | Interface definitions: before Batch 2 ends (Week 5); real provider tested: before INVOICE-01 moves to Done (Week 6). |
| **Who** | Dev 4 (Security and external-service foundation owner per assignments); Dev 5 (PDF generation interface owner). |
| **How (Approach)** | Define provider interfaces early (Batch 0); implement development adapters so stories can be coded and tested without live external services; validate real provider integration (Resend email, Expo push, Render cron) before Batch 3 stories reach the Done state. |
| **How Much** | No additional cash cost; interface design is included in existing story effort estimates. |
| **Transition Indicator** | A REMINDER or LEASE-05 story reaches implementation without a tested provider connection. |
| **Contingency** | Switch to an alternative provider (SendGrid for email, Firebase Cloud Messaging for push) if the primary fails; defer automated reminders to manual-send UI (US-REMINDER-02) if scheduler cannot be made reliable within the schedule. |

---

### RP-07 — Unclear or Shifting Requirements

| Field | Detail |
|---|---|
| **Risk** | R07 — Backlog items in "Needs Clarification" status remain unresolved when their batch starts, or pilot landlord feedback introduces late-stage scope changes |
| **Priority** | Medium (RE = 220,000 VND) |
| **Why (Objective)** | Prevent mid-batch rework caused by unresolved product decisions (similar to PD-03 utility pricing) or late landlord feedback. |
| **What (Deliverables)** | All "Needs Clarification" items resolved before their batch; change request log. |
| **When (Milestones)** | Batch-level readiness review at each batch kickoff; change log maintained continuously. |
| **Who** | PM manages resolution; landlord representative reviews and approves. |
| **How (Approach)** | Hold a pre-batch readiness review; resolve "Needs Clarification" items using experience and bounded assumptions documented in the backlog decision record (Section 3 of the Product Backlog); formal change request for any post-sign-off additions. |
| **How Much** | ~60,000 VND in interview/workshop effort. |
| **Transition Indicator** | More than 2 new or changed requirements raised after a batch's backlog is signed off. |
| **Contingency** | Queue all post-sign-off changes to the "later" backlog; notify supervisor if changes threaten the milestone. |

---

### RP-08 — Scope Creep

| Field | Detail |
|---|---|
| **Risk** | R08 — Team adds features outside the approved 51-story Product Backlog |
| **Priority** | Medium (RE = 150,000 VND) |
| **Why (Objective)** | Protect the 8–10 week timeline by restricting work to the approved scope. |
| **What (Deliverables)** | Frozen MVP backlog; "later" feature list; change request log. |
| **When (Milestones)** | Scope freeze from Day 1; change control applied from the first sprint. |
| **Who** | PM enforces; requires Sponsor approval for any baseline change. |
| **How (Approach)** | Any feature idea not in the approved backlog goes to the "later" list; formal change request required per Project Plan §8 and SOW §10; no feature is implemented without team consensus and Sponsor approval. |
| **How Much** | No additional cash cost. |
| **Transition Indicator** | A story or feature not in the approved backlog appears in the active batch or CI commit. |
| **Contingency** | Remove immediately; log as a deferred change request; re-baseline only after Sponsor approval. |

---

### RP-09 — Batch Owner Unavailability (Knowledge Silo)

| Field | Detail |
|---|---|
| **Risk** | R09 — A named batch owner (Chí, Dat, or Minh) becomes unavailable, leaving their non-overlapping domain with no successor |
| **Priority** | High (RE = 270,000 VND) |
| **Why (Objective)** | Prevent a single team member's unavailability from blocking an entire domain batch. |
| **What (Deliverables)** | Module documentation wiki; backup owner matrix; cross-review logs. |
| **When (Milestones)** | Documentation current per story; backup owners assigned before Batch 1; cross-training by Week 3. |
| **Who** | All team members; PM assigns backup owners before batch start. |
| **How (Approach)** | Atomic commits with meaningful messages; mandatory PR cross-review (reviewer must be from a different domain); PM maintains a backup owner matrix; each member documents their module's API, migration, and business logic before the next batch starts. |
| **How Much** | No additional cost. |
| **Transition Indicator** | A batch owner misses 3+ consecutive days without handover documentation. |
| **Contingency** | Backup owner takes over using documented artifacts; PM redistributes the remaining stories across available members; notify supervisor if impact exceeds one batch boundary. |

---

### RP-10 — AI Token Quota Exhausted or Plan Expires

| Field | Detail |
|---|---|
| **Risk** | R10 — AI provider token quotas (OpenAI/Google) are consumed before project completion, or free/student plan benefits expire |
| **Priority** | Medium (RE = 180,000 VND) |
| **Why (Objective)** | Maintain AI-assisted development velocity throughout all four batches (EAC = 862M tokens; conservative = 960M). |
| **What (Deliverables)** | Weekly AI usage tracking report; spend alert thresholds configured. |
| **When (Milestones)** | Weekly review; alert at 80% of each cohort's budget. |
| **Who** | PM monitors; each developer tracks their own cohort usage. |
| **How (Approach)** | Monitor usage weekly against the 862M token EAC; use lower-cost model tiers (Gemini Flash, Claude Haiku) for routine CRUD stories; reserve premium models for complex stories; the contingency reserve (VND 500,000) covers moderate API overruns. |
| **How Much** | VND 500,000 contingency reserve already budgeted. |
| **Transition Indicator** | Any cohort's token usage exceeds 80% of its allocated budget before Batch 3 starts. |
| **Contingency** | Switch affected cohort to free-tier or lower-cost model; apply for additional student credits; fall back to manual implementation for simple CRUD stories if necessary. |

---

### RP-11 — Insufficient Pilot Landlords for UAT

| Field | Detail |
|---|---|
| **Risk** | R11 — Cannot recruit enough real landlords to validate the core workflow during User Acceptance Testing |
| **Priority** | Medium (RE = 100,000 VND) |
| **Why (Objective)** | Confirm that the MVP satisfies real landlord workflows with at least 3 pilot participants before the final demonstration. |
| **What (Deliverables)** | Landlord recruitment list; UAT session notes; consent forms. |
| **When (Milestones)** | Begin outreach Week 1; confirm 3 landlords by Week 6. |
| **Who** | PM leads; all team members contribute via personal networks. |
| **How (Approach)** | Reach out immediately via personal contacts; post in Zalo/Facebook landlord groups; engage local boarding-house communities; do not wait for the app to be finished before starting outreach. |
| **How Much** | No cash cost; PM time. |
| **Transition Indicator** | Fewer than 2 confirmed landlords by Week 5. |
| **Contingency** | Use team members' family members or landlord-adjacent users (property managers, accounting students) as proxy participants; conduct a narrated walkthroughs demonstration with the supervisor. |

---

### RP-12 — VietQR Format Incorrect or Changed

| Field | Detail |
|---|---|
| **Risk** | R12 — VietQR QR payload (US-VIETQR-02, complexity score 3) is incorrectly generated, or NAPAS updates the EMVCo format |
| **Priority** | Low (RE = 62,500 VND) |
| **Why (Objective)** | Ensure the payment QR code parses correctly in all major Vietnamese banking apps. |
| **What (Deliverables)** | VietQR format test suite; banking app compatibility list (Vietcombank, Techcombank, MBBank). |
| **When (Milestones)** | QR integration tested before VIETQR-02 is marked Done (Batch 3, Week 6). |
| **Who** | Dev 3 (Minh — payment module owner). |
| **How (Approach)** | Implement strictly against VietQR/NAPAS official documentation; include automated QR payload format check in CI; test generated codes with at least 3 banking apps before acceptance. |
| **How Much** | No additional cost. |
| **Transition Indicator** | QR code fails to parse in any banking app during testing. |
| **Contingency** | Display pre-filled bank account details (bank name, account number, amount, reference) as a plain text fallback if QR generation fails. |

---

### RP-13 — Report and Dashboard Performance

| Field | Detail |
|---|---|
| **Risk** | R13 — Dashboard (US-DASH-02, DASH-03) and Report (US-REPORT-02/03, complexity score 4) queries are slow with realistic data, blocking Batch 4 acceptance |
| **Priority** | Medium (RE = 140,000 VND) |
| **Why (Objective)** | Deliver performant business reports and dashboards that are acceptable to pilot landlords with 5–30 rooms. |
| **What (Deliverables)** | Performance test results with representative data (5–30 rooms × 3–6 months); indexed query plan. |
| **When (Milestones)** | Performance validated before REPORT-01 acceptance (Batch 4, Week 8). |
| **Who** | Dev 3 (Minh — report owner); Dev 2 (Dat — dashboard 03/04 owner). |
| **How (Approach)** | Use indexed foreign keys in Drizzle schema from the start; add pagination and date-range filtering to all report endpoints; seed realistic test data before Batch 4; profile slow queries using Supabase query analyzer. |
| **How Much** | No additional cash cost. |
| **Transition Indicator** | Any report or dashboard query takes > 3 seconds with the pilot data set. |
| **Contingency** | Add database indexes for the slow query; defer the slowest report variant (e.g., REPORT-03 occupancy/churn) to a post-MVP optimization story. |

---

### RP-14 — CI/CD or Deployment Failure

| Field | Detail |
|---|---|
| **Risk** | R14 — GitHub Actions CI fails consistently or the hosting environment (Render/Railway) is unavailable, blocking story acceptance |
| **Priority** | Medium (RE = 120,000 VND) |
| **Why (Objective)** | Maintain a continuously deployable baseline that all five team members can validate against. |
| **What (Deliverables)** | CI pipeline; previous-revision rollback procedure; local demo environment. |
| **When (Milestones)** | CI verified at Batch 0 (infrastructure setup); validated before each batch deployment. |
| **Who** | Dev 5 (Quality/delivery foundation owner, per assignments); PM is release owner. |
| **How (Approach)** | Fix failed CI checks before merge per DoD; retain previous deployable revision; configure the deployment pipeline to deploy only on passing builds; maintain a local environment as a demo fallback (critical for demo day if cloud is down). |
| **How Much** | No additional cost. |
| **Transition Indicator** | CI fails for > 24 hours without a fix in progress; deployment to the agreed environment fails twice consecutively. |
| **Contingency** | Roll back to previous revision; identify and fix the root cause before resuming merges; use local environment for demo if cloud deployment cannot be recovered in time. |

---

### RP-15 — Supabase Free-Tier Quota Reached

| Field | Detail |
|---|---|
| **Risk** | R15 — Supabase free-tier limits (500MB DB, 1GB storage, 50k MAU) are reached during development or pilot, blocking file uploads and database operations |
| **Priority** | Low (RE = 60,000 VND) |
| **Why (Objective)** | Keep cloud infrastructure operational throughout the 8–10 week development and pilot period. |
| **What (Deliverables)** | Weekly Supabase usage report; image compression implementation. |
| **When (Milestones)** | Usage monitored from Batch 2 when maintenance photos and payment proofs are introduced. |
| **Who** | Dev 2 (Dat — database foundation owner); Dev 4 (storage/external-service owner). |
| **How (Approach)** | Compress maintenance and payment proof images client-side before upload; delete test/duplicate files during development; monitor Supabase dashboard weekly; delete stale pilot accounts before demo. |
| **How Much** | ~100,000 VND for one month of Supabase Pro if free tier is reached (within contingency). |
| **Transition Indicator** | Supabase dashboard shows > 80% of any free-tier limit consumed. |
| **Contingency** | Upgrade to Supabase Pro (paid); alternatively migrate storage to a different provider bucket. |

---

### RP-16 — Tenant Onboarding Flow Fails UAT

| Field | Detail |
|---|---|
| **Risk** | R16 — The PD-01 tenant provisioning flow (email temporary password, app install, first login) is too complex for real tenants to complete without assistance |
| **Priority** | Medium (RE = 87,500 VND) |
| **Why (Objective)** | Validate that the two-sided platform's tenant onboarding is discoverable and executable by non-technical users. |
| **What (Deliverables)** | Usability test with at least one proxy tenant; onboarding guide. |
| **When (Milestones)** | Usability test before Batch 2 acceptance (Week 5). |
| **Who** | FE1 (MXH — tenant/lease UI owner); PM coordinates test. |
| **How (Approach)** | Test the full tenant provisioning flow (landlord creates lease → system sends temp password email → tenant logs in via email link) with at least one proxy user before marking US-TENANT-02 as Done; include a simple in-app onboarding guide. |
| **How Much** | No additional cash cost. |
| **Transition Indicator** | Proxy tenant cannot complete login without assistance after following the email instructions. |
| **Contingency** | Add explicit step-by-step onboarding instructions in the email template; provide a landlord-facing "send instructions again" action in the app. |

---

### RP-17 — Fake Payment Screenshot

| Field | Detail |
|---|---|
| **Risk** | R17 — Tenant uploads a fraudulent bank transfer screenshot; landlord confirms without verifying |
| **Priority** | Low (Design Risk — known limitation) |
| **Why (Objective)** | Ensure landlords understand the system's manual verification limitation so they are not misled about payment confirmation. |
| **What (Deliverables)** | Clear UI disclaimer on the payment verification screen; onboarding guidance. |
| **When (Milestones)** | Disclaimer in place before UAT (Week 6). |
| **Who** | FE1 (MXH — payment UI); PM verifies in UAT checklist. |
| **How (Approach)** | Display: "Please check your own banking app to confirm payment before marking as Paid." Include this in the landlord onboarding tutorial. |
| **How Much** | No additional cost. |
| **Transition Indicator** | Pilot landlord reports confusion about whether uploaded proof is automatically verified. |
| **Contingency** | Add a more prominent confirmation dialog; schedule a UAT walkthrough of the payment flow with all pilot landlords. |

---

### RP-18 — US AI Service Inaccessible from Vietnam

| Field | Detail |
|---|---|
| **Risk** | R18 — US government policy or platform geo-restriction blocks access to Codex/ChatGPT Plus from Vietnam, disabling the OpenAI cohort (2 of 5 members) |
| **Priority** | Medium (RE = 100,000 VND; low probability but high impact) |
| **Why (Objective)** | Maintain full team implementation capacity if one AI cohort loses access. |
| **What (Deliverables)** | Documented AI provider fallback plan; preserved local project context. |
| **When (Milestones)** | Fallback plan documented before Batch 1; reviewed at each batch boundary. |
| **Who** | PM; OpenAI cohort members (2 members). |
| **How (Approach)** | OpenAI cohort members have documented fallback to Antigravity (Google Gemini) per the resource capacity baseline; maintain VPN and alternative network access as a contingency; ensure all local project context (backlog, architecture, codebase) is documented so any model can be substituted; prioritize critical-path stories for the Google cohort if OpenAI access is lost. |
| **How Much** | No additional cash cost for the fallback; VPN cost covered by contingency if needed. |
| **Transition Indicator** | Either OpenAI cohort member reports inability to access Codex or ChatGPT from Vietnam for > 24 hours. |
| **Contingency** | Switch both affected members to Antigravity/Gemini immediately; increase Google cohort WIP limit from 3 to 5 (within C1 constraints); notify supervisor. |

---

### RP-19 — Data Privacy or Security Violation

| Field | Detail |
|---|---|
| **Risk** | R19 — API authorization bug or Supabase misconfiguration exposes one tenant's PII (name, phone, payment history, ID data) to another landlord or tenant |
| **Priority** | Low (RE = 80,000 VND; low probability but high impact if it occurs) |
| **Why (Objective)** | Protect tenant PII throughout development and pilot; ensure authorization enforcement is correct at the API layer. |
| **What (Deliverables)** | Authorization tests per story; HTTPS-only configuration; privacy notice for pilot users. |
| **When (Milestones)** | Authorization verified in every story's CI tests from Batch 1; privacy notice before UAT. |
| **Who** | Dev 4 (Security foundation owner); reviewer for all auth/PII stories. |
| **How (Approach)** | Use synthetic/test data during development; HTTPS on all endpoints; JWT authorization enforced at the API per the Global DoD; never log or return passwords, tokens, or cross-tenant data; security-sensitive story reviews by Dev 4 per RP-05 review policy; basic privacy notice to all pilot users before sharing their real data. |
| **How Much** | ~50,000 VND for SSL/domain (already in budget). |
| **Transition Indicator** | Any API response returns another landlord's or tenant's data; any JWT token validated without ownership check. |
| **Contingency** | Immediately suspend pilot; patch the vulnerability; notify affected users; consult supervisor; revert to synthetic test data until the fix is deployed and verified. |

---

### RP-20 — No Post-Project Owner

| Field | Detail |
|---|---|
| **Risk** | R20 — No team member agrees to maintain the application after the academic course ends |
| **Priority** | Noted (deferred — post-delivery risk, RE = 0 VND within project scope) |
| **Why (Objective)** | Avoid undefined cloud cost obligations or a production system with no maintainer. |
| **What (Deliverables)** | Documented team decision; clean archive or handover package. |
| **When (Milestones)** | Decision before Week 8 (2 weeks before demo day). |
| **Who** | PM; supervisor approves the plan. |
| **How (Approach)** | Option A: Clean archive — shut down cloud resources, write a comprehensive README, archive the repository at demo day. Option B: One volunteer commits to post-graduation maintenance with documented infrastructure, costs (VND 200,000–400,000/month), and responsibilities. Decide explicitly with supervisor. |
| **How Much** | Option A: No ongoing cost. Option B: ~VND 200,000–400,000/month cloud costs. |
| **Transition Indicator** | Demo day (Week 9–10) approaches with no written team decision. |
| **Contingency** | Default to Option A if no volunteer is identified by Week 8. |

---

## 8. Risk Monitoring

### 8.1 Risk Management Cycle (from Course Slides)

```
Risk Management (overall process)
         |
    Risk Assessment
    +--- Risk Identification (this document, Section 2)
    +--- Risk Analysis      (this document, Section 3)
    +--- Risk Prioritization(this document, Section 4)
         |
    Risk Control
    +--- Risk Management Planning (this document, Section 7)
    +--- Risk Resolution / Taking Action (team daily work)
    +--- Risk Monitoring    (this document, Section 8)
```

Risk monitoring tracks progress toward resolving each risk item and triggers corrective action when a transition indicator fires.

### 8.2 Monitoring Cadence

| Frequency | Activity | Owner |
|---|---|---|
| **Daily** | 10-minute async stand-up: new blockers, trigger indicators, availability changes | All five members |
| **Weekly** | PM reviews risk register: update probability, impact, RE; check all transition indicators against actual progress | PM |
| **Batch Boundary** | Full risk register review: close resolved risks, open new ones, verify contingency plans are still valid | Whole team + PM |
| **At Milestones (M1–M7)** | Risk register reviewed with supervisor; any High-priority open risk escalated if unresolved | PM + Supervisor |

### 8.3 Agile Risk Process — Mitigation and Contingency Stories

Per the Agile Risk Management slides, mitigation and contingency activities should be treated as stories in the release plan:

| Risk | Mitigation Story | When Added to Plan |
|---|---|---|
| R03 — Frontend bottleneck | Build shared UI components and navigation during BE Batch 1 | Batch 0 / Week 1 |
| R04 — API/schema conflict | Pre-batch data contract meeting + affected-owner review rule | Before each batch |
| R06 — Cron/email/push | Define provider interfaces and stubs | Batch 0 (infrastructure) |
| R12 — VietQR format | Automated QR format check in CI + multi-bank testing | Before VIETQR-02 acceptance |
| R13 — Report performance | Performance test with pilot data set | Before Batch 4 acceptance |
| R16 — Tenant onboarding | Proxy-user usability test of provisioning flow | Before US-TENANT-02 acceptance |

### 8.4 Transition Indicators Summary

| ID | Risk | Trigger Indicator |
|---|---|---|
| R01 | Academic workload | > 30% batch tasks incomplete at batch midpoint |
| R02 | Mobile overrun | Walking skeleton not integrated with dev API by end of Week 5 |
| R03 | Frontend bottleneck | Two consecutive batches with FE integration pending at BE completion |
| R04 | API/schema conflict | More than one merge conflict involving shared schema in the same batch |
| R05 | AI code over-reliance | PR with AI-generated business/auth logic merged without explanation or test coverage |
| R06 | Cron/email/push | REMINDER or LEASE-05 story reaches implementation without a tested provider connection |
| R07 | Unclear requirements | > 2 changed or new requirements raised after batch backlog sign-off |
| R08 | Scope creep | Non-backlog feature appears in an active batch or CI commit |
| R09 | Batch owner unavailable | Domain owner absent 3+ consecutive days without handover documentation |
| R10 | AI quota | Any cohort's token usage exceeds 80% of its budget before Batch 3 |
| R11 | No pilot landlords | Fewer than 2 confirmed pilot landlords by Week 5 |
| R12 | VietQR format | QR code fails to parse in any banking app during testing |
| R13 | Report performance | Any report/dashboard query > 3 seconds with pilot data |
| R14 | CI/CD failure | CI broken > 24h without active fix; deployment fails twice consecutively |
| R15 | Supabase quota | Any Supabase resource exceeds 80% of free-tier limit |
| R16 | Tenant onboarding | Proxy tenant cannot complete login without assistance |
| R17 | Fake screenshots | Pilot landlord reports confusion about payment verification |
| R18 | US AI service | OpenAI cohort member reports 24h+ inaccessibility from Vietnam |
| R19 | Data privacy | API returns cross-tenant data; JWT check bypassed |
| R20 | No post-project owner | No written team decision by Week 8 |

### 8.5 Corrective Action Protocol

When a transition indicator fires:

1. **Detect** — Team member identifies the trigger during stand-up or monitoring.
2. **Report** — Raise immediately to PM; do not wait for the next scheduled review.
3. **Assess** — PM updates risk register: revised probability, impact, and RE; determine if the risk has become an **issue** (certain, not uncertain).
4. **Respond** — Execute the contingency plan defined in Section 7. If no contingency applies, escalate.
5. **Document** — Record the trigger event, response taken, and outcome in the risk log (GitHub issue or project document).
6. **Escalate** — If contingency cannot resolve the risk within one batch boundary, escalate to the supervisor.

> A **risk** becomes an **issue** when the uncertain event has occurred and requires immediate corrective action (per Project Plan §7.1). Issues are managed directly, not through the risk register.

---

## References

1. C. Ravindranath Pandian (2007). *Applied Software Risk Management: A Guide for Software Project Managers.*
2. Kathy Schwalbe (2017). *An Introduction to Project Management.* 6th Edition. Schwalbe Publishing.
3. Hooman Hoodat and Hassan Rashidi (2009). *Classification and Analysis of Risks in Software Engineering.*
4. Barry W. Boehm (1991). *Software Risk Management: Principles and Practices.*
5. M. T. Taghavifard et al. (2009). *Decision Making Under Uncertain and Risky Situations.*
6. RD Shachter (1986). *Evaluating Influence Diagrams.*
7. James Shore and Shane Warden (2008). *The Art of Agile Development.* O'Reilly.
8. IEEE Std 1540-2001. *IEEE Standard for Software Life Cycle Processes – Risk Management.*
9. RosiHome Project Charter (2026).
10. RosiHome Project Proposal (2026).
11. RosiHome Architecture Document (2026).
12. RosiHome Product Backlog (2026).
13. RosiHome Project Plan (2026).
14. RosiHome Statement of Work (2026).
15. RosiHome Software Project Estimation Document (2026).
16. RosiHome Cost-Time-Resources Estimation Report (2026).
17. RosiHome Resource Capacity Baseline (2026).
18. RosiHome User Story Batch Assignments (2026).
19. RosiHome AI-Assisted Development Pilot Plan (2026).
