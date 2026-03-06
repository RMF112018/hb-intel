# ADR-0066: Audit, Retention, and Traceability

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.13 (Audit, Retention, and Traceability)
- **Related Plans:** `docs/architecture/plans/PH5.13-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.13 requires a structured, operationally useful audit trail for key authentication and access-governance actions. Locked Option C decisions require metadata-rich event capture, meaningful active history, an archive strategy for older events, and initial admin visibility without implementing full analytics or event-tiered retention in Phase 5.

## Decision

1. Add a centralized audit module in `packages/auth/src/audit/auditLogger.ts` with:
   - canonical event taxonomy for sign in/out, session restore success/failure, access denied, request lifecycle, override lifecycle, emergency usage, review flags, and admin access-state actions
   - required metadata per event (`eventId`, `eventType`, `occurredAt`, `actorId`, `subjectUserId`, `runtimeMode`, `source`, `correlationId`, optional request/override/feature/action context, `outcome`, structured `details`)
2. Keep the audit stream as centralized in-memory operational history for Phase 5 and expose typed helpers for record/create/seed/clear/sort.
3. Implement retention policy utilities with fixed Phase 5 defaults:
   - `180` days active history
   - indefinite archive strategy for older records
   - explicit policy field documenting future event-type tiering as deferred.
4. Integrate audit emission into:
   - auth lifecycle store/adapters (`sign-in`, `sign-out`, `session-restore-*`)
   - access-denied/request-submission path
   - override request/approval/renewal/emergency workflows
   - admin actions that mutate access-control state.
5. Provide basic admin operational visibility via retention-aware projection (`toAdminAuditOperationalVisibility`) with active/archived counts and recent events.

## Consequences

### Positive

- Audit coverage for Phase 5.13 required actions is explicit, typed, and testable.
- Operational teams get immediate retention-aware audit visibility in the initial admin scope.
- Metadata contract improves troubleshooting and governance traceability across auth/access workflows.

### Tradeoffs

- In-memory event stream is a Phase 5 operational baseline and not a long-term analytics store.
- Duplicate event fan-out can occur where repository events and centralized stream are merged; de-duplication is handled by event id in admin visibility helper.

## Rejected Alternatives

1. **Unstructured string logs only:** rejected because governance and troubleshooting require structured metadata.
2. **No archive strategy in Phase 5:** rejected due to locked Option C retention requirement.
3. **Full event-tier retention implementation now:** rejected because Phase 5 scope explicitly defers tiered retention while requiring documentation for future path.
4. **Advanced analytics dashboard in 5.13:** rejected because initial scope requires only basic operational visibility.

## Traceability

- `docs/architecture/plans/PH5.13-Auth-Shell-Plan.md` §5.13 items 1-4
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` locked Option C decisions for structured audit trail, meaningful retention + archive strategy, and basic admin operational visibility
- `docs/architecture/plans/PH5.12-Auth-Shell-Plan.md` workflow integration dependencies (approval/renewal/emergency lifecycle)
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- Decision alignment references retained in implementation comments: D-04, D-07, D-10, D-12
