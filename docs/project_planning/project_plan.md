# RosiHome Software Project Plan

## 1. Document Control

| Attribute | Value |
|---|---|
| Version | 1.0 |
| Date | 23 July 2026 |
| Project | RosiHome Property Management MVP |
| Planning horizon | 8–10 calendar weeks |
| Delivery approach | Kanban with dependency-based delivery batches |
| Team | Five part-time student developers |
| Approval authority | Project Sponsor/Lecturer and Project Manager/Team Leader |

### 1.1 Purpose

This Project Plan defines how the RosiHome MVP will be delivered. It follows the course definition of a project plan by specifying:

1. the processes and tasks to be conducted;
2. the people responsible for performing the work; and
3. the mechanisms for assessing risks, controlling change, and evaluating quality.

This document establishes the delivery baseline. Cost, time, and resource estimates are maintained in `docs/cost_time_resources/cost_time_resources_estimation_report.md`.

### 1.2 Related Baselines

| Document/Artifact | Planning Use |
|---|---|
| `docs/product_backlog.md` | Product scope, dependencies, and acceptance criteria |
| `docs/architecture.md` | Architecture and technology constraints |
| `docs/project_charter.md` | Project authority, objectives, and stakeholders |
| `docs/cost_time_resources/cost_time_resources_estimation_report.md` | Time, capacity, AI usage, and cost estimates |
| `.github/workflows/ci.yml` | Backend CI quality gates |
| Current BE/FE assignment matrix | Responsibility baseline reproduced in Sections 4 and 6 |

## 2. Project Objectives and Scope

### 2.1 Objectives

RosiHome will provide a deployable MVP that enables self-managing landlords and tenants to:

- manage user accounts, roles, and profiles;
- manage properties, rooms, tenants, and leases;
- configure utilities and recurring charges;
- record meter readings and generate invoices;
- support VietQR payment instructions and manual payment verification;
- create and track maintenance requests;
- view dashboards and business reports;
- receive supported lease, payment, and maintenance notifications.

### 2.2 In Scope

- React Native mobile application;
- Node.js/Express REST backend;
- PostgreSQL database and reproducible migrations;
- image/file storage for supported workflows;
- JWT-based authentication and ownership authorization;
- GitHub pull-request workflow and backend CI;
- deployment to the agreed development/integration environment;
- automated backend tests and relevant frontend validation;
- technical and project documentation;
- pilot preparation and demonstration.

### 2.3 Out of Scope

- direct payment-gateway processing or holding user funds;
- electronic signatures;
- IoT smart-meter integration;
- multi-landlord collaboration;
- advanced accounting;
- production scale beyond the academic pilot;
- features not approved in the Product Backlog.

## 3. Delivery Process

### 3.1 Delivery Model

The project uses Kanban because AI-assisted work may complete at irregular intervals and should not wait for a fixed sprint boundary. Dependency batches determine work order; user stories remain the implementation and acceptance unit.

```text
Product Backlog
→ Ready
→ Implementation
→ Pull Request Review
→ CI / Validation
→ Integration
→ Deployment
→ Done
```

### 3.2 Work-Item Rules

A user story may enter `Ready` when:

- its intended user and business outcome are clear;
- acceptance criteria are testable;
- dependencies and affected modules are identified;
- required API/data constraints are available;
- blocking product decisions have been resolved;
- the assigned member confirms that the story can be implemented without changing approved scope.

A technical task supports a story but does not count as additional product throughput.

### 3.3 Implementation Procedure

For each story, the assigned member will:

1. review the story, acceptance criteria, dependencies, and architecture constraints;
2. create or use the assigned feature branch/task;
3. implement the smallest complete vertical behavior;
4. add or update relevant tests;
5. run local validation;
6. open a pull request with scope and validation evidence;
7. address review and CI feedback;
8. merge only after required checks pass;
9. deploy through the agreed CI/CD process;
10. verify the deployed behavior against the story acceptance criteria;
11. update the story status and related documentation.

### 3.4 Branch and Integration Procedure

- `main` is the integration baseline.
- Development occurs on assigned feature/member branches.
- Pull requests target `main`.
- A pull request should contain one coherent story or a tightly coupled story group.
- Unrelated files must not be included.
- Database migrations, API contracts, and shared types require additional cross-team review.
- Merge conflicts are resolved by the branch owner with the affected module owner.
- Direct unreviewed changes to `main` are not part of the planned workflow.

## 4. Work Breakdown and Task Plan

### 4.1 Batch 1 – Foundation

