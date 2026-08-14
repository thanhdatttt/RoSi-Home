# Risk Management Plan 2.0 — RosiHome

## 1. Risk Scales

| Probability Band | Label | Range |
|---|---|---|
| Improbable | Very Low | 0% – 20% |
| Unlikely | Low | 21% – 40% |
| Likely | Medium | 41% – 60% |
| Very Likely | High | 61% – 80% |
| Nearly Certain | Extreme | 81% – 100% |

| Impact Band | Label | Budget/Schedule Slip |
|---|---|---|
| Slightly harmful | Minor | < 10% |
| Harmful | Moderate | 10% – 30% |
| Extremely harmful | Severe | 31% – 60% |
| Catastrophic | Critical | > 60% |

> **Risk Score** = Probability Score (1–5) × Impact Score (1–4)
> **Risk Level:** 1–2 Tolerable · 3–5 Moderate · 6–10 Substantial · 12–20 Critical

---

## 2. Risk Items

---

### RP-01 — Academic Workload Reduces Availability

**Description**
Team members are full-time students with overlapping exam schedules, coursework deadlines, and personal obligations. Any peak academic period (midterms, finals, or lab submission weeks) can simultaneously reduce availability across multiple contributors, causing sprint velocity to drop without advance warning.

**Solution(s)**
- Maintain an 8–10 week schedule baseline with Week 10 explicitly treated as a contingency buffer, not bonus scope.
- Run a daily 10-minute async stand-up to surface availability changes within 24 hours.
- Rebalance assignments immediately when a member signals reduced availability.
- Pre-identify and defer lower-priority stories (notifications, PDF export, advanced analytics) before cutting the deadline.

**Impact**
- Budget slip: **~10–20%** (coordination overhead, context-switch cost).
- Schedule slip: **~10–25%** on affected batches if exam periods overlap with critical-path milestones.

**Probability: 55% (Likely)**
Highly common in student teams; overlapping academic commitments are near-certain to materialize at least once during the 8-10 week window.

**Risk Score: 3 × 2 = 6 — Substantial**

---

### RP-02 — React Native Mobile Overrun

**Description**
The frontend team is new to React Native and Expo. Unfamiliar tooling (Metro bundler, native module linking, Expo SDK compatibility, device-specific rendering) can cause unexpected build failures, native dependency conflicts, or unexpectedly long debugging cycles that delay the mobile delivery milestones.

**Solution(s)**
- Build a thin end-to-end vertical slice (login → view invoice → QR display) in the very first FE sprint to surface Expo/RN surprises before they compound.
- Use AI tooling to scaffold boilerplate screens from the agreed shared design system.
- Begin UI scaffolding in parallel with BE Batch 1 using agreed API contracts (mock responses).
- Isolate native module additions to avoid cascading rebuild failures.

**Impact**
- Budget slip: **~10–15%** (additional AI-assisted scaffolding cost, extra review cycles).
- Schedule slip: **~15–25%** on FE batches if the walking skeleton is not completed by end of Week 5.

**Probability: 35% (Unlikely)**
Mitigated by the vertical-slice safety net, but the team's limited RN/Expo experience creates baseline exposure.

**Risk Score: 2 × 2 = 4 — Moderate**

---

### RP-03 — Frontend Critical-Path Bottleneck

**Description**
The sequential BE-first → FE-second delivery model means frontend work cannot start until backend contracts are stable. If multiple BE modules land at the same batch boundary, the FE team inherits a large backlog all at once, creating a compressing pipeline that threatens MVP candidate status.

**Solution(s)**
- Build shared UI components and navigation during BE Batch 1 so FE pre-work is already done.
- Define API contracts before BE implementation begins; FE uses mock data against those contracts.
- Integrate each batch incrementally rather than deferring all integration to the final batch.
- Assign an explicit batch integration owner at every batch boundary.

**Impact**
- Budget slip: **~10–15%** (rework cost of late integration surprises).
- Schedule slip: **~15–20%** — delays MVP candidate status at each missed batch boundary.

**Probability: 55% (Likely)**
Structural consequence of the sequential model; without active pre-work discipline this bottleneck is near-certain.

