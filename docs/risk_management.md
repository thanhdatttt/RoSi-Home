# Risk Management Plan — RosiHome

## 1. Risk Scales

| Probability Band | Label | Range | Score |
|---|---|---|---|
| Improbable | Very Low | 0% – 20% | 1 |
| Unlikely | Low | 21% – 40% | 2 |
| Likely | Medium | 41% – 60% | 3 |
| Very Likely | High | 61% – 80% | 4 |
| Nearly Certain | Extreme | 81% – 100% | 5 |

| Impact Band | Label | Budget/Schedule Slip | Score |
|---|---|---|---|
| Slightly harmful | Minor | < 10% | 1 |
| Harmful | Moderate | 10% – 30% | 2 |
| Extremely harmful | Severe | 31% – 60% | 3 |
| Catastrophic | Critical | > 60% | 4 |

> **Risk Score** = Probability Score (1–5) × Impact Score (1–4)
> 
> **Note on Impact Score:** The final Impact Score is determined by the *higher* of the Budget Slip or Schedule Slip percentages.
> 
> **Risk Level:** 1–3 Tolerable · 4–5 Moderate · 6–11 Substantial · 12–20 Critical

---

## 2. Risk Items

---

### RP-01 — Academic Workload Reduces Availability

**Description**
The team consists of full-time students. When midterms or final projects hit, everyone will be busy at the same time, meaning we will write less code and fall behind schedule.

**Mitigation & Contingency**
- **Mitigation:** We planned an 8–10 week schedule but intentionally left Week 10 empty as a buffer. We also hold weekly meetings to check everyone's availability and shift tasks if someone is slammed with exams.
- **Contingency:** If we burn through the buffer and are still behind, the team will have to work overtime and put in extra hours on the weekends. If that's not enough, we will cut a "nice-to-have" feature (like advanced reporting) to make sure the core app is finished.

**Risk Exposure**
Without a buffer or extra hours, an academic crunch will severely delay the project.
- **Max Slip:** ~30–50% schedule slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Severe (3)**
- **Risk Score: 4 × 3 = 12 — Critical**

---

### RP-02 — React Native Mobile Overrun

**Description**
The frontend developers (2 people) are learning React Native and Expo for the first time. Fighting with unknown tools usually causes weird build errors that take days to fix.

**Mitigation & Contingency**
- **Mitigation:** We will build a very thin, end-to-end "vertical slice" in the very first sprint just to see if Expo throws any surprises. We will also use AI tools to quickly generate the boring UI layouts so we can focus on the hard logic.
- **Contingency:** If Expo is still causing massive blocking issues by Week 4, we will abandon the mobile app and just build a mobile-friendly web app (PWA) so we actually have something to show on demo day.

**Risk Exposure**
If we don't test the tools early, we might get stuck with unfixable bugs right before the deadline.
- **Max Slip:** ~30–40% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Severe (3)**
- **Risk Score: 3 × 3 = 9 — Substantial**

---

### RP-03 — Frontend Waiting on Backend

**Description**
Because the frontend needs the backend APIs to work, the 2 frontend developers might be stuck waiting around with nothing to do if the 3 backend developers fall behind.

**Mitigation & Contingency**
- **Mitigation:** The backend team will deliver APIs in batches, so the frontend only waits for the relevant batch instead of the entire backend. The frontend team can integrate each completed batch while continuing to build shared UI components (buttons, nav bars).
- **Contingency:** If the backend is severely delayed, we will completely drop secondary screens (like detailed tenant profiles) and only focus on making sure the rent payment flow works perfectly.

**Risk Exposure**
If frontend is completely blocked, all their work gets crammed into the final two weeks.
- **Max Slip:** ~35–50% schedule slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Severe (3)**
- **Risk Score: 4 × 3 = 12 — Critical**

---

### RP-04 — Database Schema Conflicts

**Description**
We have 3 backend engineers all touching the same PostgreSQL database. If two people change the way tables link together without telling each other, the code will break when we try to merge it.

**Mitigation & Contingency**
- **Mitigation:** Before writing code, the backend team will agree on exactly what database tables will change. Anyone who changes the database schema must notify the team in the team Messenger group so everyone knows about the change.
- **Contingency:** If a bad database change gets merged and breaks things, we will immediately revert the code, hold a meeting, and fix the tables together.

