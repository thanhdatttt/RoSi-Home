# Feasibility Study Report — RosiHome

## Document Control and Provenance

| Item            | Value                                                                              |
| --------------- | ---------------------------------------------------------------------------------- |
| Artifact        | Feasibility Study Report                                                           |
| Project         | RosiHome course MVP                                                                |
| Current version | 1.0 — standalone consolidation                                                     |
| Prepared        | 24 August 2026                                                                     |
| Original source | `docs/proposal.md`, Section 5 — Feasibility Study                                  |
| Status          | Project-authored conditional assessment; formal approval evidence is not available |

The feasibility assessment was first developed as Section 5 of the Project Proposal. This standalone report was prepared later to consolidate the assessment method, evidence, results, caveats, and planning implications in one printable artifact. It must not be presented as a separate report that existed at the Proposal's original creation date.

The Project Proposal keeps only an executive summary. This document is the canonical source for the detailed feasibility analysis.

## 1. Purpose, Scope, and Decision

This report evaluates whether the approved RosiHome course MVP can reasonably proceed under the documented technical, operational, economic, and schedule constraints. It is a decision-support artifact, not a guarantee of successful delivery or production readiness.

The current overall decision is:

> **Proceed conditionally with the course MVP.** The proposed scope is feasible for an academic project if the team preserves the mobile-first scope, controls change, reviews generated code, manages provider dependencies, and does not treat repository presence or a passing functional check as proof of production readiness or user acceptance.

The report does not approve commercial deployment, legal compliance, real bank settlement, production security, or full UAT.

## 2. Formal Feasibility Model

RosiHome uses the four dimensions recorded in the Project Proposal on `main`:

1. **Technical feasibility** — can the team build and verify the scoped solution with the selected architecture and tools?
2. **Operational feasibility** — can the proposed Landlord and Tenant workflows operate coherently in the MVP context?
3. **Economic feasibility** — are the stated cash and team-resource assumptions sufficient for the course MVP?
4. **Schedule feasibility** — can the approved scope fit the documented ten-week plan?

Privacy, lease-record, payment, and data-handling concerns are treated as **cross-cutting legal/compliance constraints**. They affect all four dimensions but are not substituted for Technical feasibility.

### 2.1 Qualitative decision rule

| Result                               | Meaning                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feasible**                         | The available inputs support the proposed approach and no known blocker requires redesign or rescoping.                                           |
| **Feasible with conditions/caveats** | The approach is supportable for the stated context, but identified assumptions, risks, or missing evidence must remain visible and controlled.    |
| **Not demonstrated**                 | Evidence is insufficient to reach a defensible conclusion.                                                                                        |
| **Not feasible**                     | A known blocker makes the proposed scope or approach unsuitable unless the team redesigns, reduces scope, changes resources, or changes schedule. |

No numeric scorecard was found. The evaluation therefore uses documented questions, evidence, consistency checks, and explicit caveats rather than inventing a weighted score.

## 3. Sources and Assessment Chronology

### 3.1 Inputs to the original Proposal-stage assessment

- `docs/proposal.md`: problem, business case, proposed MVP, ten-week timeline, cash budget, and risk summary.
- `docs/vision_and_scope.md`: target users, objectives, product boundary, and excluded scope.
- `docs/project_charter.md`: stakeholders, constraints, responsibilities, and in/out scope.
- `docs/project_estimation.md` and project plans: team capacity, effort model, dependencies, and schedule assumptions.
- `docs/risk_management.md`: delivery, provider, quality, adoption, and data risks.

### 3.2 Later evidence used to reassess, not to rewrite history

- `docs/product_backlog_3.0.md`: current requirement baseline with 51 Product User Stories and supporting work.
- `docs/architecture.md`: the current three-layer, mobile-first solution and external-service boundaries.
- `docs/prototype.md` and `Prototype/`: design coverage and workflow evidence, not real-user usability proof.
- `docs/proof_of_concept.md` and `poc-local/`: local technical evidence for the highest-risk billing/VietQR slice.
- Current source, tests, generated verification evidence, and `docs/user_manual.md`: implementation surface and documented user workflows.

The chronology is therefore:

```text
Proposal/business-case inputs
        ↓
Proposal Section 5 — initial feasibility summary
        ↓
Standalone report — expanded method, evidence, caveats, and traceability
        ↓
Current reassessment — Architecture, Prototype, PoC, Backlog, and source checks
```

This chronology distinguishes documented artifact evolution from any unrecorded meeting or approval process.

## 4. Feasibility Summary

