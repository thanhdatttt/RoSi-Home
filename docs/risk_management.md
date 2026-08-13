# Risk Management Plans

### Risk Management Plan: RP-01 — Academic Workload Reduces Availability

**1. Objectives (The "Why")**
- Deliver the MVP within the 8–10 week window without sacrificing quality or deferring demo-day commitments.

**2. Deliverables and Milestones (The "What" and "When")**
- Reviewed daily at stand-up
  1. Daily stand-up log
  2. Sprint burndown (per batch)
  3. Scope cut list if velocity drops.

**3. Responsibilities (The "Who" and "Where")**
- PM monitors velocity: Tasks 1, 2, 3
- all five members report blockers and availability changes: Support of tasks 1

**4. Approach (The "How")**
- Maintain 8–10 week range as the schedule baseline
- Treat Week 10 as contingency, not automatic additional scope. Daily 10-minute async stand-up. Rebalance assignments when a member signals reduced availability. Cut non-essential stories (notifications, PDF export, analytics) before cutting the deadline.

**5. Resources (The "How Much")**
- ~50,000 VND in coordination overhead within existing budget.

**6. Risk Characterization (Quantitative)**
- Probability: **High** (Likely, 3) — common in student teams, exams/coursework overlap the project.
- Severity: **Harmful** (2) — buffer week absorbs it, but repeated hits compress the schedule.
- Risk Score: **3 × 2 = 6 — Substantial risk**
- Time of Occurrence: any week, peak risk around exam periods (~Weeks 4–7).
- Warning Signs: a member misses 2+ consecutive stand-ups; sprint velocity drops >20% for 2 sprints in a row; recurring "reduced availability" notes in the blocker log.

---

### Risk Management Plan: RP-02 — React Native Mobile Overrun

**1. Objectives (The "Why")**
- Keep mobile delivery within the planned 2-batch FE window (Weeks 3–8) without blocking system integration testing.

**2. Deliverables and Milestones (The "What" and "When")**
- Walking skeleton: end of Week 5. Walking-skeleton mobile app (login → invoice view → QR) by end of FE Batch 1
- fully integrated: end of Week 8. Feature-complete by FE Batch 3.

**3. Responsibilities (The "Who" and "Where")**
- FE1 (MXH) and FE2 (Quân): Tasks 1, 2
- PM monitors weekly: Support of tasks 1

**4. Approach (The "How")**
- Build a thin end-to-end vertical slice in the first FE sprint to surface React Native/Expo surprises early. Use AI tools to scaffold screens from the shared design system. Reuse API business logic via the shared REST API. Begin UI scaffolding in parallel with BE Batch 1 using agreed contracts.

**5. Resources (The "How Much")**
- ~80,000 VND in extra planning within existing budget.

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — team is new to RN/Expo but has a vertical-slice safety net.
- Severity: **Harmful** (2) — would block integration testing if it slips.
- Risk Score: **2 × 2 = 4 — Moderate risk**
- Time of Occurrence: Weeks 3–8 (FE build window).
- Warning Signs: walking skeleton not done by end of Week 5; recurring Expo/RN build errors blocking work >2 days; FE velocity below plan at Batch 1 close.

---

### Risk Management Plan: RP-03 — Frontend Critical-Path Bottleneck

**1. Objectives (The "Why")**
- Prevent the sequential BE-leads-FE batch model from creating a frontend backlog that delays MVP candidate status.

**2. Deliverables and Milestones (The "What" and "When")**
- FE Batch 1 integrated: Week 5. Integrated and verified FE batch per batch boundary (not "all FE at once").

**3. Responsibilities (The "Who" and "Where")**
- FE1 (MXH), FE2 (Quân): Tasks 1
- Batch integration owner appointed at each boundary: Support of tasks 1

**4. Approach (The "How")**
- Build shared UI components and navigation during BE Batch 1 (FE pre-work). Define API contracts before BE implementation so FE can use mocks. Integrate each batch rather than building all FE screens then integrating all at once.

**5. Resources (The "How Much")**
- No additional cash cost
- Need time management discipline.

**6. Risk Characterization (Quantitative)**
- Probability: **High** (Likely, 3) — structural consequence of the sequential BE→FE model.
- Severity: **Harmful** (2) — delays MVP candidate status but doesn't stop the project.
- Risk Score: **3 × 2 = 6 — Substantial risk**
- Time of Occurrence: each batch boundary (Weeks 2, 4, 6, 8).
- Warning Signs: FE backlog size growing batch-over-batch; a batch not integrated by its boundary date; FE velocity trailing BE velocity by >30%.

