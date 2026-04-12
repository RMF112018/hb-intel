# Prompt 03 — Companion Action Ergonomics and Quick Triage

## Active finding
The companion’s moderation actions are too detail-panel dependent.

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
A governance queue should support rapid triage. Right now the queue mostly informs; the detail panel mostly acts. That click depth slows moderation and weakens the companion’s operational quality.

## In-scope footprint to start from
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/QueueRow.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/DetailPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- related runtime/action hooks under `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/`
- relevant CSS modules and shared action primitives

You must expand from these seed files to every directly and indirectly related file needed to fully close the finding.

## Required work
1. Identify the safe/common actions that should be reachable directly from the queue without forcing a detail-panel open every time.
2. Add row-level quick triage affordances with strong action clarity and good keyboard behavior.
3. Keep the detail panel for deeper or riskier workflows, but reduce unnecessary dependence on it.
4. Ensure the queue remains scannable and does not become visually noisy.
5. Revalidate selection, bulk actions, and focus order after the redesign.

## Non-negotiables
- Do not dump every possible action into the row.
- Do not make the queue visually chaotic.
- Do not break bulk approval, selection logic, or role/capability gating.
- Do not leave the detail panel and queue duplicating the same action set incoherently.

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
