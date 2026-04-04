# White-Glove Apple Adapter — Architecture Decisions

## Purpose

Document design decisions for the Apple device management adapter lane. For the full reference, see [white-glove-apple-adapter.md](../../../../../reference/white-glove/white-glove-apple-adapter.md).

## Decision 1: Three services by Apple concern

**Choice:** `AppleAbmService`, `AppleAdeService`, `AppleMdmService` as distinct classes.

**Why:**
- ABM (procurement and assignment), ADE (enrollment profiles), and MDM (ongoing management via APNs) are separate Apple platform concerns with different APIs, tokens, and failure modes.
- ABM token expiry is a distinct operational concern from ADE enrollment profile configuration.
- APNs certificate management is independent of ABM server token management.

## Decision 2: Explicit iPhone / iPad / macOS differentiation

**Choice:** `validateAdeAssignmentPosture(serialNumber, platform)` takes an explicit `AppleDevicePlatform` parameter and applies platform-specific validation rules.

**Why:**
- iPhone and iPad require supervised enrollment for full management capabilities (app install, restrictions, single-app mode).
- macOS enrollment works differently — supervision is optional, and the enrollment profile requirements differ.
- A generic "Apple device" validation would miss critical platform-specific requirements and produce incorrect readiness assessments.

## Decision 3: Apple owns enrollment authority

**Choice:** The adapter validates readiness and reports status but does not claim to be the enrollment authority. Apple ADE and ABM are the enrollment authorities.

**Why:**
- Apple ADE controls which MDM server receives enrollment. HB Intel cannot override this.
- ABM controls device assignment to MDM servers. HB Intel verifies assignment, not creates it.
- The operator must configure ABM/ADE correctly in Apple's portals. HB Intel checks and reports.
- This aligns with the no-go constraint: "preserve platform-native ownership."

## Decision 4: Supervised state as first-class concept

**Choice:** `getSupervisedState()` is a dedicated method, not a boolean flag on a larger status object.

**Why:**
- Supervision is the most important management capability differentiator for iOS/iPadOS.
- An unsupervised iPhone cannot receive many management commands that the white-glove workflow requires.
- Making it a dedicated method ensures the operator sees supervision status prominently, not buried in a generic status blob.

## Cross-references

- [Architecture baseline](white-glove-architecture-baseline.md)
- [Boundary matrix](white-glove-boundary-matrix.md)
- [Apple adapter reference](../../../../../reference/white-glove/white-glove-apple-adapter.md)
