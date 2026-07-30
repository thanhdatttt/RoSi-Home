# Risk Management Plans

### Risk Management Plan: RP-01 — Academic Workload Reduces Availability

**1. Objectives (The "Why")**
- Deliver the MVP within the 8–10 week window without sacrificing quality or deferring demo-day commitments.

**2. Deliverables and Milestones (The "What" and "When")**
- Reviewed daily at stand-up
  1. Daily stand-up log
  2. sprint burndown (per batch)
  3. scope cut list if velocity drops.

**3. Responsibilities (The "Who" and "Where")**
- PM monitors velocity
  Tasks 1, 2, 3
- all five members report blockers and availability changes.
  Support of tasks 1

**4. Approach (The "How")**
- Maintain 8–10 week range as the schedule baseline
- treat Week 10 as contingency, not automatic additional scope. Daily 10-minute async stand-up. Rebalance assignments when a member signals reduced availability. Cut non-essential stories (notifications, PDF export, analytics) before cutting the deadline.

**5. Resources (The "How Much")**
- ~50,000 VND in coordination overhead
- within existing budget.

### Risk Management Plan: RP-02 — React Native Mobile Overrun

**1. Objectives (The "Why")**
- Keep mobile delivery within the planned 2-batch FE window (Weeks 3–8) without blocking system integration testing.

**2. Deliverables and Milestones (The "What" and "When")**
- Walking skeleton: end of Week 5
  1. Walking-skeleton mobile app (login → invoice view → QR) by end of FE Batch 1
- fully integrated: end of Week 8.
  2. feature-complete by FE Batch 3.

**3. Responsibilities (The "Who" and "Where")**
- FE1 (MXH) and FE2 (Quân)
  Tasks 1, 2
- PM monitors weekly.
  Support of tasks 1

**4. Approach (The "How")**
- Build a thin end-to-end vertical slice in the first FE sprint to surface React Native/Expo surprises early. Use AI tools to scaffold screens from the shared design system. Reuse API business logic via the shared REST API. Begin UI scaffolding in parallel with BE Batch 1 using agreed contracts.

**5. Resources (The "How Much")**
- ~80,000 VND in extra planning
- within existing budget.

### Risk Management Plan: RP-03 — Frontend Critical-Path Bottleneck

**1. Objectives (The "Why")**
- Prevent the sequential BE-leads-FE batch model from creating a frontend backlog that delays MVP candidate status.

**2. Deliverables and Milestones (The "What" and "When")**
- FE Batch 1 integrated: Week 5
  1. Integrated and verified FE batch per batch boundary (not "all FE at once").

**3. Responsibilities (The "Who" and "Where")**
- FE1 (MXH), FE2 (Quân)
  Tasks 1
- batch integration owner appointed at each boundary.
  Support of tasks 1

**4. Approach (The "How")**
- Build shared UI components and navigation during BE Batch 1 (FE pre-work). Define API contracts before BE implementation so FE can use mocks. Integrate each batch rather than building all FE screens then integrating all at once.

**5. Resources (The "How Much")**
- No additional cash cost
- time management discipline.

### Risk Management Plan: RP-04 — Cross-Module API/Schema Conflict

**1. Objectives (The "Why")**
- Prevent merge conflicts and rework caused by incompatible schema or API changes, especially across the three non-overlapping BE domains (Chí: auth/lease
- Dat: property/meter/invoice
- Minh: maintenance/payment/report).

**2. Deliverables and Milestones (The "What" and "When")**
- Contract agreement completed before each batch starts (before Weeks 2, 4, 6, 8).
  1. Pre-batch API and data contract agreements
  2. mandatory affected-owner PR review for shared schema changes.

**3. Responsibilities (The "Who" and "Where")**
- Batch integration owner (named per batch per Project Plan §6.3)
  Tasks 1, 2
- PM resolves conflicts.
  Support of tasks 1

**4. Approach (The "How")**
- Hold a pre-batch contract meeting
- document API contracts and Drizzle schema changes in the PR before merge
- all changes to shared database tables require approval from every affected module owner. Use separate feature branches/worktrees per story to isolate merge conflicts.

**5. Resources (The "How Much")**
- ~60,000 VND in planning meeting effort
- within budget.

### Risk Management Plan: RP-05 — Over-Reliance on AI-Generated Code

**1. Objectives (The "Why")**
- Ensure every merged story meets the Global Definition of Done, including authorization, ownership, and security requirements, regardless of whether code was AI-generated.

**2. Deliverables and Milestones (The "What" and "When")**
- Review policy in place before Batch 1 coding begins.
  1. PR review checklist
  2. author explanation of business/security logic
  3. CI test coverage.

**3. Responsibilities (The "Who" and "Where")**
- All five developers
  Tasks 1, 2, 3
