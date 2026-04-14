# 02 - Workflow Logic Assessment

## Objective finding

The workflow logic is **partially coherent but not fully operationally complete**.

The implementation has a real state machine, a publish orchestrator, history logging, validation, preview, archive, and withdraw paths. That is materially better than a UI-only status toggle system.

However, several important lifecycle branches are either internally inconsistent or not fully wired to the real page/binding behavior.

---

## 1. State machine evaluation

### Defined transitions
- `draft -> review | archived | withdrawn`
- `review -> approved | draft | withdrawn`
- `approved -> scheduled | draft | withdrawn`
- `scheduled -> approved | withdrawn`
- `published -> archived | withdrawn`
- `archived -> withdrawn`
- `withdrawn -> terminal`

### Positive findings
- `published` is intentionally unreachable through generic UI transitions
- Publish is correctly treated as orchestrator-owned, not a simple state flip
- Archive and withdraw are treated as real operational flows, not just label changes

### Gaps
- `scheduled` has no actual publish fulfillment path
- No scheduler or due-date executor was found
- UI Publish action is enabled only when `WorkflowState === 'approved'`

### Conclusion
The state machine is conceptually valid, but **the scheduled branch is incomplete**.

---

## 2. Preview behavior vs publish behavior

### Positive findings
- Preview and publish use the same resolution stack:
  - article load
  - template resolution
  - team/media loading
  - page composition
  - validation
  - drift computation
- That is good architecture and reduces divergence risk

### Conclusion
Preview/publish parity is a strong part of the current design.

---

## 3. Publish path evaluation

### Positive findings
- Publish blocks on failed resolution
- Publish blocks on composition failure
- Publish blocks on validation failure
- Publish explicitly calls SharePoint page publish after create/update
- Publish writes binding row
- Publish back-syncs master article metadata
- Publish appends workflow history

### Major gaps
- The create vs republish decision does not flow strongly enough into page identity handling
- The page creation service updates by **page file name**, not by existing binding `PageId`
- The system therefore cannot guarantee that `inPlaceUpdate` actually means same-page update

### Conclusion
The publish path has the right stages, but one of the most important invariants — stable page identity on in-place republish — is not actually enforced.

---

## 4. Republish path evaluation

### Positive findings
- Explicit decision model exists:
  - `create`
  - `inPlaceUpdate`
  - `regenerate`
  - `blocked`
  - `noOp`
- Archived and withdrawn articles are blocked from implicit republish
- Drift signals are surfaced in preview and UI messaging

### Major gaps
- `templateKeyDrift -> regenerate` is defined in policy, but the implementation does not preserve prior binding lineage
- `shellVersionDrift` and `templateVersionDrift` return `inPlaceUpdate`, but the page service still operates by page name
- Slug/page-name drift can therefore break the in-place promise

### Conclusion
Republish logic is well-described but not fully enforced by the lower layers.

---

## 5. Archive / withdrawal handling

### Positive findings
- Archive/withdraw:
  - update master row state
  - suppress rollups
  - call `SavePageAsDraft` when a bound page exists
  - update binding row
  - append workflow history
- This is a meaningful operational flow, not just status decoration

### Gap
- Binding semantics are lossy because the destination-page list has only `draft/published/error/scheduled`
- Archive/withdraw end up represented indirectly through binding state + message text rather than through a dedicated lifecycle state on the binding row

### Conclusion
Archive/withdraw are reasonably implemented given the current schema, but the binding model is not semantically rich.

---

## 6. History recording

### Positive findings
- Generic state transitions append history
- Publish/republish append history
- Archive/withdraw append history

### Gap
- Failure after publish-history append is classified as `articleSync` in publishing errors instead of `historyAppend`

### Conclusion
History is present and useful, but failure reporting around it is not perfectly accurate.

---

## 7. Page binding drift / regeneration logic

### Positive findings
- Drift is explicitly modeled:
  - shell version drift
  - template key drift
  - template version drift

### Major gaps
- The code comments claim:
  - in-place update preserves `PageId` and `PageUrl`
  - regenerate supersedes prior binding
- The actual lower layers do not fully prove either guarantee

### Conclusion
This is the most important lifecycle integrity gap in the system.

---

## 8. Latent defects likely to appear only on specific branches

### A. Team-member save branch
Likely failure when saving rows because `PersonPrincipalId` is not resolved.

### B. Republish after slug/page-name drift
Likely duplicate-page or wrong-page update behavior.

### C. Milestone template path
Likely impossible to complete because milestone fields are validated but not exposed/persisted.

### D. Scheduled path
Likely operator dead end.

---

## Final workflow judgment

### Trustworthy today
- Draft/review/approved generic state handling
- Preview parity
- Basic publish stage ordering
- Archive/withdraw concept

### Not trustworthy today
- Scheduled publishing
- In-place republish identity preservation
- Regeneration lineage
- Team-member save/edit lifecycle
