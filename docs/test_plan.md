# Software Test Plan (STP)

**Project:** RosiHome – Property & Rental Management Mobile MVP <br>
**Team:** 5 students — 3 Backend Developers, 2 Mobile Frontend Developers <br>
**Methodology:** Kanban <br>
**Project Duration:** 10 weeks <br>
**Date:** August 2026

## 1. Purpose and Scope

This Test Plan defines how the RosiHome team will verify that the MVP works according to its requirements and acceptance criteria.

Testing focuses on the features that are important to the core user workflows.

### In Scope

**Backend**

* Business logic and utility calculations
* Rent and invoice calculations
* Lease status transitions
* API validation and error handling
* Other important business rules

**Mobile Frontend**

* Navigation between screens
* Forms and input validation
* Property and room management
* Lease-related workflows
* Invoice and payment-related screens
* Basic usability and UI consistency

### Out of Scope

The MVP will not include dedicated:

* Load and performance testing
* Penetration testing
* Large-scale compatibility testing across many devices

These areas may be considered for a future production version.

## 2. Testing Approach

The team uses two main forms of testing:

1. **Automated testing** for important backend business logic.
2. **Manual exploratory testing** for mobile workflows and user-facing behavior.

Testing is performed as part of the normal Kanban workflow rather than as a separate project phase.

## 3. Automated Backend Testing

### 3.1 Purpose

Automated tests are used where they provide useful protection against incorrect or repeated business logic errors.

Priority is given to logic where an incorrect result could affect users or financial information.

### 3.2 Test Areas

Tests should cover important cases for:

* Utility calculations
* Rent calculations
* Invoice generation
* Meter-related calculations
* Lease status transitions
* Business-rule validation

The team does not define an artificial target for the number of tests. Coverage is based on the importance and complexity of the logic.

### 3.3 Execution

Vitest is used for backend automated tests.

Relevant tests should be run when changes affect the logic they cover. Automated checks may also be executed through the project's CI pipeline when a Pull Request is created.

A change should not be merged while a relevant required check is failing unless the team has identified and documented the reason for the failure.

## 4. Manual Mobile Testing

### 4.1 Purpose

Manual testing verifies that the mobile application behaves correctly from a user's perspective.

The focus is on realistic workflows rather than attempting to test every possible combination of inputs.

### 4.2 Test Areas

The team manually verifies important workflows such as:

* Creating and editing a property
* Managing rooms
* Creating and updating leases
* Recording meter readings
* Viewing generated invoices
* Viewing payment-related information
* Navigating between related screens
* Handling invalid or incomplete input

Testing should be performed on the physical mobile devices available to the team.

### 4.3 Exploratory Testing

Exploratory testing is used to discover problems that may not be obvious from individual requirements.

Developers or available users can perform normal workflows and report:

* Unexpected behavior
* Navigation problems
* Incorrect displayed information
* Validation problems
* Confusing UI behavior
* Edge cases encountered during normal use

Testing does not require a rigid script for every session.

When external users are available, their feedback can provide additional usability information. External testers are not a required dependency for completing the project's testing process.

## 5. Test Data and Environment

Testing should use data that represents realistic RosiHome scenarios.

Examples include:

* Multiple properties
* Multiple rooms
* Different lease states
* Different meter readings
* Different rent and invoice values
* Valid and invalid form inputs

The team should avoid using production or sensitive personal data during testing.

The backend and mobile application should be tested in the development environment used by the team. Any environment-specific problem that affects functionality should be recorded as a defect.

## 6. Defect Management

The team distinguishes between defects caught during active development and those discovered post-merge or during user testing.

### 6.1 Pre-merge Defects (In-Development)
Defects discovered by developers during coding, local testing, or CI pipeline checks are fixed immediately on the feature branch. No separate Trello card is created for pre-merge bugs to prevent task board inflation.

### 6.2 Escaped Defects (Post-merge & UAT)
When a defect is discovered after code is merged into `main`, or surfaced during manual UAT sessions:

1. **Card Creation:** A dedicated card is logged in the `Bugs` column on the Trello Kanban board with a red `Bug` label, specifying reproduction steps, expected vs. actual behavior, and severity.
2. **Assignment & Fallback:** The bug is primarily assigned to the original author of the code. If the original author is busy with a higher-priority task, another available team member takes ownership of the fix.
3. **UAT Feedback Categorization:**
   - *Critical Functional / Layout Defects:* Logged as standalone `Bug` cards in the `Bugs` column on Trello.
   - *Minor UI Tweaks & Formatting:* Recorded as sub-task checklists attached to the parent feature card rather than cluttering the board with individual cards.

### 6.3 Defect Severity & Priority

**High-Priority Defects** (Logged as standalone cards in the `Bugs` column, blocking release):
* Core workflow failures
* Incorrect financial or utility calculation logic
* Application crashes or severe UI layout breakage
* Significant data inconsistency

**Lower-Priority Defects** (Managed as card checklists or minor enhancement tasks):
* Minor visual styling or spacing adjustments
* Non-critical usability improvements
* Simple text placeholder or localization tweaks

## 7. Test and Defect Workflow

Testing and defect resolution follow the team's Kanban board workflow:

**Backlog → In Progress → Done | Bugs | Done in Week 6–10**

1. **Identification:** Bug is reported via CI failure (pre-merge) or UAT session (post-merge).
2. **Logging & Assignment:** Post-merge bugs are logged in the `Bugs` column on Trello and assigned to the original author (or an available teammate if the author is occupied).
3. **Resolution & Verification:** The assigned developer moves the card to `In Progress`, fixes the issue, passes local Vitest checks, and submits a PR.
4. **Completion:** Upon peer review and successful CI build, the bug card is moved to `Done` (and archived into `Done in Week X` at the end of the week).

## 8. Test Completion Criteria

A feature is considered sufficiently tested for the MVP when:

* Its acceptance criteria have been verified.
* Relevant automated tests have passed where applicable.
* Important user workflows have been manually verified.
* Known significant defects have been fixed or separately recorded and accepted by the team.
* Required code review has been completed.

There is no requirement to prove that every possible input or edge case has been tested.

## 9. Roles and Responsibilities

### Backend Developers — 3 members

* Write and maintain automated tests for important backend logic.
* Verify API behavior.
* Investigate and fix backend defects.
* Review backend Pull Requests.

### Mobile Frontend Developers — 2 members

* Manually verify mobile workflows.
* Check navigation, validation, and UI behavior.
* Investigate and fix frontend defects.
* Review frontend Pull Requests.

### Whole Team

All members are responsible for:

* Testing the work they develop.
* Reviewing teammates' changes.
* Reporting defects clearly.
* Rechecking fixes.
* Following the Kanban workflow.
* Ensuring completed work satisfies the Definition of Done.

## 10. Test Plan Principle

Testing for RosiHome is intentionally lightweight and focused on the MVP.

The team prioritizes **important business logic, core user workflows, realistic manual verification, and disciplined defect tracking** rather than exhaustive testing.

The purpose of testing is to provide reasonable confidence that the MVP works correctly for its intended use within the project's 10-week scope.