**Risk Exposure**
Messing up the database structure requires throwing away and rewriting a lot of code.
- **Max Slip:** ~30–40% rework slip
- Probability: **55% (Likely, 3)**
- Impact: **Severe (3)**
- **Risk Score: 3 × 3 = 9 — Substantial**

---

### RP-05 — Over-Reliance on AI Code

**Description**
Everyone on the team uses AI tools (like Copilot or ChatGPT). AI can confidently write code that looks correct but actually has huge security flaws, especially around who is allowed to see what data.

**Mitigation & Contingency**
- **Mitigation:** You can't just copy-paste AI code and merge it. Developers must cross-check the AI's functionality against the acceptance criteria in the product backlog. We also require manual testing, automated tests, and GitHub is configured to require at least one contributor approval before a branch can be merged.
- **Contingency:** If bad AI code manages to bypass the GitHub Actions and manual reviews to reach the main branch, we will immediately fix the logic in the very next commit.

**Risk Exposure**
Trusting AI blindly can lead to massive security bugs that ruin the whole app architecture.
- **Max Slip:** ~35–50% rework slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Severe (3)**
- **Risk Score: 4 × 3 = 12 — Critical**

---

### RP-06 — Third-Party Services Fail or Block Us

**Description**
Later in the project, we need external tools for emails, push notifications, and generating PDFs. If we can't figure out how to set them up, we can't finish those features.

**Mitigation & Contingency**
- **Mitigation:** The team will research, prepare, and test multiple free or free-tier external services for email, push notifications, and PDF generation, so we can replace the current service if necessary.
- **Contingency:** If an external service becomes unavailable, we will switch to one of the prepared alternatives, reconfigure the integration, and continue with the affected feature.

**Risk Exposure**
Getting stuck trying to configure a broken email server wastes days of coding time.
- **Max Slip:** ~30–45% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Severe (3)**
- **Risk Score: 3 × 3 = 9 — Substantial**

---

### RP-07 — Landlords Change Their Minds

**Description**
When we show the app to landlords, they might suddenly ask for things to work differently, forcing us to throw away code we already wrote.

**Mitigation & Contingency**
- **Mitigation:** Before we start coding a new feature, the team will make sure we fully understand what the landlord actually needs.
- **Contingency:** If a landlord demands a big change after we've already built it, the Project Manager will politely say no and promise to put it in "Version 2.0," protecting our current deadline.

**Risk Exposure**
Constantly rewriting code to chase changing opinions will destroy our schedule.
- **Max Slip:** ~30–45% schedule slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Severe (3)**
- **Risk Score: 4 × 3 = 12 — Critical**

---

### RP-08 — Scope Creep

**Description**
As the app starts to look good, people will get excited and want to add fun new features that aren't in the original plan.

**Mitigation & Contingency**
- **Mitigation:** We are freezing the scope on Day 1. Any cool new idea goes straight onto a "do it later" list. The PM's job is to enforce this rule strictly every week.
- **Contingency:** If a new feature is absolutely necessary, we will try to swap it by dropping an old feature. If no old features can be dropped because they are all critical, the team must authorize emergency overtime.

**Risk Exposure**
If we keep adding features, the app will never be finished in time for the deadline.
- **Max Slip:** > 60% schedule slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Catastrophic (4)**
- **Risk Score: 4 × 4 = 16 — Critical**

---

### RP-09 — Knowledge Silos

**Description**
With 3 backend developers, it's easy for one person to become the only one who understands a specific part of the code. If they get sick or drop out, no one else knows how to finish their work.

**Mitigation & Contingency**
- **Mitigation:** During the weekly meeting, the backend team will share current backend information and walk through important modules with the whole team, so everyone can back up each backend area. We will still use AI codebase-scanning tools (like Cursor or Claude) to read and explain unfamiliar code quickly.
- **Contingency:** If a developer vanishes, another backend dev will take over their tasks immediately, using AI to quickly summarize their recent commits and get up to speed in hours instead of days.

**Risk Exposure**
Losing the only person who knows how the payment code works will bring the project to a halt.
- **Max Slip:** ~30–40% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Severe (3)**
- **Risk Score: 3 × 3 = 9 — Substantial**

---

### RP-10 — AI Token Limits Exhausted