**Purpose:** establish independent foundations required by later business workflows.

| Owner | Planned Work | Primary Outputs |
|---|---|---|
| BE1 Chí | AUTH-01→06, PROFILE-01 | Authentication, authorization, password/profile flows |
| BE2 Đạt | PROPERTY-01→02, ROOM-01→03 | Property/room schema, API, validation, ownership rules |
| BE3 Minh | UTILITY-01→02, CHARGE-01 | Utility-rate and recurring-charge foundation |
| FE1 MXH | Auth, Profile, Property, Room UI | Core account and portfolio screens |
| FE2 Quân | Design System, Navigation, Shared Components, Utility UI | Reusable UI foundation and utility screens |

**Exit condition:** foundation APIs and UI contracts are available for dependent Batch 2 work.

### 4.2 Batch 2 – Core Business

**Purpose:** implement the primary landlord/tenant operational workflows.

| Owner | Planned Work | Primary Outputs |
|---|---|---|
| BE1 Chí | TENANT-01→02, LEASE-01→06 | Tenant provisioning and lease lifecycle |
| BE2 Đạt | METER-01→03 | Meter readings, consumption, and correction workflow |
| BE3 Minh | MAINT-01→05 | Maintenance submission, review, status, and room history |
| FE1 MXH | Tenant and Lease UI | Tenant/lease flows |
| FE2 Quân | Meter and Maintenance UI | Meter and maintenance flows |

**Dependencies:** Batch 1 authentication, property/room, utility configuration, storage, and approved shared contracts.

**Exit condition:** core lease, meter, and maintenance workflows are integrated and deployed.

### 4.3 Batch 3 – Billing and Payment

**Purpose:** complete the invoice-to-payment workflow.

| Owner | Planned Work | Primary Outputs |
|---|---|---|
| BE1 Chí | Review, testing, bug fixing, integration support | Stabilized Auth/Tenant/Lease foundation |
| BE2 Đạt | INVOICE-01→04 | Invoice generation, viewing, PDF, review/send |
| BE3 Minh | VIETQR-01→02, PAYMENT-01→03, REMINDER-01→02 | Payment configuration, QR, proof, verification, reminders |
| FE1 MXH | Invoice and Payment UI | Invoice and payment screens |
| FE2 Quân | VietQR, Upload Proof, Notification UI | Tenant payment and notification interactions |

**Dependencies:** Lease, Utility, Charge, Meter, storage, PDF generation, and notification infrastructure.

**Exit condition:** an authorized invoice can progress through review, sending, VietQR display, payment proof, and manual verification.

### 4.4 Batch 4 – Dashboard and Reporting

**Purpose:** aggregate stable operational data into management views.

| Owner | Planned Work | Primary Outputs |
|---|---|---|
| BE1 Chí | DASH-01→02 | Occupancy and revenue summaries |
| BE2 Đạt | DASH-03→04 | Outstanding invoices and lease-expiration summaries |
| BE3 Minh | REPORT-01→05 | Financial, occupancy, maintenance, and PDF reports |
| FE1 MXH | Dashboard UI | Portfolio dashboard |
| FE2 Quân | Report UI | Report selection, display, and export |

**Dependencies:** stable Room, Lease, Invoice, Payment, Maintenance, and authorization data.

**Exit condition:** dashboard/report results match authorized source data and can be demonstrated in the deployed environment.

### 4.5 Final Integration and Pilot Preparation

The team will:

- complete cross-module API/UI integration;
- run backend CI and relevant mobile validation;
- correct integration defects;
- verify supported end-to-end workflows in the deployed environment;
- prepare test data and pilot accounts;
- update technical and user-facing documentation;
- prepare the final academic demonstration.

## 5. Schedule and Milestones

The baseline duration is 8–10 weeks. The schedule is relative because the formal start date is controlled by the academic calendar.

| Period | Planned Focus | Milestone |
|---|---|---|
| Week 1 | Scope, architecture, contracts, environment, Batch 1 start | Planning and technical baseline approved |
| Weeks 2–3 | Batch 1 completion and Batch 2 start | Foundation available |
| Weeks 3–5 | Batch 2 backend/frontend integration | Core business workflows deployed |
| Weeks 5–7 | Batch 3 billing/payment implementation | Invoice-to-payment flow deployed |
| Weeks 7–8 | Batch 4 dashboard/report implementation | Analytics flows deployed |
| Week 9 | System integration, testing, documentation, pilot preparation | MVP candidate ready |
| Week 10 | Contingency for rework, external services, and academic feedback | Final deployed submission |

