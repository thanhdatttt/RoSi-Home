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

| Stream | Calibrated Scope                                             | Stories | Time Basis |     Tokens | Model/Access                                         |
| ------ | ------------------------------------------------------------ | ------: | ---------: | ---------: | ---------------------------------------------------- |
| BE1    | setup backend infrastructure + frontend infrastructure       |       0 |     2 days |       30 M | `Hy3`, free                                          |
| BE1    | Batch 1 + Batch 2 + resolve docs overhead compared with code |      15 |     3 days |     105.0M | `Hy3`, free                                          |
| BE2    | Batch 1                                                      |       5 |     1 days |       6.3M | `Hy3`, free                                          |
| BE2    | Batch 2 + Batch 3                                            |       7 |     2 days |      13.0M | `Hy3`, free                                          |
| FE1    | Batch 1 frontend work                                        |       7 |     2 days |      10.5M | Gemini 3.1 Pro, student subscription free for 1 year |
| FE2    | Batch 1 frontend work                                        |       8 |     2 days |     118.0M | GPT-5.6 Sol High, Plus subscription                  |
| BE3    | Billing Foundation                                           |       3 |   0.5 days |      36.5M | GPT-5.6 Sol, Plus/trial                              |
| BE3    | MAINT-01→05                                                  |       5 |   0.5 days | 56.564626M | GPT-5.6 Sol, Plus/trial                              |

 The first 2 day, BE1 also setup backend infrastructure + frontend infrastructure + resolve docs overhead : those are not counted towards user story

The whole team have to wait for infrastructure set up and FE have to wait for backend to finish the batch before doing the FE part of the batch. Thus, the whole process took 7 days in total. BE don't need to wait for anything so they work at their own pace.

**Team scope:**

| Batch   | BE1 (Chí)                                       | BE2 (Đạt)                                  | BE3 (Minh)                                                    | FE1 (MXH)                       | FE2 (Quân)                                                       |
| ------- | ----------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| Batch 1 | Auth: US-AUTH-01→06, US-PROFILE-01              | Property: US-PROPERTY-01→02, US-ROOM-01→03 | Billing Foundation: US-UTILITY-01→02, US-CHARGE-01            | US-AUTH-01→06, US-PROFILE-01    | US-PROPERTY-01→02, US-ROOM-01→03, US-UTILITY-01→02, US-CHARGE-01 |
| Batch 2 | Tenant & Lease: US-TENANT-01→02, US-LEASE-01→06 | Meter: US-METER-01→03                      | Maintenance: US-MAINT-01→05                                   | US-TENANT-01→02, US-LEASE-01→06 | US-METER-01→03, US-MAINT-01→05                                   |
| Batch 3 | Review, Test, Bug Fix                           | Invoice: US-INVOICE-01→04                  | Payment: US-VIETQR-01→02, US-PAYMENT-01→03, US-REMINDER-01→02 | US-INVOICE-01→04                | US-VIETQR-01→02, US-PAYMENT-01→03, US-REMINDER-01→02             |
| Batch 4 | Dashboard: US-DASH-01→02                        | Dashboard: US-DASH-03→04                   | Report: US-REPORT-01→05                                       | US-DASH-01→04                   | US-REPORT-01→05                                                  |
