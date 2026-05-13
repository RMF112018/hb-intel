# 05 — B05 Targeted Web Verification Notes

## Purpose

This note captures the narrow external verification used to support B05 documentation alignment. It does **not** turn the package into a broad research memo. It exists to ensure that B05’s load-bearing Adobe/Microsoft claims are still current enough to preserve in repo planning docs.

---

## 1. Acrobat Sign application posture

### Verified points
Adobe’s application quickstart distinguishes:
- `CUSTOMER` apps for internal/account-owned Acrobat Sign use,
- `PARTNER` apps for apps accessing other Acrobat Sign accounts,
- partner posture requiring certification for full cross-account access.

### B05 implication
The B05 planning baseline of an Acrobat Sign `CUSTOMER` app for an internal HB My Dashboard feature remains appropriate.

### Primary reference
- Adobe Acrobat Sign Developer Guide — *Create an Application Quickstart*

---

## 2. Delegated OAuth and scope posture

### Verified points
Adobe’s OAuth guidance supports:
- authorization-code flow,
- redirect/callback handling,
- scope modifiers including `self`,
- token exchange returning access and refresh tokens,
- `api_access_point` and `web_access_point` context values.

Adobe’s migration guidance continues to recommend end-user OAuth authorization for unique user tokens rather than a shared principal posture when the experience is user-specific.

### B05 implication
A user-specific “agreements requiring my action” queue is correctly modeled as delegated OAuth rather than shared account retrieval.

### Primary references
- Adobe Acrobat Sign Developer Guide — *Create an Application Quickstart*
- Adobe Acrobat Sign Developer Guide — *Managing OAuth Tokens*
- Adobe Acrobat Sign Developer Guide — *Migrating and Updating Apps: Updating API Authentication Methods*

---

## 3. Token lifetime and storage posture

### Verified points
Adobe documents:
- access tokens with a one-hour lifetime,
- refresh tokens with 60-day inactivity expiry,
- refresh-token reuse extending the inactivity window,
- revocation support.

Microsoft guidance continues to classify access tokens as sensitive credentials and states that refresh tokens should be stored safely like access tokens or application credentials.

### B05 implication
B05’s backend-only encrypted refresh-token persistence, no-SPFx-token-storage, and refresh failure → `authorization-required` posture remains justified.

### Primary references
- Adobe Acrobat Sign Developer Guide — *Managing OAuth Tokens*
- Microsoft Learn — *Access tokens in the Microsoft identity platform*
- Microsoft Learn — *Refresh tokens in the Microsoft identity platform*

---

## 4. Stable identity claims

### Verified points
Microsoft states that:
- `oid` is an immutable object identifier,
- `preferred_username`, `email`, and similar user-readable claims are mutable and should not be authorization keys,
- a stable application identity key can be formed from `tid` + `oid`.

### B05 implication
Because the current repo exposes `oid` and normalized `upn` but not `tid`, B05’s recommendation to key the grant through trusted tenant context + `claims.oid`, while keeping `upn` display-only, remains the correct current planning posture.

### Primary references
- Microsoft Learn — *ID token claims reference*
- Microsoft Learn — *Secure applications and APIs by validating claims*

---

## 5. Adobe retrieval endpoint and rate-limit posture

### Verified points
Adobe’s best-practice material distinguishes:
- `GET v6/agreements` for general paginated agreement listing,
- `POST v6/search` for advanced criteria including status/role/filter/sort behavior.

Adobe also documents throttling behavior with `429` responses and retry-related handling.

### B05 implication
B05’s live-provider baseline of bounded `POST v6/search`, no broad retrieval plus local filtering, and Retry-After-aware degraded-state mapping is consistent with current vendor guidance.

### Primary references
- Adobe Acrobat Sign Developer Guide — *API Best Practices: Retrieving List of Agreements and Details*
- Adobe Acrobat Sign Developer Guide — *API Throttling*

---

## 6. Signing URL limitations

### Verified points
Adobe’s signing URL guidance is tailored to hosted/in-person signing workflows and documents timing/availability behavior such as `DOCUMENT_NOT_YET_AVAILABLE`.

### B05 implication
B05’s decision not to treat signing URLs as the default durable row-level “Open in Adobe Sign” handoff contract remains justified. The row CTA should depend on validated backend-supplied URLs, with a general module-level Adobe launch handled separately where product-approved.

### Primary references
- Adobe Acrobat Sign Developer Guide — *API Usage: Get the Signing URL*
- Adobe Acrobat Sign Developer Guide — *API Best Practices: Signing URL / Base URI / Retry*

---

## 7. Package implication

These findings support preserving B05’s current:
- `CUSTOMER` app baseline,
- delegated OAuth posture,
- stable actor key posture,
- backend-only token storage,
- bounded `POST v6/search` retrieval,
- validated source-handoff rules,
- signing URL non-default row CTA posture.

They do **not** require runtime implementation in this documentation package.