---

### Risk Management Plan: RP-04 — Cross-Module API/Schema Conflict

**1. Objectives (The "Why")**
- Prevent merge conflicts and rework caused by incompatible schema or API changes, especially across the three non-overlapping BE domains (Chí: auth/lease, Dat: property/meter/invoice, Minh: maintenance/payment/report).

**2. Deliverables and Milestones (The "What" and "When")**
- Contract agreement completed before each batch starts (before Weeks 2, 4, 6, 8).
  1. Pre-batch API and data contract agreements
  2. Mandatory affected-owner PR review for shared schema changes.

**3. Responsibilities (The "Who" and "Where")**
- Batch integration owner (named per batch per Project Plan): Tasks 1, 2
- PM resolves conflicts: Support of tasks 1

**4. Approach (The "How")**
- Hold a pre-batch contract meeting
- Document API contracts and Drizzle schema changes in the PR before merge
- All changes to shared database tables require approval from every affected module owner. Use separate feature branches/worktrees per story to isolate merge conflicts.

**5. Resources (The "How Much")**
- ~60,000 VND in planning meeting effort within budget.

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — mitigated by pre-batch contract meetings, but 3 independent BE owners create exposure.
- Severity: **Harmful** (2) — causes rework and merge delays, not a project blocker.
- Risk Score: **2 × 2 = 4 — Moderate risk**
- Time of Occurrence: start of each batch (Weeks 2, 4, 6, 8).
- Warning Signs: a schema PR rejected by an affected owner; >1 shared-migration merge conflict per week; a pre-batch contract meeting skipped or held without all owners.

---

### Risk Management Plan: RP-05 — Over-Reliance on AI-Generated Code

**1. Objectives (The "Why")**
- Ensure every merged story meets the Universial Definition of Done, including authorization, ownership, and security requirements, regardless of whether code was AI-generated.

**2. Deliverables and Milestones (The "What" and "When")**
- Review policy in place before Batch 1 coding begins.
  1. PR review checklist
  2. Author explanation of business/security logic
  3. CI test coverage.

**3. Responsibilities (The "Who" and "Where")**
- All five developers: Tasks 1, 2, 3
- Reviewer is always a non-author: Support of tasks 1

**4. Approach (The "How")**
- Every PR must include: author comment explaining business or security logic, non-author reviewer approval, automated tests covering the main success and authorization paths. Follow the project plan's Implementation Procedure. Weekly team code walkthrough for complex modules.

**5. Resources (The "How Much")**
- No additional cash cost
- Built into team review overhead (~25% of capacity per resource baseline).

**6. Risk Characterization (Quantitative)**
- Probability: **High** (Likely, 3) — heavy AI-assisted coding across all five members.
- Severity: **Harmful** (2) — could ship security/authorization defects.
- Risk Score: **3 × 2 = 6 — Substantial risk**
- Time of Occurrence: continuous, from Batch 1 onward.
- Warning Signs: a PR merged without non-author review; missing author explanation comment on a PR; CI security/authorization test coverage falling below target.

---

### Risk Management Plan: RP-06 — Cron/Email/Push/PDF Infrastructure Unavailable

**1. Objectives (The "Why")**
- Prevent Batch 3 (INVOICE-01, VIETQR-02, REMINDER-01/02) and Batch 4 (REPORT-05 PDF export) from being blocked by an unready external integration.

**2. Deliverables and Milestones (The "What" and "When")**
- Interface definitions: before Batch 2 ends (Week 5)
  1. Provider interface definitions
  2. Development adapters (stubs)
  3. End-to-end tests with real providers before batch acceptance.

**3. Responsibilities (The "Who" and "Where")**
- Dev 4 (Security and external-service foundation owner per assignments): Tasks 1, 2, 3
- Dev 5 (PDF generation interface owner): Support of tasks 1

**4. Approach (The "How")**
- Define provider interfaces early (Batch 0)
- Implement development adapters so stories can be coded and tested without live external services
- Validate real provider integration (Email, Expo push, Render cron) before Batch 3 stories reach the Done state.