**Description**
If the team uses AI heavily for coding, they might hit their monthly message limits on tools like Claude or ChatGPT, suddenly slowing down their coding speed.

**Mitigation & Contingency**
- **Mitigation:** Developers should pace their usage and use lighter AI models for simple questions. The team will also research and prepare multiple free AI agent sources so work can switch to another source at any time if a quota is exhausted.
- **Contingency:** If a developer runs out of premium AI access, they will switch to one of the prepared free AI agent sources and continue the work.

**Risk Exposure**
Suddenly losing AI assistance mid-sprint cuts coding speed in half.
- **Max Slip:** ~15–25% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Moderate (2)**
- **Risk Score: 3 × 2 = 6 — Substantial**

---

### RP-11 — No One Wants to Test the App

**Description**
If we wait until the app is perfectly finished to find landlords to test it, we might end up with zero testers, proving that no one actually wants the product.

**Mitigation & Contingency**
- **Mitigation:** We will start messaging landlords on Zalo and Facebook groups in Week 1, long before the app is done, to get a waiting list of people ready to test it.
- **Contingency:** If we can't find real landlords, we will ask friends or family members to pretend to be landlords so we can at least get some basic usability testing done for the demo.

**Risk Exposure**
Building an app that nobody uses is a complete failure of the MVP.
- **Max Slip:** > 60% schedule/budget slip
- Probability: **55% (Likely, 3)**
- Impact: **Catastrophic (4)**
- **Risk Score: 3 × 4 = 12 — Critical**

---

### RP-12 — VietQR Format Incorrect

**Description**
If we don't strictly follow the official NAPAS rules for generating VietQR codes, the QR codes won't scan properly in the tenant's banking apps.

**Mitigation & Contingency**
- **Mitigation:** Read the official documentation carefully. Developers must physically scan the generated QR codes with their own banking apps to prove they work before finishing the task.
- **Contingency:** If the QR code generation is broken, the app will just display the landlord's bank account number in plain text so the tenant can copy and paste it manually.

**Risk Exposure**
Edge cases in banking formats easily break the QR codes if we don't test them.
- **Max Slip:** ~10–25% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Moderate (2)**
- **Risk Score: 3 × 2 = 6 — Substantial**

---

### RP-13 — Dashboard Loads Too Slowly

**Description**
Even though the frontend dashboard is smart and only shows a few items at a time (like the top 3 buildings with a "see all" pagination button), the backend API can still be extremely slow if the database doesn't have proper indexes.

**Mitigation & Contingency**
- **Mitigation:** The backend team will use proper database indexes on foreign keys from the start and avoid "N+1 query" mistakes, ensuring the API can fetch those top items instantly without scanning the whole database.
- **Contingency:** If the dashboard is still slow, we will dedicate more effort to investigate the cause of the delay and fix the underlying queries, indexes, or other bottlenecks before the demo.

**Risk Exposure**
Bad database queries can easily crash the app or cause 10-second loading screens.
- **Max Slip:** ~30–40% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Severe (3)**
- **Risk Score: 3 × 3 = 9 — Substantial**

---

### RP-14 — Deployment Failure on Demo Day

**Description**
If our cloud server on Render crashes, or we break the app right before the presentation, we won't have anything to show the teachers.

**Mitigation & Contingency**
- **Mitigation:** Developers must make sure the app actually runs properly on their own laptops before merging code. We won't merge any risky new code right before Demo Day.
- **Contingency:** If the cloud server is completely dead during the presentation, we will run the app locally on a developer's laptop to show it to the audience.

**Risk Exposure**
A server crash during the final presentation ruins the entire project grade.
- **Max Slip:** > 60% schedule slip (Demo Fails)
- Probability: **55% (Likely, 3)**
- Impact: **Catastrophic (4)**
- **Risk Score: 3 × 4 = 12 — Critical**

---

### RP-15 — Supabase Free-Tier Runs Out

**Description**
Because tenants upload photos of utility meters and payment receipts, we might use up our 1 GB of free file storage on Supabase very quickly.

**Mitigation & Contingency**
- **Mitigation:** We will enforce a maximum file size for every uploaded image and compress images before upload where possible, limiting storage consumption.
- **Contingency:** If the selected storage service still approaches its limit, we will switch to an external service with more storage or store the files locally on the machine running the server.