**Risk Score: 3 × 2 = 6 — Substantial**

---

### RP-04 — Cross-Module API/Schema Conflict

**Description**
Three independent backend engineers own non-overlapping domains (auth/lease, property/meter/invoice, maintenance/payment/report) but share the same PostgreSQL schema. Incompatible migration changes, conflicting foreign keys, or undocumented API contract modifications can cause hard-to-resolve merge conflicts and force time-consuming rework.

**Solution(s)**
- Hold a pre-batch contract meeting before each batch starts to align on any shared-table changes.
- Require mandatory PR approval from every affected module owner for changes to shared database tables.
- Document API contracts and Drizzle schema changes in the PR description before merging.
- Use separate feature branches per story to isolate conflicts.

**Impact**
- Budget slip: **~10–20%** (rework time for affected modules).
- Schedule slip: **~10–15%** per impacted batch, not a project-level blocker.

**Probability: 35% (Unlikely)**
Pre-batch meetings and required cross-owner approval significantly reduce exposure, but 3 independent owners is inherently risky.

**Risk Score: 2 × 2 = 4 — Moderate**

---

### RP-05 — Over-Reliance on AI-Generated Code

**Description**
All five developers are using AI tools heavily to generate code. AI models can confidently produce plausible-but-incorrect authorization logic, miss ownership validation, misunderstand multi-tenant data isolation requirements, or generate insecure patterns that pass superficial review. Without mandatory human validation, defects can accumulate silently.

**Solution(s)**
- Every PR must include an author comment explaining the business or security logic, and a non-author reviewer approval.
- Automated tests must cover the main success path and at least one authorization/ownership boundary per story.
- Follow the Implementation Procedure defined in the Project Plan.
- Hold a weekly team code walkthrough for complex or security-sensitive modules.

**Impact**
- Budget slip: **~15–25%** (rework cost if a security defect reaches Done).
- Schedule slip: **~10–20%** — deferred bug fixing compresses later batches.

**Probability: 55% (Likely)**
Heavy AI-assisted coding across all five members makes this near-certain to surface at least once.

**Risk Score: 3 × 2 = 6 — Substantial**

---

### RP-06 — Cron/Email/Push/PDF Infrastructure Unavailable

**Description**
Batch 3 stories (automated billing, VietQR payment, lease reminders) and Batch 4 (PDF report export) depend on external or infrastructure services: SMTP/email, Expo push notifications, server-side cron jobs on Render, and a PDF generation library. If any of these are not available, verified, or correctly configured by their batch start, the affected stories cannot reach Done.

**Solution(s)**
- Define clean provider interfaces (email, push, cron, PDF) during Batch 0 before any story depends on them.
- Implement development adapters (stubs) so all stories can be coded and unit-tested without live external services.
- Validate real provider integration (live email send, live Expo push, Render cron trigger) before any Batch 3 story reaches the Done state.

**Impact**
- Budget slip: **~10–15%** (provider integration debugging, adapter re-work).
- Schedule slip: **~15–25%** on Batch 3 or Batch 4 stories specifically.

**Probability: 35% (Unlikely)**
Stub adapters strongly mitigate this, but live third-party services are outside team control.

**Risk Score: 2 × 2 = 4 — Moderate**

---

### RP-07 — Unclear or Shifting Requirements

**Description**
Landlord and course requirements can shift mid-project due to late feedback, evolving stakeholder expectations, or team misinterpretation of acceptance criteria. Mid-batch requirement changes force rework on already-merged code and compress the remaining schedule.

**Solution(s)**
- Hold a pre-batch readiness review to resolve all "Needs Clarification" items before each batch starts.
- Use experience and bounded assumptions documented in the backlog decision record when stakeholder input is unavailable.
- Require a formal change request for any post-sign-off scope additions.
- Maintain a running change-request log.

**Impact**
- Budget slip: **~15–25%** (rework cost per changed story).
- Schedule slip: **~15–20%** — rework causes downstream batch compression.

**Probability: 55% (Likely)**
Classic top-ranked software risk; unclear requirements and requirement churn are consistently the most frequent failure modes in student projects.

