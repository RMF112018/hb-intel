# Prompt-02 — Replace the master-record contract with a tenant-aligned `HB Articles` / `ArticleId` model

Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Objective:
Scrub the current `PublisherPostRow` / `PostId` master-record model and rebuild it around the actual `HB Articles` schema and `ArticleId` key.

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
- `publisherRowMappers.ts`
- `publisherWriters.ts`
- `publisherRepositories.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- tests

Required changes:
1. Replace the master contract with an `HB Articles`-aligned row/domain model keyed by `ArticleId`.
2. Use the actual tenant field names from the schema report, including the correct content, destination, page, sync, and publication fields.
3. Remove dependence on non-tenant master fields such as `PostId`, `PostFamily`, `PageShellKey`, `TargetSiteKey`, and `SourceTemplatePath` unless they are intentionally remapped to real tenant fields with explicit rationale.
4. Update row mappers, read filters, upsert logic, and authoring-surface state so they consume the new article model consistently.
5. Update tests so the master-record layer proves correct field names and rejects obsolete `Post*` assumptions.

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
- The master data model is keyed by `ArticleId`.
- The `HB Articles` repository reads and writes actual tenant field names only.
- The authoring surface loads and saves through the tenant-aligned article model.
- Tests cover read/write mapping for the real `HB Articles` schema.

Required final deliverables in your response:
1. Concise summary of exactly what changed
2. File-by-file change list
3. Verification performed and results
4. Any residual risks that are truly out of scope for this prompt
```
