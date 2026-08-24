# Quality Management Plan (QMP)
**Project:** RosiHome – Property & Rental Management Mobile MVP <br>
**Team:** 5 students — 3 Backend Developers, 2 Mobile Frontend Developers <br>
**Methodology:** Kanban <br>
**Project Duration:** 10 weeks <br>
**Date:** August 2026
## 1. Purpose
This Quality Management Plan defines how the RosiHome team will maintain and evaluate quality during the 10-week MVP development period.

The plan focuses on:

* Delivering the agreed MVP features correctly.
* Preventing avoidable defects during development.
* Keeping code consistent and understandable.
* Ensuring that work follows the team's Kanban process.
* Recording and resolving defects without adding unnecessary process overhead.

Quality is evaluated primarily through **acceptance criteria, code review, defect handling, and adherence to the defined Kanban workflow**, rather than by the number of tests executed.
## 2. Quality Priorities
The team will focus on four practical quality characteristics.
### 2.1 Functionality
Core property management workflows must behave according to their defined requirements.

The MVP focuses on:

* Property and room management
* Lease management
* Meter readings
* Invoice generation
* Payment-related workflows

**Quality check:** A feature is considered acceptable when it satisfies its defined acceptance criteria.
### 2.2 Reliability
The application should handle normal user operations without crashes, incorrect business calculations, or corrupted data.

Particular attention is given to:

* Rent and invoice calculations
* Meter-related calculations
* Lease status changes
* API validation and error handling
* Data consistency between related entities

**Quality check:** Defects affecting core business operations are recorded, prioritized, and resolved before the related work is considered complete.
### 2.3 Usability
The mobile interface should be understandable to typical landlords and tenants without requiring technical knowledge.

The team will check:

* Navigation clarity
* Form usability
* Clear validation and error messages
* Consistency between screens
* Ease of completing common workflows

**Quality check:** Feedback from manual use is recorded and converted into Kanban work when changes are necessary.
### 2.4 Maintainability
The codebase should remain understandable and manageable for the team throughout development.

The team will use:

* Consistent TypeScript practices
* ESLint and Prettier
* Modular code structure
* Meaningful naming
* Pull request review before merging

**Quality check:** Code changes follow the team's coding standards and are reviewed before entering the main branch.
## 3. Quality Assurance Practices
Quality assurance focuses on preventing problems while work is being developed.
### 3.1 Coding Standards
Backend and mobile frontend code will use:

* TypeScript with strict type checking
* ESLint for code-quality checks
* Prettier for consistent formatting

These checks are automated where practical so that developers do not need to perform them manually.
### 3.2 Unit Testing
Unit tests will be used selectively for logic where defects could have a significant impact.

Priority areas include:

* Utility calculations
* Rent and meter calculations
* Invoice generation
* Lease status transitions
* Other complex business rules

The team will not set an artificial target for the number of tests. Tests are added where they provide useful protection for important logic.
### 3.3 Code Review
Direct commits to the `main` branch are not allowed.

For a feature or significant change:

1. The developer creates a Pull Request.
2. At least one teammate reviews the change.
3. Review comments are addressed when necessary.
4. The Pull Request is merged after review.

Code review checks both implementation quality and consistency with the requirements.
## 4. Kanban Quality Workflow
All development work is managed through the team's Kanban board on Trello.

The board contains the following functional lists:

**Backlog → In Progress → Done | Bugs | Done in Week 6–10**

- **Main Flow:** Work moves from `Backlog` to `In Progress`, and finally to `Done` upon satisfying the Definition of Done.
- **Defect Column:** A dedicated `Bugs` list is used to isolate post-merge functional defects.
- **Weekly Archives:** At the end of each week, completed cards in `Done` are archived into `Done in Week X` lists (e.g., `Done in Week 6`, `Done in Week 7`). This enables the team to track weekly throughput and construct the project's Burndown Chart.
### 4.1 Work in Progress
Developers should avoid starting excessive work at the same time.

