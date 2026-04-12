# Prompt 01 — Doctrine / Token Closure

## Active finding
Doctrine/token closure gap in ordinary HB Kudos webpart source.

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
The repo’s own benchmark says ordinary homepage webpart CSS modules must not retain raw color/geometry/elevation literals. The current public and companion CSS modules still do. Until this is fixed, the implementation is not honestly benchmark-grade.

## In-scope footprint to start from
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- any other CSS module / token bridge / variant seam required to fully close literal drift

You must expand from these seed files to every directly and indirectly related file needed to fully close the finding.

## Required work
1. Trace every raw color literal, raw rgba literal, raw spacing/radius/elevation/transition px literal, and any equivalent unguided presentation value in the audited Kudos webpart family.
2. Distinguish between:
   - sanctioned runtime-measured inline values
   - sanctioned local token-seam exceptions
   - non-compliant ordinary-source literals
3. Eliminate the non-compliant literals from ordinary source.
4. Formalize the local token/alias seam as needed so the CSS modules read from governed custom properties rather than ad hoc literals.
5. Keep the public surface architecture intact; this prompt is about doctrine closure, not redesign.
6. Update any benchmark-facing comments if they currently overstate closure.

## Non-negotiables
- Do not only replace the two obvious hex values in `companion.module.css`.
- Do not leave raw px-based elevation/geometry drift scattered through ordinary source.
- Do not widen the local token seam sloppily; keep it disciplined and comprehensible.
- Do not move values around cosmetically and call that closure.

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
