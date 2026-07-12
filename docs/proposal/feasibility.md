# Feasibility Study — RosiHome

## 1. Operational Feasibility — **Feasible with caveats**

- The product replaces manual/spreadsheet workflows that landlords are already motivated to leave behind — <cite index="9-1">more than 40% of small landlords still rely on manual tools today</cite>, indicating real latent demand rather than a workflow no one wants.
- Onboarding must be extremely low-friction given the target user is not technical and does everything themselves.<cite index="10-1">Small landlords need software that is fast to use without requiring a training course, since most of their day is not spent on property management</cite>
- **Caveat:** Sustained operation after the academic term ends (hosting costs, support, further development) is not guaranteed unless the team explicitly plans a post-capstone maintenance owner or treats the project as capstone-only with a clean handover/shutdown plan. This should be decided explicitly by the team and advisor (see Risks document).

## 2. Economic Feasibility — **Feasible**

- No paid labor is required (student project); primary cash costs are cloud hosting, domain, and optional tool subscriptions — all of which have free or heavily discounted student tiers (GitHub Student Pack, Azure for Students, Figma Education, etc.).
- If pursued beyond graduation, the freemium/per-unit pricing precedent set by comparable products (<cite index="4-1">e.g. $15–29/month entry tiers</cite>, <cite index="3-1">or flat $5/unit/month models</cite>) shows a viable, proven monetization path — not required for the academic deliverable, but supports longer-term viability.

## 3. Schedule Feasibility — **Feasible within 8 - 10 weeks**

Based on the scope defined in the business case (core modules only, QR-based bank-transfer payment with proof upload, no AI features at MVP) and a 5-person team augmented by AI coding assistants, the estimated effort fits within a standard undergraduate capstone timeline. Scope discipline is the primary lever for keeping this feasible.

## 4. Legal / Compliance Feasibility — **Feasible with specific constraints**

- **Data privacy:** Tenant PII (ID documents, contact info, payment history) must be handled carefully even at MVP/demo stage — use of test/synthetic data during development and pilot, with a basic privacy notice for any real pilot users.
- **E-signature / e-contract legality:** Vietnam's lease-management landscape involves land-price volatility and evolving compliance requirements; the MVP should treat digital lease **storage** (not legally binding e-signature) as the safe initial scope, since binding e-signature has jurisdiction-specific legal requirements beyond an academic MVP's scope.
- **Payments:** RosiHome never touches, holds, or moves tenant money — it only calculates the amount owed, sends a bank-transfer QR code addressed to the landlord's own account, and stores the proof-of-payment screenshot the tenant uploads. Because funds move directly bank-to-bank between tenant and landlord, RosiHome is not a payment intermediary and does not require a payment license, PCI compliance, or escrow handling, at MVP or beyond.

**Overall conclusion:** RosiHome is feasible as a capstone project across all five dimensions, provided the team keeps MVP scope disciplined (QR-based payment with proof upload, non-binding digital lease records, core web + mobile modules only) and explicitly decides the product's fate after the course ends.