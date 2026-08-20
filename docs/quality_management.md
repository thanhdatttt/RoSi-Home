# Quality Management Plan (QMP)

**Project:** RosiHome Property Management MVP  
**Methodology:** Kanban / Agile  
**Date:** August 2026 (Week 10)  
**Prepared By:** Development Team  

---

## 1. Objectives
The purpose of this Quality Management Plan is to define how the RosiHome team will ensure that the software meets its business, user, and technical requirements. Our goals are to:
- Deliver a stable and functional Mobile MVP for landlords and tenants.
- Prevent defects early in the development lifecycle through Agile QA practices.
- Ensure high team collaboration quality and maintainable source code.

## 2. Quality Characteristics & Requirements
Based on the ISO 9126 standard for Software Quality, we prioritize the following characteristics for the RosiHome MVP:

1. **Functionality (Suitability & Accuracy):** 
   - *Requirement:* The system must accurately manage the core workflows: Properties, Rooms, Tenants, Meters, Billing, and Payments.
   - *Metric:* 100% of the 51 User Stories in the Product Backlog must meet their Acceptance Criteria.
2. **Reliability (Maturity & Fault Tolerance):** 
   - *Requirement:* The backend API must handle concurrent mobile requests without crashing and prevent data loss during invoice generation.
   - *Metric:* 0 critical data-loss incidents during testing and pilot operation.
3. **Usability (Learnability & Operability):** 
   - *Requirement:* The mobile application must be intuitive.
   - *Metric:* The average time for a landlord to learn how to create a room and issue a bill should be under 10 minutes. Evaluated via Qualitative Exploratory Testing (UAT).
4. **Maintainability (Analyzability & Modifiability):** 
   - *Requirement:* The codebase must be clean and modular to allow rapid feature additions post-MVP.
   - *Metric:* 100% adherence to strict typing and coding standards.

## 3. Agile Quality Assurance (QA) Techniques
*QA focuses on the processes used to PREVENT defects before they occur.*

- **Coding Standards:** 
  - Both Backend (Node.js) and Frontend (React Native) must use TypeScript with `"strict": true` configured in `tsconfig.json`.
  - ESLint and Prettier are utilized across the repository to prevent formatting discrepancies and avoid making code styling a "divisive issue."
- **Unit Testing (Test-Driven Mindset):**
  - **Framework:** Vitest.
  - **Coverage:** Developers must write tests for complex domain logic (Charges, Invoices, Maintenance) and API contracts.
  - **Goal:** Maintain over 30 test suites and 250+ assertions.
- **Code Reviews (Peer Review):**
  - No code is committed directly to the `main` branch. 
  - All changes require a GitHub Pull Request (PR) and must be reviewed and *Approved* by a teammate other than the author.
- **Definition of Done (DoD):**
  A Kanban card is only moved to "Done" when it meets the following criteria:
  - Code is implemented and meets business acceptance criteria.
  - Passes Typecheck, Build, and Unit Tests.
  - Code is reviewed and approved via PR.
  - Deployed successfully to the testing environment.

## 4. Quality Control (QC) & Evaluation Methods
*QC focuses on the activities used to DETECT defects in the product.*

- **Automated Continuous Integration (CI/CD):** 
  - We use GitHub Actions to automatically verify code quality on every PR.
  - The CI pipeline executes three critical jobs: `Detect changes`, `Typecheck, Test & Build`, and `CI Status`.
  - *Evaluation:* A PR cannot be merged unless the CI pipeline reports a 100% Pass Rate.
- **Exploratory Testing / User Acceptance Testing (UAT):**
  - We conduct manual exploratory testing sessions with external beta testers using the Expo mobile build.
  - *Evaluation:* Testers use the app without rigid scripts to discover UI/UX friction, navigation bugs, and localization issues. Feedback is captured in a formal Customer Feedback Report.
- **Defect Management (Bug Tracking):**
  - Bugs discovered during UAT or internal testing are logged into the Kanban board with a red `Bug` label.
  - *Resolution:* Critical functional bugs must be resolved before the final batch release. Minor UI tweaks are absorbed as enhancements.

## 5. Roles & Responsibilities
In our Agile team, **Quality is everyone's responsibility**.
- **Developers:** Responsible for writing clean code, adhering to standards, and writing unit tests for their assigned features.
- **Reviewers:** Responsible for diligently checking PRs for logic errors, code smells (e.g., *Divergent Change, Shotgun Surgery*), and standard violations.
- **Project Manager / QA Lead:** Responsible for facilitating UAT sessions, maintaining the Bug tracker, and ensuring the Definition of Done is strictly followed.
