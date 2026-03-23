# ADR-0122: Publish Workflow Shared Primitive Architecture

**Status:** Accepted
**Date:** 2026-03-23
**Package:** `@hbc/publish-workflow`
**Governing Plan:** `docs/architecture/plans/shared-features/SF25-Publish-Workflow.md`

## Context

Phase 3 modules (Reports, Subcontract Compliance) require governed publication lifecycles with readiness gates, approval flows, supersession chains, and revocation. SF25 defines `@hbc/publish-workflow` as the Tier-1 shared publication runtime.

## Decision

- **L-01:** Lifecycle runtime owned by primitive (draft→ready-for-review→approved-for-publish→publishing→published + superseded/revoked/failed)
- **L-02:** Always-visible panel policy across all complexity modes
- **L-03:** Readiness/approval rules as deterministic gates
- **L-04:** Offline resilience via versioned-record + Background Sync
- **L-05:** AI inline actions with citation + explicit approval
- **L-06:** Supersession chain traceability, 5 publish KPIs

### Architecture

- UI (HbcPublishPanel, PublishTargetSelector, PublishApprovalChecklist, PublishReceiptCard) in `@hbc/ui-kit`
- 31 tests at 100%/97%/100% coverage

## Related

- [SF25-Publish-Workflow.md](../../plans/shared-features/SF25-Publish-Workflow.md)
- [publish-workflow-adoption-guide.md](../../how-to/developer/publish-workflow-adoption-guide.md)
- [api.md](../../reference/publish-workflow/api.md)