**5. Resources (The "How Much")**
- No additional cash cost
- Interface design is included in existing story effort estimates.

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — mitigated by stub adapters, but real third-party services are outside team control.
- Severity: **Harmful** (2) — blocks specific batches, not the whole project.
- Risk Score: **2 × 2 = 4 — Moderate risk**
- Time of Occurrence: before Batch 3 (~Week 6) and Batch 4 (~Week 8).
- Warning Signs: stub adapters not ready by Batch 2 close; provider sandbox/account not verified; end-to-end test against a real provider fails.

---

### Risk Management Plan: RP-07 — Unclear or Shifting Requirements

**1. Objectives (The "Why")**
- Prevent mid-batch rework caused by unresolved product decisions or late landlord feedback.

**2. Deliverables and Milestones (The "What" and "When")**
- Batch-level readiness review at each batch kickoff
  1. All "Needs Clarification" items resolved before their batch
- Change log maintained continuously.
  1. change request log.

**3. Responsibilities (The "Who" and "Where")**
- PM manages resolution: Tasks 1, 2
- Landlord representative reviews and approves: Support of tasks 1

**4. Approach (The "How")**
- Hold a pre-batch readiness review
- Resolve "Needs Clarification" items using experience and bounded assumptions documented in the backlog decision record
- Formal change request for any post-sign-off additions.

**5. Resources (The "How Much")**
- ~60,000 VND in interview/workshop effort.

**6. Risk Characterization (Quantitative)**
- Probability: **High** (Likely, 3) — classic top risk per "Software Risk Check List" (Unclear requirements, Too many requirement changes).
- Severity: **Harmful** (2) — causes rework, not project failure.
- Risk Score: **3 × 2 = 6 — Substantial risk**
- Time of Occurrence: each batch kickoff.
- Warning Signs: >2 "Needs Clarification" items still open at batch kickoff; landlord feedback contradicts an earlier sign-off; change-request log growing faster than usual.

---

### Risk Management Plan: RP-08 — Scope Creep

**1. Objectives (The "Why")**
- Protect the 8–10 week timeline by restricting work to the approved scope.

**2. Deliverables and Milestones (The "What" and "When")**
- Scope freeze from Day 1
  1. Frozen MVP backlog
  2. "Later" feature list
  3. Change request log.

**3. Responsibilities (The "Who" and "Where")**
- PM enforces: Tasks 1, 2, 3
- Requires Sponsor approval for any baseline change: Support of tasks 1

**4. Approach (The "How")**
- Any feature idea not in the approved backlog goes to the "later" list
- Formal change request required per Project Plan and SOW.
- No feature is implemented without team consensus and Sponsor approval.

**5. Resources (The "How Much")**
- No additional cash cost.

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — process control (scope freeze + sponsor gate) reduces frequency.
- Severity: **Extremely harmful** (3) — if it slips through, it directly threatens the fixed timeline.
- Risk Score: **2 × 3 = 6 — Substantial risk**
- Time of Occurrence: any time after Day 1, peak risk near demo day as team feels pressure to "add one more thing."
- Warning Signs: a feature request bypasses the "later" list; a PR contains functionality outside the frozen backlog; Sponsor is asked to approve an unplanned demo feature late in the schedule.

---

### Risk Management Plan: RP-09 — Batch Owner Unavailability (Knowledge Silo)

**1. Objectives (The "Why")**
- Prevent a single team member's unavailability from blocking an entire domain batch.

**2. Deliverables and Milestones (The "What" and "When")**
- Documentation current per story
  1. Module documentation wiki
- Backup owners assigned before started
  1. Backup owner matrix
- Cross-training by Week 3.
  1. Cross-review logs.

**3. Responsibilities (The "Who" and "Where")**
- All team members: Tasks 1, 2, 3
- PM assigns backup owners before batch start: Support of tasks 2

**4. Approach (The "How")**
- Atomic commits with meaningful messages
- Mandatory PR cross-review (reviewer must be from a different domain)
- PM maintains a backup owner matrix
- Each member documents their module's API, migration, and business logic before the next batch starts.

**5. Resources (The "How Much")**
- No additional cost.

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — cross-training and backup-owner assignment reduce likelihood.
- Severity: **Harmful** (2) — can stall one domain's batch, mitigated by backups.
- Risk Score: **2 × 2 = 4 — Moderate risk**
- Time of Occurrence: any batch boundary.
- Warning Signs: module documentation not updated for >1 week; no backup owner assigned before a batch starts; single-author commit share >80% in a module.

---

