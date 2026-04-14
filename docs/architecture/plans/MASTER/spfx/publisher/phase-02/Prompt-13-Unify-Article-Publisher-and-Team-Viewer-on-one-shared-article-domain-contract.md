# Prompt-13 — Unify Article Publisher and Team Viewer on one shared article-domain contract

Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Objective:
Eliminate the split-brain integration where Team Viewer understands `HB Article*` data but the publisher-side adapter still emits a competing model.

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
- `teamViewerAdapter.ts`
- `apps/hb-webparts/src/webparts/teamViewer/data/teamViewerListRegistry.ts`
- `apps/hb-webparts/src/webparts/teamViewer/data/teamViewerListSource.ts`
- `publisherAdapter/*`
- integration tests

Required changes:
1. Use one shared article-domain contract across the publisher and Team Viewer integration seam.
2. Keep the destination-specific `HB Article*` consumer behavior that already exists on the Team Viewer side.
3. Remove or adapt any publisher-side structures that still force Team Viewer through the obsolete `PostId` model.
4. Add focused integration tests proving the publisher and Team Viewer agree on keys and field semantics.

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
- Publisher and Team Viewer share one article-domain model.
- No integration seam requires mental translation between `PostId` and `ArticleId`.
- Integration tests pass.

Required final deliverables in your response:
1. Concise summary of exactly what changed
2. File-by-file change list
3. Verification performed and results
4. Any residual risks that are truly out of scope for this prompt
```