- reviewer is always a non-author
  Support of tasks 1
- Dev 4 (security/external-service owner) reviews auth, JWT, payment, and PII-handling stories.
  Support of tasks 1

**4. Approach (The "How")**
- Every PR must include: (1) author comment explaining AI-generated business or security logic, (2) non-author reviewer approval, (3) automated tests covering the main success and authorization paths. Follow the project plan's Implementation Procedure (§3.3). Weekly team code walkthrough for complex modules.

**5. Resources (The "How Much")**
- No additional cash cost
- built into team review overhead (~25% of capacity per resource baseline).

### Risk Management Plan: RP-06 — Cron/Email/Push/PDF Infrastructure Unavailable

**1. Objectives (The "Why")**
- Prevent Batch 3 (INVOICE-01, VIETQR-02, REMINDER-01/02) and Batch 4 (REPORT-05 PDF export) from being blocked by an unready external integration.

**2. Deliverables and Milestones (The "What" and "When")**
- Interface definitions: before Batch 2 ends (Week 5)
  1. Provider interface definitions
  2. development adapters (stubs)
  3. end-to-end tests with real providers before batch acceptance.

**3. Responsibilities (The "Who" and "Where")**
- Dev 4 (Security and external-service foundation owner per assignments)
  Tasks 1, 2, 3
- Dev 5 (PDF generation interface owner).
  Support of tasks 1

**4. Approach (The "How")**
- Define provider interfaces early (Batch 0)
- implement development adapters so stories can be coded and tested without live external services
- validate real provider integration (Resend email, Expo push, Render cron) before Batch 3 stories reach the Done state.

**5. Resources (The "How Much")**
- No additional cash cost
- interface design is included in existing story effort estimates.

### Risk Management Plan: RP-07 — Unclear or Shifting Requirements

**1. Objectives (The "Why")**
- Prevent mid-batch rework caused by unresolved product decisions (similar to PD-03 utility pricing) or late landlord feedback.

**2. Deliverables and Milestones (The "What" and "When")**
- Batch-level readiness review at each batch kickoff
  1. All "Needs Clarification" items resolved before their batch
- change log maintained continuously.
  2. change request log.

**3. Responsibilities (The "Who" and "Where")**
- PM manages resolution
  Tasks 1, 2
- landlord representative reviews and approves.
  Support of tasks 1

**4. Approach (The "How")**
- Hold a pre-batch readiness review
- resolve "Needs Clarification" items using experience and bounded assumptions documented in the backlog decision record (Section 3 of the Product Backlog)
- formal change request for any post-sign-off additions.

**5. Resources (The "How Much")**
- ~60,000 VND in interview/workshop effort.

### Risk Management Plan: RP-08 — Scope Creep

**1. Objectives (The "Why")**
- Protect the 8–10 week timeline by restricting work to the approved scope.

**2. Deliverables and Milestones (The "What" and "When")**
- Scope freeze from Day 1
  1. Frozen MVP backlog
  2. "later" feature list
  3. change request log.

**3. Responsibilities (The "Who" and "Where")**
- PM enforces
  Tasks 1, 2, 3
- requires Sponsor approval for any baseline change.
  Support of tasks 1

**4. Approach (The "How")**
- Any feature idea not in the approved backlog goes to the "later" list
- formal change request required per Project Plan §8 and SOW §10
- no feature is implemented without team consensus and Sponsor approval.

**5. Resources (The "How Much")**
- No additional cash cost.

### Risk Management Plan: RP-09 — Batch Owner Unavailability (Knowledge Silo)

**1. Objectives (The "Why")**
- Prevent a single team member's unavailability from blocking an entire domain batch.

**2. Deliverables and Milestones (The "What" and "When")**
- Documentation current per story
  1. Module documentation wiki
- backup owners assigned before Batch 1
  2. backup owner matrix
- cross-training by Week 3.
  3. cross-review logs.

**3. Responsibilities (The "Who" and "Where")**
- All team members
  Tasks 1, 2, 3
- PM assigns backup owners before batch start.
  Support of tasks 1

**4. Approach (The "How")**
- Atomic commits with meaningful messages
- mandatory PR cross-review (reviewer must be from a different domain)
- PM maintains a backup owner matrix
- each member documents their module's API, migration, and business logic before the next batch starts.

**5. Resources (The "How Much")**
- No additional cost.

### Risk Management Plan: RP-10 — AI Token Quota Exhausted or Plan Expires

**1. Objectives (The "Why")**
- Maintain AI-assisted development velocity throughout all four batches (EAC = 862M tokens
- conservative = 960M).

**2. Deliverables and Milestones (The "What" and "When")**
- Weekly review
  1. Weekly AI usage tracking report
- alert at 80% of each cohort's budget.
  2. spend alert thresholds configured.