### Risk Management Plan: RP-10 — AI Token Quota Exhausted or Plan Expires

**1. Objectives (The "Why")**
- Maintain AI-assisted development velocity throughout all four batches.

**2. Deliverables and Milestones (The "What" and "When")**
- Weekly review: Weekly AI usage tracking report
- Alert at 80% of each cohort's budget spend alert thresholds configured.

**3. Responsibilities (The "Who" and "Where")**
- PM monitors: Tasks 1, 2
- Each developer tracks their own cohort usage: Support of tasks 1

**4. Approach (The "How")**
- Monitor usage weekly.
- Use lower-cost model tiers (Gemini Flash, Claude Haiku) for routine CRUD stories
- Reserve premium models for complex stories
- The contingency reserve covers moderate API overruns.

**5. Resources (The "How Much")**
- 500,000 VND contingency reserve already budgeted.

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — usage tracking + tiered model strategy reduce likelihood.
- Severity: **Harmful** (2) — slows velocity but contingency reserve absorbs cost.
- Risk Score: **2 × 2 = 4 — Moderate risk**
- Time of Occurrence: any week; cumulative exposure increases toward project end.
- Warning Signs: 80%-of-budget alert triggers for any cohort; unexpected spike in premium-model calls; a developer reports quota-exceeded errors.

---

### Risk Management Plan: RP-11 — Insufficient Pilot Landlords for UAT

**1. Objectives (The "Why")**
- Confirm that the MVP satisfies real landlord workflows with at least 3 pilot participants before the final demonstration.

**2. Deliverables and Milestones (The "What" and "When")**
- Begin outreach Week 1
  1. Landlord recruitment list
  2. UAT session notes
  3. Consent forms.

**3. Responsibilities (The "Who" and "Where")**
- PM leads: Tasks 1, 2, 3
- All team members contribute via personal networks: Support of tasks 1

**4. Approach (The "How")**
- Reach out immediately via personal contacts
- Post in social landlord groups
- Engage local boarding-house communities
- Do not wait for the app to be finished before starting outreach.

**5. Resources (The "How Much")**
- No cash cost
- PM time.

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — early, multi-channel outreach reduces likelihood but recruitment is inherently uncertain.
- Severity: **Extremely harmful** (3) — without real UAT, MVP validity and demo credibility are undermined.
- Risk Score: **2 × 3 = 6 — Substantial risk**
- Time of Occurrence: ongoing from Week 1, critical by Week 6.
- Warning Signs: fewer than 3 landlords committed by Week 3; no outreach responses after 2 weeks; consent forms not returned by prospective participants.

---

### Risk Management Plan: RP-12 — VietQR Format Incorrect or Changed

**1. Objectives (The "Why")**
- Ensure the payment QR code parses correctly in all major Vietnamese banking apps.

**2. Deliverables and Milestones (The "What" and "When")**
- QR integration tested before VIETQR-02 is marked Done (Batch 3, Week 6).
  1. VietQR format test suite
  2. Banking app compatibility list (Vietcombank, Techcombank, MBBank).

**3. Responsibilities (The "Who" and "Where")**
- Dev 3 (Minh — payment module owner): Tasks 1, 2

**4. Approach (The "How")**
- Implement strictly against VietQR/NAPAS official documentation
- Include automated QR payload format check in tests.
- Test generated codes with some banking apps before acceptance.

**5. Resources (The "How Much")**
- No additional cost.

**6. Risk Characterization (Quantitative)**
- Probability: **Low** (Highly unlikely, 1) — spec is public and stable; team implements strictly against official documentation.
- Severity: **Harmful** (2) — would block payment verification for affected banks.
- Risk Score: **1 × 2 = 2 — Tolerable risk**
- Time of Occurrence: before Batch 3 / Week 6.
- Warning Signs: a NAPAS/VietQR spec update notice; QR fails to scan in ≥1 tested banking app; payload checksum mismatch in the automated test suite.

---

### Risk Management Plan: RP-13 — Report and Dashboard Performance

**1. Objectives (The "Why")**
- Deliver performant business reports and dashboards that are acceptable to pilot landlords with 5–30 rooms.

**2. Deliverables and Milestones (The "What" and "When")**
- Performance validated before REPORT-01 acceptance (Batch 4, Week 8).
  1. Performance test results with representative data (5–30 rooms × 3–6 months)
  2. Indexed query plan.

