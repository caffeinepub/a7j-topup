# Specification

## Summary
**Goal:** Update the Add Money page to show personal payment numbers for bKash and Nagad, add a clear “How to Add Money” instruction box, and refresh styling with payment icons while keeping existing submission and history features unchanged.

**Planned changes:**
- Update `frontend/src/pages/AddMoneyPage.tsx` to display payment methods with clearly visible, copyable/readable plain-text numbers: bKash Personal **01868226859** and Nagad Personal **01784377956** (English labels).
- Add a prominent instruction card titled **"How to Add Money"** containing the exact 5 steps provided, plus an **"Important Notice"** section with the exact two bullet points provided.
- Adjust layout/styling to a white background with clean card layout, rounded corners, soft shadows, and purple primary buttons (using existing styling utilities).
- Add and render static payment method icons for bKash and Nagad from `frontend/public/assets/generated` and display them next to their respective payment method.

**User-visible outcome:** On the Add Money page, users see bKash and Nagad methods with their personal numbers and icons, can follow the on-page instructions to submit a top-up request, and can still submit transactions and view transaction history as before.