**Risk Score: 3 × 2 = 6 — Substantial**

---

### RP-08 — Scope Creep

**Description**
As the project progresses and the app becomes visibly functional, team members and stakeholders may be tempted to add features outside the frozen MVP backlog — particularly in the final weeks when demo-day pressure peaks. Even small additions consume disproportionate delivery capacity in a compressed timeline.

**Solution(s)**
- Maintain a scope freeze from Day 1; any feature idea not in the approved backlog goes to a "later" list.
- Require a formal change request with team consensus and Sponsor approval for any baseline modification.
- PM enforces the process at every stand-up and PR review.

**Impact**
- Budget slip: **~20–35%** (unplanned features consume AI token and review budgets).
- Schedule slip: **~30–50%** — even one unplanned feature can threaten the fixed demo-day deadline.

**Probability: 35% (Unlikely)**
The scope-freeze process and Sponsor approval gate reduce frequency, but demo-day pressure is a consistent trigger in student projects.

**Risk Score: 2 × 3 = 6 — Substantial**

---

### RP-09 — Batch Owner Unavailability (Knowledge Silo)

**Description**
Each backend domain is primarily owned by one engineer. If that engineer becomes temporarily unavailable (illness, academic emergency, personal event), and no one else understands the module's business logic, migration state, or API design, the entire domain's batch can stall until the owner returns.

**Solution(s)**
- Require atomic commits with meaningful messages so any team member can understand recent changes.
- Mandatory cross-domain PR review: the reviewer must be from a different domain.
- PM maintains a backup owner matrix and assigns backup owners before each batch starts.
- Each member documents their module's API, migration, and core business logic before the next batch begins.

**Impact**
- Budget slip: **~10–15%** (backup owner ramp-up time).
- Schedule slip: **~10–20%** on the affected domain batch.

**Probability: 35% (Unlikely)**
Cross-training and backup-owner assignment significantly reduce likelihood and severity.

**Risk Score: 2 × 2 = 4 — Moderate**

---

### RP-10 — AI Token Quota Exhausted or Plan Expires

**Description**
All five developers rely on AI coding assistants funded from per-cohort budgets. Unexpected usage spikes (debugging complex stories, regenerating large files, premium-model calls on routine tasks) can exhaust monthly quotas before the batch is complete, forcing developers to work without AI assistance or incur unplanned cost.

**Solution(s)**
- Monitor usage weekly and set an alert at 80% of each cohort's monthly budget.
- Use lower-cost model tiers (Flash, Haiku) for routine CRUD stories and reserve premium models for complex architectural work.
- The 500,000 VND contingency reserve explicitly covers moderate API cost overruns.

**Impact**
- Budget slip: **~10–20%** (contingency draw if a paid tier upgrade is needed).
- Schedule slip: **~5–15%** — velocity slows without AI assistance until quota resets or contingency is applied.

**Probability: 35% (Unlikely)**
Usage tracking and tiered model selection reduce likelihood, but cumulative exposure grows toward project end.

**Risk Score: 2 × 2 = 4 — Moderate**

---

### RP-11 — Insufficient Pilot Landlords for UAT

**Description**
The project requires at least 3 pilot landlords to run a credible User Acceptance Test that validates MVP workflows with real users. If outreach is delayed or responses are poor, the team may reach the UAT window (Week 6–8) without confirmed participants, undermining the demo's credibility and the project's evidence of real-world viability.

**Solution(s)**
- Begin outreach via personal contacts in Week 1 — do not wait for the app to be functional.
- Post in social landlord groups and engage local boarding-house communities simultaneously.
- PM tracks a named recruitment list and escalates early if fewer than 3 landlords are committed by Week 3.
- Prepare consent forms and a simple UAT script in advance to reduce onboarding friction for participants.

**Impact**
- Budget slip: **~5–10%** (additional outreach and recruitment PM time).
- Schedule slip: **~30–45%** — without UAT results, the demo is weakened and submission evidence is incomplete.

