# User Story Batch Assignments

## 1. Planning Rules

- The team has five full-stack developers and one half-day batch provides approximately 3–4 hours per developer.
- A developer pulls at most one user story at a time. A blank slot means the developer reviews, tests, integrates, or helps unblock active work instead of pulling a blocked story.
- A batch starts only after the dependencies of its assigned stories have reached `Accepted Done`.
- An unfinished story carries over and keeps its WIP slot; the next dependent story does not start early.
- No developer is the sole reviewer of their own story.
- Infrastructure tasks establish the delivery baseline and are not counted as completed user-story throughput.

## 2. Batch 0 — Infrastructure Setup

| Dev | Infrastructure task | Required output |
| :--- | :--- | :--- |
| **Dev 1** | Backend and API foundation | Node.js/Express service, environment configuration, REST/error conventions, health endpoint |
| **Dev 2** | Database and persistence foundation | PostgreSQL, Drizzle schema/migration workflow, seed data, audit-log and soft-delete conventions |
| **Dev 3** | Mobile application foundation | React Native project, navigation, state/API client, environment configuration |
| **Dev 4** | Security and external-service foundation | JWT/RBAC baseline plus interfaces or development adapters for email, mobile push, and file storage |
| **Dev 5** | Quality and delivery foundation | Test runner, CI, secrets/configuration convention, development deployment, PDF-generation interface |

Batch 1 may start only when Mobile can call the deployed development API, the API can migrate/connect to the database, baseline tests pass, and all five developers can work in isolated branches/worktrees.

## 3. User Story Assignments

The distribution is balanced at 11 stories for Dev 1 and 10 stories for each other developer. The one-story difference is unavoidable because the backlog contains 51 stories.

| Batch | Dev 1 | Dev 2 | Dev 3 | Dev 4 | Dev 5 | Total US |
| ----: | :--- | :--- | :--- | :--- | :--- | ------: |
| 1 | `AUTH-01` Register landlord | — | — | — | — | 1 |
| 2 | — | `AUTH-02` Login | `AUTH-06` Password recovery | — | — | 2 |
| 3 | `AUTH-05` Change password | `PROFILE-01` Profile | — | `AUTH-03` Logout | `AUTH-04` RBAC/ownership | 4 |
| 4 | — | — | `PROPERTY-01` Create property | `VIETQR-01` Bank details | — | 2 |
| 5 | `ROOM-01` Add room | `UTILITY-01` Configure rates | `CHARGE-01` Property surcharge | — | `PROPERTY-02` View/update property | 4 |
| 6 | `ROOM-02` View/update room | `ROOM-03` Bulk rooms | `UTILITY-02` Update rates | `METER-01` Initial reading | `LEASE-01` Create lease | 5 |
| 7 | `TENANT-02` Provision account | `LEASE-03` Update/renew | `LEASE-04` End lease | `LEASE-05` Expiry reminder | `LEASE-06` Upcoming expirations | 5 |
| 8 | `TENANT-01` View/update tenant | `LEASE-02` View lease | `METER-02` Monthly calculation | `MAINT-01` Submit request | `DASH-01` Occupied/total rooms | 5 |
| 9 | `INVOICE-01` Generate invoice | `DASH-04` Lease expirations | — | `MAINT-02` Tenant request list | `MAINT-03` Landlord review | 4 |
| 10 | `MAINT-04` Update status | — | `INVOICE-02` View invoice | `METER-03` Correct reading | `VIETQR-02` Invoice QR | 4 |
| 11 | `INVOICE-03` Invoice PDF | `INVOICE-04` Review/send | `PAYMENT-01` Upload proof | `MAINT-05` History | `REMINDER-02` Manual reminder | 5 |
| 12 | — | `PAYMENT-02` Verify payment | `REMINDER-01` Automatic reminder | — | — | 2 |
| 13 | — | — | — | `PAYMENT-03` Payment history | `DASH-02` Revenue summary | 2 |
| 14 | `DASH-03` Outstanding invoices | `REPORT-01` Select report period | — | — | — | 2 |
| 15 | — | — | `REPORT-02` Financial/debt | `REPORT-03` Occupancy/churn | `REPORT-04` Maintenance metrics | 3 |
| 16 | `REPORT-05` Export report PDF | — | — | — | — | 1 |
|  | **11 stories** | **10 stories** | **10 stories** | **10 stories** | **10 stories** | **51** |

## 4. Workload Summary

| Dev | Infrastructure tasks | User stories | Total assigned work items |
| :--- | ---: | ---: | ---: |
| **Dev 1** | 1 | 11 | 12 |
| **Dev 2** | 1 | 10 | 11 |
| **Dev 3** | 1 | 10 | 11 |
| **Dev 4** | 1 | 10 | 11 |
| **Dev 5** | 1 | 10 | 11 |
| **Team** | **5** | **51** | **56** |

Story count is only a balancing starting point; it is not evidence that effort is equal. Actual human time, review time, rework, blocked time, and `Accepted Done` throughput must be recorded in the pilot measurement workbook and used to rebalance later batches.
