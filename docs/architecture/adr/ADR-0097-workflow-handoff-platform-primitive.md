# ADR-0097 — Workflow Handoff Platform Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** The source specification (PH7-SF-08) referenced ADR-0017 as its target number.
This conflicts with CLAUDE.md §7 (all numbers below ADR-0091 are reserved). The canonical
locked ADR for this feature is ADR-0097. The source spec's ADR-0017 reference is superseded
by this document.

---

## Context

Cross-module handoffs — BD to Estimating, Estimating to Project Hub, and future routes — require
a structured, auditable transfer of custody between modules. Without a shared primitive, each
module would implement its own ad-hoc handoff pattern, leading to inconsistent state machines,
duplicated audit trails, and no standardized BIC transfer on handoff.

Phase 7 Shared Feature 08 (SF-08) defines `@hbc/workflow-handoff` as the platform primitive
that all modules use for structured cross-module handoff. Ten architectural decisions were made
during its design and are locked by this ADR.

---

## Decisions

### D-01 — Storage Backend: SharePoint List + Azure Functions

**Decision:** Use a `HBC_HandoffPackages` SharePoint list as the primary store, with all
write and state-transition operations going through Azure Functions. Direct SharePoint Graph
API calls from the client are prohibited for handoff operations.

**Rationale:** Consistent with the SF-01 (Data API) storage pattern. Azure Functions provide
server-side validation and enforce the state machine (a client cannot self-approve a transition).
SharePoint provides the audit trail and existing permission model.

**Consequences:** All nine handoff Azure Functions must be provisioned before the package can
be used in production. The client package communicates only through the REST API at
`/api/workflow-handoff/*`.

---

### D-02 — Five-State Linear State Machine

**Decision:** `HandoffStatus` is a five-state linear machine:
`draft → sent → received → acknowledged | rejected`.
`acknowledged` and `rejected` are terminal states. No transitions out of terminal states are
permitted. Server-side enforcement is required — the `handoffAcknowledge` and `handoffReject`
Azure Functions must validate the preceding state before writing.

**Rationale:** A simple, auditable state machine with no ambiguity. Terminal states ensure the
handoff record is a permanent audit artifact.

**Consequences:** Rejected handoffs require a new handoff to be initiated. The consuming module's
`onRejected` handler must return the source record to its pre-handoff state (e.g., via
`ScorecardApi.returnToRevision`).

---

### D-03 — Pre-flight Validation Synchronous

**Decision:** `IHandoffConfig.validateReadiness(source)` is a synchronous function that returns
a string (failure message) or `null` (ready). The `HbcHandoffComposer` step indicator disables
the "Proceed" CTA when any pre-flight check is failing. No asynchronous pre-flight is supported.

**Rationale:** Asynchronous pre-flight would require loading state and error handling in the
Composer before the user has taken any action. Synchronous validation keeps the Composer
snappy and predictable. Complex async checks belong in the source module's workflow stage gate,
not in the handoff pre-flight.

**Consequences:** Pre-flight can only check fields already loaded in the source record.
Network-dependent checks (e.g., "does this document still exist?") are not suitable for
pre-flight and should be surfaced via document resolution errors in Step 2 instead.

---

### D-04 — Field Mapping Frozen at Assembly Time

**Decision:** `mapSourceToDestination(source)` is called once when `usePrepareHandoff` assembles
the package. The resulting `destinationSeedData` snapshot is frozen — no live re-evaluation occurs
as the user progresses through the Composer steps. The seed data the recipient sees in
`HbcHandoffReceiver` is exactly what was assembled at send time.

**Rationale:** The handoff package is an immutable audit artifact. The recipient must be able to
trust that the data they see in the Receiver matches what the sender certified. Live re-evaluation
would create a race condition where data changes after send.

**Consequences:** If the source record changes after a handoff is sent, the handoff package still
reflects the state at send time. This is the intended behavior. Consuming modules should surface
this clearly in the UI if needed.

---

### D-05 — BIC Transfer on Send

**Decision:** On `HandoffApi.send()` success, BIC ownership transfers to the `recipient`. The
consuming module's `IBicNextMoveConfig.resolveCurrentOwner` must read `useHandoffStatus` and
return the recipient as owner when `status === 'sent' || status === 'received'`. On `acknowledged`
or `rejected`, BIC returns to the consuming module's default resolution logic (post-creation for
acknowledged; return-to-sender for rejected).

**Rationale:** BIC ownership must always reflect who has actionable responsibility. During the
handoff period, the recipient is responsible for review and action.

