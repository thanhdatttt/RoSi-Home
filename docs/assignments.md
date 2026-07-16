| Batch | Dev 1                              | Dev 2                            | Dev 3                           | Dev 4                          | Dev 5                           | Tổng US |
| ----: | ---------------------------------- | -------------------------------- | ------------------------------- | ------------------------------ | ------------------------------- | ------: |
|     1 | `AUTH-01` Register landlord        | —                                | —                               | —                              | —                               |       1 |
|     2 | `AUTH-02` Login                    | `AUTH-06` Password recovery      | —                               | —                              | —                               |       2 |
|     3 | `AUTH-03` Logout                   | `AUTH-04` RBAC/ownership         | `AUTH-05` Change password       | `PROFILE-01` Profile           | —                               |       4 |
|     4 | `PROPERTY-01` Create property      | `VIETQR-01` Bank details         | —                               | —                              | —                               |       2 |
|     5 | `PROPERTY-02` View/update property | `ROOM-01` Add room               | `UTILITY-01` Configure rates    | `CHARGE-01` Property surcharge | —                               |       4 |
|     6 | `ROOM-02` View/update room         | `ROOM-03` Bulk rooms             | `UTILITY-02` Update rates       | `METER-01` Initial reading     | `LEASE-01` Create lease         |       5 |
|     7 | `TENANT-02` Provision account      | `LEASE-03` Update/renew          | `LEASE-04` End lease            | `LEASE-05` Expiry reminder     | `LEASE-06` Upcoming expirations |       5 |
|     8 | `TENANT-01` View/update tenant     | `LEASE-02` View lease            | `METER-02` Monthly calculation  | `MAINT-01` Submit request      | `DASH-01` Occupied/total rooms  |       5 |
|     9 | `MAINT-02` Tenant request list     | `MAINT-03` Landlord review       | `INVOICE-01` Generate invoice   | `DASH-04` Lease expirations    | —                               |       4 |
|    10 | `INVOICE-02` View invoice          | `METER-03` Correct reading       | `VIETQR-02` Invoice QR          | `MAINT-04` Update status       | —                               |       4 |
|    11 | `INVOICE-03` Invoice PDF           | `INVOICE-04` Review/send         | `PAYMENT-01` Upload proof       | `MAINT-05` History             | `REMINDER-02` Manual reminder   |       5 |
|    12 | `PAYMENT-02` Verify payment        | `REMINDER-01` Automatic reminder | —                               | —                              | —                               |       2 |
|    13 | `PAYMENT-03` Payment history       | `DASH-02` Revenue summary        | —                               | —                              | —                               |       2 |
|    14 | `DASH-03` Outstanding invoices     | `REPORT-01` Select report period | —                               | —                              | —                               |       2 |
|    15 | `REPORT-02` Financial/debt         | `REPORT-03` Occupancy/churn      | `REPORT-04` Maintenance metrics | —                              | —                               |       3 |
|    16 | `REPORT-05` Export report PDF      | —                                | —                               | —                              | —                               |       1 |
|       |                                    |                                  |                                 |                                | **Tổng cộng**                   |  **51** |
