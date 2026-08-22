# RosiHome Lessons Learned Register
## Purpose
This register records the main project-management lessons from RosiHome as practical guidance for future projects.
## LL-01 - Control Scope, Requirements, and Decisions
**Problem.** Major implementation decisions changed during delivery while documents continued to describe different baselines.

**Reason.** Decisions were not always recorded with their impact and synchronized across all affected work before implementation continued.

**Lesson.** Freezing the final backlog helped avoid scoop creep, but unrecorded decisions cause documents and implementation to describe different baselines.

**Future practice.** Record implementation decisions and synchronize all affected project documents before work continues.
## LL-02 - Use a Fixed Weekly Meeting Schedule
**Problem.** Voting for a free meeting day each week conflicted with plans members had already made.

**Reason.** The team did not establish a stable schedule at kickoff.

**Lesson.** Voting for a free meeting day every week conflicted with plans members had already made and added coordination effort.

**Future practice.** Set one weekly meeting slot at kickoff with a stable schedule.
## LL-03 - Validate External Services in a Production-Like Environment
**Problem.** Email delivery required several provider approaches before the deployed workflow operated reliably.

**Reason.** Some providers require payment to send emails to the users in deployed production.

**Lesson.** EmailJS was the approach that worked for this deployment after the earlier Nodemailer/SMTP and Resend approaches did not meet the project's deployment constraints. This does not mean one provider is universally correct; local success does not guarantee deployment success.

**Future practice.** Validate external-service configuration and failure handling in the target environment before dependent work begins.
## LL-04 - Write Documents for Purpose and Clarity
**Problem.** The team produced long documents that took too much time to review and were still difficult to understand as a whole.

**Reason.** The team prioritized filling headings and sections over each document's purpose, meaning, and essential content.

**Lesson.** A document is useful only when it serves its purpose, so clarity and essential content matter more than complete section coverage.

**Future practice.** Define the purpose first, include only essential content, and keep the document concise and easy to understand.
## LL-05 - Validate the Project Idea Before Committing
**Problem.** During the first four weeks, the team pursued an idea that was not worth developing, then had to redo the documents from scratch and work overtime in week 5 to recover the project schedule.

**Reason.** The team moved into later steps without spending enough time and effort brainstorming and carefully validating the idea.

**Lesson.** Investing more time and effort in idea selection at the start is better than recovering from avoidable rework later.

**Future practice.** Brainstorm alternatives and carefully validate the chosen idea before starting later project work.