**Probability: 35% (Unlikely)**
Early, multi-channel outreach reduces likelihood, but participant recruitment is inherently uncertain.

**Risk Score: 2 × 3 = 6 — Substantial**

---

### RP-12 — VietQR Format Incorrect or Changed

**Description**
The VietQR/NAPAS specification defines a precise QR payload format for Vietnamese banking interoperability. An implementation that deviates from the spec (even slightly) produces QR codes that fail to parse in one or more banking apps, breaking the payment verification flow for affected tenants.

**Solution(s)**
- Implement strictly against the official VietQR/NAPAS documentation.
- Include an automated test that validates the QR payload format and checksum before acceptance.
- Test generated QR codes with at least three major banking apps (Vietcombank, Techcombank, MBBank) before marking the story Done.

**Impact**
- Budget slip: **~5–10%** (format debugging and re-testing).
- Schedule slip: **~10–15%** on the payment module specifically; no project-level impact.

**Probability: 15% (Very Low)**
The spec is public, stable, and well-documented; strict implementation against it virtually eliminates the risk.

**Risk Score: 1 × 2 = 2 — Tolerable**

---

### RP-13 — Report and Dashboard Performance

**Description**
Report and dashboard endpoints aggregate data across properties, rooms, leases, invoices, and meter readings. Without proper indexing and pagination, these queries can degrade significantly even at pilot scale (5–30 rooms × 3–6 months of data), producing a poor landlord experience during the demo.

**Solution(s)**
- Apply indexed foreign keys in the Drizzle schema from the start (rooms, leases, invoices).
- Add pagination and date-range filtering to all report and dashboard endpoints.
- Profile slow queries using Supabase's query analyzer before Batch 4 acceptance.
- Validate all report endpoints against a representative synthetic dataset (30 rooms, 6 months).

**Impact**
- Budget slip: **~5–10%** (profiling and query optimization effort).
- Schedule slip: **~10–15%** on Batch 4 report stories; no project-level blocker.

**Probability: 35% (Unlikely)**
Data volumes are small for the pilot, but indexing omissions and N+1 query patterns are easy to accidentally introduce.

**Risk Score: 2 × 2 = 4 — Moderate**

---

### RP-14 — CI/CD or Deployment Failure

**Description**
A broken CI pipeline or failed Render deployment — especially near demo day — leaves the team without a validated, deployable baseline. If the production environment is unavailable at demo time, the entire demonstration depends on a local environment that may not accurately represent the real system.

**Solution(s)**
- Fix all CI failures before merge per the Definition of Done; the pipeline must be green before any PR is approved.
- Retain the previous deployable revision in Render and document a rollback procedure.
- Configure the deployment pipeline to trigger only on passing CI builds.
- Maintain a fully configured local development environment as a demo fallback.

**Impact**
- Budget slip: **~10–20%** (emergency debugging, rollback coordination).
- Schedule slip: **~30–50%** impact on demo day credibility if production is down during the demonstration.

**Probability: 35% (Unlikely)**
DoD enforcement and pinned rollback reduce likelihood, but CI/CD failures are common in environments with multiple active contributors.

**Risk Score: 2 × 3 = 6 — Substantial**

---

### RP-15 — Supabase Free-Tier Quota Reached

**Description**
Once maintenance photo uploads and payment proof images are introduced in Batch 2, Supabase storage and bandwidth consumption grows steadily. The free tier has fixed storage (500 MB) and bandwidth (2 GB/month) limits that may be exhausted during active development and UAT, causing upload failures.

**Solution(s)**
- Compress all maintenance and payment proof images client-side before upload.
- Delete test and duplicate files from Supabase during development.
- Monitor the Supabase dashboard weekly from Batch 2 onward.
- Delete stale pilot accounts and their associated files before the final demo.
- The contingency budget includes ~100,000 VND for one month of Supabase Pro if the free tier is exceeded.

**Impact**
- Budget slip: **< 10%** (a planned and pre-budgeted upgrade path exists).
- Schedule slip: **< 5%** (upgrading the plan is immediate; no code change required).

**Probability: 55% (Likely)**
Free-tier storage and bandwidth limits are typically tight once image uploads begin in active development.

