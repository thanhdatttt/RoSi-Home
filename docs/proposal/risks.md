# Risk Assessment — RosiHome

Risks are scored Likelihood (L) × Impact (I) on a 1–5 scale; Score = L×I (1–25). Priority: **High ≥15, Medium 8–14, Low ≤7.**

## 1. Risk Register

| # | Risk | Category | L | I | Score | Priority | Mitigation |
|---|---|---|---|---|---|---|---|
| R1 | Mobile app effort underestimated (largest single module in the time estimate) | Schedule | 4 | 4 | 16 | High | Build a thin vertical-slice mobile prototype in Sprint 0/1 to validate estimate early; consider React Native/MAUI code-sharing to cut duplicate work |
| R2 | Billing/invoice engine complexity (utility metering, proration, edge cases) exceeds estimate | Technical/Schedule | 4 | 4 | 16 | High | Time-box a design spike before Sprint 3; scope MVP to simple flat-rate + manual meter entry, defer complex proration rules |
| R3 | Team member availability drops due to competing coursework/exams | Resource | 4 | 4 | 16 | High | Build exam-period buffer into schedule (already reflected in the 16-week vs. ~10-week capacity gap); cross-train so no module has a single point of failure |
| R4 | Scope creep (adding a full payment gateway, SMS/Zalo integration, AI features before MVP is stable) | Scope | 4 | 4 | 16 | High | Enforce MVP feature freeze at W18; maintain a clearly labeled "fast-follow / post-MVP" backlog so ideas are captured, not lost, without derailing the deadline |
| R5 | Low pilot-user recruitment (can't find 5–10 real landlords willing to test) | Market/Validation | 3 | 4 | 12 | Medium | Start recruiting in Phase 0 via personal networks and local landlord Facebook/Zalo groups; have a fallback of simulated/synthetic user testing with realistic personas if recruitment falls short |
| R6 | Tenant uploads fake/edited proof-of-payment screenshot since RosiHome doesn't verify the bank transfer directly | Trust/Fraud | 3 | 3 | 9 | Medium | MVP relies on landlord's own confirmation step (they can check their real bank app before confirming in RosiHome); document this as a known trust limitation, not a solved problem — automatic bank verification is a possible post-MVP enhancement, not an MVP requirement |
| R7 | Data privacy incident with real pilot user data (tenant PII, ID documents) | Legal/Compliance | 2 | 5 | 10 | Medium | Use synthetic/test data through development; minimal real-data collection during pilot with explicit consent and a basic privacy notice; no ID document uploads during pilot unless necessary |
| R8 | Uneven skill distribution — one module (e.g., mobile) has only one capable team member | Resource | 3 | 4 | 12 | Medium | Pair programming / knowledge-sharing sessions early; use AI assistance to lower the skill floor for cross-coverage |
| R9 | AI-assistance productivity gain doesn't materialize as assumed (25–35%) | Schedule/Estimation | 3 | 3 | 9 | Medium | Time estimate already includes a buffer (16 weeks allocated vs ~10 weeks of estimated pure capacity); treat AI gains as upside, not a load-bearing assumption |
| R10 | Post-graduation continuity — no one maintains/hosts the product after the course ends | Operational | 4 | 2 | 8 | Medium | Decide explicitly with advisor whether project ends at demo (clean shutdown/archival) or one member continues it; document either decision |
| R11 | Competing products iterate faster / market moves (e.g., incumbents add AI features) | Market/Competitive | 2 | 2 | 4 | Low | Not a concern for an academic MVP timeline; relevant only if pursuing commercialization |
| R12 | Free-tier cloud/service limits are exceeded mid-project | Infrastructure | 2 | 2 | 4 | Low | Monitor usage; budget has contingency line for overage (see Budget document) |
| R13 | Team conflict / uneven contribution among 5 members | Team/People | 3 | 3 | 9 | Medium | Clear role ownership (Stakeholders doc), visible task board, advisor-mediated check-ins if issues arise |
| R14 | Legal ambiguity around digital lease "signatures" being mistaken for legally binding contracts | Legal/Compliance | 2 | 3 | 6 | Low | Explicitly label MVP lease records as storage/reference only, not a legally binding e-signature product |

## 2. Top 4 Risks Requiring Immediate Action (Score ≥15)

1. **R1 — Mobile effort underestimation**: address with an early vertical-slice prototype.
2. **R2 — Billing engine complexity**: address with a pre-Sprint-3 design spike and simplified MVP scope.
3. **R3 — Team availability during academic term**: already partially mitigated by schedule buffer; reinforce with cross-training.
4. **R4 — Scope creep**: enforce a written feature-freeze policy and a visible "post-MVP" backlog from day one.

## 3. Risk Monitoring Process

- Risk register reviewed at the start of every sprint (bi-weekly) by the PM/team lead.
- Any new risk identified during a sprint retro is added within 48 hours.
- Any risk that moves to High priority is flagged to the faculty advisor at the next milestone check-in.