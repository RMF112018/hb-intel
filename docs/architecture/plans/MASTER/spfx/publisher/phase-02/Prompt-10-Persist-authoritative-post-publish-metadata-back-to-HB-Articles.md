# Prompt-10 — Persist authoritative post-publish metadata back to `HB Articles`

Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Objective:
Ensure the master article record is updated after successful publish/republish/regenerate so `HB Articles` stays synchronized with the destination page.

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
- `publishOrchestrator.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- master-row tests

Required changes:
1. After successful publish/republish/regenerate, persist authoritative destination metadata back to `HB Articles`.
2. Update the correct tenant fields for page URL, page ID/name, publish/sync status, page template information, render version, last sync date, and other materially correct destination metadata.
3. Keep this update tenant-aligned and do not write obsolete non-tenant fields.
4. Add tests that prove the master article row is updated only on successful downstream publish outcomes.

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
- Successful publish paths update `HB Articles` with tenant-aligned destination metadata.
- Failed publish paths do not falsely mark the master record as published/in-sync.
- Tests cover at least create and republish success cases.

Required final deliverables in your response:
1. Concise summary of exactly what changed
2. File-by-file change list
3. Verification performed and results
4. Any residual risks that are truly out of scope for this prompt
```
