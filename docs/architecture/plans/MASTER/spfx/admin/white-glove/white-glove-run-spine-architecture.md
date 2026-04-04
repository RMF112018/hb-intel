# White-Glove Run Spine — Architecture Decisions

## Purpose

Document the design decisions behind the white-glove run, audit, checkpoint, and evidence spine. For the full reference, see [white-glove-run-spine.md](../../../../../reference/white-glove/white-glove-run-spine.md).

## Decision 1: New service composing with existing stores

**Choice:** `WhiteGloveRunService` composes with `IAdminRunService`, `IAdminAuditService`, and `IAdminEvidenceService` rather than modifying them.

**Why:**
- The existing generalized stores handle individual run envelopes, audit events, and evidence. They are stable and battle-tested.
- White-glove needs parent/child orchestration *on top* — package status aggregation, multi-device coordination, and retry of individual devices.
- Modifying the generalized stores would risk breaking provisioning, install/bootstrap, and other admin domains.
- The white-glove service is a domain-specific orchestration layer; the generalized stores are the persistence layer.

## Decision 2: In-memory stub with Table Storage roadmap

**Choice:** Phase 9.1 uses in-memory storage. Table Storage backing will be added when adapter lanes are built.

**Why:**
- The service interface is stable — adding persistence is a mechanical change.
- In-memory storage enables API route testing and SPFx integration without Table Storage configuration.
- The adapter lanes (Prompts 05–07) need the run service interface; they don't depend on the persistence implementation.

## Decision 3: Package status aggregation from device statuses

**Choice:** Package run status is derived from child device run statuses, not independently tracked.

**Why:**
- This prevents status drift between parent and children.
- The aggregation rules are deterministic — all completed = Completed, mixed = PartiallyCompleted, etc.
- Operators see the truthful aggregate; they don't see a parent "Running" while all children have failed.

## Decision 4: Audit events on package run partition

**Choice:** Audit events use the parent package run ID as partition key, even for device-level events.

**Why:**
- This enables a single query to retrieve the complete audit trail for a package deployment.
- Device-level events include the device run ID in the summary for filtering.
- The existing audit store already uses run ID as partition key; this is consistent.

## Decision 5: Provisioning compatibility by domain isolation

**Choice:** White-glove runs use `AdminDomain.WhiteGloveDeployment` for partition isolation. No existing provisioning code is modified.

**Why:**
- Provisioning runs partition by `provisioning-rollout` domain.
- White-glove runs partition by `white-glove-deployment` domain.
- Audit and evidence tables use run ID as partition key — naturally isolated.
- The orchestration bridge, saga orchestrator, and SignalR push remain untouched.

## Cross-references

- [Architecture baseline](white-glove-architecture-baseline.md)
- [Domain model](../../../../../reference/white-glove/white-glove-domain-model.md)
- [Run spine reference](../../../../../reference/white-glove/white-glove-run-spine.md)