**Risk Score: 3 × 1 = 3 — Tolerable**

---

### RP-16 — Tenant Onboarding Flow Fails UAT

**Description**
The tenant onboarding flow is multi-step and cross-system: the landlord creates a lease, the system generates and emails a temporary password, the tenant receives the email and logs in for the first time, and then is forced to change their password. Any friction point in this chain (email not received, unclear UI, confusing password change flow) can prevent non-technical users from completing onboarding unaided.

**Solution(s)**
- Test the full tenant provisioning flow with at least one proxy (non-technical) user before marking US-TENANT-02 as Done.
- Include a simple in-app onboarding guide or contextual help text as a safety net.
- Validate that the temporary password email arrives promptly in common Vietnamese email providers (Gmail, Yahoo Mail).

**Impact**
- Budget slip: **~10–15%** (usability rework, UI copy changes, onboarding guide authoring).
- Schedule slip: **~10–20%** — a failed onboarding flow undermines pilot adoption and delays UAT readiness.

**Probability: 35% (Unlikely)**
Usability testing before acceptance catches most issues early, but the multi-step cross-system nature of the flow is inherently fragile.

**Risk Score: 2 × 2 = 4 — Moderate**

---

### RP-17 — Fake Payment Screenshot

**Description**
The payment verification model relies on the landlord visually inspecting a screenshot uploaded by the tenant and then cross-checking their banking app. A tenant could upload a fabricated or recycled screenshot. There is no automated bank confirmation in the MVP. If landlords are not clearly informed of this limitation, they may over-trust the system and mark fraudulent payments as Paid.

**Solution(s)**
- Display a prominent, permanent disclaimer on the payment verification screen: *"Please verify this payment in your own banking app before marking it as Paid."*
- Include this disclaimer in the landlord onboarding guide and UAT walkthrough.
- PM verifies the disclaimer is present in the UAT checklist before UAT begins.

**Impact**
- Budget slip: **< 10%** (UI copy and a single disclaimer component).
- Schedule slip: **< 5%** (minor UI addition; does not affect backend logic).

**Probability: 55% (Likely)**
Manual verification is inherently exploitable; fraudulent screenshot attempts are expected at least once during the pilot period.

**Risk Score: 3 × 1 = 3 — Tolerable**

---

### RP-18 — US AI Service Inaccessible from Vietnam

**Description**
OpenAI services have historically been inaccessible from Vietnam without a VPN. Regulatory changes, ISP-level blocking, or service-provider policy shifts could cut off access for team members relying on OpenAI during any week of the project, reducing that cohort's AI-assisted development capacity to zero.

**Solution(s)**
- Document a fallback plan before Batch 1: OpenAI cohort members switch to Antigravity (Google Gemini/Claude) per the resource capacity baseline.
- Maintain VPN and alternative network access as a ready contingency.
- Ensure all local project context (backlog, architecture, codebase, decision records) is documented so any model can be onboarded as a substitute.
- Prioritize critical-path stories for the Google cohort if OpenAI access is disrupted.

**Impact**
- Budget slip: **~20–35%** (VPN cost, model-switching overhead, context re-establishment time).
- Schedule slip: **~30–45%** — losing a full AI cohort's capacity mid-batch significantly compresses delivery.

**Probability: 35% (Unlikely)**
Access disruptions are episodic and outside team control; not the common case, but historically plausible in the Vietnamese network environment.

**Risk Score: 2 × 3 = 6 — Substantial**

---

### RP-19 — Data Privacy or Security Violation

**Description**
The system stores sensitive tenant PII (full name, ID number, phone, email), financial records (lease amounts, payment history), and authentication tokens. An authorization bug, a misconfigured endpoint (HTTP instead of HTTPS), a leaked JWT, or PII in application logs could expose one tenant's data to another user or to the public, which would undermine pilot trust and potentially require halting the pilot.

