# Prompt-01 — Realign list descriptors and list-title bindings to the tenant `HB Article*` lists

Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Objective:
Replace the publisher list binding layer so every read/write targets the actual tenant list titles and no code still depends on the obsolete `Project Spotlight *` list set.

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
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageBindingWriter.ts`
- tests covering those seams

Required changes:
1. Replace the list-descriptor registry with the actual tenant list titles: `HB Articles`, `HB Article Team Members`, `HB Article Media`, `HB Article Template Registry`, `HB Article Destination Pages`, `HB Article Workflow History`, `HB Article Publishing Errors`, and `HB Article Promotion Rules` where applicable.
2. Preserve the app identity rebrand to **Article Publisher**. Do not undo or partially undo the rebrand.
3. Do not rename destination-specific `projectSpotlight` values that the rebranding report explicitly preserved.
4. Update repository and writer seams so they resolve the corrected list titles everywhere, including helper endpoints and tests.
5. Add or update tests so a title drift back to `Project Spotlight *` fails loudly.

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
- No publisher repository or writer references `Project Spotlight Posts`, `Project Spotlight Post Team Members`, `Project Spotlight Post Media`, `Project Spotlight Template Registry`, or `Project Spotlight Page Bindings`.
- All list-title reads/writes point at the tenant `HB Article*` titles.
- Typecheck passes for `@hbc/spfx-hb-webparts`.
- Relevant repository/writer tests pass.

Required final deliverables in your response:
1. Concise summary of exactly what changed
2. File-by-file change list
3. Verification performed and results
4. Any residual risks that are truly out of scope for this prompt
```
