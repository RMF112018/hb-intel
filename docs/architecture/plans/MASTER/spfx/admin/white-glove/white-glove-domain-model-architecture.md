# White-Glove Domain Model — Architecture Decisions

## Purpose

Document the design decisions behind the white-glove domain model in `@hbc/models/admin-control-plane`. For the full type reference, see [white-glove-domain-model.md](../../../reference/white-glove/white-glove-domain-model.md).

## Decision 1: Composition over inheritance for the run hierarchy

**Choice:** `IWhiteGlovePackageRun` and `IWhiteGloveDeviceRun` each contain an `IAdminRunEnvelope` via a `run` property rather than extending the interface.

**Why:**
- `IAdminRunEnvelope` is a domain-agnostic envelope. It has no concept of parent/child runs.
- Adding `childRuns` to the generalized model would pollute it with white-glove-specific structure.
- Composition lets the package run carry the envelope for unified display while also carrying white-glove-specific fields (package template, employee info, device runs, snapshots).
- This mirrors how `IAppBindingRecord` is a separate domain interface that references generalized types.

**Back-reference:** Each child device run's `IAdminRunEnvelope.parentRunId` stores the parent package run's `runId`. Additionally, `IWhiteGloveDeviceRun.parentPackageRunId` provides an explicit typed back-reference.

## Decision 2: Parallel checkpoint taxonomy

**Choice:** `WhiteGloveCheckpointType` is a separate enum (6 domain-specific values) that maps to `AdminCheckpointCategory` via `WHITE_GLOVE_CHECKPOINT_CATEGORY_MAP`.

**Why:**
- `AdminCheckpointCategory` (5 values) describes checkpoint mechanics (timeout, escalation, confirmation). These are correct and complete for the engine.
- White-glove checkpoint types describe domain-specific pause reasons (connector readiness, technician prep, enrollment blocked). These are semantically different.
- Adding domain-specific values to `AdminCheckpointCategory` would contaminate the generalized enum.
- `IAdminCheckpointDefinition.checkpointId` already supports domain-specific identification. The enum provides canonical values.

## Decision 3: Six explicit package families

**Choice:** `WhiteGlovePackageFamily` is a closed enum with exactly six values. The `WHITE_GLOVE_PACKAGE_CATALOG` constant defines the full code-default baseline.

**Why:**
- The six employee device package families are locked requirements from the end-state plan. They have distinct device combinations and operational characteristics.
- A configurable template system would introduce premature complexity. The governed override model allows IT to adjust individual attributes (manufacturers, labels, NinjaOne flags) without changing the package structure.
- Explicit families make type-safe code paths possible for each combination.

## Decision 4: Template governance boundary

**Choice:** Three governance classifications — code-defined, governed override, derived at runtime.

**Why:**
- Some attributes are structural and must not be editable (package family, platform, enrollment authority). Changing these would break the operational lane logic.
- Some attributes are legitimately IT-managed (allowed manufacturers, display labels, NinjaOne flags). These need governed configuration with versioning and audit.
- Some attributes are computed (version number, source tag, effective timestamp). These cannot be set manually.
- The `WhiteGloveTemplateAttributeGovernance` enum makes this classification explicit and queryable.

## Decision 5: Domain-specific failure classification

**Choice:** `WhiteGloveFailureClass` is a separate enum from `IAdminFailureSummary.failureClass`.

**Why:**
- The generalized failure classes (transient, structural, permissions, repeated, admin-class) are too broad for device deployment recovery guidance.
- White-glove needs adapter-specific failure types (connector failure, enrollment failure, profile assignment failure, standardization failure) to drive targeted recovery UX.
- The `adapterSource` field on `IWhiteGloveFailureSummary` identifies which adapter reported the failure.

## Cross-references

- [Architecture baseline](white-glove-architecture-baseline.md)
- [Domain model reference](../../../reference/white-glove/white-glove-domain-model.md)
- [Phase 2 run model](../phase-02/admin-control-plane-run-model.md)
- [Phase 2 checkpoint model](../phase-02/admin-control-plane-checkpoint-and-execution-modes.md)
