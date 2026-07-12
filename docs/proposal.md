# Project Proposal — RosiHome

---

## 1. Business Case

### 1.1. The Story: Mr. Tuấn's Boarding House

Mr. Tuấn (48, Ho Chi Minh City) owns a 12-room boarding house that he built up over a decade of saving. He also works a full-time day job, so the boarding house runs on whatever time he has left in the evenings. Every month he walks room to room with a notebook to read the electricity and water meters by hand, then does the rent math on his phone's calculator before texting each tenant on Zalo. Two tenants always "forget" to reply. One month he loses track of who has paid and who hasn't, deposits a rent payment into the wrong ledger line in his spreadsheet, and ends up in an awkward argument with a tenant who insists she already paid. Three months later, a tenant's lease quietly expires without Mr. Tuấn noticing — he only finds out when the tenant has already moved out, leaving the room empty for a month with no new tenant lined up.

### 1.2. How RosiHome Changes the Game

RosiHome turns Mr. Tuấn's evening ritual of notebooks, calculators, and Zalo messages into a single flow he can run from his phone in minutes:
 
- He adds his 12 rooms once and his QR bank account, with each tenant's profile and digital lease stored in the app — no more paper folder, no more relying on memory for renewal dates.
- Each month, he enters the electricity and water meter readings on his phone; **RosiHome automatically calculates the rent + utility invoice** for every room.
- For each invoice, RosiHome **sends a payment QR code** (bank transfer QR) of Mr. Tuấn's bank account and the exact amount owed to the tenant in the app - no manual bank-transfer typos, no confusion about how much is owed.
- The tenant **scans the QR code in their own banking app and pays Mr. Tuấn directly** - money moves bank-to-bank, the app never holds or touches the tenant's funds. The tenant then **uploads a screenshot of the payment confirmation as proof** directly in RosiHome.
- Mr. Tuấn reviews the proof and confirms the payment with one tap; RosiHome **automatically stores the full payment history** for every tenant, every room, every month - no more "I already paid" disputes with no record to check.
- When a tenant reports a leaking tap, they **log it in the app with a photo** instead of a phone call Mr. Tuấn might forget by the time he's home - he tracks every request to resolution in one list.
- Every **lease renewal date is tracked automatically**, and RosiHome reminds him 90 days out - no more losing a month of rent to a lease that expired unnoticed.
- On a Sunday evening, instead of manually eyeballing a spreadsheet, Mr. Tuấn opens one dashboard and sees, at a glance: how many rooms are occupied, how much rent is outstanding, and how much the boarding house made this month.

### 1.3. The Result
 
Mr. Tuấn stops losing evenings to notebooks and calculators, stops losing rent to disputes he can't prove, and stops losing tenants to renewal dates he forgot to track. Because the money moves directly between his tenant's bank account and his own — with a QR code doing the calculation and RosiHome doing the record-keeping — he never has to worry about holding tenant funds or reconciling a third-party wallet. His tenants get a clear, scan-and-pay experience with proof stored automatically, instead of a string of Zalo messages - which makes them more likely to renew rather than move out. What used to be an anxious, error-prone side job now runs itself in the background, with RosiHome doing the arithmetic and the reminders so Mr. Tuấn only has to make decisions, not chase paperwork.

---

## 2. Stakeholders

### Who's Involved
 
| Stakeholder | Who they are | What they want |
|---|---|---|
| **Landlords** | Landlords using the app day-to-day | Save time, stop losing money to missed payments or missed renewals |
| **Tenants** | Tenants using the app | Clear, transparent way to see charges, pay rent, and report issues |
| **Director / Project Manager** | Team member leading day-to-day execution | On-time delivery, clear scope, smooth team coordination |
| **Development Team** | The other 4 student members | Clear tasks, technical ownership, a strong portfolio piece |
| **External Corporation** | Cloud providers (Azure/AWS), banks (via VietQR-standard QR generation), GitHub | Reliable use of their platforms/standards — no payment gateway partnership needed, since RosiHome only generates a bank-transfer QR code and never holds tenant funds |
| **University** | The school/program | A strong showcase project reflecting well on the program |

---

## 3. Feasibility Study

### 3.1. Operational Feasibility — **Feasible with caveats**

- The product replaces manual/spreadsheet workflows that landlords are already motivated to leave behind — <cite index="9-1">more than 40% of small landlords still rely on manual tools today</cite>, indicating real latent demand rather than a workflow no one wants.
- Onboarding must be extremely low-friction given the target user is not technical and does everything themselves. <cite index="10-1">Small landlords need software that is fast to use without requiring a training course, since most of their day is not spent on property management</cite>.