**3. Responsibilities (The "Who" and "Where")**
- PM monitors
  Tasks 1, 2
- each developer tracks their own cohort usage.
  Support of tasks 1

**4. Approach (The "How")**
- Monitor usage weekly against the 862M token EAC
- use lower-cost model tiers (Gemini Flash, Claude Haiku) for routine CRUD stories
- reserve premium models for complex stories
- the contingency reserve (VND 500,000) covers moderate API overruns.

**5. Resources (The "How Much")**
- VND 500,000 contingency reserve already budgeted.

### Risk Management Plan: RP-11 — Insufficient Pilot Landlords for UAT

**1. Objectives (The "Why")**
- Confirm that the MVP satisfies real landlord workflows with at least 3 pilot participants before the final demonstration.

**2. Deliverables and Milestones (The "What" and "When")**
- Begin outreach Week 1
  1. Landlord recruitment list
  2. UAT session notes
  3. consent forms.

**3. Responsibilities (The "Who" and "Where")**
- PM leads
  Tasks 1, 2, 3
- all team members contribute via personal networks.
  Support of tasks 1

**4. Approach (The "How")**
- Reach out immediately via personal contacts
- post in Zalo/Facebook landlord groups
- engage local boarding-house communities
- do not wait for the app to be finished before starting outreach.

**5. Resources (The "How Much")**
- No cash cost
- PM time.

### Risk Management Plan: RP-12 — VietQR Format Incorrect or Changed

**1. Objectives (The "Why")**
- Ensure the payment QR code parses correctly in all major Vietnamese banking apps.

**2. Deliverables and Milestones (The "What" and "When")**
- QR integration tested before VIETQR-02 is marked Done (Batch 3, Week 6).
  1. VietQR format test suite
  2. banking app compatibility list (Vietcombank, Techcombank, MBBank).

**3. Responsibilities (The "Who" and "Where")**
- Dev 3 (Minh — payment module owner).
  Tasks 1, 2

**4. Approach (The "How")**
- Implement strictly against VietQR/NAPAS official documentation
- include automated QR payload format check in CI
- test generated codes with at least 3 banking apps before acceptance.

**5. Resources (The "How Much")**
- No additional cost.

### Risk Management Plan: RP-13 — Report and Dashboard Performance

**1. Objectives (The "Why")**
- Deliver performant business reports and dashboards that are acceptable to pilot landlords with 5–30 rooms.

**2. Deliverables and Milestones (The "What" and "When")**
- Performance validated before REPORT-01 acceptance (Batch 4, Week 8).
  1. Performance test results with representative data (5–30 rooms × 3–6 months)
  2. indexed query plan.

**3. Responsibilities (The "Who" and "Where")**
- Dev 3 (Minh — report owner)
  Tasks 1, 2
- Dev 2 (Dat — dashboard 03/04 owner).
  Support of tasks 1

**4. Approach (The "How")**
- Use indexed foreign keys in Drizzle schema from the start
- add pagination and date-range filtering to all report endpoints
- seed realistic test data before Batch 4
- profile slow queries using Supabase query analyzer.

**5. Resources (The "How Much")**
- No additional cash cost.

### Risk Management Plan: RP-14 — CI/CD or Deployment Failure

**1. Objectives (The "Why")**
- Maintain a continuously deployable baseline that all five team members can validate against.

**2. Deliverables and Milestones (The "What" and "When")**
- CI verified at Batch 0 (infrastructure setup)
  1. CI pipeline
  2. previous-revision rollback procedure
  3. local demo environment.

**3. Responsibilities (The "Who" and "Where")**
- Dev 5 (Quality/delivery foundation owner, per assignments)
  Tasks 1, 2, 3
- PM is release owner.
  Support of tasks 1

**4. Approach (The "How")**
- Fix failed CI checks before merge per DoD
- retain previous deployable revision
- configure the deployment pipeline to deploy only on passing builds
- maintain a local environment as a demo fallback (critical for demo day if cloud is down).

**5. Resources (The "How Much")**
- No additional cost.

### Risk Management Plan: RP-15 — Supabase Free-Tier Quota Reached

**1. Objectives (The "Why")**
- Keep cloud infrastructure operational throughout the 8–10 week development and pilot period.

**2. Deliverables and Milestones (The "What" and "When")**
- Usage monitored from Batch 2 when maintenance photos and payment proofs are introduced.
  1. Weekly Supabase usage report
  2. image compression implementation.

**3. Responsibilities (The "Who" and "Where")**
- Dev 2 (Dat — database foundation owner)
  Tasks 1, 2
- Dev 4 (storage/external-service owner).
  Support of tasks 1

**4. Approach (The "How")**
- Compress maintenance and payment proof images client-side before upload
- delete test/duplicate files during development
- monitor Supabase dashboard weekly
- delete stale pilot accounts before demo.

