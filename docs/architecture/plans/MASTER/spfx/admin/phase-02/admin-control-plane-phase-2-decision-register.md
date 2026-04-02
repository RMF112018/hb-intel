# Admin Control Plane — Phase 2 Decision Register

## Purpose

This register tracks architectural decisions made during Phase 2 contract work. Each entry records the decision, rationale, and alternatives considered. Later prompts append to this register as new decisions are made.

## Decisions

### P2-D01 — Shared contract types belong in @hbc/models

**Decision**: Admin control-plane contract types (enums, interfaces, type aliases) are placed in `packages/models/src/admin-control-plane/` and exported through the `@hbc/models` public surface.

**Rationale**:
- `@hbc/models` is the canonical home for pure shared types across the HB Intel monorepo.
- The contract types are consumed by `apps/admin` (operator console), `backend/functions` (control plane), and potentially `@hbc/features-admin` (intelligence layer). Placing them in any one consumer would create the wrong dependency direction.
- `@hbc/features-admin` is the admin-intelligence package (LD-03) — putting control-plane types there would blur the intelligence/execution boundary.
- `apps/admin` is a consumer, not a shared type provider.
- Creating a new package would add workspace overhead for what is currently a small set of pure types.

**Alternatives rejected**:
- `@hbc/features-admin` — wrong boundary (intelligence, not control plane).
- `apps/admin` — app packages should not export shared types.
- New `@hbc/admin-control-plane` package — premature; may be warranted later if the contract surface grows to include runtime behavior, but for pure types `@hbc/models` is the established pattern.

### P2-D02 — 8 admin domains aligned with Phase 1 taxonomy

**Decision**: The admin domain enum uses 8 domains that map to the Phase 1 domain taxonomy, consolidating the 10 Phase 1 domains into 8 by folding "Operator Console Shell" and "Runs / History / Status" into cross-cutting concerns rather than standalone action domains.

**Rationale**:
- "Operator Console Shell" is a UX concern, not an admin action domain. It does not produce control-plane actions.
- "Runs / History / Status" is a cross-cutting capability consumed by all domains (every domain produces runs and history). It is not a source of independent actions.
- The remaining 8 domains each represent a distinct area that generates unique admin actions with specific risk profiles.

### P2-D03 — Risk level determines default execution mode

**Decision**: Each risk level has a default execution mode. Domains may override the default with documented rationale. The provisioning saga's override (moderate risk → seamless) is the canonical example, explicitly allowed by LD-05.

**Rationale**:
- Fixed risk-to-mode mapping would prevent provisioning from staying seamless (violating LD-05).
- No mapping at all would leave execution mode as an ad hoc choice per action.
- Default-with-override provides discipline while respecting domain-specific needs.

### P2-D04 — Action keys use domain:family:verb triple

**Decision**: Admin action identifiers use the format `domain:family:verb` (e.g., `provisioning-rollout:saga:launch`), typed as a template literal against `AdminDomain`.

**Rationale**:
- Scoped identifiers prevent name collisions across domains.
- The triple structure is human-readable and machine-parseable.
- Template literal typing provides compile-time validation that the domain prefix is a valid `AdminDomain` value.
- The pattern is consistent with the existing permission key format in the admin app (`admin:access-control:view`).

### P2-D05 — Contract surface is type-only with no runtime dependencies

**Decision**: The `admin-control-plane` module in `@hbc/models` contains only enums, interfaces, and type aliases. No runtime logic, no external imports, no validation schemas.

**Rationale**:
- `@hbc/models` is consumed by all layers. Runtime dependencies would create coupling across the dependency graph.
- Validation schemas (Zod) may be added later in `api-schemas/` following the existing pattern, but contract types remain pure.
- This preserves tree-shaking and keeps the package lightweight.

### P2-D06 — Generalized run model is a translation target, not a replacement

**Decision**: The generalized `IAdminRunEnvelope` is a **translation target** for provisioning data, not a replacement for `IProvisioningStatus`. Provisioning retains its own types and persistence. New admin domains use the generalized model natively. Unified display projects provisioning into the generalized model via a read-only adapter (Phase 5).

**Rationale**:
- Replacing provisioning types would break a production-grade 7-step saga with proven retry, compensation, and audit behavior (violates LD-04).
- New admin domains should not be forced into provisioning-specific vocabulary.
- A projection adapter at the display boundary gives the operator console a unified view without disrupting backend persistence.
- This approach defers the replacement-vs-coexistence decision to Phase 7 when more domain data informs the choice.

