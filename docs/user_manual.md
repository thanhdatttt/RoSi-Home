# RosiHome User Manual

This guide covers the supported mobile-first MVP in the current repository. Screen names may appear in English or Vietnamese. The application needs a configured and reachable RosiHome backend; users do not need developer credentials or database access.

## 1. Before You Start

- Use the RosiHome Expo application on a supported iOS or Android device. The same codebase also has an Expo Web runtime for development and demonstrations.
- A landlord signs in with an email address. A tenant signs in with the phone number registered on the lease.
- A landlord may create a landlord account from the Register screen. A tenant cannot self-register; the tenant account is created when the landlord creates the lease.
- If the application cannot reach the server, check the network and try again. Do not enter real banking or identity data in a classroom demonstration; use approved synthetic data.

## 2. Sign In and Account Safety

1. Open RosiHome and choose **Sign in**.
2. Enter a landlord email or tenant phone number and the password.
3. Turn on **Remember me** only on a trusted device.
4. A tenant using a temporary password must set a new password before opening other screens.
5. Use **Profile** to update the supported profile fields, change the password, or log out.

Landlords can request password recovery by email. Tenants should contact their landlord when they cannot use their lease-linked phone account. Email recovery requires the project's email service to be configured and available.

## 3. Landlord Workflows

### 3.1 Set Up a Property

1. From the Landlord dashboard, open **Properties** and choose **Add property**.
2. Enter the property name, address, locality, electricity rate, water billing method, and the requested water value.
3. Add optional recurring surcharges and save.
4. Open the property to edit its details, rooms, utility rates, surcharges, and lease-reminder settings.
5. Add one room or use the bulk room form. Each room needs a name and positive monthly base rent.

Future-dated utility rates and surcharges are shown separately from the current values. Deleting or deactivating data may be blocked when active records depend on it; read the confirmation before continuing.

### 3.2 Create and Manage a Lease

1. Open **Leases** and choose the new-lease action.
2. Select a vacant room and enter the tenant, lease dates, agreed rent, and deposit.
3. Save the lease. The system may provision the tenant account and return a temporary password for secure delivery to that tenant.
4. Open a lease to view it, update allowed terms, renew it, or end it with an actual end date.

Ending a lease keeps invoice, payment, meter, and maintenance history. RosiHome stores lease information; it is not an electronic-signature service.

### 3.3 Meter Readings, Invoices, and VietQR

1. Open a property, room, then **Meter readings**.
2. Record the initial electricity/water baseline before monthly readings.
3. Add the reading for a billing period. A correction is allowed only while the linked invoice is still Draft; the original remains in history.
4. Open **Invoices** to review Draft, Sent, or Paid records. Open a Draft, check its itemized charges, then choose **Review & send to tenant**.
5. For a Sent invoice, preview the tenant VietQR or download the invoice PDF.

The current mobile UI does not provide a landlord screen to configure bank details or approve a pending payment proof. Those actions require the supported project environment/API workflow. Generating or scanning VietQR does not confirm payment and never marks the invoice Paid by itself.

### 3.4 Maintenance, Reminders, and Reports

- Open **Maintenance** to filter requests, review details/photos, start work, and mark a request Completed.
- Open **Notifications** to view in-app items. Remote push requires a physical iOS/Android device, permission, an Expo project ID, and a configured push service.
- Use the property reminder screen and the expiring-leases view for supported lease reminders.
- Open **Reports**, select a month or custom date range, generate the report, and open/share its PDF when available.

## 4. Tenant Workflows

### 4.1 View the Home and Lease

1. Sign in with the lease-registered phone number and the password provided by the landlord.
2. Change the temporary password when required.
3. The Tenant dashboard shows the active property/room and the next payment when available.
4. Open **My lease** to view the room, period, rent, deposit, utilities, and services. Lease information is maintained by the landlord.

### 4.2 View and Pay an Invoice

1. Open **My invoices**. Tenants see Sent and Paid invoices; landlord Drafts remain hidden.
2. Open an invoice and check the billing period, due date, amount, and itemized charges.
3. Choose **Pay with VietQR**, then verify the recipient, amount, and transfer description in the banking application before confirming the transfer.
4. Return to RosiHome and choose **Upload payment proof** for an unpaid Sent invoice. Select a PNG/JPG/JPEG image no larger than 5 MB.
5. Wait for landlord verification. Uploading a screenshot or scanning a QR does not mark the invoice Paid.
6. Use **Payment history** to review paid and outstanding invoices.

### 4.3 Submit a Maintenance Request

1. Open **Repairs & maintenance** and choose **New maintenance request**.
2. Enter a title and description. An active room is required.
3. Optionally add up to three PNG/JPEG photos, each no larger than 5 MB. Camera/library permission is required on the device.
4. Submit the request and use the list/detail screens to follow Pending, In Progress, and Completed status.

## 5. Current MVP Limits

- The product is mobile-first. Expo Web is the web runtime of the same codebase, not a separate web application.
- External email, push, Storage, database, and Render behavior depends on correct protected configuration. Repository code alone does not prove provider delivery or production availability.
- RosiHome initiates a direct bank-transfer workflow. It does not hold money, receive a bank callback, reconcile a bank statement automatically, or prove payment from the QR alone.
- The current mobile UI has no landlord payment-configuration or payment-proof approval screen.
- Digital lease records are informational storage, not a legally binding e-signature.
- Real-device usability, production load, backup/recovery, and app-store packaging are outside this manual's verified evidence.
