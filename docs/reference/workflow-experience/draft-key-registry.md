<!-- Tier 1 — Canonical Normative Plan -->

# Draft Key Registry — Project Setup Workflows

**Traceability:** W0-G3-T05 Session State, Draft, Save, and Resume Contract

---

## 1. Draft Key Table

| # | Key string | Surface | Stored shape | TTL | Created | Cleared |
|---|-----------|---------|-------------|-----|---------|---------|
| 1 | `project-setup-form-draft` | New-request wizard | `ISetupFormDraft` | 48 h | On first field edit | On successful submit or user discard |
| 2 | `project-setup-clarification-{requestId}` | Clarification-return wizard | `IClarificationDraft` | 168 h (7 days) | On clarification re-entry | On successful resubmission |
| 3 | `project-setup-controller-review-{requestId}` | Controller review surface | `IControllerReviewDraft` | 24 h | On first annotation or field edit | On successful review submission |

## 2. Auto-Save Specification

- **Debounce:** 1.5 seconds (`AUTO_SAVE_DEBOUNCE_MS = 1500`)
- **Persistence:** Full draft shape written to IndexedDB via `useAutoSaveDraft`
- **Backend sync:** None — drafts are local-only by design
- **Flush on unmount:** Pending saves flush immediately when the component unmounts

### Draft-Saved Feedback Rules

1. A "Draft saved" indicator should appear after each successful auto-save
2. The indicator must show the timestamp from `lastSavedAt`
3. The indicator must clear when the draft is explicitly discarded
4. The indicator must not appear during the debounce window (`isSavePending = true`)
5. If IndexedDB is unavailable, no indicator is shown (silent degradation)

## 3. Resume Decision Trees

### New Request (`mode = 'new-request'`)

```
Draft exists? ──yes──► decision: 'prompt-user'
                        → Surface shows resume prompt dialog
                        → User chooses: resume (load draft) or discard (fresh-start)
             ──no───► decision: 'fresh-start'
                        → Surface opens with empty form
```

### Clarification Return (`mode = 'clarification-return'`)

```
Always ──────────────► decision: 'auto-continue'
                        → Draft loaded automatically (if exists)
                        → Surface opens at first flagged step
```

### Controller Review (`mode = 'controller-review'`)

```
Always ──────────────► decision: 'auto-continue'
                        → Draft loaded automatically (if exists)
                        → Surface opens with in-progress annotations
```

## 4. Transient vs. Durable State

| State category | Storage | Lifetime | Example |
|---------------|---------|----------|---------|
| Draft field values | IndexedDB (local) | TTL-bounded | Form inputs, annotations |
| Step wizard statuses | IndexedDB (local) | TTL-bounded | Step completion state |
| Submitted requests | Backend API | Permanent | `IProjectSetupRequest` |
| Clarification items | Backend API | Permanent | `IRequestClarification` |

## 5. Failure & Degraded Behavior

| Scenario | Behavior |
|----------|----------|
| IndexedDB unavailable | Auto-save silently no-ops; no draft-saved indicator; form still works but without persistence |
| Mid-submission failure | Draft remains in IndexedDB; user can return and resume |
| Session expiry (TTL exceeded) | Draft is purged on next `purgeExpiredDrafts` call; user starts fresh |
| Browser storage cleared | Equivalent to TTL expiry; user starts fresh |

## 6. Cross-References

- [BIC Action Contract](./bic-action-contract.md)
- [Clarification Re-entry Spec](./clarification-reentry-spec.md)
- [Setup Notification Registrations](./setup-notification-registrations.md)
- [Setup Wizard Contract](./setup-wizard-contract.md)

---

**Source:** `packages/session-state/src/hooks/useAutoSaveDraft.ts`, `packages/features/estimating/src/project-setup/hooks/useProjectSetupDraft.ts`
