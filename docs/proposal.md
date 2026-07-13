# Project Proposal — RosiHome

---

## 1. Pain Points & Problem Statement

### 1.1. Who Feels the Pain

| Persona | Description |
|---|---|
| **The Self-Managing Landlord** | Owns 1–30 units (rooms, boarding house, small apartment block), manages everything himself alongside a day job or other business |
| **The Tenant** | Rents from a self-managing landlord, communicates mostly over Zalo, has no formal system to check charges or raise issues |

### 1.2. Pain Points

| # | Pain Point | Who Feels It | Root Cause | Real Impact |
|---|---|---|---|---|
| P1 | Rent & utility calculation is manual | Landlord | No system to auto-calculate rent + metered utilities per unit | Hours lost every month; calculation errors |
| P2 | No shared record of payments | Landlord + Tenant | Payment confirmed only via Zalo message or memory | "I already paid" disputes with no proof either side can check |
| P3 | Lease renewal dates are tracked by memory | Landlord | No reminder system for lease expiry | Missed renewals, unplanned vacancy, lost rent |
| P4 | Maintenance requests get lost | Landlord + Tenant | Requests come in as phone calls/texts with no log | Delayed repairs, tenant frustration, higher move-out rate |
| P5 | No visibility into portfolio performance | Landlord | Data scattered across notebooks/spreadsheets/chat | Can't answer "am I actually making money this month?" |

### 1.3. Problem Statement

> Small-scale landlords lose time and money every month because rent calculation, payment tracking, lease renewals, and maintenance requests are handled manually and informally — they actually have to manage the whole process themselves by using different tools such as calculators, spreadsheets, and chat apps to communicate with tenants.

### 1.4. Evidence This Is a Real, Widespread Problem

