# RosiHome Lessons Learned Register

## Purpose

This register records the main project-management lessons from RosiHome and converts them into practical guidance for future projects. Future improvement actions should be managed as Trello work items.

## Executive Summary

The project reached delivery, but recovery work consumed time through integration rework, provider changes, final defect fixing, and overtime. The central lesson is to deliver vertically, account for all work, maintain a predictable team cadence, validate deployment dependencies early, and turn experience into visible improvement work.

## LL-01 - Control Scope, Requirements, and Decisions

**Problem.** Major product and technology decisions changed during delivery while parts of the project continued to describe different baselines.

**Reason.** Decisions were not always recorded with their impact and synchronized across all affected work before implementation continued.

**Impact.** Clarification and rework consumed capacity and schedule buffer, reduced predictability, and increased the risk of conflicting priorities, although final delivery was achieved.

**Lesson.** Freezing the final backlog helped protect delivery, but major product and technology decisions also need a clear record. Unrecorded decisions cause plans and implementation to describe different baselines.

**Future practice.** Record every material decision or change with its reason, impact, approval, and affected work. Update the backlog and related project materials before closing the change.

**Owner.** Project Manager acting as Change-Control Owner.

## LL-02 - Account for All Project Work

**Problem.** Documentation, infrastructure, research, testing, meetings, deployment, integration, rework, and bugs competed with feature work but were not always equally visible in progress tracking.

**Reason.** Planning and status reporting emphasized feature throughput, while cross-cutting and defect work could be fragmented across the backlog, board, plans, and informal coordination.

**Impact.** Capacity and remaining effort were harder to judge, progress could appear more complete than the whole project was, and late rework contributed to extra effort and overtime.

**Lesson.** Feature stories do not represent the whole project. Documentation, infrastructure, research, testing, meetings, deployment, integration, rework, and bugs also consume capacity and affect progress.

**Future practice.** Maintain one authoritative backlog for all work. Give every item an owner, status, completion criteria, and links to its outputs. Track bugs with severity, target date, affected story, regression test, and closure result.

**Owner.** Designated Backlog and Flow Owner.

## LL-03 - Deliver Vertical User Stories

**Problem.** Backend-to-frontend handoffs delayed integrated story completion and exposed API-contract and data-mapping problems late.

**Reason.** Ownership and sequencing followed technical layers, so frontend completion depended on backend batch handoffs instead of one cross-functional user outcome.

**Impact.** Team members waited on dependencies, integration feedback arrived later, and defect fixing and rework became concentrated closer to release, increasing schedule pressure.

**Lesson.** The project had a user-story backlog, but execution still relied on backend-to-frontend handoffs. This delayed integration and exposed contract and data-mapping problems late.

**Future practice.** Give each story one cross-functional owner. Complete the UI, API, data, tests, documentation, and deployment needed to demonstrate the user outcome before marking the story Done.

**Owner.** Batch Integration Owner.

## LL-04 - Use a Fixed Weekly Meeting Cadence

**Problem.** Voting for a free meeting day each week conflicted with plans members had already made.

**Reason.** The team did not protect one recurring slot or establish a stable attendance, agenda, and decision protocol at kickoff.

**Impact.** Repeated scheduling created avoidable coordination effort, reduced attendance predictability, and could delay decisions and blocker resolution.

**Lesson.** Voting for a free meeting day every week conflicted with plans members had already made and added avoidable coordination effort.

**Future practice.** Agree on one recurring weekly slot at kickoff. Use a prepared agenda, record decisions and action owners, and provide an asynchronous update path for members who cannot attend. Reschedule only for exceptional conflicts.

**Owner.** Project Manager or Team Lead.

## LL-05 - Validate External Services in a Production-Like Environment

**Problem.** Email delivery required several provider approaches before the deployed workflow operated reliably.

**Reason.** Hosting restrictions, credentials, sender configuration, templates, quotas, and failure handling were not validated together early enough in the target environment.

