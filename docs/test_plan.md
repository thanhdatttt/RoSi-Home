# Software Test Plan (STP)

**Project:** RosiHome Property Management MVP  
**Methodology:** Kanban / Agile  
**Date:** August 2026 (Week 10)  
**Prepared By:** Development Team  

---

## 1. Introduction & Scope
The purpose of this Test Plan is to outline the strategy, environment, and defect management workflow for verifying the RosiHome MVP.

- **In Scope:** Automated Unit Testing for the Backend API (domain logic, contracts) and Exploratory User Acceptance Testing (UAT) for the Mobile Frontend.
- **Out of Scope:** Stress/Load testing and deep security penetration testing are deferred to post-MVP production phases.

## 2. Testing Strategy
Following Agile Quality Management principles, our testing is divided into two distinct, continuous phases to ensure both code stability and user satisfaction.

### 2.1 Automated Backend Testing (White Box)
- **Objective:** Verify business logic accuracy (e.g., utility calculations, invoice generation) and prevent regressions.
- **Framework:** Vitest.
- **Target:** All critical domains (Meters, Charges, Invoices, Leases) must be covered by dedicated test suites.
- **Execution:** Tests are integrated into our Continuous Integration (CI) pipeline (GitHub Actions). The test suite executes automatically on every Pull Request. Code cannot be merged into `main` if any test fails.

### 2.2 User Acceptance Testing (Black Box / Exploratory)
- **Objective:** Ensure the mobile application meets end-user requirements and provides a seamless UI/UX.
- **Method:** Exploratory Testing. External users (Beta Testers) will interact with the React Native MVP on physical devices. Instead of following rigid, scripted steps, testers are encouraged to explore the app organically to discover real-world friction points and edge-case bugs.
- **Output:** Findings are documented in the Customer Feedback & UAT Report.

## 3. Test Environment & Tools
- **Backend Automation:** Node.js v22 runtime with an isolated PostgreSQL database provisioned via Docker for consistent test state.
- **Frontend UAT:** Expo Go / React Native preview builds running on physical iOS and Android devices.
- **Issue Tracking:** Trello (Kanban Board).

## 4. Defect Management Workflow
To maintain Agile velocity and avoid inflating our task tracking, we use a Kanban-optimized defect management workflow:

1. **Identification:** Bugs are discovered via CI failures, Code Reviews, or UAT sessions.
2. **Classification & Logging:**
   - *Critical / Functional Bugs:* Logged as distinct cards on the Trello Kanban Board with a red `Bug` label. These block the release and take highest priority.
   - *Minor UI Tweaks / Enhancements:* Not logged as separate bug cards. Instead, they are added as checklist sub-tasks to the original feature card or addressed iteratively to keep the Kanban board clean.
3. **Resolution:** Developers fix the code locally. The fix must pass the local Vitest suite and undergo peer Code Review before the PR is approved.

## 5. Roles & Responsibilities
Quality and testing are shared responsibilities across the entire team:
- **Backend Developers (Chí, Đạt, Minh):** Responsible for writing comprehensive unit tests using Vitest for their assigned modules and resolving API-level functional bugs.
- **Frontend Developers (MXH, Quân):** Responsible for resolving UI/UX issues found during UAT and ensuring cross-platform component stability.
- **Beta Testers (External):** Conduct unbiased exploratory UAT sessions and report subjective feedback on usability.