Where dependencies permit, backend and frontend tasks run in parallel. Starting later-batch implementation does not waive its dependency or quality requirements.

## 6. People and Responsibilities

### 6.1 Governance Roles

| Role | Responsibility |
|---|---|
| Project Sponsor/Lecturer | Approves academic milestones, provides guidance, and evaluates final deliverables |
| Project Manager/Team Leader | Maintains the plan, coordinates work, manages risks and changes, and reports to the sponsor |
| Product representatives | Clarify landlord/tenant workflows and provide acceptance feedback |
| Development team | Designs, implements, tests, integrates, documents, and deploys the MVP |

### 6.2 Named Delivery Responsibilities

| Member | Primary Role | Accountable Workstream |
|---|---|---|
| Chí | BE1 | Auth, Profile, Tenant, Lease, Dashboard 01–02, backend stabilization |
| Đạt | BE2 | Property, Room, Meter, Invoice, Dashboard 03–04 |
| Minh | BE3 | Utility, Charge, Maintenance, Payment, Reminder, Report |
| MXH | FE1 | Auth/Profile/Property/Room, Tenant/Lease, Invoice/Payment, Dashboard UI |
| Quân | FE2 | Design system, Utility, Meter/Maintenance, VietQR/Notification, Report UI |

### 6.3 Shared Responsibilities

| Activity | Responsible | Accountable |
|---|---|---|
| Story clarification | Assigned member + affected API/UI owner | Project Manager |
| Code implementation | Assigned member | Assigned member |
| Pull-request review | A teammate other than the author | Module owner |
| Shared API/schema decision | Affected BE/FE owners | Integration owner appointed for the batch |
| Backend CI maintenance | Backend team | BE1 infrastructure owner |
| Mobile validation | FE1 and FE2 | FE owner for the affected package |
| Deployment | Assigned release member | Project Manager/Integration owner |
| Documentation | Story owner | Project Manager |

The Project Manager records the named integration/release owner at the start of each batch. Review work is planned capacity and is not treated as free or duplicate effort.

## 7. Risk Assessment Mechanism

### 7.1 Risk Process

The team maintains a risk register with:

- risk description and cause;
- probability and impact;
- owner;
- preventive action;
- contingency response;
- trigger or early-warning indicator;
- current status.

Risks are reviewed at each batch boundary and whenever a trigger occurs. A risk becomes an issue when the uncertain event has occurred and requires immediate action.

### 7.2 Initial Risk Register

| Risk | Probability | Impact | Owner | Preventive/Contingency Action |
|---|---|---|---|---|
| Academic workload reduces availability | Medium | High | Project Manager | Maintain 8–10 week range; rebalance assignments; use Week 10 contingency |
| Frontend becomes the critical-path bottleneck | Medium | High | FE1/FE2 | Build shared components first; integrate each batch rather than waiting for all backend work |
| Cross-module API/schema conflict | Medium | High | Batch integration owner | Agree contracts before implementation; require affected-owner review |
| AI-generated code is accepted without sufficient understanding | Medium | High | Story owner/reviewer | Human review, tests, and explanation of business/security logic before merge |
| AI trial/free benefit expires or reaches quota | Medium | Medium | Project Manager | Track benefit limits; maintain paid fallback and prioritize critical-path work |
| External storage/email/notification service is unavailable | Medium | High | Relevant backend owner | Define interfaces early; use test substitutes; isolate provider configuration |
| CI or deployment fails | Medium | High | Release owner | Fix failed checks before merge/deployment; retain the previous deployable revision |
| Scope expands beyond the approved backlog | Medium | High | Project Manager/Sponsor | Use formal change control; defer non-essential additions |
| Pilot users are unavailable | Medium | Medium | Project Manager | Recruit early; prepare representative test accounts and scenarios |

Risk exposure is assessed qualitatively as Probability × Impact. High-exposure items receive an owner and response before dependent work starts.

## 8. Change-Control Mechanism

### 8.1 Change Request

A proposed change must record:

- requester and date;
- reason and expected benefit;
- affected user stories, interfaces, and documents;
- time, resource, cost, risk, and quality impact;
- dependency and migration impact;
- recommended decision.

### 8.2 Decision Levels

| Change Type | Examples | Approval |
|---|---|---|
| Technical implementation change | Internal refactor with no behavior, scope, or baseline impact | Module owner |
| Minor product clarification | Clarifies an existing acceptance criterion without adding behavior | Project Manager + affected owners |
| Baseline change | Adds/removes a story, changes acceptance behavior, deadline, architecture, or budget | Project Sponsor/Lecturer + Project Manager |

