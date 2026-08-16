# Risk Management Plan — RosiHome

## 1. Risk Scales

| Probability Band | Label | Range | Score |
|---|---|---|---|
| Improbable | Very Low | 0% – 20% | 1 |
| Unlikely | Low | 21% – 40% | 2 |
| Likely | Medium | 41% – 60% | 3 |
| Very Likely | High | 61% – 80% | 4 |
| Nearly Certain | Extreme | 81% – 100% | 5 |

| Impact Band | Label | Budget/Schedule Slip | Score |
|---|---|---|---|
| Slightly harmful | Minor | < 10% | 1 |
| Harmful | Moderate | 10% – 30% | 2 |
| Extremely harmful | Severe | 31% – 60% | 3 |
| Catastrophic | Critical | > 60% | 4 |

> **Risk Score** = Probability Score (1–5) × Impact Score (1–4)
> 
> **Note on Impact Score:** The final Impact Score is determined by the *higher* of the Budget Slip or Schedule Slip percentages.
> 
> **Risk Level:** 1–3 Tolerable · 4–5 Moderate · 6–11 Substantial · 12–20 Critical

**Methodology: Inherent vs. Residual Risk**
This document tracks risk using the Risk Reduction Leverage model:
- **Risk Exposure Before ($RE_{before}$):** The inherent risk score *before* any mitigations are applied.
- **Risk Exposure After ($RE_{after}$):** The residual risk score *after* our defined solutions are implemented.

---

## 2. Risk Items

---

### RP-01 — Academic Workload Reduces Availability

**Description**
Team members are full-time students with overlapping exam schedules, coursework deadlines, and personal obligations. Any peak academic period can simultaneously reduce availability, causing sprint velocity to drop.

**Mitigation & Contingency**
- **Mitigation:** Maintain an 8–10 week schedule baseline with Week 10 explicitly treated as a contingency buffer. Run a weekly meeting to surface availability changes and rebalance assignments immediately.
- **Contingency:** If the buffer is exhausted, immediately drop one "nice-to-have" feature (e.g., advanced reporting) from the MVP scope to ensure core milestones are hit.

**Risk Exposure Before ($RE_{before}$)**
Without a buffer or rebalancing, an academic crunch causes major milestone delays.
- **Max Slip:** ~30–50% schedule slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Severe (3)**
- **$RE_{before}$ Score: 4 × 3 = 12 — Critical**

**Risk Exposure After ($RE_{after}$)**
With a buffer, the delay is contained, though weekly meetings mean rebalancing may be slightly delayed.
- **Max Slip:** ~10–25% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 3 × 2 = 6 — Substantial**

---

### RP-02 — React Native Mobile Overrun

**Description**
The frontend team is new to React Native and Expo. Unfamiliar tooling can cause unexpected build failures and long debugging cycles that delay the mobile milestones.

**Mitigation & Contingency**
- **Mitigation:** Build a thin end-to-end vertical slice in the first FE sprint to surface Expo/RN surprises. Use AI tooling to scaffold boilerplate screens from the agreed shared design system.
- **Contingency:** If Expo proves too technically blocking by Week 4, pivot the frontend to a standard mobile-responsive web app (PWA) to ensure demo readiness.

**Risk Exposure Before ($RE_{before}$)**
Without early prototyping, technical blockers arrive late.
- **Max Slip:** ~30–40% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Severe (3)**
- **$RE_{before}$ Score: 3 × 3 = 9 — Substantial**

**Risk Exposure After ($RE_{after}$)**
Vertical slice ensures blockers are caught early.
- **Max Slip:** ~15–25% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 2 × 2 = 4 — Moderate**

---

### RP-03 — Frontend Critical-Path Bottleneck

**Description**
The sequential BE-first → FE-second model means frontend work cannot start until backend contracts are stable, risking a massive backlog at the end.