**3. Responsibilities (The "Who" and "Where")**
- Dev 3 (Minh — report owner): Tasks 1, 2
- Dev 2 (Dat — dashboard 03/04 owner): Support of tasks 1

**4. Approach (The "How")**
- Use indexed foreign keys in Drizzle schema from the start
- Add pagination and date-range filtering to all report endpoints
- Profile slow queries using Supabase query analyzer.

**5. Resources (The "How Much")**
- No additional cash cost.

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — data volumes are small (5–30 rooms), but indexing/pagination must be done correctly.
- Severity: **Harmful** (2) — degrades UX at pilot demo, not a system failure.
- Risk Score: **2 × 2 = 4 — Moderate risk**
- Time of Occurrence: before Batch 4 / Week 8.
- Warning Signs: query response time >2s with representative data; missing index detected in the query plan; dashboard fails to load smoothly at the 30-room dataset size.

---

### Risk Management Plan: RP-14 — CI/CD or Deployment Failure

**1. Objectives (The "Why")**
- Maintain a continuously deployable baseline that all five team members can validate against.

**2. Deliverables and Milestones (The "What" and "When")**
- CI verified at Batch 0 (infrastructure setup)
  1. CI pipeline
  2. Previous-revision rollback procedure
  3. Local demo environment.

**3. Responsibilities (The "Who" and "Where")**
- Dev 3 (Dat): Task 1
- All devs: Tasks 2, 3
- PM is release owner: Support of tasks 1

**4. Approach (The "How")**
- Fix failed CI checks before merge per DoD
- Retain previous deployable revision
- Configure the deployment pipeline to deploy only on passing builds
- Maintain a local environment as a demo fallback (critical for demo day if cloud is down).

**5. Resources (The "How Much")**
- No additional cost.

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — DoD gate and pinned rollback reduce likelihood.
- Severity: **Extremely harmful** (3) — a failure right at demo day would be highly visible and hard to recover from quickly.
- Risk Score: **2 × 3 = 6 — Substantial risk**
- Time of Occurrence: Batch 0 setup, and any time after (peak sensitivity near demo day).
- Warning Signs: CI pipeline red for more than 1 day; a rollback rehearsal fails; a build succeeds locally but fails in CI.

---

### Risk Management Plan: RP-15 — Supabase Free-Tier Quota Reached

**1. Objectives (The "Why")**
- Keep cloud infrastructure operational throughout the 8-10 week development and pilot period.

**2. Deliverables and Milestones (The "What" and "When")**
- Usage monitored from Batch 2 when maintenance photos and payment proofs are introduced.
  1. Weekly Supabase usage report
  2. Image compression implementation.

**3. Responsibilities (The "Who" and "Where")**
- Dev 2 (Chi — database foundation owner): Tasks 1, 2
- Dev 4 (Hung): Support of tasks 1

**4. Approach (The "How")**
- Compress maintenance and payment proof images client-side before upload
- Delete test/duplicate files during development
- Monitor Supabase dashboard weekly
- Delete stale pilot accounts before demo.

**5. Resources (The "How Much")**
- ~100,000 VND for one month of Supabase Pro if free tier is reached (within contingency).

**6. Risk Characterization (Quantitative)**
- Probability: **High** (Likely, 3) — free-tier storage/bandwidth limits are typically tight once image uploads start.
- Severity: **Slightly harmful** (1) — a paid-tier upgrade path is already budgeted, so impact is easily contained.
- Risk Score: **3 × 1 = 3 — Tolerable risk**
- Time of Occurrence: from Batch 2 (photo/proof uploads) onward.
- Warning Signs: weekly usage report shows >70% of quota; a storage/bandwidth warning email from Supabase; test/duplicate files not cleaned up before demo.

---

### Risk Management Plan: RP-16 — Tenant Onboarding Flow Fails UAT

**1. Objectives (The "Why")**
- Validate that the two-sided platform's tenant onboarding is discoverable and executable by non-technical users.

**2. Deliverables and Milestones (The "What" and "When")**
- Usability test before Batch 2 acceptance (Week 5).
  1. Usability test with at least one proxy tenant
  2. Onboarding guide (optional).

**3. Responsibilities (The "Who" and "Where")**
- FE1 (MXH — tenant/lease UI owner): Tasks 1, 2
- PM coordinates test: Support of tasks 1