**Alternatives rejected**:
- **Replace provisioning types** — too risky; breaks working production code for no immediate benefit.
- **Wrapper pattern** — adds indirection in the backend without clear value; projection at the display boundary is simpler.
- **No crosswalk** — later phases would re-argue the mapping ad hoc, creating inconsistency.

### P2-D07 — API contracts reuse existing backend patterns

**Decision**: The admin API contract catalog aligns with existing backend patterns: `IAdminApiResponse<T>` mirrors `successResponse`, `IAdminApiListResponse<T>` mirrors `listResponse`, `IAdminApiError` mirrors `errorResponse`. Phase 3 implementation uses existing `withAuth()`, `parseBody()`/`parseQuery()`, and response helper infrastructure.

**Rationale**:
- The backend already has proven middleware and response helpers. Inventing parallel patterns would create inconsistency and maintenance burden.
- Aligning DTOs with existing shapes means Phase 3 can adopt them without refactoring the helper layer.
- `requestId` propagation via X-Request-Id is already implemented and matches the `requestId` field in all response DTOs.

### P2-D08 — Preview/dry-run uses launch request with dryRun flag

**Decision**: Preview and dry-run use the same `IAdminRunLaunchRequest` with `dryRun: true` rather than a separate endpoint contract. The response type differs (`IAdminPreviewResponse` instead of `IAdminRunLaunchResponse`).

**Rationale**:
- The input for a preview is identical to a real launch — same action, same command payload, same target entity.
- A separate request type would duplicate fields and drift over time.
- The response is intentionally different because a preview produces an impact summary, not a run ID.

### P2-D09 — Checkpoint categories mapped to execution modes

**Decision**: 5 checkpoint categories (`pre-execution-approval`, `mid-execution-review`, `destructive-confirmation`, `external-event-wait`, `post-execution-validation`) are defined. Each execution mode has a fixed pattern of which categories it uses: seamless uses none, checkpointed uses mid-execution-review, destructive uses all three gates, advisory uses none.

**Rationale**:
- Fixed mode-to-checkpoint mapping prevents ad hoc checkpoint placement that would make execution behavior unpredictable.
- Separating categories allows different UX, timeout, and escalation behavior per category while keeping the lifecycle state machine uniform.
- Explicitly excluding checkpoints from seamless mode preserves LD-05 (provisioning stays straight-through).
- The `external-event-wait` category is separate because it resolves via incoming event, not operator decision, requiring different correlation and deduplication semantics.

### P2-D10 — Checkpoint decisions use idempotency keys for at-least-once tolerance

**Decision**: Every `IAdminCheckpointDecision` carries an `idempotencyKey` (UUID v4, caller-generated). The backend uses this key to deduplicate repeated submissions and reject conflicting decisions on the same checkpoint.

**Rationale**:
- Network retries, browser refreshes, and webhook replays can cause duplicate submissions.
- Without idempotency, a duplicate "approve" could resume a run twice or a duplicate "reject" could conflict with an already-processed "approve."
- Caller-generated keys (rather than server-generated) allow the client to safely retry without knowing whether the first attempt succeeded.

### P2-D11 — Audit, evidence, and config are separate record types with normalized references

**Decision**: Audit records, evidence payloads, and config snapshots are separate record types linked by references (IDs and storage locators), not embedded in each other. Audit records reference evidence and config by ID; evidence and config are stored in their own stores.

**Rationale**:
- Embedding large payloads (command inputs, step details, config values) in every audit record would bloat the audit store and make it slow to query.
- Separate stores allow independent retention policies, query patterns, and storage implementations.
- Normalized references support "what governed this run" queries without requiring full payload joins at audit query time.
- Storage locators are intentionally opaque strings to avoid locking Phase 2 contracts to a specific Phase 4/10 storage implementation.

### P2-D12 — Standards references track source (code-default, live-override, merged)

**Decision**: `IAdminStandardsReference` includes a `source` field distinguishing `'code-default'`, `'live-override'`, and `'merged'` origins. This directly supports the hybrid source-of-truth model required by LD-08.

**Rationale**:
- LD-08 requires hybrid repo/live control. Without tracking the source, operators cannot determine whether a standard was immutable code or an admin-maintained override.
- The `merged` source captures the effective state when both code defaults and live overrides contribute to the governing standard.