**Risk Exposure**
Uncompressed phone photos will eat through 1 GB of storage in a matter of days.
- **Max Slip:** ~10–25% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Moderate (2)**
- **Risk Score: 2 × 2 = 4 — Moderate**

---

### RP-16 — Tenants Don't Get Their Passwords

**Description**
When a landlord adds a tenant, the app automatically emails the tenant a temporary password. If that email gets flagged as spam, the tenant might not see it and will assume they are locked out of the app.

**Mitigation & Contingency**
- **Mitigation:**  We will add clear guidance telling the tenant to check their spam or junk folder if the email cannot be found.
- **Contingency:** If the email is completely lost, we will show the temporary password directly on the landlord's screen so they can just copy it and text it to the tenant via Zalo.

**Risk Exposure**
If tenants can't find their passwords, landlords have to spend time playing tech support.
- **Max Slip:** ~10–25% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Slightly harmful (1)**
- **Risk Score: 3 × 1 = 3 — Tolerable**

---

### RP-17 — Tenants Upload Fake Payment Proofs

**Description**
Because the app doesn't connect directly to the bank, a tenant could upload a fake screenshot saying they paid. If the landlord trusts the app blindly, they might get scammed.

**Mitigation & Contingency**
- **Mitigation:** We will put a very clear warning message in the app: "Always check your actual bank app to confirm you received the money before approving this."
- **Contingency:** If a landlord gets tricked by a fake screenshot, we will manually ban the tenant's account from the system.

**Risk Exposure**
If landlords assume the app verifies the money automatically, it will destroy their trust in the product.
- **Max Slip:** ~30–50% budget/trust slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Severe (3)**
- **Risk Score: 4 × 3 = 12 — Critical**

---

### RP-18 — Private Data Got Leaked

**Description**
We are storing people's phone numbers, IDs, and financial records. If we make a mistake with our security rules, someone could steal this data.

**Mitigation & Contingency**
- **Mitigation:** All data must be sent over HTTPS. Users must be authenticated, and newly created accounts must be verified before they can retrieve sensitive personal information such as phone numbers, ID numbers, and financial records. We will strictly review code that handles user permissions and use fake data during testing so we do not accidentally leak real information.
- **Contingency:** If we realize data is exposed, we will immediately shut down the database, tell our pilot users and teachers what happened, and fix the bug before turning it back on.

**Risk Exposure**
Leaking personal data will instantly kill the pilot program and the project.
- **Max Slip:** > 60% schedule slip
- Probability: **55% (Likely, 3)**
- Impact: **Catastrophic (4)**
- **Risk Score: 3 × 4 = 12 — Critical**

---

### RP-19 — Who Pays for the Server Later?

**Description**
After we get our grade, the servers will keep running and charging money. If we don't decide who is paying for it, it will drain someone's personal bank account.

**Mitigation & Contingency**
- **Mitigation:** By Week 9, the team needs to formally decide if we are shutting the app down completely, or if someone wants to take it over and pay for it.
- **Contingency:** If no one wants it, we will export all the data and permanently delete the cloud servers one week after the final presentation.

**Risk Exposure**
Forgotten servers are a classic way for students to lose money unnecessarily.
- **Max Slip:** < 10% budget slip
- Probability: **75% (Very Likely, 4)**
- Impact: **Minor (1)**
- **Risk Score: 4 × 1 = 4 — Moderate**

---

### RP-20 — Someone Else Builds It First

**Description**
Another company could release a free property management app in Vietnam right before we do, making our landlords lose interest in our student project.

**Mitigation & Contingency**
- **Mitigation:** We will research the market and target users' workflows carefully to gain clear insights, identify the right pain points, and solve them thoroughly. We will deploy the MVP and attract the first user group as quickly as possible.
- **Contingency:** We will research competitors and track user metrics over time. We will continue if the results remain healthy, pivot if user numbers decline, and shut down if the product is not viable.

**Risk Exposure**
A big competitor could steal all our pilot users, leaving us with nothing to present.
- **Max Slip:** ~30–40% schedule slip
- Probability: **35% (Unlikely, 2)**
- Impact: **Severe (3)**
- **Risk Score: 2 × 3 = 6 — Substantial**

---

## 3. Risk Summary Dashboard

### 3.1 Risk Register

