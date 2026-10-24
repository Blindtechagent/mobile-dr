# Mobile DR

## Current build

- Mobile-only customer app.
- Hindi by default with an English option.
- One customer navigation drawer; staff area is available through Staff Login.
- Customer repair form is simplified to essential information.
- Firebase Realtime Database is used for products, offers and repair records.
- Firebase Authentication is used for staff login and anonymous customer repair submission.
- Staff authentication uses Firebase Auth LOCAL persistence.
- Staff can manage products, offers and repairs, update repair status, contact customers and print/save the repair list as PDF.
- Customers do not create separate profile records.
- Services, orders, inventory, reviews, payments, reports and customer-profile modules are not included.

## Firebase

The Firebase web configuration is already included in `js/firebase-config.js`.

Required Firebase Authentication providers:

- Email/Password for the authorized staff account.
- Anonymous for customer repair submission.

The included `database.rules.json` contains the Realtime Database security rules for the current account model.

## Repair retention

The app uses a Firebase free-plan-compatible cleanup method. When the authorized staff area opens, it checks Firebase for repairs whose status is `ready` or `picked_up` and whose completion time is older than 15 days, then removes those records.

This cleanup does not use Firebase Cloud Functions, Cloud Scheduler, Artifact Registry or a Blaze/pay-as-you-go deployment.

## Staff account

Configured staff email:

`nks54612@gmail.com`

Configured owner UID:

`A6dvwZKq2odRufHVBuW1NeUNte72`

The staff password is stored only in Firebase Authentication and is not included in the project.

## Important

Do not put passwords or Firebase Admin SDK/service-account credentials in this website. The Firebase Web App configuration is client-side configuration; database access is protected by Firebase Authentication and Realtime Database Security Rules.
