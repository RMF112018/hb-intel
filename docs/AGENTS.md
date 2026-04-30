# HB Intel Docs Routing — Codex

## Primary rule

Do not edit architecture or planning docs until their classification is understood.

## Required starting sources

Use these first for docs work:

```text
docs/README.md
docs/architecture/blueprint/current-state-map.md
docs/reference/developer/documentation-authoring-standard.md
```

## Classification rules

Use the repo classification vocabulary:

- Canonical Current-State
- Canonical Normative Plan
- Historical Foundational
- Deferred Scope
- Superseded / Archived Reference
- Permanent Decision Rationale
- Living Reference / Diataxis

Current-state docs govern present truth. Normative plans govern active or approved future work. Historical, deferred, and superseded docs are context only unless the user explicitly activates them.

ADRs are append-oriented decision records. Do not rewrite durable decision history unless the task explicitly authorizes a correction.

## Plan-library guard

Do not create or update `docs/architecture/plans/**` unless the user explicitly requests a canonical plan-library change. Draft planning artifacts belong in the generated artifact package or another clearly scoped working location.

## Documentation style

- Keep docs concise and current.
- Do not copy long doctrine blocks into local docs.
- Link or point to canonical sources instead of duplicating them.
- Use package/app README files for local ownership, commands, entry points, and implementation notes.
- Use `docs/reference/**` for stable lookup material.
- Use `docs/how-to/**` for procedures.
- Use ADRs for durable decisions.

## Validation

For docs-only work, prefer:

- `git diff -- <changed docs>`
- `git status --short`
- `pnpm format:check` only when required by task scope or repo convention.

Do not run broad builds/tests for docs-only work unless the docs change affects generated docs, commands, tooling, or repo behavior.