### 8.3 Change Procedure

1. Log the request; do not implement it as hidden scope.
2. Analyze impact on scope, schedule, resources, cost, risk, and quality.
3. Obtain the required approval.
4. Update the Product Backlog and affected baselines.
5. Communicate the decision to all affected owners.
6. Implement through the normal branch, review, CI, and deployment process.

Rejected or deferred requests remain recorded to prevent repeated informal scope discussions.

## 9. Quality-Evaluation Mechanism

### 9.1 Quality Objectives

The delivered MVP should:

- satisfy approved user-story acceptance criteria;
- enforce role and ownership rules in the backend;
- protect passwords, tokens, private files, and cross-tenant/landlord data;
- preserve billing, payment, lease, and maintenance consistency;
- use reproducible database migrations and configuration;
- pass the applicable automated and manual checks;
- deploy successfully to the agreed environment;
- provide errors that are useful without exposing sensitive data.

### 9.2 Quality Gates

| Gate | Required Evidence |
|---|---|
| Story readiness | Reviewed acceptance criteria, dependencies, and owner |
| Local validation | Relevant tests/typecheck/lint executed by the author |
| Pull-request review | Approval or resolved feedback from another team member |
| Backend CI | Migration, typecheck, unit tests, integration tests, API tests, and build pass |
| Mobile validation | `npm run lint` plus relevant manual/functional checks until mobile CI is added |
| Integration | API/UI contract works with representative test data |
| Deployment | Deployment succeeds and acceptance behavior is verified in the agreed environment |
| Documentation | API, setup, migration, or user documentation updated where affected |

The current GitHub Actions workflow enforces backend migration, typecheck, unit, integration, API, and build checks. It does not currently validate the mobile application; mobile validation remains an explicit FE responsibility.

### 9.3 Completion Criteria

A story is `Done` for this plan when:

- its approved acceptance criteria pass;
- relevant automated/manual validation passes;
- ownership and authorization behavior is verified where applicable;
- code review is complete;
- CI checks applicable to the change pass;
- required database/configuration changes are reproducible;
- the behavior is deployed and verified in the agreed environment;
- required documentation is updated;
- no unresolved defect blocks the intended user outcome.

## 10. Communication and Coordination

| Communication | Participants | Frequency | Purpose |
|---|---|---|---|
| Team coordination | Five development members | Short daily asynchronous update or meeting | Assign work, expose blockers, coordinate dependencies |
| Batch planning/review | Project Manager and affected owners | At each batch boundary | Confirm readiness, ownership, risks, and integration plan |
| Sponsor review | Project Manager and Lecturer | Weekly or at academic milestones | Confirm direction and obtain required decisions |
| Pull-request discussion | Author, reviewer, affected owners | Per pull request | Review implementation, contracts, tests, and quality |
| Pilot feedback | Team and representative users | During pilot preparation/use | Validate workflows and usability |

Decisions that affect scope, API contracts, schedule, or quality are recorded in the relevant GitHub issue, pull request, backlog, or approved project document rather than remaining only in chat.

## 11. Tools and Project Facilities

| Category | Planned Tools/Facilities |
|---|---|
| Source and collaboration | GitHub repository, pull requests, issues, GitHub Actions |
| Backend | Node.js, Express, TypeScript, Drizzle ORM |
| Frontend/mobile | React Native, Expo |
| Database | PostgreSQL |
| Storage/integration | Approved cloud storage, email/push services, VietQR tooling |
| Testing | Vitest, Supertest, PostgreSQL integration environment, Postman/manual API checks |
| AI development assistance | GPT-5.6 Sol and team-reported `Hy3` access |
| Documentation | Markdown documents in the repository |
| Hardware | Member laptops, mobile test devices, internet access |

Credentials and environment secrets must remain in approved environment/secret storage and must not be committed to the repository.

## 12. Plan Approval and Maintenance

This plan becomes the working project baseline when the Project Manager and Sponsor/Lecturer approve:

- scope and batch sequence;
- named responsibilities;
- the 8–10 week schedule;
- risk ownership;
- change-decision authority;
- quality gates and completion criteria.

The Project Manager maintains the plan when an approved change affects process, tasks, people, schedule assumptions, risk mechanisms, or quality mechanisms. Routine implementation details that do not change the baseline remain in user stories, issues, and pull requests rather than expanding this document.
