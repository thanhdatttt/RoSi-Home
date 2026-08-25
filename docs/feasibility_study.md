# Feasibility Study Report — RosiHome

> **Decision: Proceed with conditions.** RosiHome is feasible as a course MVP for a five-student team and a ten-week plan. The team can continue if it keeps the agreed scope, fixes important security issues, and completes user acceptance testing. This report does not claim that RosiHome is ready for production.

## 1. Purpose and Scope

This report answers one question: **Can the team complete the RosiHome project with its current scope, time, people, tools, and budget?**

The assessment covers four areas: technical, operational, economic, and schedule feasibility. It uses the project Proposal, Product Backlog 3.0, Architecture, Prototype, Proof of Concept (PoC), project estimation, and risk plan. It focuses on the course MVP. It does not approve commercial use, real bank settlement, legal compliance, or production security.

## 2. Feasibility Assessment

| Area            | Evidence from RosiHome                                                                                                                                                                                                                                                                                                                                 | Result                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Technical**   | The project uses one Expo/React Native client, one Express REST API, PostgreSQL/Drizzle, private file storage, and VietQR. This simple monolithic design fits a small student team. The local PoC passed 25 functional tests, TypeScript checks, and build/export checks. However, its dependency audit still reports 8 moderate and 12 high findings. | **Feasible for the course MVP, with security work still required.**                                     |
| **Operational** | The Proposal, Prototype, User Manual, and current software describe clear Landlord and Tenant workflows for properties, rooms, leases, invoices, payment proof, maintenance, and reports. These artifacts show that the planned workflow is understandable and can be implemented. No formal usability test or complete real-user UAT was found.       | **Feasible as an MVP, but real users must still validate it.**                                          |
| **Economic**    | The Proposal estimates a cash budget of **4,250,000 VND** for tools, meetings, cloud services, domain, security, and contingency. Student labor is part of the course work and is not included as a cash cost. Free or student service tiers help keep the cost low.                                                                                   | **Feasible under the stated budget assumptions.** The amount is an estimate, not an actual-cost record. |
| **Schedule**    | The plan gives the five-person team ten weeks. The backlog provides a clear scope, priorities, and estimates. The selected architecture also reduces setup and coordination work. The main schedule threats are scope growth, integration work, security fixes, and unfinished UAT.                                                                    | **Feasible only if the team protects the MVP scope and tracks progress every week.**                    |

## 3. Strongest Evidence

The strongest technical evidence is the local billing and VietQR PoC. It tests one of the most difficult project flows:

1. Meter readings are used to calculate an invoice with a repeatable integer-VND result.
2. The invoice keeps a price snapshot and prevents conflicting duplicates.
3. Ownership and invoice-state rules are checked.
4. A Sent invoice can generate a deterministic VietQR payload.
5. The verification run passed 6 test files and 25 tests, strict TypeScript checks, the API build, and the Expo Web export.

This evidence shows that the team can build the high-risk idea inside the PoC boundary. It does **not** prove that a real bank accepted the QR code, that money moved, or that the production system is secure. VietQR starts a bank transfer; it does not confirm payment automatically.

## 4. Main Trade-offs and Risks

| Decision                             | Benefit                                                          | Trade-off or condition                                                                                |
| ------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Use one monolithic REST backend      | Easier for five students to build, test, and deploy in ten weeks | It cannot scale each service separately like microservices, but that is not needed for the course MVP |
| Use VietQR with manual payment proof | Reduces payment integration cost and complexity                  | The landlord must verify the transfer; QR generation alone cannot mark an invoice as Paid             |
| Use AI coding tools                  | Helps the team work faster and handle repetitive tasks           | Every important change still needs human review, testing, and security checks                         |
| Use free or student service tiers    | Keeps the planned cash cost low                                  | Prices and service limits may change, so the team must track actual spending                          |
| Keep the current MVP scope           | Gives the team a realistic chance to finish on time              | New ideas must be delayed or must replace work of similar size                                        |

The largest current risks are scope growth, dependency vulnerabilities, external-service problems, personal-data exposure, and missing real-user validation. The team should not hide these limits. They are conditions that must be managed before the project can move beyond the course MVP.
