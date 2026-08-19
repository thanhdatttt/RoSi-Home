# Customer Feedback & User Acceptance Testing (UAT) Report

**Project:** RosiHome Property Management MVP  
**Date of Testing:** 12 August 2026
**Tested By:** External User / Beta Tester  
**Testing Scope:** Mobile Application MVP (Frontend UI & Core Flows)  

---

## 1. Overview
On August 12, 2026, an external user conducted a hands-on testing session with the RosiHome mobile application MVP. The purpose of this session was to gather authentic customer feedback on usability, detect undiscovered bugs, and identify areas for improvement before the final release. 

Below is the documented feedback categorized by type, along with the team's proposed resolutions.

## 2. Feedback Log

| No. | Category | Customer Feedback / Issue Description | Team's Resolution & Action Item |
|:---:|:---|:---|:---|
| **1** | **Enhancement** | **Room Search:** Missing a search bar to quickly find specific rooms in a property. | **Accepted.** Will add a search input field at the top of the Room List screen. |
| **2** | **UI/UX** | **Currency Formatting:** Several money fields do not have comma separation (e.g., showing 1000000 instead of 1,000,000), making it hard to read. | **Accepted.** Will implement a global number formatter for all currency displays. |
| **3** | **Enhancement** | **Locality Dropdown:** The locality/area selection needs a dropdown with predefined options like "Ho Chi Minh", "Hanoi", "Quang Ngai". | **Accepted.** Will replace the free-text input with a Dropdown Picker component for cities/provinces. |
| **4** | **Business Logic** | **Tenant vs Water Charge mismatch:** The system allows setting water charges "per flat", but the lease creation flow currently only creates 1 tenant per room. | **Accepted.** Will update the lease creation process to support adding multiple tenants (occupants) per room, ensuring accurate 'per head count' utility calculations and better tenant management. |
| **5** | **UI/UX** | **Missing Navigation:** The Profile screen is missing a "Back" button. | **High Priority Fix.** Will add a header with a back chevron on the Profile screen. |
| **6** | **UI/UX** | **Navigation Flow:** The device's back button behavior is inconsistent; it must reliably return the user to the immediate parent screen. | **Accepted.** Will refine the React Navigation stack to handle hardware back-button presses properly. |
| **7** | **UI/UX** | **Duplicated CTA:** The "Add Room" button appears twice on the same screen (one in the Quick Actions section and another right below it at the top of the Room List). | **Accepted.** Will remove the duplicated button in the Room List header to keep the UI clean. |
| **8** | **Enhancement** | **Pagination UX:** The "See More" button for the room list should load double the current amount of items per click to reduce repetitive tapping. | **Accepted.** Will increase the pagination limit parameter in the backend API call. |
| **9** | **Functional Bug** | **Navigation Bar:** The Bottom Navigation bar is broken, the icons are squished to the left side. | **High Priority Fix.** Will debug the Flexbox layout styling in the Bottom Tab Navigator component to ensure icons are evenly distributed across the screen width. |
| **10** | **UI/UX** | **Login Screen Clarity:** The login screen is confusing regarding credentials. It should explicitly state that Landlords use their *Email*, while Tenants use their *Lease-registered Phone Number*. | **Accepted.** Will redesign the Login form placeholders and add helper text to distinguish Landlord vs Tenant login methods. |
| **11** | **Localization** | **Translation Issues:** Vietnamese language support is broken or incomplete in several screens. | **High Priority Fix.** Will review and update the `i18n` translation JSON files to ensure 100% coverage. |

## 3. Conclusion & Next Steps
The feedback provided by the external tester is highly valuable. The majority of the issues identified are UI/UX inconsistencies and navigation bugs. The development team will register these 11 points into the project backlog as technical debt and prioritize fixing the "Functional Bugs" and "High Priority" UI issues before the final production rollout.