> [!NOTE]
> **Caveat:** Sustained operation after the academic term ends (hosting costs, support, further development) is not guaranteed unless the team explicitly plans a post-capstone maintenance owner or treats the project as capstone-only with a clean handover/shutdown plan. This should be decided explicitly by the team and advisor (see Risks section).

### 3.2. Economic Feasibility — **Feasible**

- No paid labor is required (student project); primary cash costs are cloud hosting, domain, and optional tool subscriptions — all of which have free or heavily discounted student tiers (GitHub Student Pack, Azure for Students, Figma Education, etc.).
- If pursued beyond graduation, the freemium/per-unit pricing precedent set by comparable products (<cite index="4-1">e.g. $15–29/month entry tiers</cite>, <cite index="3-1">or flat $5/unit/month models</cite>) shows a viable, proven monetization path — not required for the academic deliverable, but supports longer-term viability.

### 3.3. Schedule Feasibility — **Feasible within 8 - 10 weeks**

Based on the scope defined in the business case (core modules only, QR-based bank-transfer payment with proof upload, no AI features at MVP) and a 5-person team augmented by AI coding assistants, the estimated effort fits within a standard undergraduate capstone timeline. Scope discipline is the primary lever for keeping this feasible.

### 3.4. Legal / Compliance Feasibility — **Feasible with specific constraints**

- **Data privacy:** Tenant PII (ID documents, contact info, payment history) must be handled carefully even at MVP/demo stage — use of test/synthetic data during development and pilot, with a basic privacy notice for any real pilot users.
- **E-signature / e-contract legality:** Vietnam's lease-management landscape involves land-price volatility and evolving compliance requirements; the MVP should treat digital lease **storage** (not legally binding e-signature) as the safe initial scope, since binding e-signature has jurisdiction-specific legal requirements beyond an academic MVP's scope.
- **Payments:** RosiHome never touches, holds, or moves tenant money — it only calculates the amount owed, sends a bank-transfer QR code addressed to the landlord's own account, and stores the proof-of-payment screenshot the tenant uploads. Because funds move directly bank-to-bank between tenant and landlord, RosiHome is not a payment intermediary and does not require a payment license, PCI compliance, or escrow handling, at MVP or beyond.

---

## 4. Project Timeline & Schedule

### 4.1. How We Estimated This
 
1. **What the team already knows** — the 5 members already have coursework in web, mobile, testing and database, so it costs not too much time for learning a brand-new stack from zero.
2. **How long similar apps take to build** — rental/property management apps are a well-understood app category (forms, lists, invoices, a dashboard) with standard, well-documented patterns — not something being invented from scratch.
3. **Heavy AI assistance** — the team is using paid AI coding tools (Claude Code, Codex, Gemini, ChatGPT) across all 5 members, not just for autocomplete but to generate whole features, write tests, debug, and scaffold boilerplate. With one AI tool per person working in parallel on different modules, the team effectively multiplies its own output — this is the main reason the timeline compresses well below the "typical human-only" 4–6 month benchmark for this kind of app.

Based on this, we estimate **8–10 weeks** for the MVP, working part-time alongside coursework.

### 4.2. Timeline
 
| Phase | Time | What Happens |
|---|---|---|
| Planning & Design | 1 week | Finalize features, wireframes, database design (AI-assisted: quick prototyping of schema/UI ideas) |
| Core Build — Web + Backend | 3 weeks | Login, properties/rooms, tenants, billing + QR payment — AI generates boilerplate CRUD/API code, team focuses on logic and review |
| Core Build — Mobile App | 2 weeks | Landlord + tenant mobile app, built in parallel with web using AI to scaffold screens quickly |
| Testing & Fixes | 1–2 weeks | AI-assisted test generation (unit/E2E), bug fixing, polish |
| Pilot & Demo | 1–2 weeks | Try it with a few real landlords, fix feedback, final presentation |
 
**Total: 8–10 weeks**

---

## 5. Cost & Budget Plan

### 5.1. Seed Budget for MVP Build (Startup-Style)

RosiHome needs **4,250,000 VND** to build and pilot its MVP over 8–10 weeks.

This isn't a traditional "team salary" budget — it's a lean, tools-only budget, because the founding team (5 SE students) contributes labor for equity in learning/portfolio value, not cash. Every dong requested goes into the tools that let 5 people ship like a much bigger team: AI coding agents and the minimum cloud/infra to run a real pilot.

### 5.2. Use of Funds & Cost Breakdown
 
