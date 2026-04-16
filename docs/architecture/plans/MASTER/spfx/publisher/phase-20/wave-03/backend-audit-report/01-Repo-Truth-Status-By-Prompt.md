# 01 — Repo-Truth Status by Prior Prompt

## Prompt 01 — dirty draft publish gap

### Status
**Still open, but narrower than the prior package described.**

### Why
The live repo already tracks dirty state, offers `Save and refresh preview`, and resets a clean baseline after save/publish. But Publish and Republish still remain tied to readiness logic that does not consider dirty-state truth, while `handlePublishAction` still invokes the orchestrator directly against saved state.

### Audit conclusion
The prior prompt was directionally right, but under-described the partial mitigation already present. The rebuilt prompt must target the remaining stale-publish seam precisely.

---

## Prompt 02 — unknown `RequiredFieldSetKey` fail-open

### Status
**Still open.**

### Why
The validation engine still treats unknown required-field-set keys as warning-only and falls back to global rules. The repo has intentionally blocked milestone legacy publish/republish, but that does not close the operational-template fail-open seam.

### Audit conclusion
The rebuilt prompt must explicitly distinguish:
- operational template contract failures
- legacy non-operational milestone behavior
- readiness/preflight/save implications

---

## Prompt 03 — silent mapper/repository row rejection

### Status
**Still open.**

### Why
Row mappers still reject malformed data by returning `undefined`, and repository reads still filter away rejected rows without carrying structured diagnostics through the read path.

### Audit conclusion
The rebuilt prompt must require a coherent diagnostic model rather than generic “surface it better” language.

---

## Prompt 04 — key governance and duplicate protection

### Status
**Still open.**

### Why
Critical reads and writes still rely on first-match text keys, while the checked-in schema report does not prove custom indexing or unique-value enforcement for the relevant key columns.

### Audit conclusion
The rebuilt prompt must explicitly force the code agent to locate or create authoritative schema ownership for key enforcement and to add duplicate fail-closed behavior in code.

---

## Prompt 05 — binding lineage structure

### Status
**Still open, but partially improved.**

### Why
The current orchestrator already captures `supersededBinding` and writes it into workflow-history note text. That is better than before, but the durable record is still too dependent on freeform note text.

### Audit conclusion
The rebuilt prompt must preserve the one-row authoritative current-binding model while replacing note-only lineage with structured lineage fields or an equivalent bounded structure.

---

## Newly added Prompt 06 — publishing-error operability

### Status
**New required prompt.**

### Why
The prior package left this as a low-priority note, but repo truth shows a real structured-data gap: the `HB Article Publishing Errors` list is still too coarse, and detailed failure classification still relies too heavily on Title/ErrorSummary prose.

### Audit conclusion
This should now be treated as required backend closure work because it materially affects supportability and failure truthfulness.
