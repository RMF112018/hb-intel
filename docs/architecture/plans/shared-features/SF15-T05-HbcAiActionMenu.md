# SF15-T05 — `HbcAiActionMenu`: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-01, D-05
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan — SF15-T05 action menu task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Implement action trigger and contextual action selection popover.

---

## Contract

```typescript
interface HbcAiActionMenuProps<T> {
  record: T;
  config: IAiAssistConfig<T>;
  resultPlacement?: 'sidebar' | 'modal' | 'inline';
}
```

Behavior:

- shows filtered actions only
- expert mode may show token estimate/metadata
- selecting action invokes `useAiAction`

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist test -- HbcAiActionMenu
pnpm --filter @hbc/ai-assist build
```
