| Stream | Calibrated Scope      | Stories |            Time Basis |     Tokens | Model/Access                                         |
| ------ | --------------------- | ------: | --------------------: | ---------: | ---------------------------------------------------- |
| BE1    | Batch 1 + Batch 2     |      15 |    35 real-time hours |     135.0M | `Hy3`, free                                          |
| BE2    | Batch 1               |       5 |     7 real-time hours |       6.3M | `Hy3`, free                                          |
| BE2    | Batch 2 + Batch 3     |       7 |    13 real-time hours |      13.0M | `Hy3`, free                                          |
| BE2    | Batch 4               |       2 |     2 real-time hours |       2.5M | `Hy3`, free                                          |
| FE1    | Batch 1 frontend work |       7 | 13–15 real-time hours |      10.5M | Gemini 3.1 Pro, student subscription free for 1 year |
| FE2    | Batch 1 frontend work |       8 | 13–14 real-time hours |     118.0M | GPT-5.6 Sol High, Plus subscription                  |
| BE3    | Billing Foundation    |       3 |          2h real-time |      36.5M | GPT-5.6 Sol, Plus/trial                              |
| BE3    | MAINT-01→05           |       5 |          3h real-time | 56.564626M | GPT-5.6 Sol, Plus/trial                              |

 The first 2 day, BE1 also setup backend infrastructure + frontend infrastructure + resolve docs overhead : those are not counted towards user story

The whole team have to wait for infrastructure set up and FE have to wait for backend to finish the batch before doing the FE part of the batch. Thus, the whole process took 7 days in total. BE don't need to wait for anything so they work at their own pace.

**Team scope:**

| Batch   | BE1 (Chí)                                       | BE2 (Đạt)                                  | BE3 (Minh)                                                    | FE1 (MXH)                       | FE2 (Quân)                                                       |
| ------- | ----------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| Batch 1 | Auth: US-AUTH-01→06, US-PROFILE-01              | Property: US-PROPERTY-01→02, US-ROOM-01→03 | Billing Foundation: US-UTILITY-01→02, US-CHARGE-01            | US-AUTH-01→06, US-PROFILE-01    | US-PROPERTY-01→02, US-ROOM-01→03, US-UTILITY-01→02, US-CHARGE-01 |
| Batch 2 | Tenant & Lease: US-TENANT-01→02, US-LEASE-01→06 | Meter: US-METER-01→03                      | Maintenance: US-MAINT-01→05                                   | US-TENANT-01→02, US-LEASE-01→06 | US-METER-01→03, US-MAINT-01→05                                   |
| Batch 3 | Review, Test, Bug Fix                           | Invoice: US-INVOICE-01→04                  | Payment: US-VIETQR-01→02, US-PAYMENT-01→03, US-REMINDER-01→02 | US-INVOICE-01→04                | US-VIETQR-01→02, US-PAYMENT-01→03, US-REMINDER-01→02             |
| Batch 4 | Dashboard: US-DASH-01→02                        | Dashboard: US-DASH-03→04                   | Report: US-REPORT-01→05                                       | US-DASH-01→04                   | US-REPORT-01→05                                                  |

### Proposed End-to-End Assignment (Product Backlog 2.0)

Trong phương án này, mỗi người chịu trách nhiệm **end-to-end** cho user story được giao, gồm API, mobile UI, kiểm thử và sửa lỗi liên quan; không tách riêng frontend/backend. Batch sau chỉ bắt đầu khi dependency cần thiết ở batch trước đã hoàn thành.

| Batch | Chí | Đạt | Minh | MXH | Quân |
|---|---|---|---|---|---|
| **Batch 0 — Infrastructure setup** | `TASK-TECH-01` Backend infrastructure; `TASK-PM-01` Trello | `TASK-TECH-03` Quality tooling | — | `TASK-TECH-02` Frontend infrastructure | — |
| **Batch 1 — Core setup** | Auth/Profile: `US-AUTH-01→06`, `US-PROFILE-01` | Property/Room: `US-PROPERTY-01→02`, `US-ROOM-01→03` | Utility/Charge: `US-UTILITY-01→02`, `US-CHARGE-01` | — | — |
| **Batch 2 — Rental foundation** | — | Meter: `US-METER-01→03` | — | Tenant/Lease in dependency order: `US-LEASE-01` → `US-TENANT-02` → `US-TENANT-01` → `US-LEASE-02→04` | — |
| **Batch 3 — Operational workflows** | Lease expiry: `US-LEASE-05→06` | — | Billing/QR in dependency order: `US-VIETQR-01` → `US-INVOICE-01→04` → `US-VIETQR-02` | Maintenance: `US-MAINT-01→05` | — |
| **Batch 4 — Payment follow-up** | — | — | Payment reminders: `US-REMINDER-01→02` | — | Payment verification/tracking: `US-PAYMENT-01→03` |
| **Batch 5 — Monitoring & reports** | — | Dashboard: `US-DASH-01→04` | — | — | Reports: `US-REPORT-01→05` |

#### Document Task Assignment (Not Divided by Batch)

Document tasks are independent of the development batches and may be completed according to the course submission schedule.

| Document task | Responsible |
|---|---|
| `TASK-DOC-05` Write Product Backlog 2.0 | **Chí** |
| `TASK-DOC-09` Write the Software Project Estimation document | **Chí** |
| `TASK-DOC-11` Write the Project Proposal | **Chí** |
| `TASK-DOC-15` Write the Vision and Scope document | **Chí** |
| `TASK-DOC-01` Write the Technical Architecture document | **Đạt** |
| `TASK-DOC-07` Write the Project Charter | **Đạt** |
| `TASK-DOC-03` Write Product Backlog Version 1 | **Minh** |
| `TASK-DOC-13` Write the Statement of Work | **Hưng (MXH)** |
| `TASK-DOC-17` Write the Risk Management Plan | **Hưng (MXH)** |

#### Workload Summary

| Member | Related story groups | User stories | Setup/PM/document tasks | Total assigned items |
|---|---|---:|---:|---:|
| **Chí** | Auth/Profile, Lease Expiry | 9 | 6 | 15 |
| **Đạt** | Property/Room, Meter, Dashboard | 12 | 3 | 15 |
| **Minh** | Utility/Charge, Invoice, VietQR, Payment Reminder | 11 | 1 | 12 |
| **Hưng (MXH)** | Tenant, Lease, Maintenance | 11 | 3 | 14 |
| **Quân** | Payment, Report | 8 | 0 | 8 |
| **Team** | All 51 user stories and 13 tasks | **51** | **13** | **64** |

Story-count difference is `12 - 8 = 4`, within the allowed maximum of five. Empty cells mean the member supports integration, reviews, tests, or unblocks the active batch instead of taking a dependency-blocked story.