**4. Approach (The "How")**
- Test the full tenant provisioning flow (landlord creates lease → system sends temp password email → tenant logs in via email link) with at least one proxy user before marking US-TENANT-02 as Done
- Include a simple in-app onboarding guide (optional).

**5. Resources (The "How Much")**
- No additional cash cost.

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — usability testing before acceptance catches most issues early.
- Severity: **Harmful** (2) — a failed onboarding flow undermines pilot adoption.
- Risk Score: **2 × 2 = 4 — Moderate risk**
- Time of Occurrence: before Batch 2 acceptance / Week 5.
- Warning Signs: proxy tenant cannot complete the flow unaided; temp-password email not received or delayed; more than 2 confusion points recorded during the usability test.

---

### Risk Management Plan: RP-17 — Fake Payment Screenshot

**1. Objectives (The "Why")**
- Ensure landlords understand the system's manual verification limitation so they are not misled about payment confirmation.

**2. Deliverables and Milestones (The "What" and "When")**
- Disclaimer in place before UAT (Week 6).
  1. Clear UI disclaimer on the payment verification screen
  2. Onboarding guidance (optional).

**3. Responsibilities (The "Who" and "Where")**
- FE1 (MXH — payment UI): Tasks 1, 2
- PM verifies in UAT checklist: Support of tasks 1

**4. Approach (The "How")**
- Display: "Please check your own banking app to confirm payment before marking as Paid." Include this in the notification or on the payment verification screen.

**5. Resources (The "How Much")**
- No additional cost.

**6. Risk Characterization (Quantitative)**
- Probability: **High** (Likely, 3) — manual verification is inherently exploitable; expect it to be attempted at least once during pilot.
- Severity: **Slightly harmful** (1) — a UI disclaimer fully addresses expectations; no system failure results.
- Risk Score: **3 × 1 = 3 — Tolerable risk**
- Time of Occurrence: before UAT / Week 6, ongoing during pilot.
- Warning Signs: a build ships without the disclaimer; a UAT tester marks a fake payment "Paid" without checking their banking app; a landlord raises a trust complaint about payment status.

---

### Risk Management Plan: RP-18 — US AI Service Inaccessible from Vietnam

**1. Objectives (The "Why")**
- Maintain full team implementation capacity if one AI cohort loses access.

**2. Deliverables and Milestones (The "What" and "When")**
- Fallback plan documented before Batch 1
  1. Documented AI provider fallback plan
- Reviewed at each batch boundary.
  1. Preserved local project context.

**3. Responsibilities (The "Who" and "Where")**
- PM: Tasks 1, 2
- OpenAI cohort members: Support of tasks 1

**4. Approach (The "How")**
- OpenAI cohort members have documented fallback to Antigravity (Google Gemini) per the resource capacity baseline
- Maintain VPN and alternative network access as a contingency
- Ensure all local project context (backlog, architecture, codebase) is documented so any model can be substituted
- Prioritize critical-path stories for the Google cohort if OpenAI access is lost.

**5. Resources (The "How Much")**
- No additional cash cost for the fallback
- VPN cost covered by contingency if needed.

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — access disruptions are episodic and outside team control, but not the common case.
- Severity: **Extremely harmful** (3) — removes a meaningful share of the team's AI-assisted capacity if it hits.
- Risk Score: **2 × 3 = 6 — Substantial risk**
- Time of Occurrence: any week; more likely during periods of regulatory or network change.
- Warning Signs: OpenAI cohort members report blocked API calls; VPN becomes required to reach the provider; sustained latency or outage lasting more than 1 day.

---

### Risk Management Plan: RP-19 — Data Privacy or Security Violation

**1. Objectives (The "Why")**
- Protect tenant PII throughout development and pilot
- Ensure authorization enforcement is correct at the API layer.

**2. Deliverables and Milestones (The "What" and "When")**
- Authorization verified in every story's CI tests from Batch 1
  1. Authorization tests per story
  2. HTTPS-only configuration
  3. Privacy notice for pilot users.

**3. Responsibilities (The "Who" and "Where")**
- All dev: Tasks 1, 2, 3
- Reviewer for all auth/PII stories: Support of tasks 1

**4. Approach (The "How")**
- Use synthetic/test data during development
- HTTPS on all endpoints
- JWT authorization enforced at the API per the Global DoD
- Never log or return passwords, tokens, or cross-tenant data
- Security-sensitive story is reviewed
- Basic privacy notice to all pilot users before sharing their real data.