**Solution(s)**
- Use only synthetic or test data during development; no real PII before UAT.
- Enforce HTTPS on all API endpoints.
- Apply JWT authorization checks in every route per the Global Definition of Done.
- Never log or return passwords, raw tokens, or cross-tenant data.
- Every security-sensitive story requires a dedicated non-author reviewer.
- Issue a plain-language privacy notice to all pilot users before sharing any real data.

**Impact**
- Budget slip: **~30–50%** (incident response, re-testing, potential re-architecture of affected modules).
- Schedule slip: **~40–60%** — a real PII leak could force the pilot to halt and require a public-facing incident response.

**Probability: 35% (Unlikely)**
Mandatory CI authorization tests and security review policies reduce likelihood significantly.

**Risk Score: 2 × 3 = 6 — Substantial**

---

### RP-20 — No Post-Project Owner

**Description**
After demo day, if no team member explicitly commits to maintaining the cloud infrastructure, the system will continue to incur hosting costs (Render, Supabase) with no assigned payer and no one responsible for security patches or data deletion. This creates an undefined financial obligation and a potential data governance problem.

**Solution(s)**
- Option A: Clean archive — shut down all cloud resources, write a comprehensive README, and archive the repository at demo day. Zero ongoing cost.
- Option B: One volunteer commits to post-graduation maintenance with documented infrastructure, monthly cost estimate (VND 200,000–400,000/month), and explicit responsibilities.
- PM and Supervisor must approve the chosen option by Week 9 at the latest.

**Impact**
- Budget slip: **< 10%** (both options are pre-planned and bounded).
- Schedule slip: **< 5%** (the decision itself requires only a brief meeting).

**Probability: 55% (Likely)**
Absence of an explicit post-project ownership decision is the common outcome for student capstone projects.

**Risk Score: 3 × 1 = 3 — Tolerable**

---

## 3. Risk Summary Dashboard

### 3.1 Risk Register

| ID | Risk Title | Probability | Impact Band | Score | Level |
|---|---|---|---|---|---|
| RP-01 | Academic Workload Reduces Availability | 55% | Moderate (10–25%) | 6 | 🟠 Substantial |
| RP-02 | React Native Mobile Overrun | 35% | Moderate (15–25%) | 4 | 🟡 Moderate |
| RP-03 | Frontend Critical-Path Bottleneck | 55% | Moderate (15–20%) | 6 | 🟠 Substantial |
| RP-04 | Cross-Module API/Schema Conflict | 35% | Moderate (10–15%) | 4 | 🟡 Moderate |
| RP-05 | Over-Reliance on AI-Generated Code | 55% | Moderate (10–20%) | 6 | 🟠 Substantial |
| RP-06 | Cron/Email/Push/PDF Infra Unavailable | 35% | Moderate (15–25%) | 4 | 🟡 Moderate |
| RP-07 | Unclear or Shifting Requirements | 55% | Moderate (15–20%) | 6 | 🟠 Substantial |
| RP-08 | Scope Creep | 35% | Severe (30–50%) | 6 | 🟠 Substantial |
| RP-09 | Batch Owner Unavailability | 35% | Moderate (10–20%) | 4 | 🟡 Moderate |
| RP-10 | AI Token Quota Exhausted | 35% | Moderate (5–15%) | 4 | 🟡 Moderate |
| RP-11 | Insufficient Pilot Landlords for UAT | 35% | Severe (30–45%) | 6 | 🟠 Substantial |
| RP-12 | VietQR Format Incorrect or Changed | 15% | Moderate (10–15%) | 2 | 🟢 Tolerable |
| RP-13 | Report and Dashboard Performance | 35% | Moderate (10–15%) | 4 | 🟡 Moderate |
| RP-14 | CI/CD or Deployment Failure | 35% | Severe (30–50%) | 6 | 🟠 Substantial |
| RP-15 | Supabase Free-Tier Quota Reached | 55% | Minor (< 5%) | 3 | 🟢 Tolerable |
| RP-16 | Tenant Onboarding Flow Fails UAT | 35% | Moderate (10–20%) | 4 | 🟡 Moderate |
| RP-17 | Fake Payment Screenshot | 55% | Minor (< 5%) | 3 | 🟢 Tolerable |
| RP-18 | US AI Service Inaccessible from Vietnam | 35% | Severe (30–45%) | 6 | 🟠 Substantial |
| RP-19 | Data Privacy or Security Violation | 35% | Severe (40–60%) | 6 | 🟠 Substantial |
| RP-20 | No Post-Project Owner | 55% | Minor (< 5%) | 3 | 🟢 Tolerable |

