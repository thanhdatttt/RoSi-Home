# RosiHome Statement of Work

## 1. Document Information

| Attribute | Value |
|---|---|
| Project | RosiHome Property Management MVP |
| Version | 1.0 |
| Date | 23 July 2026 |
| Client/Sponsor | University Supervisor / Lecturer |
| Delivery Team | RosiHome Student Development Team |
| Project Manager | Team Leader |
| Effective Date | Upon confirmation by the Sponsor and Project Manager |
| Planned Duration | 8–10 calendar weeks |

## 2. Purpose and Agreement

This Statement of Work (SOW) defines the agreed work required to deliver the RosiHome Minimum Viable Product. It establishes a common baseline between the Sponsor and the Development Team for:

- project objectives and scope;
- deliverables and acceptance conditions;
- schedule and milestones;
- responsibilities and decision authority;
- resource and budget assumptions;
- dependencies, constraints, and exclusions;
- change-control and approval procedures.

The SOW prevents differences between sponsor expectations and developer assumptions from becoming hidden scope, schedule, or budget problems. Detailed implementation planning is maintained in `docs/project_planning/project_plan.md`. Estimates are maintained in `docs/cost_time_resources/cost_time_resources_estimation_report.md`.

## 3. Project Background and Objectives

Self-managing landlords often use notebooks, spreadsheets, calculators, and messaging applications to manage rental properties. These fragmented processes can cause billing errors, payment disputes, missed lease events, and inefficient maintenance handling.

RosiHome will provide a centralized mobile property-management platform supported by a REST backend and PostgreSQL database. The MVP objectives are to:

1. centralize property, room, tenant, and lease information;
2. calculate rent, utilities, and recurring charges consistently;
3. generate and manage invoices;
4. support VietQR payment instructions and manual payment verification;
5. track maintenance requests and status history;
6. provide dashboards, reports, and supported notifications;
7. deploy a working academic MVP that can be demonstrated and evaluated.

## 4. Scope of Work

### 4.1 In-Scope Product Capabilities

The Development Team will implement the approved Product Backlog covering:

| Workstream | Included Capabilities |
|---|---|
| Identity and access | Registration, login/logout, role and ownership enforcement, password management, profile management |
| Property portfolio | Property and room creation, viewing, updating, and bulk room setup |
| Tenant and lease | Tenant provisioning, lease creation, viewing, renewal/update, termination, and expiration information |
| Utility and billing | Utility rates, recurring charges, meter readings, consumption, corrections, invoice generation, review, viewing, and PDF export |
| Payment | Landlord payment configuration, VietQR display, payment-proof upload, manual verification, payment history, and outstanding balances |
| Maintenance | Request submission, tenant/landlord views, review, status updates, and room maintenance history |
| Notifications | Supported lease, invoice/payment, and maintenance notifications |
| Analytics | Occupancy, revenue, outstanding-payment, lease-expiration dashboards, and business reports |

The technical delivery surfaces are:

- React Native mobile application;
- Node.js/Express/TypeScript REST API;
- PostgreSQL database with reproducible migrations;
- approved file/image storage;
- GitHub source control, pull requests, CI/CD, and deployment to the agreed development/integration environment.

### 4.2 Delivery Batches

| Batch | Main Scope | Completion Outcome |
|---|---|---|
| Batch 1 – Foundation | Auth/Profile, Property/Room, Utility/Charge, shared UI foundation | Core technical and data foundations available |
| Batch 2 – Core Business | Tenant/Lease, Meter, Maintenance, corresponding mobile UI | Core landlord/tenant workflows deployed |
| Batch 3 – Billing/Payment | Invoice, VietQR, Payment, Reminder, corresponding mobile UI | Invoice-to-payment workflow deployed |
| Batch 4 – Analytics | Dashboard, Report, corresponding mobile UI | Portfolio analytics and reporting deployed |

### 4.3 Supporting Work

The scope includes work necessary to complete the product:

- API and UI integration;
- automated and manual testing;
- database migration and environment configuration;
- CI/CD maintenance and deployment;
- correction of defects found before acceptance;
- technical and setup documentation;
- representative test data, pilot preparation, and final demonstration.

### 4.4 Out of Scope

The following are excluded unless approved through change control:

- direct payment-gateway processing or custody of user funds;
- electronic signatures;
- IoT smart-meter integration;
- multi-landlord collaboration;
- advanced accounting or tax reporting;
- production scale beyond the academic pilot;
- product features not contained in the approved backlog;
- long-term commercial operation and support after the course.

## 5. Deliverables and Acceptance

| ID | Deliverable | Acceptance Conditions |
|---|---|---|
| D1 | Backend API and database | Approved backend stories are implemented; relevant tests and CI checks pass; migrations are reproducible; behavior is deployed and verified |
| D2 | React Native mobile application | Approved mobile workflows are available; relevant lint/manual functional validation passes; application integrates with the deployed backend |
| D3 | Billing and payment workflow | Invoice generation, review/send, VietQR, proof upload, manual verification, and history follow approved acceptance criteria |
| D4 | Lease and maintenance workflow | Lease lifecycle and maintenance request/status/history behavior follow approved acceptance criteria |
| D5 | Dashboard and reporting | Authorized dashboard/report outputs match their source data and supported export behavior |
| D6 | Deployment and test evidence | GitHub CI/CD is configured; applicable checks pass; the agreed environment contains the accepted MVP revision |
| D7 | Project documentation | Product backlog, architecture, estimation report, project plan, SOW, setup/testing guidance, and required API documentation are complete and internally consistent |
| D8 | Pilot/demo package | Representative accounts/data and a repeatable demonstration of the principal landlord and tenant workflows are available |

