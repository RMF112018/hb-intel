# Future-Wave Handoff, Risk Exposure, and Standards Alignment

## 7. Future-Wave Handoff Notes

### Wave 9 — Project Lifecycle Readiness Center

Wave 9 should consume Wave 8 framework contracts and implement the lifecycle readiness/checklist module using the existing startup, safety, and closeout checklist-definition files. Wave 9 should not re-create the framework vocabulary unless Wave 8 left a documented gap.

Wave 9 likely implementation areas:

- template item library seeded from Startup/Safety/Closeout definitions;
- project item instance state;
- source lineage to PDFs/checklist-definition files;
- role/action matrix;
- evidence policies;
- gate scoring/posture;
- safety recurring inspection posture;
- closeout-from-day-one views;
- item detail drawer;
- checklist-family-specific views/lenses;
- Priority Actions read-model integration;
- Approvals/Checkpoints posture.

### Wave 10 — Permit Log

Consume Wave 8 domains/gates/source-module vocabulary for permit/AHJ readiness signals. Permit detail ownership stays in Wave 10.

### Wave 11 — Responsibility Matrix / RACI

Consume Wave 8 ownership/accountability patterns, but implement RACI-specific rows, seeded responsibilities, editable assignments, and role authority in Wave 11.

### Wave 12 — Constraints Log

Consume Wave 8 blocker/dependency/severity posture, but implement constraint-specific workflows in Wave 12.

### Wave 13 — Buyout Log

Consume Wave 8 procurement/buyout readiness domain, but implement buyout detail in Wave 13.

### Wave 14 — Approvals / Checkpoints

Consume Wave 8 approval/acknowledgement posture, but implement execution of approval queues/checkpoints in Wave 14.

---

## 8. Risk Exposure

| Risk | Exposure | Mitigation in this package |
| --- | --- | --- |
| Wave 8 scope-lock currently excludes runtime implementation | Source work may violate docs | Prompt 01 authorization gate required before code |
| Wave 8 accidentally becomes Wave 9 checklist module | Scope creep and wrong UX | Strict no-checklist-library rule; Wave 9 handoff preserved |
| Readiness score hides blockers | Unsafe misleading posture | Blocker-first posture; confidence separate from completion |
| Evidence storage boundary blurred | Duplicates Document Control ownership | Evidence references only; Document Control remains source-of-record |
| Backend route addition breaks exact route-count tests | Test failure | Prompt 03 explicitly updates eight-route tests to nine |
| SPFx backend mode becomes default | Runtime risk | Prompt 04/05 preserve fixture-first default and opt-in backend path |
| Product copy implies executable workflow | User confusion | Required product-safe copy and inert/disabled affordances |
| Package/lockfile churn | Repo instability | No package/dependency edits allowed |
| Graph/SharePoint runtime sneaks in | Tenant/security/performance risk | Explicit forbidden imports/calls and guardrail tests |

---

## 9. Standards / Best Practices Alignment

Wave 8 implementation must align to:

- repo-truth-first execution;
- explicit prompt-level scope;
- deterministic fixtures;
- read-only envelope semantics;
- no broad `git add .`;
- explicit path staging;
- no package/lockfile churn;
- no live tenant mutation;
- no direct runtime integrations;
- SPFx fixture-first default behavior;
- PCC bento/card layout patterns;
- source/degraded-state product-safe copy;
- Wave 9–14 downstream ownership boundaries;
- construction-readiness practices informed by OSHA, CII, CMAA/AIA, and Microsoft governance guidance.