**Impact.** Provider changes created integration and configuration rework, consumed delivery capacity, and made email-dependent work less predictable.

**Lesson.** EmailJS was the approach that worked for this deployment after the earlier Nodemailer/SMTP and Resend approaches did not meet the project's deployment constraints. This does not mean one provider is universally correct; local success does not guarantee deployment success.

**Future practice.** Run a small deployed validation for email and other critical services before dependent stories. Test credentials, quotas, failure paths, logging, retry behavior, rollback, and environment configuration.

**Owner.** Infrastructure and Release Owner.

## LL-06 - Protect Project-Management Capacity

**Problem.** Project coordination, infrastructure, deployment, documentation, stabilization, and critical feature work were concentrated in one member.

**Reason.** Management and technical responsibilities were combined without enough reserved coordination capacity or backup ownership.

**Impact.** The concentration created decision and review bottlenecks, key-person dependency, fragile handover, and a greater risk of overtime or delay when priorities competed.

**Lesson.** Combining project management, infrastructure, deployment, documentation, and critical feature ownership in one person creates a coordination bottleneck and a single point of failure.

**Future practice.** Reserve capacity for management work, distribute critical ownership, appoint deputies, and require peer review, walkthroughs, and handover notes. Every critical area should have a primary and backup owner.

**Owner.** Project Sponsor or Lecturer acting as Governance Owner.

## LL-07 - Turn Feedback and Retrospectives into Work

**Problem.** User feedback and team reflection were not consistently converted into tracked improvement work throughout delivery.

**Reason.** Validation, retrospectives, and follow-up actions were treated more as late or informal activities than as recurring parts of the delivery process.

**Impact.** Misunderstandings and repeated process problems could remain visible for longer, reducing the time available for correction and concentrating rework nearer release.

**Lesson.** User validation and team reflection are most useful when they happen throughout delivery rather than only near the final demonstration.

**Future practice.** Recruit representative users early, demonstrate each delivery slice, and hold a retrospective at every batch boundary. Convert the most important findings into owned backlog actions and verify them at the next review.

**Owner.** Designated Continuous Improvement Owner.

## Practices to Retain

This section describes working methods that supported the project or fit its AI-assisted delivery model and should continue in future projects. These are ongoing operating practices rather than one-time corrective lessons.

### Use Trello as the Operational Work Board

Use Trello as the shared view of user stories, technical tasks, documents, tests, bugs, deployment work, and rework. Each card should show its work-item ID, owner, reviewer, status, dependencies, completion criteria, and links to relevant outputs. Update the board whenever work is registered, assigned, blocked, reviewed, accepted, or completed.

### Retain Kanban for AI-Assisted Delivery

Kanban is a good fit for AI-agent projects because agent-supported work can finish irregularly and team members can progress through many small user stories in a short period. Maintain a visible flow from Ready through implementation, review, validation, integration, deployment, and Done. Preserve work-in-progress limits so rapid agent output does not create hidden unfinished work.

### Use AI Agents Across the Delivery Lifecycle

Use agents not only to write application code, but also to draft and update documents, generate unit, API, and integration tests, assist debugging, prepare repetitive validation, and support release checks. Human owners remain accountable for requirements, security, correctness, review, and final acceptance.

### Track Human Time and AI Token Usage Together

Traditional time tracking alone is incomplete for an AI-assisted project. For each work item, record human effort by activity together with the model/tool, measured input and output tokens, quota or cost, agent run time where available, rework, defects, and completed outcome. Label unavailable token values as estimated or not recorded. Use the combined data for estimation, capacity planning, budget control, and deciding where agents provide real value.

### Maintain Story-Based Planning and Acceptance Criteria

Keep user stories as the main planning and acceptance unit. Clear outcomes and acceptance criteria help members and agents understand the required result and make progress easier to review.

### Keep Human Review and Deployment Verification

Continue peer review, automated checks, integration validation, and deployed verification. Fast agent-generated output should improve delivery speed without bypassing the controls that protect product quality.
