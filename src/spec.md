# Specification

## Summary
**Goal:** Make the Add Money (A7J TOPUP) flow fully functional by letting users submit bKash/Nagad top-up transactions via a modal, storing them as pending requests, and enabling admins to approve/reject them.

**Planned changes:**
- Add/verify two payment method buttons on `/add-money` (bKash, Nagad) that open a method-specific modal and can be closed without submitting.
- Update the modal UI to the requested design (white card, rounded corners, soft shadow, top-right close X), show the correct payment number per method, display a 4-step ordered instruction list, and provide a purple “Submit Transaction” CTA.
- Implement the modal submission flow with client-side validation (amount > 0, TxID required), backend submission call, and clear English success/failure messages (success closes modal; failure keeps it open).
- Persist top-up requests in the backend with fields: user Principal, amount, transactionId (TxID), payment method, status (pending by default), and createdAt timestamp.
- Enforce backend security: prevent duplicate TxID globally; restrict approve/reject actions to admins only; only pending transactions can be approved/rejected.
- Ensure the admin panel transactions list shows newly submitted pending top-ups and supports approve/reject; approving credits the user wallet balance, rejecting does not.
- Maintain mobile-responsive, professional UI for the Add Money page, modal, and transaction history/admin tables (no horizontal scrolling except tables as needed).

**User-visible outcome:** Users can choose bKash or Nagad, submit a validated top-up request from a clean mobile-friendly modal, and see it in their transaction history as pending; admins can see pending requests in the admin panel and approve/reject them (approval credits the wallet).