| ID | Risk Title | Risk Score | Risk Level |
|---|---|---|---|
| RP-01 | Academic Workload Reduces Availability | 12 | 🔴 Critical |
| RP-02 | React Native Mobile Overrun | 9 | 🟠 Substantial |
| RP-03 | Frontend Waiting on Backend | 12 | 🔴 Critical |
| RP-04 | Database Schema Conflicts | 9 | 🟠 Substantial |
| RP-05 | Over-Reliance on AI Code | 12 | 🔴 Critical |
| RP-06 | Third-Party Services Fail or Block Us | 9 | 🟠 Substantial |
| RP-07 | Landlords Change Their Minds | 12 | 🔴 Critical |
| RP-08 | Scope Creep | 16 | 🔴 Critical |
| RP-09 | Knowledge Silos | 9 | 🟠 Substantial |
| RP-10 | AI Token Limits Exhausted | 6 | 🟠 Substantial |
| RP-11 | No One Wants to Test the App | 12 | 🔴 Critical |
| RP-12 | VietQR Format Incorrect | 6 | 🟠 Substantial |
| RP-13 | Dashboard Loads Too Slowly | 9 | 🟠 Substantial |
| RP-14 | Deployment Failure on Demo Day | 12 | 🔴 Critical |
| RP-15 | Supabase Free-Tier Runs Out | 4 | 🟡 Moderate |
| RP-16 | Tenants Don't Get Their Passwords | 3 | 🟢 Tolerable |
| RP-17 | Tenants Upload Fake Payment Proofs | 12 | 🔴 Critical |
| RP-18 | Private Data Got Leaked | 12 | 🔴 Critical |
| RP-19 | Who Pays for the Server Later? | 4 | 🟡 Moderate |
| RP-20 | Someone Else Builds It First | 6 | 🟠 Substantial |

---

### 3.2 Risk Level Summary

| Level | Count |
|---|---|
| 🔴 Critical (12–20) | 9 |
| 🟠 Substantial (6–11) | 8 |
| 🟡 Moderate (4–5) | 2 |
| 🟢 Tolerable (1–3) | 1 |

---

### 3.3 Priority Rankings

| Rank | ID | Risk Title | Risk Score |
|---|---|---|---|
| 1 | RP-08 | Scope Creep | 16 |
| 2 | RP-01 | Academic Workload Reduces Availability | 12 |
| 3 | RP-03 | Frontend Waiting on Backend | 12 |
| 4 | RP-05 | Over-Reliance on AI Code | 12 |
| 5 | RP-07 | Landlords Change Their Minds | 12 |
| 6 | RP-11 | No One Wants to Test the App | 12 |
| 7 | RP-14 | Deployment Failure on Demo Day | 12 |
| 8 | RP-17 | Tenants Upload Fake Payment Proofs | 12 |
| 9 | RP-18 | Private Data Got Leaked | 12 |
| 10 | RP-02 | React Native Mobile Overrun | 9 |
| 11 | RP-04 | Database Schema Conflicts | 9 |
| 12 | RP-06 | Third-Party Services Fail or Block Us | 9 |
| 13 | RP-09 | Knowledge Silos | 9 |
| 14 | RP-13 | Dashboard Loads Too Slowly | 9 |
| 15 | RP-10 | AI Token Limits Exhausted | 6 |
| 16 | RP-12 | VietQR Format Incorrect | 6 |
| 17 | RP-20 | Someone Else Builds It First | 6 |
| 18 | RP-15 | Supabase Free-Tier Runs Out | 4 |
| 19 | RP-19 | Who Pays for the Server Later? | 4 |
| 20 | RP-16 | Tenants Don't Get Their Passwords | 3 |

---

### 3.4 Top Watch Items

The following risks have the highest **Risk Score** and demand immediate action/enforcement from Day 1:

1. **RP-08 (Scope Creep)** — Without a hard freeze, failure is nearly certain.
2. **RP-18 (Data Privacy)** — Security rules and HTTPS must be enforced to prevent a catastrophic leak.
3. **RP-14 (Deployment Failure)** — The app must run locally first to prevent Demo Day failure.
4. **RP-11 (UAT Recruitment)** — Landlord outreach must start in Week 1 to prevent an empty MVP.
5. **RP-05 (AI Over-reliance)** — Non-author review must be strictly enforced to prevent severe bugs.