**Consequences:** The consuming module must wire `useHandoffStatus` into its BIC config. This is
an inversion-of-control pattern — `@hbc/workflow-handoff` does NOT implement BIC logic itself.

---

### D-06 — Document Resolution Async, Links Only

**Decision:** `resolveDocuments(source): Promise<IHandoffDocument[]>` is async and returns link
metadata only — `documentId`, `fileName`, `sharepointUrl`, `category`, `fileSizeBytes`. No file
content is copied or stored in the handoff package. If SharePoint URLs change after the handoff
is created, the `handoffGet` Azure Function is responsible for migrating stale URLs to current
ones before returning the package.

**Rationale:** Copying file content would bloat the handoff package and create duplicate storage.
Links are sufficient for the recipient to access documents. URL migration in the API layer
insulates the client from SharePoint URL changes.

**Consequences:** Document resolution may fail or return an empty array if SharePoint is
unavailable at assembly time. The Composer must handle `documentError` state gracefully.

---

### D-07 — Rejection is Terminal, Requires Reason

**Decision:** `HandoffApi.reject()` requires a non-empty `rejectionReason` string. The
`handoffReject` Azure Function validates this. Once rejected, the handoff is permanently in the
`rejected` state. The `onRejected` handler in the consuming module's config is responsible for
returning the source record to its pre-handoff revision state.

**Rationale:** Rejection without a reason is unhelpful to the sender. The consuming module must
define what "return to revision" means for its record type — this is business logic that belongs
in the consuming module, not the shared primitive.

**Consequences:** `HbcHandoffReceiver` must enforce a non-empty reason before enabling the
"Confirm Reject" CTA. The rejection reason is permanently stored in `HBC_HandoffPackages` and
surfaced in version history context payloads.

---

### D-08 — Complexity Gating: Composer/Receiver Ungated; StatusBadge Essential=hidden

**Decision:** `HbcHandoffComposer` and `HbcHandoffReceiver` are ungated by complexity — they are
always rendered when invoked. `HbcHandoffStatusBadge` is complexity-gated: Essential renders null,
Standard renders the label, Expert renders label + timestamp.

**Rationale:** The Composer and Receiver are task-completion surfaces — a user who has been
directed to perform a handoff action must be able to do so regardless of their complexity setting.
The StatusBadge is informational ambient UI and can be hidden for Essential users who prefer less
visual noise.

**Consequences:** Essential users cannot see handoff status from the badge but will still receive
notifications and see the handoff in My Work Feed. Standard and Expert users see the badge inline
on the source record detail view.

---

### D-09 — Generic Type Contract: IHandoffPackage<TSource, TDest>

**Decision:** `IHandoffPackage<TSource, TDest>` and `IHandoffConfig<TSource, TDest>` are fully
generic over source and destination record types. The consuming module supplies the concrete types.
The shared package uses `Record<string, unknown>` as the default when no concrete types are
provided (e.g., in test fixtures).

**Rationale:** The handoff primitive serves multiple routes (BD→Estimating, Estimating→Project
Hub, etc.) with different source and destination schemas. Full generics provide end-to-end type
safety from `mapSourceToDestination` through `onAcknowledged` without requiring `any` casts.

**Consequences:** The `mapListItem<TSource, TDest>` API mapper must use try/catch JSON.parse for
`sourceSnapshot` since it is stored as a string in SharePoint. Type safety ends at the API
boundary; consuming modules should validate the parsed snapshot if needed.

---

### D-10 — Testing Sub-Path: `@hbc/workflow-handoff/testing`

**Decision:** A `./testing` export entry point exposes fixture factories
(`createMockHandoffPackage<S,D>`, `createMockHandoffConfig<S,D>`, `createMockHandoffDocument`,
`createMockContextNote`) and canonical state maps (`mockHandoffStates` — 5 states).
This sub-path is excluded from the production bundle. Consuming module tests import from this
sub-path to create consistent, predictable fixtures without duplicating factory logic.

**Rationale:** Consistent with the testing sub-path pattern established in SF-02, SF-05, SF-06,
and SF-07. The five canonical states map exactly to the five `HandoffStatus` values, ensuring
every state transition is testable from a standard baseline.

**Consequences:** Any consuming module that adds tests for handoff-related behavior must import
fixtures from `@hbc/workflow-handoff/testing` rather than defining its own mock packages.

---

## Compliance

This ADR is locked by CLAUDE.md §6.3 (Phase 7 Governance Rules). It may only be reversed or
modified by a superseding ADR with explicit rationale. The ten decisions above are the binding
implementation contract for `@hbc/workflow-handoff` and all consuming modules.