When possible, existing work should be completed or unblocked before new work is started. This helps the team identify unfinished or blocked work early.
### 4.2 Definition of Done
A Kanban card can be moved to **Done** only when:

* The implementation satisfies its acceptance criteria.
* Relevant validation and tests have been completed.
* Required code checks pass.
* The code has received peer review.
* Known defects related to the work have been addressed or explicitly recorded as separate Kanban cards.

The Definition of Done is a **process control**, not a test-count target.
## 5. Quality Control
Quality control focuses on finding problems in completed or nearly completed work.
### 5.1 Automated Checks
Pull Requests should run the available automated checks, including:

* Type checking
* ESLint
* Relevant automated tests

A Pull Request with failed required checks should not be merged until the issue is resolved or the failure is understood and intentionally handled.
### 5.2 Manual Verification
Developers manually verify important workflows on the actual mobile application and backend environment.

Verification should focus on realistic user actions rather than attempting to test every possible input.

Examples include:

* Creating and editing a property
* Managing rooms
* Creating or updating a lease
* Recording meter readings
* Generating an invoice
* Checking payment-related information
### 5.3 User Feedback
When external users or classmates are available to try the MVP, the team can collect practical usability feedback.

Useful feedback is recorded as Kanban cards when it requires development work.

The team does not require a formal testing report for every feedback session.
## 6. Defect Management
Defects are managed directly through the Kanban board using the dedicated `Bugs` list:

- **Pre-merge Defects:** Bugs caught locally during development or CI checks are fixed immediately by the developer on the feature branch. No separate Trello card is created.
- **Post-merge & UAT Defects:** Bugs discovered after merging to `main` or during manual UAT sessions are logged as dedicated cards in the `Bugs` column on Trello with a red `Bug` label.
- **Assignment & Fallback:** Defect cards are assigned primarily to the original code author. If the author is unavailable or occupied with a higher-priority task, another available teammate takes ownership of the fix.
- **Prioritization:** Critical functional bugs take priority and block release. Minor visual adjustments and UI feedback are attached as checklist items to existing feature cards to keep the Kanban board clean.
## 7. Document and Process Evaluation
Project quality will be evaluated based on **feasibility and adherence to the defined process**.

The evaluation checks whether:

* Work is managed through the Kanban board.
* Cards contain clear requirements or acceptance criteria where appropriate.
* Work follows the defined Kanban flow.
* Completed work satisfies the Definition of Done.
* Code changes receive peer review.
* Defects are recorded and tracked through the board.
* Important business logic receives appropriate verification.
* Project documents accurately describe the team's actual development process.

The evaluation does **not** depend on an arbitrary number of test cases, test executions, or defect counts.

A high number of discovered defects does not automatically indicate poor quality. What matters is whether the team identifies, records, prioritizes, and resolves defects appropriately within the project workflow.
## 8. Roles and Responsibilities
### Backend Developers — 3 members
* Implement and maintain backend APIs and business logic.
* Maintain relevant automated tests for important business logic.
* Perform code reviews.
* Investigate and fix backend defects.
### Mobile Frontend Developers — 2 members
* Implement mobile screens and user workflows.
* Maintain UI consistency and validation.
* Perform code reviews.
* Investigate and fix frontend defects.
### Whole Team
All members are responsible for:

* Following the Kanban workflow.
* Reviewing each other's code.
* Applying the Definition of Done.
* Recording and resolving defects.
* Verifying completed features.
* Keeping project documentation consistent with the actual development process.
## 9. Quality Management Principle
For a five-person team working for 10 weeks, quality management must remain lightweight.

RosiHome will therefore prioritize **clear requirements, a simple Kanban workflow, peer review, targeted testing, manual verification, and disciplined defect tracking** rather than large amounts of documentation or artificial quality metrics.

The goal is not to prove that every possible defect has been eliminated. The goal is to ensure that the team has a practical and consistent process for producing, checking, and improving the MVP.