| Dimension       | Main question                                                       | Current result                                          | Main caveat / risk                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Technical**   | Can the selected solution be built and verified for the course MVP? | **Feasible for the course MVP, with readiness caveats** | Local functional evidence exists, but production dependency security, provider behavior, production deployment, real-device behavior, and full UAT are not established |
| **Operational** | Can Landlords and Tenants follow the proposed MVP workflows?        | **Feasible with operational caveats**                   | Repository and prototype evidence are not real-user usability evidence; onboarding and post-course ownership/support remain open                                       |
| **Economic**    | Can the stated resources and cash budget support the MVP?           | **Feasible under stated assumptions**                   | The 4,250,000 VND figure is an estimate excluding student labor; a complete actual-cost ledger is not available                                                        |
| **Schedule**    | Can the approved scope fit the ten-week course plan?                | **Feasible with scope discipline**                      | Rework, integration, provider setup, review, UAT, and added scope can consume the remaining schedule                                                                   |

## 5. Technical Feasibility

- **Question:** Can the five-person team implement and verify the approved MVP with the selected architecture and tools?
- **Inputs:** Architecture, Product Backlog 3.0, team skills and tools, current source/tests, Prototype, PoC, and external-provider assumptions.
- **Method:** Trace the highest-risk workflows from requirement to architecture and observable implementation; run the available local PoC verification; separate functional plausibility from production readiness.
- **Assessment:** The repository uses a mobile-first Expo/React Native client, an Express REST backend, PostgreSQL/Drizzle persistence, controlled file storage, and a direct-transfer VietQR boundary. These choices fit a small course team and the scoped workflows.
- **Current evidence snapshot:** `poc-local/evidence/verification-latest.md`, completed `2026-08-24T01:30:30.426Z`, records 6/6 test files and 25/25 tests passing, strict typecheck passing, and API build/Expo Web export passing. The production dependency audit gate fails with 20 findings: 8 moderate and 12 high.
- **Result:** **Feasible for the course MVP, with readiness caveats.** The local vertical slice supports technical plausibility; the failed dependency gate keeps the PoC evidence `PARTIAL` and blocks a production-ready claim.
- **Main caveat / risk:** The current evidence does not prove production PostgreSQL concurrency, production provider delivery, real-device push behavior, production availability, full security, or completed UAT.
- **Planning implication:** Keep the monolithic/mobile-first scope, remediate or explicitly accept dependency risk before production use, and require evidence for each provider-dependent capability.

## 6. Operational Feasibility

- **Question:** Do the proposed workflows fit the work of self-managing Landlords and Tenants?
- **Inputs:** Proposal pain points, Vision & Scope, original/revised Prototype, User Manual, current routes, and role/ownership boundaries.
- **Method:** Walk through the Landlord and Tenant scenarios and check whether each problem has an observable action and result without assuming usability success.
- **Assessment:** RosiHome centralizes property/room records, leases, billing, reminders, payment proof, maintenance, and reporting that would otherwise be split across manual records and chat threads.
- **Result:** **Feasible with operational caveats.** The workflow is represented in design and implementation artifacts.
- **Main caveat / risk:** No formal real-user usability study or complete UAT evidence was found. Onboarding must remain low-friction, and post-course hosting, support, and ownership need an explicit decision.
- **Planning implication:** Keep workflows short, retain role-specific guidance, and treat pilot/usability evidence as future validation rather than completed proof.

## 7. Economic Feasibility

- **Question:** Are the documented cash and team resources sufficient for the academic MVP?
- **Inputs:** Proposal budget, project estimation, cost/time/resource documents, five-student team, and service/tool assumptions.
- **Method:** Compare the scoped deliverables with the planned cash categories and explicitly separate estimated cash cost from student labor and actual expenditure.
- **Assessment:** The Proposal estimates **4,250,000 VND** for AI coding-agent subscriptions, meetings, cloud infrastructure, domain, security, and contingency. Student labor is provided as coursework and excluded from cash cost.
- **Result:** **Feasible under the stated assumptions.** The planned resources are consistent with a small academic MVP.
- **Main caveat / risk:** The figure is an estimate, not proof of final expenditure. Provider prices, free/student tiers, subscription usage, and contingency needs can change; a complete actual-cost ledger is not available.
- **Planning implication:** Track actual spending separately, re-estimate when service assumptions change, and do not present the estimate as realized cost.

## 8. Schedule Feasibility

