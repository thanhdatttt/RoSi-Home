# Test Execution Report
**Project:** RosiHome – Property & Rental Management Mobile MVP
**Team:** 5 students — 3 Backend Developers, 2 Mobile Frontend Developers
**Methodology:** Kanban 
**Date:** 16 August 2026 (End of Week 10)
**Prepared By:** Development Team
## 1. Purpose
This report summarizes the testing performed for the RosiHome MVP during the 10-week development period.

Testing covered:
* Automated testing of important backend business logic.
* Manual exploratory testing of the mobile application.
* Defect tracking and verification of fixes.

The results provide evidence of the testing performed within the MVP scope. They do not represent a complete assessment of performance, security, or production readiness.
## 2. Automated Backend Testing
Important backend business logic was tested using automated unit tests.
### Test Results
* **Framework:** Vitest
* **CI:** GitHub Actions
* **Test files executed:** 33
* **Result:** All 33 test files reported passing results.

The tested areas included:
* Meter reading calculations
* Utility rate calculations
* Invoice generation
* Lease status transitions

The automated tests provide regression protection for these areas. They do not verify every possible backend behavior or guarantee that the application contains no defects.

**Evidence:** `Unit Tests.png` and the corresponding CI execution results.
## 3. Manual Mobile Testing
An exploratory testing session was conducted on 12 August 2026 using physical mobile devices.
The session focused on realistic user workflows and user-facing behavior.

Areas reviewed included:
* Property management
* Lease-related workflows
* Invoice viewing
* Payment-related screens
* Navigation
* UI layout
* Input and displayed information
### Issues Identified
A total of **11 issues or improvement items** were recorded.
**Functional or significant UI defects — 3**
1. Bottom navigation layout problem
2. Missing back navigation on the Profile screen
3. Incorrect water charge calculation based on head count

These were recorded as dedicated Kanban bug cards and resolved during Week 10.

**Minor UI/UX improvements — 8**
Examples included:
* Currency formatting
* City selection
* Search bar behavior
* Login screen helper text

These were handled as smaller changes associated with their existing feature work.

**Evidence:** `customer_feedback.md` and `Bug Tracking.png`.
## 4. Defect Resolution and Verification
The identified issues were handled through the project's Kanban workflow.

For the three significant defects:
* The problems were recorded as bug cards.
* Fixes were implemented.
* Code changes were peer-reviewed.
* Relevant automated checks were run where applicable.
* The affected functionality was manually verified after the fix.

The eight minor UI/UX items were also addressed during the final development period.

Based on the recorded results, all issues identified during the documented exploratory session were addressed before the end of Week 10.
## 5. Test Limitations
The following areas were not specifically tested as part of this MVP:
* Load and performance testing
* Penetration or dedicated security testing
* Extensive device and OS compatibility testing
* Production-scale data testing

Therefore, the results should be interpreted within the project's intended MVP scope.
## 6. Conclusion
The documented testing confirmed that the main backend business logic covered by the automated tests was passing and that the mobile application underwent manual verification of its key user workflows.

The exploratory session identified three significant defects and eight minor UI/UX issues. The recorded issues were addressed before the end of the project.

The RosiHome MVP is therefore considered **suitable for its planned project demonstration and MVP evaluation**, subject to the testing limitations described above.

This report evaluates the testing that was actually performed. It does not claim that the application is defect-free or production-ready.
