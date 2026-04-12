# Prompt 02 — Companion Workspace Structural Redesign

## Active finding
The companion moderation workspace is structurally underpowered and still reads as a conventional queue/card tool.

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
The governing doctrine prefers structural replacement over decorative refinement when a surface still reads as cautious enterprise UI. The companion is cleaner than before, but it is still compositionally conservative and leaves major product quality on the table.

## In-scope footprint to start from
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/QueueRow.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/DetailPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- any shared shell / layout seam required to implement a materially stronger triage workspace

You must expand from these seed files to every directly and indirectly related file needed to fully close the finding.

## Required work
1. Redesign the companion as a premium moderation workspace rather than a repeated-card queue.
2. Remove the generic-card/list feel from the primary queue region.
3. Introduce a clearer triage structure with stronger persistent context, stronger priority/status grammar, and better action visibility.
4. Make the rendered result feel intentionally productized, not merely tidied.
5. Preserve host-safe behavior and reuse strong existing shells where they are still correct.
6. Keep the new design practical for SharePoint-hosted widths and authoring constraints.

## Non-negotiables
- Do not do a tint pass on the existing queue and call it a redesign.
- Do not preserve the repeated generic-card posture if it still dominates the surface.
- Do not regress host-aware behavior, loading states, error states, or role-aware gating.
- Do not touch unrelated public-surface architecture in this prompt.

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
