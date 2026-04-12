# Prompt 05 — Assignee Resolution UX Upgrade

## Active finding
Reassignment/ownership UX is too raw for a premium governance surface.

This is the **only active remediation topic** for this prompt. Do not work on any other audit finding in parallel.

## Repo and branch
- Repo: `https://github.com/RMF112018/hb-intel.git`
- Branch: `main`

## Governing authority
Primary binding doctrine:
1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Supporting authority:
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`
- `apps/hb-webparts/.eslintrc.cjs`

## Mandatory working posture
- Treat this finding as unresolved until it is **fully closed**.
- Perform an **exhaustive scrub** of the complete repo-truth footprint associated with this finding.
- Do **not** apply superficial fixes.
- Do **not** stop when the most visible symptom improves.
- Do **not** re-read files that are still within your current context or memory.
- Preserve strong existing architecture unless this prompt explicitly directs structural replacement.
- Do not declare success until you can prove the defect is gone everywhere in the relevant footprint.

## Why this finding matters
The current email-plus-resolve interaction works, but it feels like an operator utility rather than a premium moderated workflow. The companion should not be weaker than the public composer in identity confidence and picker quality.

## In-scope footprint to start from
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/DetailPanel.tsx`
- any existing people-search / assignee-resolution utilities that can be legitimately reused
- relevant tests/harness fixtures

You must expand from these seed files to every directly and indirectly related file needed to fully close the finding.

## Required work
1. Replace the raw email resolution interaction with a governed assignee picker/search flow.
2. Surface identity confidence clearly: name, email, and photo where available.
3. Preserve the canonical resolution contract required by the underlying SharePoint writer/runtime.
4. Handle zero-match, multi-match, and failure paths cleanly.
5. Keep the experience host-safe and keyboard accessible.

## Non-negotiables
- Do not leave the final UX as a raw email text box plus lookup button.
- Do not create duplicate people-search logic if a governed shared seam can be reused appropriately.
- Do not weaken existing typed action contracts to get the UI in.

## Closure proof required before you stop
You must provide:
1. the full list of files touched
2. why each touched file was in scope
3. what stale / redundant / contradictory code was removed
4. what replaced it
5. what remains intentionally unchanged
6. why the original finding is now 100% closed in the audited footprint

## Deliverables
- code changes
- any necessary test/harness updates
- any necessary docs/comments updates
- a concise closure summary tied to the finding only