- **Question:** Can the approved MVP be delivered within the ten-week course plan?
- **Inputs:** Proposal timeline, Product Backlog 3.0, priorities and dependencies, project estimation, team capacity, and risk register.
- **Method:** Compare the planned phases with the approved scope and known delivery risks; use current implementation only as reassessment evidence, not as proof that all acceptance work is complete.
- **Assessment:** The Proposal allocates four weeks to research/proposal, two weeks to core management, three weeks to invoice/payment, and one week to review, demonstration, and closure.
- **Result:** **Feasible with scope discipline.** The plan can support the approved MVP only if dependencies and change are actively controlled.
- **Main caveat / risk:** Scope growth, rework, integration, external-provider setup, security remediation, review, and UAT can consume the schedule. Backlog `Status: Done` or source presence does not independently prove acceptance.
- **Planning implication:** Require impact analysis for added scope, prioritize dependency-critical flows, and keep incomplete acceptance/UAT visible.

## 9. Cross-Cutting Legal and Compliance Constraints

These constraints refine the four feasibility conclusions; they are not an independent legal opinion:

- Use synthetic demonstration data where possible and protect Tenant personal data through role, ownership, and private-storage controls.
- Treat digital leases as stored records, not as legally binding e-signatures unless authoritative requirements and implementation evidence are added.
- Treat VietQR as payment initiation. QR generation does not move money, confirm settlement, or mark an invoice Paid; Landlord bank verification remains necessary.
- Reassess privacy, payment, lease, and security obligations before any real production use.

**NOT FOUND:** independent legal/privacy opinion or formal compliance approval for this report.

## 10. Formation and Evaluation Method

The standalone report was formed by expanding the Proposal's initial four-dimension summary:

```text
Collect problem, scope, team, cost, schedule, architecture, and risk assumptions
→ ask one decision question for each formal dimension
→ identify the source and assessment method
→ record evidence and counter-evidence
→ assign a conditional result using the qualitative decision rule
→ record caveat and planning implication
→ cross-check terminology and boundaries across downstream artifacts
```

Evaluation uses four controls:

1. **Source traceability:** every material number or boundary points to a named repository source.
2. **Cross-document consistency:** Proposal, Charter, Backlog, Architecture, User Manual, Prototype, PoC, and plans must not contradict the same scope/payment/data decision.
3. **Evidence boundary:** design, source inspection, automated checks, UAT, production behavior, and independent approval are not treated as equivalent evidence.
4. **Change sensitivity:** the result must be reassessed when scope, schedule, team, cost, provider, security, or legal assumptions materially change.

## 11. Use and Reassessment Triggers

The report supports the decision to keep a mobile-first course MVP, use one REST monolith, retain direct VietQR transfer with proof/manual verification, avoid runtime AI and binding e-signature claims, and require impact analysis before adding scope.

Reassess this report when any of the following occurs:

- approved scope or Product Backlog baseline changes;
- team capacity or course deadline changes;
- estimated or actual cost materially changes;
- a critical provider, deployment, audit, or security result changes;
- real-user usability/UAT evidence becomes available;
- authoritative legal/privacy guidance changes a project boundary.

## 12. Evidence and Confidence Map

| Claim                                         | Source                                            | Confidence / boundary                                                                    |
| --------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Original feasibility summary                  | `docs/proposal.md`, Section 5                     | **FACT** — original embedded artifact                                                    |
| Four formal dimensions                        | `docs/proposal.md`, Section 5                     | **FACT** — Technical, Operational, Economic, Schedule                                    |
| Current requirement scope                     | `docs/product_backlog_3.0.md`                     | **FACT** — current documented baseline; status is not UAT proof                          |
| Architecture and implementation surface       | `docs/architecture.md`; repository source         | **FACT** for documented/source structure; production behavior not established            |
| Prototype workflow coverage                   | `docs/prototype.md`; `Prototype/`                 | **FACT** for design artifacts; not usability or production proof                         |
| PoC verification snapshot                     | `poc-local/evidence/verification-latest.md`       | **FACT** for the dated local run; overall evidence remains `PARTIAL` because audit fails |
| Budget and timeline                           | `docs/proposal.md`; estimation/planning documents | **FACT** as project estimates and assumptions, not actual results                        |
| Complete actual-cost ledger                   | —                                                 | **NOT FOUND**                                                                            |
| Formal usability/UAT completion               | —                                                 | **NOT FOUND**                                                                            |
| Independent legal/privacy opinion             | —                                                 | **NOT FOUND**                                                                            |
| Customer/lecturer/formal feasibility approval | —                                                 | **NOT FOUND**                                                                            |