- **Physical, repeated visits are the norm.** A guide aimed at Vietnamese boarding-house owners describes that landlords must visit their property **at least twice a month** — once to finalize electricity/water meter readings, once to collect payment — not counting extra trips when a tenant delays payment or raises a complaint, work "often eating up an entire evening" because tenants are usually out during the day. — [gameviethot.com: Những khó khăn khi quản lý nhà trọ thủ công](https://gameviethot.com/file-excel-quan-ly-nha-tro/)
- **Most lease contracts are informal, with no legal grounding.** The same source states that **up to 80% of boarding-house/mini-apartment owners still draft their own lease contracts** with loosely defined terms, not based on proper legal provisions — usually handwritten or typed, making it hard to track deadlines, terms, or resolve disputes when they arise. — [gameviethot.com: Những khó khăn khi quản lý nhà trọ thủ công](https://gameviethot.com/file-excel-quan-ly-nha-tro/)
- **Excel remains the default tool nationwide, and it's fragile.** Among the hundreds of thousands of boarding-house rows across Vietnam, Excel is still described as the most commonly used management tool — but sources warn it "still requires manual meter entry," "makes it hard to get a periodic overview of the business," and is "prone to errors and permanent data loss from unexpected computer crashes." — [Smartos.space: Quản lý phòng trọ bằng excel? Nên hay Không?](https://smartos.space/quan-ly-phong-tro-bang-excel-nen-hay-khong/) and [Mona.house: Quản lý nhà trọ bằng excel – có còn hiệu quả không](https://mona.house/quan-ly-nha-tro-bang-excel/)
- **Utility billing complexity is a widely discussed problem on its own.** A dedicated guide on calculating electricity/water charges for boarding houses acknowledges that manual calculation "often causes errors, wastes time, and is hard to keep under control," especially once a property has a shared water pump or multiple sub-meters. — [Amerigroup.vn: File Excel Tính Tiền Điện Nước Nhà Trọ](https://amerigroup.vn/file-excel-tinh-tien-dien-nuoc-nha-tro/)


---

## 2. Business Case

### 2.1. The Story: Mr. Tuấn's Boarding House

Mr. Tuấn (48, Ho Chi Minh City) owns a 12-room boarding house that he built up over a decade of saving. He also works a full-time day job, so the boarding house runs on whatever time he has left in the evenings. Every month he walks room to room with a notebook to read the electricity and water meters by hand, then does the rent math on his phone's calculator before texting each tenant on Zalo. Two tenants always "forget" to reply. One month he loses track of who has paid and who hasn't, deposits a rent payment into the wrong ledger line in his spreadsheet, and ends up in an awkward argument with a tenant who insists she already paid. Three months later, a tenant's lease quietly expires without Mr. Tuấn noticing — he only finds out when the tenant has already moved out, leaving the room empty for a month with no new tenant lined up.

### 2.2. How RosiHome Changes the Game

RosiHome replaces the notebook-and-Zalo routine with one simple way. Landlords enter meter readings and bank - transfer QR code, RosiHome will calculate each invoice and send the tenant scans it to pay directly and uploads proof, and RosiHome stores the full payment history automatically. Lease renewals are tracked and flagged in advance, maintenance requests are logged with photos, and a dashboard shows occupancy, arrears, and revenue at a glance.

### 2.3. The Result
 
Mr. Tuấn stops losing evenings to notebooks and calculators, stops losing rent to disputes he can't prove, and stops losing tenants to renewal dates he forgot to track. What used to be an anxious, error-prone side job now runs itself in the background, with RosiHome doing the arithmetic and the reminders so Mr. Tuấn only has to make decisions, not chase paperwork.

---

## 3. Stakeholders

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

## 4. Feasibility Study

### 4.1. Operational Feasibility — **Feasible with caveats**

- The product replaces manual/spreadsheet workflows that landlords are already motivated to leave behind — <cite index="9-1">more than 40% of small landlords still rely on manual tools today</cite>, indicating real latent demand rather than a workflow no one wants.
- Onboarding must be extremely low-friction given the target user is not technical and does everything themselves. <cite index="10-1">Small landlords need software that is fast to use without requiring a training course, since most of their day is not spent on property management</cite>.

> [!NOTE]
> **Caveat:** Sustained operation after the academic term ends (hosting costs, support, further development) is not guaranteed unless the team explicitly plans a post-capstone maintenance owner or treats the project as capstone-only with a clean handover/shutdown plan. This should be decided explicitly by the team and advisor (see Risks section).

### 4.2. Economic Feasibility — **Feasible**

- No paid labor is required (student project); primary cash costs are cloud hosting, domain, and optional tool subscriptions — all of which have free or heavily discounted student tiers (GitHub Student Pack, Azure for Students, Figma Education, etc.).
- If pursued beyond graduation, the freemium/per-unit pricing precedent set by comparable products (<cite index="4-1">e.g. $15–29/month entry tiers</cite>, <cite index="3-1">or flat $5/unit/month models</cite>) shows a viable, proven monetization path — not required for the academic deliverable, but supports longer-term viability.

### 4.3. Schedule Feasibility — **Feasible within 8 - 10 weeks**

Based on the scope defined in the business case (core modules only, QR-based bank-transfer payment with proof upload, no AI features at MVP) and a 5-person team augmented by AI coding assistants, the estimated effort fits within a standard undergraduate capstone timeline. Scope discipline is the primary lever for keeping this feasible.

### 4.4. Legal / Compliance Feasibility — **Feasible with specific constraints**

- **Data privacy:** Tenant PII (ID documents, contact info, payment history) must be handled carefully even at MVP/demo stage — use of test/synthetic data during development and pilot, with a basic privacy notice for any real pilot users.
- **E-signature / e-contract legality:** Vietnam's lease-management landscape involves land-price volatility and evolving compliance requirements; the MVP should treat digital lease **storage** (not legally binding e-signature) as the safe initial scope, since binding e-signature has jurisdiction-specific legal requirements beyond an academic MVP's scope.
- **Payments:** RosiHome never touches, holds, or moves tenant money — it only calculates the amount owed, sends a bank-transfer QR code addressed to the landlord's own account, and stores the proof-of-payment screenshot the tenant uploads. Because funds move directly bank-to-bank between tenant and landlord, RosiHome is not a payment intermediary and does not require a payment license, PCI compliance, or escrow handling, at MVP or beyond.

---

## 5. Project Timeline & Schedule

### 5.1. How We Estimated This
 
1. **What the team already knows** — the 5 members already have coursework in web, mobile, testing and database, so it costs not too much time for learning a brand-new stack from zero.
2. **How long similar apps take to build** — rental/property management apps are a well-understood app category (forms, lists, invoices, a dashboard) with standard, well-documented patterns — not something being invented from scratch.
3. **Heavy AI assistance** — the team is using paid AI coding tools (Claude Code, Codex, Gemini, ChatGPT) across all 5 members, not just for autocomplete but to generate whole features, write tests, debug, and scaffold boilerplate. With one AI tool per person working in parallel on different modules, the team effectively multiplies its own output — this is the main reason the timeline compresses well below the "typical human-only" 4–6 month benchmark for this kind of app.

Based on this, we estimate **8–10 weeks** for the MVP, working part-time alongside coursework.

### 5.2. Timeline
 
| Phase | Time | What Happens |
|---|---|---|
| Planning & Design | 1 week | Finalize features, wireframes, database design (AI-assisted: quick prototyping of schema/UI ideas) |
| Core Build — Web + Backend | 3 weeks | Login, properties/rooms, tenants, billing + QR payment — AI generates boilerplate CRUD/API code, team focuses on logic and review |
| Core Build — Mobile App | 2 weeks | Landlord + tenant mobile app, built in parallel with web using AI to scaffold screens quickly |
| Testing & Fixes | 1–2 weeks | AI-assisted test generation (unit/E2E), bug fixing, polish |
| Pilot & Demo | 1–2 weeks | Try it with a few real landlords, fix feedback, final presentation |
 
**Total: 8–10 weeks**

---

## 6. Cost & Budget Plan

### 6.1. Seed Budget for MVP Build (Startup-Style)

RosiHome needs **4,250,000 VND** to build and pilot its MVP over 8–10 weeks.

This isn't a traditional "team salary" budget — it's a lean, tools-only budget, because the founding team (5 SE students) contributes labor for equity in learning/portfolio value, not cash. Every dong requested goes into the tools that let 5 people ship like a much bigger team: AI coding agents and the minimum cloud/infra to run a real pilot.

### 6.2. Use of Funds & Cost Breakdown
 
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

### 6.3. Burn Rate & Runway
 
| Metric | Value |
|---|---|
| Runway needed | 8–10 weeks (~2–2.5 months) |
| Average monthly burn | ~1,700,000 – 2,125,000 đ/month |
| Peak burn week | Sprint weeks with heaviest AI usage (mobile build + testing phases) |
| Cash-out risk | Low — 500,000 đ contingency reserve (12% of budget) covers overage without needing a follow-on ask mid-build |

At this burn rate, the entire MVP is funded through to pilot/demo day without requiring any additional capital — a deliberately tight, no-slack-needed budget rather than one padded for comfort.

### 6.4. Funding Sources (Cap Table of Effort, Not Equity)
 
| Source | Round | Amount | Status |
|---|---|---|---|
| University / department resources | "Grant" | Azure/AWS student credits, GitHub Student Pack | Apply first — reduces cash ask below 4,250,000 đ if approved |
| Team self-funding | "Founder capital" | 4,250,000 đ ÷ 5 = ~850,000 đ/person | Fallback if no university support |

No outside investors are needed at this stage — this is a **bootstrapped, founder-funded MVP**, consistent with how most successful software products start: prove the product works before raising anything.

### 6.5. Milestone-Based Spending (Spend Tied to Progress, Not Just Time)
 
| Milestone | Cumulative Spend | Unlocks |
|---|---|---|
| M1 — Design freeze | ~450,000 đ (domain secured) | Team starts building against a locked spec |
| M2 — Web MVP functional | ~1,600,000 đ (dev tools fully utilized) | Core billing + QR payment flow working end-to-end |
| M3 — Mobile MVP functional | ~2,500,000 đ (cloud infra scaled up) | Full landlord + tenant app usable |
| M4 — AI features live | ~3,400,000 đ (LLM API spend active) | Meter-reading AI + weekly report AI shipped |
| M5 — Pilot & demo | 4,250,000 đ (contingency available if needed) | Real landlords using RosiHome, ready to present |

---

## 7. Risk Assessment
 
### 7.1 The Risks
 
| Risk | Why It Could Happen | What We'll Do About It |
|---|---|---|
| **The 8–10 week timeline slips** | Students juggle exams and other coursework; AI-assisted speed doesn't remove real-life scheduling conflicts | Keep sprints short (2 weeks), do daily 10-minute check-ins, and cut non-essential features before cutting the deadline |
| **Mobile app takes longer than expected** | Mobile is usually the biggest single piece of work in this kind of app | Build a small working version early (Week 1–2 of mobile work) to catch surprises before they eat the whole schedule |
| **Team relies too much on AI without understanding the code** | Easy to accept AI-generated code without reviewing it | Every teammate reviews and understands the code they ship — AI drafts, humans approve |
| **Tenant uploads a fake payment screenshot** | RosiHome doesn't verify the bank transfer directly — it only stores the proof the tenant uploads | Landlord confirms payment manually by checking their own bank app first; this is a known limitation, not a solved problem |
| **Can't find real landlords to pilot the app with** | No marketing budget — outreach is manual | Start reaching out early (personal network, local Zalo/Facebook landlord groups), don't wait until the app is finished |
| **AI tool costs go over budget** | Heavy testing/experimentation can burn through API credits faster than expected | The budget already includes a contingency reserve (~500,000 VND) for exactly this |
| **Scope creep** | Tempting to add features (live payment gateway, SMS, more AI) before the core app works | Freeze features once the core flow (billing, QR payment, maintenance, dashboard) works; anything else goes on a "later" list |
| **No one maintains the app after the course ends** | It's a student project with no built-in long-term owner | Decide with the advisor upfront: either wrap up cleanly at demo day, or one teammate agrees to keep it running |
 
### 7.2 Risk Summary

None of these risks are about the technology being too hard — they're about **time, discipline, and follow-through**, which is normal for a startup project. The single best thing the team can do to manage risk is keep the scope small, ship the core flow first, and get real landlords using it as early as possible instead of waiting for a "finished" version.