A deliverable is accepted when:

- its approved acceptance criteria are satisfied;
- applicable backend or mobile validation passes;
- ownership and authorization behavior is verified where relevant;
- the change has completed the team’s pull-request process;
- the behavior is deployed and verified in the agreed environment;
- required documentation is updated;
- no unresolved defect prevents the intended user outcome.

Acceptance does not imply production-scale availability or long-term commercial support.

## 6. Schedule and Milestones

The planned duration is 8–10 calendar weeks. The exact dates will follow the academic calendar.

| Milestone | Target Period | Acceptance Evidence |
|---|---|---|
| M1 – Planning and technical baseline | Week 1 | Approved backlog, architecture, assignments, plan, and environments |
| M2 – Foundation available | Weeks 2–3 | Batch 1 APIs/UI foundations integrated |
| M3 – Core business workflows | Weeks 3–5 | Batch 2 workflows deployed |
| M4 – Billing/payment workflow | Weeks 5–7 | Batch 3 workflow deployed |
| M5 – Dashboard/report workflow | Weeks 7–8 | Batch 4 outputs deployed |
| M6 – MVP candidate | Week 9 | Integrated application, validation evidence, and documentation |
| M7 – Final delivery | Week 10 if required | Corrected deployed revision and academic demonstration |

Week 10 is schedule contingency for integration, external-service, deployment, or sponsor-feedback rework. It is not automatic additional scope.

## 7. Roles and Responsibilities

| Party/Member | Primary Responsibility |
|---|---|
| Sponsor/Lecturer | Approve the SOW and major baseline changes; provide academic guidance; evaluate final deliverables |
| Project Manager/Team Leader | Coordinate delivery, maintain baselines, assign integration/release ownership, manage decisions and sponsor communication |
| Chí – BE1 | Auth, Profile, Tenant, Lease, Dashboard 01–02, backend stabilization |
| Đạt – BE2 | Property, Room, Meter, Invoice, Dashboard 03–04 |
| Minh – BE3 | Utility, Charge, Maintenance, Payment, Reminder, Report |
| MXH – FE1 | Auth/Profile/Property/Room, Tenant/Lease, Invoice/Payment, Dashboard UI |
| Quân – FE2 | Design system, Utility, Meter/Maintenance, VietQR/Notification, Report UI |
| Product representatives | Clarify workflows and provide acceptance feedback when available |

Each story owner is responsible for implementation, relevant validation, pull-request evidence, corrections, and documentation. Review and integration are shared team responsibilities. The Project Manager remains accountable for coordinating completion of the agreed deliverables.

## 8. Resource and Budget Baseline

The team consists of five part-time student members with approximately 3–4 hours per person per day, five days per week.

| Estimate | Expected | Range |
|---|---:|---:|
| Complete MVP duration | 9 weeks | 8–10 weeks |
| Gross team capacity | 787.5 hours | 600–1,000 hours |
| Development cash budget | VND 3,277,500 | VND 950,000–4,062,500 |

The cash budget includes AI development tools, cloud infrastructure, domain/security, and contingency. Unpaid student labor is excluded from cash cost but may be reported as economic labor using an approved shadow hourly rate.

Free/trial AI access and student/cloud credits are treated as temporary benefits. If they expire or reach quota, paid fallback must remain within the approved budget or be submitted as a change request.

## 9. Assumptions, Dependencies, and Constraints

### Assumptions

- the approved Product Backlog remains materially stable;
- members retain the stated part-time availability;
- completed modules do not require major redesign;
- required pilot devices and internet access remain available;
- landlords and tenants use supported smartphones and valid contact information;
- payments continue directly between tenant and landlord, with manual verification.

### Dependencies

- Identity and Property/Room foundations precede most business workflows.
- Lease and Utility/Meter data precede Invoice.
- Invoice precedes Payment, Reminder, and financial reporting.
- Stable operational data precedes Dashboard and Report acceptance.
- File storage is required for maintenance images and payment proofs.
- Email/push/PDF/VietQR capabilities are required by their dependent stories.

### Constraints

- academic deadline and part-time student availability;
- free/trial provider quotas and expiry;
- five-person review and integration capacity;
- external-service availability;
- mobile and cloud environment limitations.

If an assumption becomes false or a dependency is unavailable, the Project Manager evaluates the impact and initiates change control where the baseline is affected.

## 10. Change Control

A change request is required when a proposal affects:

- approved scope or acceptance behavior;
- schedule or milestone commitments;
- budget or resource baseline;
- architecture or external-service dependency;
- an approved deliverable or responsibility.

Each request records the requester, reason, affected scope, time/resource/cost impact, risks, and recommended decision.

| Change Type | Approval Authority |
|---|---|
| Internal technical change with no baseline impact | Module owner |
| Clarification within existing approved behavior | Project Manager and affected owners |
| Scope, deadline, architecture, budget, or acceptance-baseline change | Sponsor/Lecturer and Project Manager |

The change-control procedure is:

1. record the request and analyze its scope, time, resource, cost, risk, and quality impact;
2. obtain approval from the authority defined above;
3. communicate the approved change, its impact, and its implementation timing to the entire team;
4. confirm that all affected owners understand the change;
5. update the backlog, plan, estimate, and SOW where applicable;
6. begin implementation through the normal branch, review, CI, and deployment process.

No approved change may be implemented before the whole team has been informed. Work must not be added informally without impact analysis, approval, and team communication.
