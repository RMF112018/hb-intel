# SF12-T07 — Reference Integrations: `@hbc/session-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`
**Decisions Applied:** D-09
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T06

> **Doc Classification:** Canonical Normative Plan — SF12-T07 integration reference task; sub-plan of `SF12-Session-State.md`.

---

## Objective

Provide canonical integration patterns for packages that require offline-safe draft/queue behavior.

---

## Required References

1. `@hbc/sharepoint-docs` upload queue integration
2. `@hbc/acknowledgment` offline acknowledgment queue integration
3. PH9b `useFormDraft` integration via `useDraft<T>`
4. `@hbc/workflow-handoff` draft persistence in composer flow

---

## Canonical Pattern: Queueing an Offline Operation

```typescript
const { queueOperation } = useSessionState();

queueOperation({
  type: 'upload',
  target: '/api/documents/upload',
  payload: {
    documentId,
    listId,
    contentBase64,
  },
  maxRetries: 5,
});
```

---

## Canonical Pattern: Form Draft Persistence

```typescript
const { value: savedDraft, save, clear } = useDraft<FormValues>(`scorecard:${scorecardId}`);
const [values, setValues] = useState(savedDraft ?? initialValues);

const onChange = (next: FormValues) => {
  setValues(next);
  save(next, 72);
};
```

---

## Verification Commands

```bash
rg -n "useDraft\(|queueOperation\(" packages
pnpm turbo run check-types --filter packages/sharepoint-docs...
pnpm turbo run check-types --filter packages/acknowledgment...
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF12-T07 completed: 2026-03-11

Hooks implemented (4 packages):
- @hbc/sharepoint-docs: useSessionUploadQueue (NEW) — queueOperation pattern for document uploads
- @hbc/acknowledgment: useOfflineQueue (REWRITE) — replaced stub with real session-state queueOperation integration
- @hbc/acknowledgment: useAcknowledgmentQueueReplay (REWRITE) — replaced stub with real queuedOperations filtering
- @hbc/query-hooks: useFormDraftPersisted (NEW) — IndexedDB-backed variant of useFormDraft via useDraft<T>
- @hbc/workflow-handoff: useComposerDraft (NEW) — persists composer context notes + recipient override via useDraft<T>

Barrel exports updated:
- packages/sharepoint-docs/src/index.ts — added useSessionUploadQueue + SessionUploadParams
- packages/workflow-handoff/src/hooks/index.ts — added useComposerDraft
- packages/query-hooks/src/stores/index.ts — added useFormDraftPersisted
- packages/query-hooks/src/index.ts — added useFormDraftPersisted to Zustand stores section

Tests (18 total):
- sharepoint-docs: 3 tests (enqueue shape, context passthrough, callback stability)
- acknowledgment: 3 tests (enqueue shape, has() true, has() false)
- acknowledgment: 4 tests (replayCount, isReplaying online+retried, offline, no-retry)
- query-hooks: 8 tests (draft undefined, save TTL 72, clear, hasDraft, submitWithDraftClear, disabled no-ops, restoreDraftValues, restoreIntoReset)
- workflow-handoff: 4 tests (null draft, save TTL 24, clear, existing draft)

Infrastructure:
- @hbc/session-state workspace dep added to all 4 packages
- vitest aliases added for @hbc/session-state and @hbc/session-state/testing in all 4 vitest configs
- acknowledgment vitest.config.ts: removed coverage exclusions for useOfflineQueue.ts and useAcknowledgmentQueueReplay.ts (no longer stubs)
- query-hooks: added vitest.config.ts, test scripts, testing devDependencies (was missing)

Verification: All 4 packages pass check-types ✓ and test ✓; session-state 91 tests pass ✓
Next: SF12-T08 (Testing Strategy)
-->