**Mitigation & Contingency**
- **Mitigation:** Build shared UI components and navigation during BE Batch 1 (FE pre-work). Define API contracts before BE implementation begins so FE uses mocks.
- **Contingency:** Descope secondary frontend screens (e.g., complex tenant profiles) to ensure the core payment and leasing flows are perfectly polished.

**Risk Exposure Before ($RE_{before}$)**
Without mock contracts, FE is completely blocked until BE is 100% finished.
- **Max Slip:** ~35–50% schedule slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Severe (3)**
- **$RE_{before}$ Score: 4 × 3 = 12 — Critical**

**Risk Exposure After ($RE_{after}$)**
Mock contracts and batching smooth out the pipeline.
- **Max Slip:** ~15–20% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 3 × 2 = 6 — Substantial**

---

### RP-04 — Cross-Module API/Schema Conflict

**Description**
Three independent backend engineers share the same PostgreSQL schema. Conflicting foreign keys or undocumented API changes cause merge conflicts.

**Mitigation & Contingency**
- **Mitigation:** Conduct pre-batch contract meetings to align on shared-table changes. Enforce mandatory PR approval from every affected module owner for schema changes.
- **Contingency:** Immediately revert the conflicting PR and schedule an emergency sync call to manually resolve the schema mapping.

**Risk Exposure Before ($RE_{before}$)**
Without contract meetings, schema conflicts require significant module rework.
- **Max Slip:** ~30–40% budget/rework slip
- Probability: **55% (Likely, 3)**
- Impact: **Severe (3)**
- **$RE_{before}$ Score: 3 × 3 = 9 — Substantial**

**Risk Exposure After ($RE_{after}$)**
Required reviews catch conflicts before merge.
- **Max Slip:** ~10–15% budget/rework slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 2 × 2 = 4 — Moderate**

---

### RP-05 — Over-Reliance on AI-Generated Code

**Description**
All five developers use AI tools heavily. AI can confidently produce plausible-but-incorrect authorization logic that passes superficial review.

**Mitigation & Contingency**
- **Mitigation:** Every PR must include an author comment explaining the logic, and a non-author reviewer approval. Automated tests must cover at least one authorization boundary per story.
- **Contingency:** Revert the defective commit and assign a human pair-programming session to manually rewrite the critical logic.

**Risk Exposure Before ($RE_{before}$)**
Without mandatory review and tests, severe bugs ship to production requiring architecture rework.
- **Max Slip:** ~35–50% budget/rework slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Severe (3)**
- **$RE_{before}$ Score: 4 × 3 = 12 — Critical**

**Risk Exposure After ($RE_{after}$)**
Testing and code review catch hallucinated logic early.
- **Max Slip:** ~10–20% budget/rework slip
- Probability: **55% (Likely, 3)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 3 × 2 = 6 — Substantial**

---

### RP-06 — Cron/Email/Push/PDF Infra Unavailable

**Description**
Batch 3 and 4 depend on external services (SMTP, Expo push, Render cron, PDF gen). If these aren't ready, stories cannot reach Done.

**Mitigation & Contingency**
- **Mitigation:** Implement development adapters (stubs) so stories can be coded without live services. Validate real provider integration before Batch 3 acceptance.
- **Contingency:** Hardcode mock responses for Demo Day (e.g., simulating a successful email send in the UI) if the third-party provider is completely offline.

**Risk Exposure Before ($RE_{before}$)**
Waiting for live services blocks local development and delays integration.
- **Max Slip:** ~30–45% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Severe (3)**
- **$RE_{before}$ Score: 3 × 3 = 9 — Substantial**

**Risk Exposure After ($RE_{after}$)**
Stubs unblock local development entirely.
- **Max Slip:** ~15–25% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 2 × 2 = 4 — Moderate**

---

### RP-07 — Unclear or Shifting Requirements

**Description**
Landlord requirements shift mid-project due to late feedback, forcing rework on already-merged code.

