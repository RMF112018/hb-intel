# SF13-T07 — Reference Integrations: `@hbc/project-canvas`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-13-Shared-Feature-Project-Canvas.md`
**Decisions Applied:** D-02, D-09
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** T06

> **Doc Classification:** Canonical Normative Plan — SF13-T07 integration reference task; sub-plan of `SF13-Project-Canvas.md`.

---

## Objective

Provide canonical tile wiring references and role default mappings.

---

## Required References

- `BicMyItemsTile` (`@hbc/bic-next-move`)
- `PendingApprovalsTile` (`@hbc/acknowledgment`)
- `DocumentActivityTile` (`@hbc/sharepoint-docs`)
- `WorkflowHandoffInboxTile` (`@hbc/workflow-handoff`)
- `RelatedItemsTile` (`@hbc/related-items`)
- `NotificationSummaryTile` (`@hbc/notification-intelligence`)

Include full role-default map for:

- Superintendent
- Project Manager
- Project Engineer
- Chief Estimator
- VP of Operations
- Director of Preconstruction

---

## Verification Commands

```bash
rg -n "TileRegistry\.register|defaultForRoles" packages
pnpm turbo run check-types --filter packages/project-hub...
```