---

### 3.2 Risk Level Summary

| Level | Count | IDs |
|---|---|---|
| 🔴 Critical (12–20) | 0 | — |
| 🟠 Substantial (6–11) | 9 | RP-01, 03, 05, 07, 08, 11, 14, 18, 19 |
| 🟡 Moderate (3–5) | 7 | RP-02, 04, 06, 09, 10, 13, 16 |
| 🟢 Tolerable (1–2) | 4 | RP-12, 15, 17, 20 |

---

### 3.3 Priority Rankings (Score descending, then by Schedule Impact)

| Rank | ID | Risk Title | Score | Schedule Slip | Resolution Progress |
|---|---|---|---|---|---|
| 1 | RP-19 | Data Privacy or Security Violation | 6 | 40–60% | Not started |
| 2 | RP-18 | US AI Service Inaccessible from Vietnam | 6 | 30–45% | Not started |
| 3 | RP-08 | Scope Creep | 6 | 30–50% | Not started |
| 4 | RP-14 | CI/CD or Deployment Failure | 6 | 30–50% | Not started |
| 5 | RP-11 | Insufficient Pilot Landlords for UAT | 6 | 30–45% | Not started |
| 6 | RP-01 | Academic Workload Reduces Availability | 6 | 10–25% | Not started |
| 7 | RP-03 | Frontend Critical-Path Bottleneck | 6 | 15–20% | Not started |
| 8 | RP-05 | Over-Reliance on AI-Generated Code | 6 | 10–20% | Not started |
| 9 | RP-07 | Unclear or Shifting Requirements | 6 | 15–20% | Not started |
| 10 | RP-02 | React Native Mobile Overrun | 4 | 15–25% | Not started |
| 11 | RP-06 | Cron/Email/Push/PDF Infra Unavailable | 4 | 15–25% | Not started |
| 12 | RP-04 | Cross-Module API/Schema Conflict | 4 | 10–15% | Not started |
| 13 | RP-09 | Batch Owner Unavailability | 4 | 10–20% | Not started |
| 14 | RP-10 | AI Token Quota Exhausted | 4 | 5–15% | Not started |
| 15 | RP-13 | Report and Dashboard Performance | 4 | 10–15% | Not started |
| 16 | RP-16 | Tenant Onboarding Flow Fails UAT | 4 | 10–20% | Not started |
| 17 | RP-15 | Supabase Free-Tier Quota Reached | 3 | < 5% | Not started |
| 18 | RP-17 | Fake Payment Screenshot | 3 | < 5% | Not started |
| 19 | RP-20 | No Post-Project Owner | 3 | < 5% | Not started |
| 20 | RP-12 | VietQR Format Incorrect or Changed | 2 | 10–15% | Not started |

---

### 3.4 Probability Distribution

| Probability Band | Count | IDs |
|---|---|---|
| 55% – Likely | 7 | RP-01, 03, 05, 07, 15, 17, 20 |
| 35% – Unlikely | 12 | RP-02, 04, 06, 08, 09, 10, 11, 13, 14, 16, 18, 19 |
| 15% – Very Low | 1 | RP-12 |

---

### 3.5 Top Watch Items

The following risks demand immediate action before Batch 1 coding begins:

1. **RP-19 (Data Privacy)** — CI authorization tests and HTTPS must be in place from the very first merged story.
2. **RP-14 (CI/CD Failure)** — Pipeline must be green and rollback procedure tested before Batch 1.
3. **RP-11 (UAT Recruitment)** — Landlord outreach must start in Week 1, not Week 6.
4. **RP-18 (AI Access)** — Fallback model plan must be documented before any developer begins Batch 1.
5. **RP-08 (Scope Creep)** — Scope freeze and Sponsor approval gate must be enforced from Day 1.
