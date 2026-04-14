# Prompt-14 — Standardize terminology so app identity and destination identity do not drift

Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Objective:
Finish the ubiquitous-language scrub so the codebase clearly distinguishes the **Article Publisher** app identity from the current **Project Spotlight** destination identity and from the tenant’s article-domain vocabulary.

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
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `publisherContracts.ts`
- `publisherListDescriptors.ts`
- `publisherEnums.ts`
- nearby comments and tests

Required changes:
1. Standardize terminology around the tenant-authoritative article model.
2. Keep **Article Publisher** for the app identity, **Project Spotlight** for the current destination where materially correct, and tenant-authoritative `HB Article*` / `ArticleId` language for the data model.
3. Do not rename preserved destination-scoped values that the rebranding report intentionally left in place.
4. Limit this prompt to terminology cleanup after the functional seams are already corrected.

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
- App identity, destination identity, and tenant data-model terminology are clearly separated.
- Comments, contracts, and enums no longer obscure the boundary between the app and the destination.
- Typecheck still passes after the scrub.

Required final deliverables in your response:
1. Concise summary of exactly what changed
2. File-by-file change list
3. Verification performed and results
4. Any residual risks that are truly out of scope for this prompt
```
