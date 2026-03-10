# SF14-T02 — TypeScript Contracts: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-02, D-03, D-06
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan — SF14-T02 contracts task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Define public contracts for relationship definitions, related item summaries, direction model, and role visibility.

---

## Core Contracts

```typescript
export type RelationshipDirection =
  | 'originated'
  | 'converted-to'
  | 'has'
  | 'references'
  | 'blocks'
  | 'is-blocked-by';

export interface IRelationshipDefinition {
  sourceRecordType: string;
  targetRecordType: string;
  label: string;
  direction: RelationshipDirection;
  targetModule: string;
  resolveRelatedIds: (sourceRecord: unknown) => string[];
  buildTargetUrl: (targetRecordId: string) => string;
  visibleToRoles?: string[];
}

export interface IRelatedItem {
  recordType: string;
  recordId: string;
  label: string;
  status?: string;
  href: string;
  moduleIcon: string;
  relationship: RelationshipDirection;
  relationshipLabel: string;
  bicState?: IBicNextMoveState;
}
```

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items check-types
pnpm --filter @hbc/related-items build
```