**5. Resources (The "How Much")**
- ~50,000 VND for SSL/domain (already in budget).

**6. Risk Characterization (Quantitative)**
- Probability: **Medium** (Unlikely, 2) — mandatory CI authorization tests and security review reduce likelihood.
- Severity: **Extremely harmful** (3) — a real PII leak would compromise pilot trust and could force the pilot to halt.
- Risk Score: **2 × 3 = 6 — Substantial risk**
- Time of Occurrence: continuous, from Batch 1 onward; highest stakes once real pilot data is used.
- Warning Signs: an authorization test missing or failing in CI; PII found in application logs; an endpoint reachable over plain HTTP.

---

### Risk Management Plan: RP-20 — No Post-Project Owner

**1. Objectives (The "Why")**
- Avoid undefined cloud cost obligations or a production system with no maintainer.

**2. Deliverables and Milestones (The "What" and "When")**
- Decision before Week 10 (1 week before demo day).
  1. Documented team decision
  2. Clean archive or handover package.

**3. Responsibilities (The "Who" and "Where")**
- PM: Tasks 1, 2
- Supervisor approves the plan: Support of tasks 1

**4. Approach (The "How")**
- Option A: Clean archive — shut down cloud resources, write a comprehensive README, archive the repository at demo day.
- Option B: One volunteer commits to post-graduation maintenance with documented infrastructure, costs (VND 200,000-400,000/month), and responsibilities. Decide explicitly with supervisor.

**5. Resources (The "How Much")**
- Option A: No ongoing cost.
- Option B: ~VND 200,000-400,000/month cloud costs.

**6. Risk Characterization (Quantitative)**
- Probability: **High** (Likely, 3) — common outcome for student capstone projects absent an explicit decision.
- Severity: **Slightly harmful** (1) — both Option A and B are pre-planned and bounded, so undecided status is easily resolved.
- Risk Score: **3 × 1 = 3 — Tolerable risk**
- Time of Occurrence: decision due by Week 9–10.
- Warning Signs: no volunteer identified by Week 9; supervisor has not approved a plan by Week 9; a cloud billing alert arrives with no assigned payer.

---

## 7. Risk Monitoring Dashboard

| Risk Item | Score | Risk Level | Ranking (This) | Ranking (Last) | Risk Resolution Progress |
|---|---|---|---|---|---|
| RP-01 — Academic Workload Reduces Availability | 6 | Substantial | 1 | — | Not started|
| RP-03 — Frontend Critical-Path Bottleneck | 6 | Substantial | 2 | — | Not started|
| RP-05 — Over-Reliance on AI-Generated Code | 6 | Substantial | 3 | — | Not started|
| RP-07 — Unclear or Shifting Requirements | 6 | Substantial | 4 | — | Not started|
| RP-08 — Scope Creep | 6 | Substantial | 5 | — | Not started|
| RP-11 — Insufficient Pilot Landlords for UAT | 6 | Substantial | 6 | — | Not started|
| RP-14 — CI/CD or Deployment Failure | 6 | Substantial | 7 | — | Not started|
| RP-18 — US AI Service Inaccessible from Vietnam | 6 | Substantial | 8 | — | Not started|
| RP-19 — Data Privacy or Security Violation | 6 | Substantial | 9 | — | Not started|
| RP-02 — React Native Mobile Overrun | 4 | Moderate | 10 | — | Not started|
| RP-04 — Cross-Module API/Schema Conflict | 4 | Moderate | 11 | — | Not started|
| RP-06 — Cron/Email/Push/PDF Infra Unavailable | 4 | Moderate | 12 | — | Not started|
| RP-09 — Batch Owner Unavailability | 4 | Moderate | 13 | — | Not started|
| RP-10 — AI Token Quota Exhausted | 4 | Moderate | 14 | — | Not started|
| RP-13 — Report and Dashboard Performance | 4 | Moderate | 15 | — | Not started|
| RP-16 — Tenant Onboarding Flow Fails UAT | 4 | Moderate | 16 | — | Not started|
| RP-15 — Supabase Free-Tier Quota Reached | 3 | Tolerable | 17 | — | Not started|
| RP-17 — Fake Payment Screenshot | 3 | Tolerable | 18 | — | Not started|
| RP-20 — No Post-Project Owner | 3 | Tolerable | 19 | — | Not started|
| RP-12 — VietQR Format Incorrect or Changed | 2 | Tolerable | 20 | — | Not started|