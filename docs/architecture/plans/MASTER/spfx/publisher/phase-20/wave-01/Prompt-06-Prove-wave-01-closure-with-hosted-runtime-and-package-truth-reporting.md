# Prompt-06 — Prove Wave 01 closure with hosted-runtime and package-truth reporting

## Objective

Compile the Wave 01 implementation work into a **credible closure package** that proves the supported Project Spotlight runtime is now more governed, more authoritative, and lower-friction in live use.

This prompt is not allowed to produce a vague success memo.
It must produce evidence.

## Why this matters

The prior package's closure prompt was too soft. Repo truth already contains stronger packaging and hosted-runtime proof seams for `hb-publisher`; Wave 01 closure must explicitly use them.

## Live repo authorities to inspect first

- every file changed by Prompts 01–05
- `apps/hb-publisher/package.json`
- `apps/hb-publisher/deployment/README.md`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `tools/build-spfx-package.ts`
- any targeted test files updated or added during Prompts 01–05
- `dist/sppkg/` outputs produced by the packaging run

## Required validation commands

Run the strongest relevant validation commands for the Publisher domain after implementation:

- `pnpm --filter @hbc/spfx-hb-publisher check-types`
- `pnpm --filter @hbc/spfx-hb-publisher test`
- `pnpm --filter @hbc/spfx-hb-publisher build`
- `npx tsx tools/build-spfx-package.ts --domain hb-publisher`

If any stronger, more targeted validation command becomes relevant due to your implementation changes, run it too.

## Required proof artifacts and evidence

At minimum, closure reporting must account for the Publisher domain's packaging/runtime outputs and prove the results are meaningful.

Explicitly inspect and report the relevant generated artifacts in `dist/sppkg/`, including where present:

- `hb-publisher.sppkg`
- `hb-publisher-shim-proof.json`
- `hb-publisher-package-truth-proof.json`
- `hb-publisher-hosted-deployment-plan.json`
- `hb-publisher-hosted-load-proof.json`

Do not simply state that the files exist. Explain what they prove.

## The closure report must explicitly cover

### 1. Governed asset acquisition
Prove whether the hosted runtime now passes and uses a concrete governed `searchAssets` seam, and identify the exact mount/provider path that makes that true.

### 2. Project identity contract hardening
State what brittle assumptions were removed or centralized and what contract now governs project lookup.

### 3. Defaults and assistance
Enumerate the safe defaults/assists added and prove that author-owned values are still preserved.

### 4. First-pass friction reduction
Identify the workflow/interaction changes that actually reduced first-pass burden.

### 5. Build, test, packaging, and hosted runtime evidence
Provide the concrete verification outcomes, not just “all good”.

### 6. Residuals
Call out any residual limitation plainly.
If a limitation remains because it is intentionally outside current Project Spotlight scope, say so directly.
If an in-scope item still failed, do not bury it.

## Closure-report quality bar

The report must be:

- concise but rigorous
- implementation-specific
- explicit about evidence sources
- honest about residuals
- strong enough that a reviewer can understand what changed and why the wave can be considered closed

## Prohibited outcomes

- no generic victory memo
- no hiding residuals in vague language
- no substituting “build passed” for runtime truth
- no claiming hosted-runtime closure without inspecting the actual generated proof artifacts
- no smuggling future-wave editorial ambitions into this report

## Final instruction to the code agent

Produce a closure report that can withstand scrutiny.
Wave 01 is only closed if the evidence shows that the supported Publisher runtime is now truly more governed, more authoritative, and lower-friction than before.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
