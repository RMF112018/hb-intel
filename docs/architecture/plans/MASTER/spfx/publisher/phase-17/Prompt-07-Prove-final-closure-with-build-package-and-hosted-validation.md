# Prompt 07 — Prove final closure with build, package, and hosted validation

## Objective

Finish enhanced Wave 02 with explicit proof that the upgraded Publisher still builds, packages, mounts, and behaves correctly in its SharePoint-hosted SPFx posture.

This is a proof prompt, not a confidence prompt.
Assertions are not enough.

## Why this issue matters

Wave 02 is structural premiumization work.
That means it can easily regress:

- dependency health
- bundle behavior
- manifest expectations
- mount/runtime stability
- host-safe styling and interaction behavior
- packaging output

The live HB repo already has a strict packaging path.
Final closure has to prove the Publisher still survives that path after the Wave 02 changes.

## Governing authority / required references

- live repo implementation under `apps/hb-publisher/`
- `apps/hb-publisher/config/package-solution.json`
- `apps/hb-publisher/src/mount.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `tools/build-spfx-package.ts`
- any package / build scripts actually used to produce `hb-publisher.sppkg`

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/package.json`
- `apps/hb-publisher/config/package-solution.json`
- `apps/hb-publisher/src/mount.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `tools/build-spfx-package.ts`
- any generated proof artifacts or package outputs touched by the build path

Before editing or running final proof, inspect the actual scripts and package path rather than assuming how the repo builds.

## Current-state problem description

The prior Wave 02 proof prompt was directionally right but too loose.
It did not force a sufficiently concrete closure artifact set for a code agent.

This prompt closes that gap.

## Required implementation outcome

Produce final proof of closure for the Publisher wave.

At minimum:

1. run the relevant local lint / type / test / build steps for the seams you changed
2. run the repo’s actual SPFx package path for `hb-publisher`
3. confirm the stable runtime identity remains intact
4. confirm manifest intent still survives packaging
5. confirm the mounted runtime still resolves correctly after Wave 02 changes
6. record the evidence clearly enough for future review

## Dependencies / cross-surface considerations

This prompt assumes Prompts 01–06 are already closed.

Do not weaken the proof standard because the work “looks fine.”
If a proof step fails, fix the regression before declaring closure.

Be careful to verify, not merely restate:

- webpart GUID stability
- full-bleed manifest intent if still applicable
- package name / output path correctness
- mount global / runtime dispatch correctness
- any new dependency behavior that could affect bundling

## Validation / proof-of-closure requirements

Produce and document proof for all of the following:

- app build succeeds
- relevant tests succeed or are explicitly updated with passing evidence
- `hb-publisher.sppkg` still generates successfully
- manifest and runtime identity remain stable
- no premiumization change broke host-safe SPFx behavior
- final proof artifacts are documented clearly enough that another engineer can trust the closure claim

## Required closure artifacts

Produce a final closure note or markdown artifact that includes:

1. commands run
2. pass/fail results
3. location of the generated package artifact
4. runtime identity confirmation
5. manifest confirmation
6. any screenshots, host-validation notes, or local smoke-test notes required to support the claim

Do not close this prompt without explicit evidence.

## Deliverables / closure artifacts

Produce all code, tests, and documentation updates required for full closure of this prompt.
Also produce a concise closure note that records:

- what changed
- what was validated
- what directly-coupled issues had to be closed to finish honestly
- any remaining assumptions that are still materially relevant

## Non-negotiable change-control rule

Do **not** make unrelated changes.
Do **not** widen scope beyond what is necessary for honest closure of this prompt.
If you touch a directly-coupled seam, explain why it was necessary.
Do **not** move on until you can prove closure.
