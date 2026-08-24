# Software Process Definition — RoSi-Home
## 1. General Information
- **Project:** RoSi-Home — Property management platform for self-managed landlords.
- **Execution Time:** 6 weeks (Weeks 5–10).
- **Team Size:** 5 Students (3 Backend, 2 Frontend).
- **Tech Stack:** Node.js, Express, PostgreSQL, React Native (Expo), Render.
## 2. Selected SDLC Model
- **Model:** **Agile (Kanban Framework)**.
- **Tailoring Rationale:** 
  - AI code generation is very fast but unpredictable. Kanban keeps the workflow continuous without being restricted by rigid timeboxes.
  - The property management domain has high data dependency. Developing the project sequentially (batch by batch) helps minimize rework.
## 3. Process Elements
- **Roles:** Project Manager (Progress & Risk tracking), Backend Developer (Database & API), Frontend Developer (UI & Integration).
- **Standards:** TypeScript Strict Mode, REST API guidelines.
- **Tools:** Trello (Kanban Board), GitHub (Source Code & CI/CD).
## 4. Phase Definition
| Phase | Purpose | Deliverables |
|---|---|---|
| **Phase 1: Core Foundation**<br/>*(Weeks 5–6)* | Setup architecture, CI/CD, and develop the first 2 core batches: Platform -> Operations. | Functioning CI/CD, Core features on Staging, Mobile interface (via Expo) testable on laptop. |
| **Phase 2: Advanced Features**<br/>*(Weeks 7–8)* | Code and integrate the final 2 batches: Billing -> Reporting. | All functional features completed on Staging. |
| **Phase 3: Pilot & Closure**<br/>*(Weeks 9–10)* | Cross-functional E2E testing, run a real-world Pilot with 2 landlords, finalize documentation. | Stable Production release, handover documentation. |
### 4.1. Execution Strategy: Sashimi Principle
To prevent bottlenecks between the Backend and Frontend teams, the project employs the **Sashimi model** (overlapping phases):
- The Backend team always develops one batch ahead of the Frontend team.
- While the Backend is building the API for a batch, the Frontend team builds the UI for that same batch using **Mock Data**. 
- Once the Backend completes the real API, the Frontend team switches from mock data to integrating the real API. This ensures both teams can work in parallel efficiently.
## 5. Story Lifecycle & Workflow
Every User Story must flow through these 5 steps on Trello:
`Ready` -> `In Progress` -> `Code Review` -> `Testing` -> `Done`

**Definition of Done (DoD):**
Every User Story must satisfy all of the following criteria before its status moves to `Done`:
- [ ] All Acceptance Criteria (AC) pass, including edge cases (empty states, invalid inputs, missing dependencies), not just the happy path.
- [ ] Role-based authorization and data ownership rules are strictly enforced by the backend API.
- [ ] Relevant automated tests pass, covering core functional paths and critical validation/authorization logic.
- [ ] Code passes all automated CI checks (TypeCheck, Lint, Unit/Integration tests) on GitHub Actions before merging.
- [ ] Pull Request (PR) is reviewed and approved by at least 1 other team member (Peer Review).
- [ ] Database migrations and environment configuration changes are reproducible and committed to the repository.
- [ ] The completed feature is deployed to and verified on the Mobile app interacting with the real Staging API.
- [ ] No unresolved Critical or High severity defects remain within the story scope.
- [ ] Error messages and API responses do not expose passwords, tokens, private files, or unauthorized tenant/landlord data.

**Quality Policies:**
- **Domain-based Ownership:** Work is assigned by business domain (e.g., Auth, Maintenance) rather than single User Stories. This minimizes context-switching and merge conflicts. While a developer may own multiple stories, they should ideally implement them sequentially.
- **AI Accountability:** AI-generated code is considered a draft. The developer must understand the logic 100% and is fully responsible for fixing any resulting bugs.
