# 11 — Documentation Classification Routing

## Primary Rule

Do not edit architecture or planning docs until their classification is understood.

## Required Sources

- `docs/README.md`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/developer/documentation-authoring-standard.md`

## Classes

Use the repo’s classification vocabulary:

- Canonical Current-State
- Canonical Normative Plan
- Historical Foundational
- Deferred Scope
- Superseded / Archived Reference
- Permanent Decision Rationale
- Living Reference / Diataxis

## Editing Rules

- Current-state docs govern present truth and must stay accurate.
- Normative plans govern active or approved future work.
- Historical docs should generally not be rewritten except to add classification/correction notes.
- Deferred docs must not be treated as active scope until reclassified.
- Superseded docs are context only.
- ADRs are append-oriented decision records.
- Living reference docs should be concise and current.

## Output

When doing docs work, state the classification and why the target can be edited.