**Mitigation & Contingency**
- **Mitigation:** Conduct a pre-batch readiness review to resolve all "Needs Clarification" items before coding. A formal change request is required for post-sign-off scope.
- **Contingency:** Push the new mandatory requirements to a "Version 2.0" backlog to protect the current sprint, unless the change is trivial.

**Risk Exposure Before ($RE_{before}$)**
Without sign-offs, constant rework destroys the schedule.
- **Max Slip:** ~30–45% schedule slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Severe (3)**
- **$RE_{before}$ Score: 4 × 3 = 12 — Critical**

**Risk Exposure After ($RE_{after}$)**
Readiness reviews bound the uncertainty per batch.
- **Max Slip:** ~15–20% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 3 × 2 = 6 — Substantial**

---

### RP-08 — Scope Creep

**Description**
As the app becomes functional, stakeholders are tempted to add features outside the frozen MVP backlog.

**Mitigation & Contingency**
- **Mitigation:** Maintain a strict scope freeze from Day 1. Any feature idea not in the approved backlog goes to a "later" list. The PM enforces the process at every weekly meeting.
- **Contingency:** If a new feature is absolutely demanded, formally swap it out by removing an existing planned feature of equal size from the backlog.

**Risk Exposure Before ($RE_{before}$)**
Without a freeze, scope expands infinitely and demo day is missed entirely.
- **Max Slip:** > 60% schedule slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Catastrophic (4)**
- **$RE_{before}$ Score: 4 × 4 = 16 — Critical**