| Category / Allocation | Service / Upgrade Detail | Estimated Cost (VND) | % of Budget | Role & Practical Effect / Purpose |
|---|---|---|---|---|
| **Development Tools** | Claude Code / Claude Pro upgraded plan, shared across the 5-person dev team | 1,600,000 đ | 38% | Lets the dev team generate code, test QR-payment logic, and scaffold/debug faster. Acts as the core "force multiplier" for the 5-person team. |
| **AI Agent Infrastructure (LLM APIs)** | Pay-as-you-go API credit (Claude Sonnet or GPT-4o) for in-app AI features | 900,000 đ | 21% | Powers in-product AI (meter-photo reading and weekly landlord reports). Sufficient for ~400–600 smart-processing calls during the pilot. |
| **Cloud Infrastructure** | Upgraded cloud server + database (small production tier) | 800,000 đ | 19% | Production-grade hosting that prevents timeouts/lag when processing meter-reading photos or generating AI reports. |
| **Domain & Security** | 1 domain (.com or .vn) + SSL certificate | 450,000 đ | 11% | Brand presence + SSL; builds user trust and protects tenant and lease data. |
| **System Contingency** | Buffer for AI API overage / rate-limit spikes during testing | 500,000 đ | 12% | Buffer for heavy testing and experimentation weeks to cover extra token consumption. |
| **TOTAL** | **Cost to build & pilot the AI-assisted MVP** | **4,250,000 đ** | **100%** | **~4.25 million VND for the entire project** |

#### Notes on Costs:
- **No labor cost:** unlike a commercial project, developer time is not counted — it's a coursework contribution, not paid work. Every number above is cash the team would actually spend.
- **AI is used in two ways**, both reflected above: (1) as a *development tool* (Claude Code/Claude Pro helping the team write code faster) and (2) as a *product feature* (in-app AI reading meter photos and summarizing reports for the landlord) — the "Development Tools" and "AI Agent Infrastructure" rows are deliberately separate line items because they're different costs for different purposes.

### 5.3. Burn Rate & Runway
 
| Metric | Value |
|---|---|
| Runway needed | 8–10 weeks (~2–2.5 months) |
| Average monthly burn | ~1,700,000 – 2,125,000 đ/month |
| Peak burn week | Sprint weeks with heaviest AI usage (mobile build + testing phases) |
| Cash-out risk | Low — 500,000 đ contingency reserve (12% of budget) covers overage without needing a follow-on ask mid-build |

At this burn rate, the entire MVP is funded through to pilot/demo day without requiring any additional capital — a deliberately tight, no-slack-needed budget rather than one padded for comfort.

### 5.4. Funding Sources (Cap Table of Effort, Not Equity)
 
| Source | Round | Amount | Status |
|---|---|---|---|
| University / department resources | "Grant" | Azure/AWS student credits, GitHub Student Pack | Apply first — reduces cash ask below 4,250,000 đ if approved |
| Team self-funding | "Founder capital" | 4,250,000 đ ÷ 5 = ~850,000 đ/person | Fallback if no university support |

No outside investors are needed at this stage — this is a **bootstrapped, founder-funded MVP**, consistent with how most successful software products start: prove the product works before raising anything.

### 5.5. Milestone-Based Spending (Spend Tied to Progress, Not Just Time)
 
| Milestone | Cumulative Spend | Unlocks |
|---|---|---|
| M1 — Design freeze | ~450,000 đ (domain secured) | Team starts building against a locked spec |
| M2 — Web MVP functional | ~1,600,000 đ (dev tools fully utilized) | Core billing + QR payment flow working end-to-end |
| M3 — Mobile MVP functional | ~2,500,000 đ (cloud infra scaled up) | Full landlord + tenant app usable |
| M4 — AI features live | ~3,400,000 đ (LLM API spend active) | Meter-reading AI + weekly report AI shipped |
| M5 — Pilot & demo | 4,250,000 đ (contingency available if needed) | Real landlords using RosiHome, ready to present |

---

## 6. Risk Assessment

Risks are scored Likelihood (L) × Impact (I) on a 1–5 scale; Score = L×I (1–25). Priority: **High ≥15, Medium 8–14, Low ≤7.**

### 6.1. Risk Register
 
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

### 6.2. Top 4 Risks Requiring Immediate Action (Score ≥15)

> [!WARNING]
> The following risks have a risk score of 15 or higher and require proactive management from the start of the project:
> 
> 1. **R1 — Mobile effort underestimation**: Address with an early vertical-slice prototype.
> 2. **R2 — Billing engine complexity**: Address with a pre-Sprint-3 design spike and simplified MVP scope.
> 3. **R3 — Team availability during academic term**: Mitigated by schedule buffer; reinforce with cross-training.
> 4. **R4 — Scope creep**: Enforce a written feature-freeze policy and a visible "post-MVP" backlog from day one.

### 6.3. Risk Monitoring Process

- Risk register reviewed at the start of every sprint (bi-weekly) by the PM/team lead.
- Any new risk identified during a sprint retro is added within 48 hours.
- Any risk that moves to High priority is flagged to the faculty advisor at the next milestone check-in.
