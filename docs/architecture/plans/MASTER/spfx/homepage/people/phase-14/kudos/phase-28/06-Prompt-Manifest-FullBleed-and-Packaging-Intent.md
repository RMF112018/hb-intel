# Prompt 06 — Manifest, Full-Bleed, and Packaging Intent

## Active finding
Manifest/full-bleed posture is not convincingly aligned with actual product role.

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
Packaging intent is part of doctrine, not an afterthought. The current manifests suggest either unexplained intent drift or unreviewed leftovers.

## In-scope footprint to start from
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- any adjacent manifest/version/package seams required to complete the decision cleanly

You must expand from these seed files to every directly and indirectly related file needed to fully close the finding.

## Required work
1. Audit whether `supportsFullBleed` is actually justified for the companion.
2. Audit whether the public surface should remain as-is or explicitly support a wider placement mode.
3. Make the manifest posture match intentional product placement.
4. Bump versions as appropriate for material changes.
5. Document the reasoning inline or in adjacent package notes if needed.

## Non-negotiables
- Do not change manifest flags casually.
- Do not leave the package in an ambiguous “maybe full-bleed, maybe not” state.
- Do not ignore SharePoint packaging/version discipline.

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
