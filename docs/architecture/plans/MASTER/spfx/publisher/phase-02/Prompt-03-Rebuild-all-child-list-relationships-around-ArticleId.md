# Prompt-03 — Rebuild all child-list relationships around `ArticleId`

Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Objective:
Replace every parent/child relationship that still keys off `PostId` so the tenant’s child rows are structurally tied to `ArticleId`.

Critical operating instruction:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Mandatory authority:
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md
- docs/architecture/plans/MASTER/spfx/publisher/architecture/publisher-rebranding-report.md
- /mnt/data/03-Findings-Register.md
- /mnt/data/04-Recommended-Remediation-Sequence.md

Working posture:
- This is a tightly bounded remediation task for one gap only.
- Do not redesign adjacent systems.
- Do not make unrelated refactors.
- Do not collapse this into a broader multi-gap rewrite.
- Preserve the Article Publisher rebrand.
- Preserve Project Spotlight as the current destination identity where the rebranding report explicitly says it remains valid.
- Treat the tenant list schema as the source of truth when code conflicts with prior assumptions.

Files to inspect first:
- `publisherContracts.ts`
- `publisherRepositories.ts`
- `publisherWriters.ts`
- `publisherRowMappers.ts`
- child-list tests

Required changes:
1. Rebuild team-member, media, binding, workflow-history, and publishing-error child contracts around `ArticleId`.
2. Update list filters, replace-all writers, and row mappers so every child list uses the tenant’s parent key and field names.
3. Keep relationship naming and semantics consistent across repositories, writers, and UI state.
4. Do not leave partial compatibility shims that allow both `PostId` and `ArticleId` unless explicitly required for a staged migration and proven necessary.

Implementation discipline:
- Scrub the full bounded seam for stale assumptions related to this gap.
- Update code, tests, and nearby comments only where required to close this gap cleanly.
- Keep behavior deterministic and testable.
- Where a prior abstraction is wrong for the tenant model, fix the abstraction rather than layering a fragile compatibility patch on top.
- Do not move on to any later remediation category until this one is fully closed.

Verification required:
- Run targeted tests for the changed seam.
- Run `pnpm --filter @hbc/spfx-hb-webparts check-types`.
- Add or update tests so this exact drift cannot silently regress.
- In your final report, explicitly prove the following exit criteria are satisfied:
- No child repository or child writer depends on `PostId`.
- Every child list filter and replace-all seam keys on `ArticleId`.
- Tests prove referential integrity against the tenant schema.

Required final deliverables in your response:
1. Concise summary of exactly what changed
2. File-by-file change list
3. Verification performed and results
4. Any residual risks that are truly out of scope for this prompt
```