**Risk Exposure After ($RE_{after}$)**
Even with a freeze, partial creep (e.g., expanding a feature's scope under the guise of a "bug fix") is still likely without strict enforcement.
- **Max Slip:** ~30–50% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Severe (3)**
- **$RE_{after}$ Score: 2 × 3 = 6 — Substantial**

---

### RP-09 — Batch Owner Unavailability (Knowledge Silo)

**Description**
Each backend domain is owned by one engineer. If they become unavailable, the domain batch stalls.

**Mitigation & Contingency**
- **Mitigation:** Enforce atomic commits and mandatory cross-domain PR review. Assign backup owners and require clear documentation before the batch starts.
- **Contingency:** The backup owner immediately takes over the domain, and the batch's scope is reduced by 20% to account for their ramp-up time.

**Risk Exposure Before ($RE_{before}$)**
Without cross-training, one illness stalls the entire batch entirely.
- **Max Slip:** ~30–40% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Severe (3)**
- **$RE_{before}$ Score: 3 × 3 = 9 — Substantial**

**Risk Exposure After ($RE_{after}$)**
Backup owners can seamlessly pick up the work.
- **Max Slip:** ~10–20% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 2 × 2 = 4 — Moderate**

---

### RP-10 — AI Token Quota Exhausted

**Description**
Unexpected AI usage spikes exhaust monthly quotas, forcing developers to work without AI assistance.

**Mitigation & Contingency**
- **Mitigation:** Monitor usage weekly. Use lower-cost models (Flash/Haiku) for routine work.
- **Contingency:** Use the contingency fund to buy a temporary pro tier, or switch developers to the free tiers of alternative tools (Claude/Gemini).

**Risk Exposure Before ($RE_{before}$)**
Running out of quota cuts coding velocity in half mid-batch.
- **Max Slip:** ~15–25% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Moderate (2)**
- **$RE_{before}$ Score: 3 × 2 = 6 — Substantial**

**Risk Exposure After ($RE_{after}$)**
Tiered models and tracking make exhaustion unlikely.
- **Max Slip:** ~10–20% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 2 × 2 = 4 — Moderate**

---

### RP-11 — Insufficient Pilot Landlords for UAT

**Description**
If outreach is delayed, the team reaches UAT with no participants, undermining demo credibility and project validity.

**Mitigation & Contingency**
- **Mitigation:** Begin multi-channel outreach in Week 1. Track recruitment explicitly as a milestone.
- **Contingency:** Recruit friends or family members to act as proxy landlords for a simulated UAT session to gather baseline usability data.

**Risk Exposure Before ($RE_{before}$)**
Waiting until the app is done to find users usually yields 0 users, invalidating the project.
- **Max Slip:** > 60% schedule/budget slip (MVP Failure)
- Probability: **55% (Likely, 3)**
- Impact: **Catastrophic (4)**
- **$RE_{before}$ Score: 3 × 4 = 12 — Critical**

**Risk Exposure After ($RE_{after}$)**
Early outreach secures the needed 3 pilots in time.
- **Max Slip:** ~30–45% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Severe (3)**
- **$RE_{after}$ Score: 2 × 3 = 6 — Substantial**

---

### RP-12 — VietQR Format Incorrect

**Description**
Implementation deviates from the VietQR spec, causing payment QR codes to fail in banking apps.

**Mitigation & Contingency**
- **Mitigation:** Implement strictly against the NAPAS spec. Test generated codes with major banking apps before marking the story Done.
- **Contingency:** Instruct tenants to manually copy-paste the landlord's account number (provided in the UI as a plaintext backup) if the QR fails.

**Risk Exposure Before ($RE_{before}$)**
Without strict testing, formatting edge cases easily break the QR.
- **Max Slip:** ~10–25% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Moderate (2)**
- **$RE_{before}$ Score: 3 × 2 = 6 — Substantial**

**Risk Exposure After ($RE_{after}$)**
Banking app tests catch bugs before release.
- **Max Slip:** ~10–15% schedule slip
- Probability: **15% (Very Low, 1)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 1 × 2 = 2 — Tolerable**

---

### RP-13 — Report and Dashboard Performance

**Description**
Without proper indexing, queries degrade even at pilot scale, producing a poor UX during demo.

**Mitigation & Contingency**
- **Mitigation:** Apply indexed foreign keys from the start. Add pagination and date filters to all reports.
- **Contingency:** Hardcode a default date filter to limit reports to the last 30 days, forcing smaller data sets during the demo.

**Risk Exposure Before ($RE_{before}$)**
N+1 queries reliably crash the dashboard with a few months of data.
- **Max Slip:** ~30–40% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Severe (3)**
- **$RE_{before}$ Score: 3 × 3 = 9 — Substantial**

**Risk Exposure After ($RE_{after}$)**
Pagination ensures load times remain fast.
- **Max Slip:** ~10–15% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 2 × 2 = 4 — Moderate**

---

### RP-14 — CI/CD or Deployment Failure

**Description**
A broken CI pipeline or failed Render deployment leaves the team without a validated baseline for demo day.

**Mitigation & Contingency**
- **Mitigation:** Pipeline must be green before PR approval. Maintain a fully configured local development environment.
- **Contingency:** Present the demo using a developer's local `localhost` environment (via Ngrok) if cloud production is offline.

**Risk Exposure Before ($RE_{before}$)**
A cloud failure on demo day destroys the final presentation.
- **Max Slip:** > 60% schedule slip (Demo Fails)
- Probability: **55% (Likely, 3)**
- Impact: **Catastrophic (4)**
- **$RE_{before}$ Score: 3 × 4 = 12 — Critical**

**Risk Exposure After ($RE_{after}$)**
Local fallback environment ensures the demo succeeds regardless of cloud status.
- **Max Slip:** ~30–50% schedule slip (Fallback overhead)
- Probability: **35% (Unlikely, 2)**
- Impact: **Severe (3)**
- **$RE_{after}$ Score: 2 × 3 = 6 — Substantial**

---

### RP-15 — Supabase Free-Tier Quota Reached

**Description**
Maintenance/payment image uploads exhaust the 1 GB free tier file storage (or the 500 MB database size limit), causing upload or insert failures.

**Mitigation & Contingency**
- **Mitigation:** Compress images client-side before upload to drastically reduce payload size.
- **Contingency:** Immediately execute the pre-budgeted $25/month (~650,000 VND) upgrade to the Pro tier to unblock uploads instantly.

**Risk Exposure Before ($RE_{before}$)**
Without compression, raw camera photos hit the quota in days.
- **Max Slip:** ~10–25% schedule slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Moderate (2)**
- **$RE_{before}$ Score: 4 × 2 = 8 — Substantial**

**Risk Exposure After ($RE_{after}$)**
Compression drastically reduces bandwidth, and a paid upgrade path is ready.
- **Max Slip:** < 5% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Minor (1)**
- **$RE_{after}$ Score: 3 × 1 = 3 — Tolerable**

---

### RP-16 — Tenant Misses Auto-Generated Login

**Description**
Tenant accounts are auto-created when a landlord creates a lease, sending a temporary password via email. If the email goes to spam, or the tenant struggles with the mandatory "change password" step, they cannot log in.

**Mitigation & Contingency**
- **Mitigation:** Authenticate the email domain (SPF/DKIM) to prevent spam. Add a "Resend Login Email" button to the landlord dashboard.
- **Contingency:** Allow the landlord to view the temporary password in their dashboard so they can manually text it to the tenant via Zalo/SMS.

**Risk Exposure Before ($RE_{before}$)**
If emails are blocked, tenants cannot access the app.
- **Max Slip:** ~10–25% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Moderate (2)**
- **$RE_{before}$ Score: 3 × 2 = 6 — Substantial**

**Risk Exposure After ($RE_{after}$)**
Direct landlord-to-tenant messaging bypasses the email infrastructure entirely.
- **Max Slip:** < 10% schedule slip
- Probability: **15% (Very Low, 1)**
- Impact: **Minor (1)**
- **$RE_{after}$ Score: 1 × 1 = 1 — Tolerable**

---

### RP-17 — Fake Payment Screenshot

**Description**
Tenants upload fake payment proofs. Without automated bank integration, landlords over-trust the system.

**Mitigation & Contingency**
- **Mitigation:** Add a prominent UI disclaimer: "Please verify this payment in your own banking app."
- **Contingency:** If a landlord is tricked, log an incident and add a "Report Fraud" button to permanently block the offending tenant account.

**Risk Exposure Before ($RE_{before}$)**
Without a disclaimer, landlords falsely assume the system verifies the money, causing severe trust issues.
- **Max Slip:** ~30–50% budget/trust slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Severe (3)**
- **$RE_{before}$ Score: 4 × 3 = 12 — Critical**

**Risk Exposure After ($RE_{after}$)**
The disclaimer correctly sets expectations.
- **Max Slip:** < 10% budget slip
- Probability: **55% (Likely, 3)**
- Impact: **Minor (1)**
- **$RE_{after}$ Score: 3 × 1 = 3 — Tolerable**

---

### RP-18 — Data Privacy or Security Violation

**Description**
Tenant PII (ID, phone) or financial data is exposed due to an authorization bug or misconfiguration.

**Mitigation & Contingency**
- **Mitigation:** Enforce HTTPS and JWT checks per DoD. Security-sensitive stories require non-author review and synthetic test data.
- **Contingency:** Immediately take the database offline. Notify affected pilot users and academic supervisors within 24 hours, and patch the vulnerability before restarting.

**Risk Exposure Before ($RE_{before}$)**
A leaked database or API instantly shuts down the pilot.
- **Max Slip:** > 60% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Catastrophic (4)**
- **$RE_{before}$ Score: 3 × 4 = 12 — Critical**

**Risk Exposure After ($RE_{after}$)**
Strict tests keep data isolated, but any minor breach still halts the project temporarily.
- **Max Slip:** ~40–60% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Severe (3)**
- **$RE_{after}$ Score: 2 × 3 = 6 — Substantial**

---

### RP-19 — No Post-Project Owner

**Description**
After demo day, cloud resources accrue cost with no assigned payer.

**Mitigation & Contingency**
- **Mitigation:** Explicitly decide on a clean archive vs. a funded maintainer by Week 9.
- **Contingency:** If undecided, automatically export database backups and terminate all cloud resources on Demo Day + 7 to prevent unexpected billing.

**Risk Exposure Before ($RE_{before}$)**
Orphaned servers drain the creator's credit card.
- **Max Slip:** < 10% budget slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Minor (1)**
- **$RE_{before}$ Score: 4 × 1 = 4 — Moderate**

**Risk Exposure After ($RE_{after}$)**
The decision gracefully shuts down or funds the infrastructure.
- **Max Slip:** < 5% budget slip
- Probability: **55% (Likely, 3)**
- Impact: **Minor (1)**
- **$RE_{after}$ Score: 3 × 1 = 3 — Tolerable**

---

### RP-20 — Competitor Releases Similar Free App

**Description**
A competitor releases a similar free app before demo day, affecting pilot adoption.

**Mitigation & Contingency**
- **Mitigation:** Validate target user needs closely and prioritize differentiating features like VietQR.
- **Contingency:** Pivot the pilot pitch to emphasize the "local student-built, perfectly tailored" aspect to retain the few committed pilot landlords.

**Risk Exposure Before ($RE_{before}$)**
Competitors steal pilot users if there's no unique value proposition.
- **Max Slip:** ~30–40% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Severe (3)**
- **$RE_{before}$ Score: 2 × 3 = 6 — Substantial**

**Risk Exposure After ($RE_{after}$)**
Differentiation retains users.
- **Max Slip:** ~10–20% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Moderate (2)**
- **$RE_{after}$ Score: 2 × 2 = 4 — Moderate**

---

## 3. Risk Summary Dashboard

### 3.1 Risk Register

| ID | Risk Title | $RE_{before}$ Score | $RE_{before}$ Level | $RE_{after}$ Score | $RE_{after}$ Level |
|---|---|---|---|---|---|
| RP-01 | Academic Workload Reduces Availability | 12 | 🔴 Critical | 6 | 🟠 Substantial |
| RP-02 | React Native Mobile Overrun | 9 | 🟠 Substantial | 4 | 🟡 Moderate |
| RP-03 | Frontend Critical-Path Bottleneck | 12 | 🔴 Critical | 6 | 🟠 Substantial |
| RP-04 | Cross-Module API/Schema Conflict | 9 | 🟠 Substantial | 4 | 🟡 Moderate |
| RP-05 | Over-Reliance on AI-Generated Code | 12 | 🔴 Critical | 6 | 🟠 Substantial |
| RP-06 | Cron/Email/Push/PDF Infra Unavailable | 9 | 🟠 Substantial | 4 | 🟡 Moderate |
| RP-07 | Unclear or Shifting Requirements | 12 | 🔴 Critical | 6 | 🟠 Substantial |
| RP-08 | Scope Creep | 16 | 🔴 Critical | 6 | 🟠 Substantial |
| RP-09 | Batch Owner Unavailability | 9 | 🟠 Substantial | 4 | 🟡 Moderate |
| RP-10 | AI Token Quota Exhausted | 6 | 🟠 Substantial | 4 | 🟡 Moderate |
| RP-11 | Insufficient Pilot Landlords for UAT | 12 | 🔴 Critical | 6 | 🟠 Substantial |
| RP-12 | VietQR Format Incorrect or Changed | 6 | 🟠 Substantial | 2 | 🟢 Tolerable |
| RP-13 | Report and Dashboard Performance | 9 | 🟠 Substantial | 4 | 🟡 Moderate |
| RP-14 | CI/CD or Deployment Failure | 12 | 🔴 Critical | 6 | 🟠 Substantial |
| RP-15 | Supabase Free-Tier Quota Reached | 8 | 🟠 Substantial | 3 | 🟢 Tolerable |
| RP-16 | Tenant Misses Auto-Generated Login | 6 | 🟠 Substantial | 1 | 🟢 Tolerable |
| RP-17 | Fake Payment Screenshot | 12 | 🔴 Critical | 3 | 🟢 Tolerable |
| RP-18 | Data Privacy or Security Violation | 12 | 🔴 Critical | 6 | 🟠 Substantial |
| RP-19 | No Post-Project Owner | 4 | 🟡 Moderate | 3 | 🟢 Tolerable |
| RP-20 | Competitor Releases Similar Free App | 6 | 🟠 Substantial | 4 | 🟡 Moderate |

---

### 3.2 Inherent Risk vs. Residual Risk Level Summary

| Level | Inherent ($RE_{before}$) Count | Residual ($RE_{after}$) Count |
|---|---|---|
| 🔴 Critical (12–20) | 9 | 0 |
| 🟠 Substantial (6–11) | 10 | 8 |
| 🟡 Moderate (4–5) | 1 | 7 |
| 🟢 Tolerable (1–3) | 0 | 5 |

---

### 3.3 Priority Rankings (Ranked by $RE_{before}$ Score)

| Rank | ID | Risk Title | $RE_{before}$ | $RE_{after}$ | Risk Reduction |
|---|---|---|---|---|---|
| 1 | RP-08 | Scope Creep | 16 | 6 | -10 |
| 2 | RP-01 | Academic Workload Reduces Availability | 12 | 6 | -6 |
| 3 | RP-03 | Frontend Critical-Path Bottleneck | 12 | 6 | -6 |
| 4 | RP-05 | Over-Reliance on AI-Generated Code | 12 | 6 | -6 |
| 5 | RP-07 | Unclear or Shifting Requirements | 12 | 6 | -6 |
| 6 | RP-11 | Insufficient Pilot Landlords for UAT | 12 | 6 | -6 |
| 7 | RP-14 | CI/CD or Deployment Failure | 12 | 6 | -6 |
| 8 | RP-18 | Data Privacy or Security Violation | 12 | 6 | -6 |
| 9 | RP-17 | Fake Payment Screenshot | 12 | 3 | -9 |
| 10 | RP-02 | React Native Mobile Overrun | 9 | 4 | -5 |
| 11 | RP-04 | Cross-Module API/Schema Conflict | 9 | 4 | -5 |
| 12 | RP-06 | Cron/Email/Push/PDF Infra Unavailable | 9 | 4 | -5 |
| 13 | RP-09 | Batch Owner Unavailability | 9 | 4 | -5 |
| 14 | RP-13 | Report and Dashboard Performance | 9 | 4 | -5 |
| 15 | RP-15 | Supabase Free-Tier Quota Reached | 8 | 3 | -5 |
| 16 | RP-16 | Tenant Misses Auto-Generated Login | 6 | 1 | -5 |
| 17 | RP-10 | AI Token Quota Exhausted | 6 | 4 | -2 |
| 18 | RP-20 | Competitor Releases Similar Free App | 6 | 4 | -2 |
| 19 | RP-12 | VietQR Format Incorrect or Changed | 6 | 2 | -4 |
| 20 | RP-19 | No Post-Project Owner | 4 | 3 | -1 |

---

### 3.4 Top Watch Items

The following risks have the highest **Inherent Risk** and demand immediate action/enforcement from Day 1 to ensure their mitigations work:

1. **RP-08 (Scope Creep)** — Without a hard freeze, failure is nearly certain.
2. **RP-18 (Data Privacy)** — CI authorization tests and HTTPS must be enforced to prevent catastrophic leak.
3. **RP-14 (CI/CD Failure)** — Pipeline must be green and rollback tested to prevent Demo Day failure.
4. **RP-11 (UAT Recruitment)** — Landlord outreach must start in Week 1 to prevent empty MVP.
5. **RP-05 (AI Over-reliance)** — Non-author review must be strictly enforced to prevent severe bugs.
