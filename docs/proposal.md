# Project Proposal - RosiHome

## 1. Pain Points & Problem Statement

### 1.1 Who Feels the Pain

- **Landlords managing small properties:** Owners who manage roughly 10-50 rooms and handle leases, maintenance requests, and monthly rent and utility calculations.
- **Tenants:** Renters who usually communicate through Zalo and have no formal place to check charges, payments, leases, or maintenance requests.

### 1.2 Pain Points

- Rent and utility calculation is manual, which costs time and creates billing errors.
- Tenants sometimes forget rent deadlines and pay late.
- Lease renewal dates are remembered manually, so missed renewals can create vacancies.
- Maintenance requests arrive through calls and chats, so they can be forgotten or delayed.
- Data is scattered across notebooks and spreadsheets, so landlords cannot see occupancy, late fee, or revenue quickly.

### 1.3 Problem Statement

> Small-scale landlords lose time and money every month because rent calculation, late-payment follow-up, lease renewals, and maintenance requests are handled manually and informally. They have to manage the process themselves by switching between calculators, spreadsheets, notebooks, banking applications, and chat apps.

### 1.4 Evidence This Is a Real, Widespread Problem

- Excel is described as a common but fragile tool: it requires manual meter entry, makes periodic business review difficult, and is prone to errors and data loss. - [Smartos.space: Quản lý phòng trọ bằng Excel? Nên hay Không?](https://smartos.space/quan-ly-phong-tro-bang-excel-nen-hay-khong/)
- Manual electricity and water calculation is also described as error-prone and time-consuming, especially with shared pumps or multiple sub-meters. - [Amerigroup.vn: File Excel Tính Tiền Điện Nước Nhà Trọ](https://amerigroup.vn/file-excel-tinh-tien-dien-nuoc-nha-tro/)

## 2. Business Case

### 2.1 The Story: Mr. Tuấn's Boarding House

Mr. Tuấn (48, Ho Chi Minh City) owns a 12-room boarding house. Every month, he spends about an hour reading electricity and water meters, calculating bills, and texting tenants the bills. Last month, he forgot to add the 200,000 VND Wi-Fi fee for two rooms, undercharging them by 400,000 VND.

One week after the payment deadline, 4 of his 12 tenants still have not transferred their rent. Mr. Tuấn sends a separate Zalo reminder to each tenant. Every time someone pays, he checks the payment proof in Zalo, checks the transfer in his banking application, confirms that the full amount was received, and marks the invoice as paid in Excel.

Lease renewals are tracked manually from paper contracts. He forgot Room 7's lease expired in June and only learned the tenant had moved out on July 5. The room stayed vacant for a month, costing him 3,500,000 VND in rent.

A tenant in Room 5 reported a leaking pipe, but the request was mixed with other conversations and was not followed up. The leak continued for a week, damaging part of the cabinet and costing Mr. Tuấn an additional 800,000 VND for repairs.

Mr. Tuấn lost 4,700,000 VND in total due to manual billing errors, the missed lease renewal, and the untracked maintenance request. Mr. Tuấn also lost hours calculating bills, checking payments, updating the spreadsheet, and fixing avoidable mistakes.

## 3. Stakeholders

| Stakeholder                       | Role                     | Interest                                                                                  |
| --------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| Project Manager                   | Team leader              | On-time, in-scope, quality delivery.                                                      |
| Five developers, including the PM | Execution                | Clear tasks and a working MVP.                                                            |
| Landlords                         | End user - landlord side | Timely rent and simpler billing, lease, and repair workflows.                             |
| Tenants                           | End user - tenant side   | Clear amounts, timely reminders, and visible payment and repair status.                   |
| University and advisor            | Project evaluator        | Students gain practical project management skills and successfully apply course concepts. |

## 4. Competitor Analysis

### 4.1 Comparable Business Cases

Each case uses the same 12-room property and follows monthly billing, late-payment reminders and verification, lease handling, maintenance follow-up, tenant access, and data continuity.

#### 4.1.1 Excel / Google Sheets + Zalo + Calculator

Mr. Tuấn reads each meter, calculates rent, utilities, Wi-Fi, and other charges, records the totals in a spreadsheet, and sends each bill through Zalo. Because every step depends on correct entry and checking, the two Wi-Fi fees can still be omitted.

After one week, 4 of the 12 tenants have not paid. Mr. Tuấn reminds each person through Zalo. For every later payment, he checks the Zalo proof, confirms the transfer and full amount in his banking application, and manually marks the invoice as paid in Excel.

Lease dates remain in paper contracts or spreadsheet cells, while maintenance reports remain among other Zalo messages. The workflow is familiar and flexible, but billing, lease, and repair records are disconnected and must be maintained manually.

Mr. Tuấn lost 4,700,000 VND in total due to manual billing errors, the missed lease renewal, and the untracked maintenance request. Mr. Tuấn also lost hours calculating bills, checking payments, updating the spreadsheet, and fixing avoidable mistakes.

#### 4.1.2 EasyTro
<p align="center">
  <img src="easytro3R.jpg">
</p>

Mr. Tuấn starts with EasyTro's Zalo Mini App, but there is no clear way to add a tenant. He spends one hour looking for the tenant-creation page before adding his first tenant.

<p align="center">
  <img src="easytro2R.jpg">
</p>

He then enters his rooms and monthly charges and uses EasyTro's billing, VietQR invoice, and debt features. This removes some calculator work, but the generated invoice displays the **wrong total**. Its QR also does not lock the invoice amount, so the tenant can enter a different transfer amount.
<p align="center">
  <img src="easytro1R.jpg">
</p>
EasyTro has no contract management, tenant-side application, or maintenance-request tracking. Lease expiry therefore remains in a separate record, while the leaking-pipe report stays outside the product.

EasyTro provides a payment-reminder button, but Mr. Tuấn must use it separately for each late tenant. He opens the reminder action, selects the corresponding person from his contacts, sends the message, and repeats the entire process for all 4 tenants. EasyTro also does not support the full payment-verification workflow, so after each tenant pays, Mr. Tuấn still checks the proof, banking transaction, and payment status manually.

<div style="display: flex; justify-content: center; gap: 10px;"> <img src="easytro4R20.jpg" width="30%"> <img src="easytro5R20.jpg" width="30%"> <img src="easytro6R20.jpg" width="30%"> </div>

Mr. Tuấn lost 4,700,000 VND in total due to the incorrect invoice total, the missed lease renewal, and the untracked maintenance request. Mr. Tuấn also lost hours finding how to add a tenant, sending individual reminders, checking payments, and fixing avoidable mistakes.

#### 4.1.3 Quản lý trọ - CL Team

<div style="display: flex; justify-content: center; gap: 10px;"> 
	<img src="trocl1.jpg" width="50%"> 
	<img src="trocl2.jpg" width="50%"> 
</div>

Before using the core features, Mr. Tuấn must pay or register for the one-month free **Pro package**. CL Tro shows the landlord's bank information but **does not generate a QR code**. The tenant must manually enter the bank details and transfer amount.

CL Tro does not support tenant rent reminders or the full payment-verification workflow. Mr. Tuấn must remind the 4 late tenants through Zalo outside the product, then check each Zalo proof and banking transaction before updating the payment status himself.

CL Tro does not support lease-renewal tracking, so Mr. Tuấn misses the expiry and loses 3,500,000 VND during the vacancy. It stores property data on the landlord's phone, so replacing the old phone causes him to **lose the records** and rebuild them. The product also has no maintenance-request tracking, leaving the leaking-pipe report outside the application and causing the additional 800,000 VND repair cost.

Mr. Tuấn lost 4,300,000 VND in total due to the missed lease renewal and the untracked maintenance request. Mr. Tuấn also lost hours sending individual reminders, checking payments, rebuilding lost records, and fixing avoidable mistakes.

#### 4.1.4 RosiHome Proposed MVP

Mr. Tuấn enters his bank-transfer details once, then records recurring charges and meter readings for each room. RosiHome calculates the invoice and generates a QR for the exact invoice amount. The tenant-side application displays the invoice, notifies the tenant, and accepts payment-proof uploads, while Mr. Tuấn still verifies the transfer in his bank account.

When rent becomes overdue, RosiHome sends reminders to all 4 late tenants at once. After each tenant uploads proof, Mr. Tuấn only checks the payment status in RosiHome against the received transfer in his banking application. Because the QR already contains the exact invoice amount, he no longer needs to search Zalo or recheck the entered amount.

RosiHome notifies Mr. Tuấn 15 days before Room 7's lease expires, giving him time to find another tenant who can move in immediately after the current tenant leaves.

Mr. Tuấn notices the unresolved repair request on the RosiHome dashboard one day after it is submitted, arranges the repair, and avoids 800,000 VND in cabinet damage.

Records are stored centrally, so replacing Mr. Tuấn's phone does not remove the property's history.

With RosiHome, Mr. Tuấn would avoid 4,700,000 VND and hours in losses avoiding all the problems in the story business case.

### 4.2 Market Gap

The reviewed alternatives address only separate parts of rental management, so their workflows remain fragmented or incomplete. RosiHome fills this gap by combining these solutions in one application and addressing needs that the existing alternatives leave unresolved.

### 4.3 RosiHome's Unique Value Proposition

- **Accurate payment flow:** RosiHome calculates the invoice and generates a QR that locks the exact amount when scanned; the landlord still verifies the bank transfer.
- **Integrated payment follow-up:** RosiHome reminds all late tenants at once without contact selection, then combines invoice-specific proof uploads, visible payment status, exact-amount QR payments, and final bank verification in one workflow.
- **Two-sided:** Landlords manage rooms and payment status, while tenants receive reminders, view invoices, and upload payment proofs through their application.
- **Lease-renewal reminders:** RosiHome tracks lease expiry dates and alerts landlords before renewal action is due.
- **Maintenance-request tracking:** Tenants submit requests with photos, while landlords track each request's status until completion.

## 5. Feasibility Study

- **Technical:** The five-member team has the skills and tools needed to build the core MVP, including billing, exact-amount QR generation, tenant/landlord views, rent-payment and lease reminders, maintenance tracking, and centralized records.
- **Operational:** RosiHome follows existing landlord–tenant workflows while replacing manual calculations, individual late-payment follow-up, chat-based requests, and paper-based lease tracking with one system.
- **Economic:** The estimated **4,250,000 VND** budget covers AI coding-agent subscriptions, team meeting meals and coffee, cloud infrastructure, domain, security, and contingency for the ten-week MVP. Student labor is provided as part of the course.
- **Schedule:** The ten-week plan allocates four weeks to research and proposal development, two weeks to core management features, three weeks to invoice and payment features, and one week to review, demonstration, and project closure.
## 6. Project Timeline & Schedule

The course lasts **10 weeks** and ends with an internal review, final demonstration, and project closure.

| Phase | Time | Deliverable |
|---|---:|---|
| Problem research and proposal | Weeks 1-4 | Research the problem and pain points, generate and evaluate ideas, select the final idea, and write the proposal. |
| Core management features | Weeks 5-6 | Build authentication, profiles, properties, room management, billing, tenant management, and meter readings. |
| Invoice and payment features | Weeks 7-9 | Build invoices, payments, dashboard, reminders, and exact-amount QR generation. |
| Review and project closure | Week 10 | Review the completed work, fix final issues, prepare and deliver the demonstration, finish documentation, and close the project. |

**Total: 10 weeks.**

## 7. Cost & Budget Plan

The estimated cash budget to build and complete the RosiHome MVP during the ten-week course is **4,250,000 VND**. The five student members provide labor as coursework, so labor is excluded. The budget contains no funding for AI product features or experiments.

| Category | Estimated cost | Purpose |
|---|---:|---|
| AI coding-agent subscriptions | 1,600,000 VND | Help the team build the MVP and write project documents. |
| Team meeting meals and coffee | 900,000 VND | Cover lunch or coffee when the team meets at school or coffee shops. |
| Cloud infrastructure | 800,000 VND | Host the application, database, and uploaded payment or maintenance evidence during development and the final demonstration. |
| Domain and security | 450,000 VND | Provide a project domain and secure access. |
| Contingency | 500,000 VND | Cover unexpected project costs or service-usage overages. |
| **Total** | **4,250,000 VND** | |

If student credits are unavailable, equal self-funding is **850,000 VND per member**.

## 8. Risk Assessment

Detailed risk descriptions, scores, mitigations, contingencies, and rankings are maintained in the [Risk Management Plan](risk_management.md), which is the source of truth for project risk control.

This proposal specifically refers to **RP-01, RP-02, RP-03, RP-04, RP-05, RP-06, RP-07, RP-08, RP-09, and RP-10**. These cover schedule pressure, AI-generated code review, changing landlord needs, scope creep, AI coding-agent availability, landlord adoption, demonstration deployment, fake payment proofs, private-data exposure, and market competition.

## 9. Elevator Pitch

**Managing a small boarding house should not require landlords to spend hours calculating bills, reminding late-paying tenants, checking each transfer across Zalo and banking applications, remembering lease expiry dates, and searching for repair requests.**

**RosiHome helps landlords manage all of these in one place.** It automatically calculates monthly rent and utility bills, generates a QR code for the exact amount due, reminds tenants when rent is overdue, alerts landlords before leases expire, and keeps repair requests visible until they are resolved.

**Instead of relying on notebooks, spreadsheets, and scattered Zalo messages, landlords can see what each tenant owes, who has paid, which leases need attention, and which repairs are still pending from one dashboard.**

**RosiHome helps small landlords save time, reduce costly billing mistakes, and avoid losing money from vacant rooms and forgotten repairs.**
