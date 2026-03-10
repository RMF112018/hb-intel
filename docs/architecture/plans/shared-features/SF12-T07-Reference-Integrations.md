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