**5. Resources (The "How Much")**
- ~100,000 VND for one month of Supabase Pro if free tier is reached (within contingency).

### Risk Management Plan: RP-16 — Tenant Onboarding Flow Fails UAT

**1. Objectives (The "Why")**
- Validate that the two-sided platform's tenant onboarding is discoverable and executable by non-technical users.

**2. Deliverables and Milestones (The "What" and "When")**
- Usability test before Batch 2 acceptance (Week 5).
  1. Usability test with at least one proxy tenant
  2. onboarding guide.

**3. Responsibilities (The "Who" and "Where")**
- FE1 (MXH — tenant/lease UI owner)
  Tasks 1, 2
- PM coordinates test.
  Support of tasks 1

**4. Approach (The "How")**
- Test the full tenant provisioning flow (landlord creates lease → system sends temp password email → tenant logs in via email link) with at least one proxy user before marking US-TENANT-02 as Done
- include a simple in-app onboarding guide.

**5. Resources (The "How Much")**
- No additional cash cost.

### Risk Management Plan: RP-17 — Fake Payment Screenshot

**1. Objectives (The "Why")**
- Ensure landlords understand the system's manual verification limitation so they are not misled about payment confirmation.

**2. Deliverables and Milestones (The "What" and "When")**
- Disclaimer in place before UAT (Week 6).
  1. Clear UI disclaimer on the payment verification screen
  2. onboarding guidance.

**3. Responsibilities (The "Who" and "Where")**
- FE1 (MXH — payment UI)
  Tasks 1, 2
- PM verifies in UAT checklist.
  Support of tasks 1

**4. Approach (The "How")**
- Display: "Please check your own banking app to confirm payment before marking as Paid." Include this in the landlord onboarding tutorial.

**5. Resources (The "How Much")**
- No additional cost.

### Risk Management Plan: RP-18 — US AI Service Inaccessible from Vietnam

**1. Objectives (The "Why")**
- Maintain full team implementation capacity if one AI cohort loses access.

**2. Deliverables and Milestones (The "What" and "When")**
- Fallback plan documented before Batch 1
  1. Documented AI provider fallback plan
- reviewed at each batch boundary.
  2. preserved local project context.

**3. Responsibilities (The "Who" and "Where")**
- PM
  Tasks 1, 2
- OpenAI cohort members (2 members).
  Support of tasks 1

**4. Approach (The "How")**
- OpenAI cohort members have documented fallback to Antigravity (Google Gemini) per the resource capacity baseline
- maintain VPN and alternative network access as a contingency
- ensure all local project context (backlog, architecture, codebase) is documented so any model can be substituted
- prioritize critical-path stories for the Google cohort if OpenAI access is lost.

**5. Resources (The "How Much")**
- No additional cash cost for the fallback
- VPN cost covered by contingency if needed.

### Risk Management Plan: RP-19 — Data Privacy or Security Violation

**1. Objectives (The "Why")**
- Protect tenant PII throughout development and pilot
- ensure authorization enforcement is correct at the API layer.

**2. Deliverables and Milestones (The "What" and "When")**
- Authorization verified in every story's CI tests from Batch 1
  1. Authorization tests per story
  2. HTTPS-only configuration
  3. privacy notice for pilot users.

**3. Responsibilities (The "Who" and "Where")**
- Dev 4 (Security foundation owner)
  Tasks 1, 2, 3
- reviewer for all auth/PII stories.
  Support of tasks 1

**4. Approach (The "How")**
- Use synthetic/test data during development
- HTTPS on all endpoints
- JWT authorization enforced at the API per the Global DoD
- never log or return passwords, tokens, or cross-tenant data
- security-sensitive story reviews by Dev 4 per RP-05 review policy
- basic privacy notice to all pilot users before sharing their real data.

**5. Resources (The "How Much")**
- ~50,000 VND for SSL/domain (already in budget).

### Risk Management Plan: RP-20 — No Post-Project Owner

**1. Objectives (The "Why")**
- Avoid undefined cloud cost obligations or a production system with no maintainer.

**2. Deliverables and Milestones (The "What" and "When")**
- Decision before Week 8 (2 weeks before demo day).
  1. Documented team decision
  2. clean archive or handover package.

**3. Responsibilities (The "Who" and "Where")**
- PM
  Tasks 1, 2
- supervisor approves the plan.
  Support of tasks 1

**4. Approach (The "How")**
- Option A: Clean archive — shut down cloud resources, write a comprehensive README, archive the repository at demo day. Option B: One volunteer commits to post-graduation maintenance with documented infrastructure, costs (VND 200,000–400,000/month), and responsibilities. Decide explicitly with supervisor.

**5. Resources (The "How Much")**
- Option A: No ongoing cost. Option B: ~VND 200,000–400,000/month cloud costs.
