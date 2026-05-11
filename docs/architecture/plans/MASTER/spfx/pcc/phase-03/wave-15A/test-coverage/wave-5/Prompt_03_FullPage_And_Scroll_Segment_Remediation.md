# Prompt 03 — Remediate Full-Page and Scroll-Segment Evidence Semantics

## Role

You are my local code agent for `RMF112018/hb-intel`.

Your task is to fix the full-page and scroll-segment screenshot evidence semantics. The current evidence can pass while above-fold, full-page, and scroll-001 are exact duplicates.

## Objective

Make screenshot evidence truthful:

- `full-page` must either be a true meaningful full-page/active-surface capture or explicitly marked not applicable.
- `scroll-segment` must either show a meaningful visible movement or explicitly mark not-scrollable/not-applicable.
- Duplicate screenshot hashes must not pass as valid evidence unless the surface is proven non-scrollable and the duplicate is classified accordingly.

## Current Failure

The PCC 1.0.0.219 uploaded screenshots showed exact duplicate hashes for all three capture kinds on six of eight surfaces.

That is not acceptable evidence.

## Required Remediation

### 1. Separate document full-page from active-surface full-content

Determine which is meaningful per surface:

- document full-page;
- SharePoint canvas scroll;
- PCC shell scroll;
- active panel scroll;
- bento grid/content scroll.

If document full-page is not meaningful because document height equals viewport height, do not pretend it is a real full-page capture.

### 2. Add full-page applicability metadata

Every `full-page` artifact must include or derive:

```ts
fullPageCaptureMode: 'document-full-page' | 'surface-scroll-composite' | 'not-applicable';
fullPageNotApplicableReason?: string;
fullPageHeightDelta: number;
fullPageMeaningful: boolean;
```

If the PNG dimensions are exactly the same as above-fold and hash is identical, then:

- `fullPageMeaningful` must be false unless the surface is proven non-scrollable;
- the test must not count it as a meaningful full-page capture.

### 3. Add scroll-segment meaningfulness metadata

Every scroll segment must prove:

- requested scroll position;
- actual scroll position;
- visible hash/image changed unless classified not-scrollable;
- true scroll root was moved;
- resulting screenshot was captured after movement.

If the screenshot hash matches above-fold:

- classify as duplicate;
- add warning;
- fail focused surfaces unless not-scrollable is proven.

### 4. Stop generating misleading fake scroll evidence

If a surface is not scrollable:

Either:

- do not create `scroll-001`; instead write metadata that scroll capture is not applicable; or
- if keeping `scroll-001` for compatibility, classify it as `not-scrollable` and make the contact sheet/markdown state that it is not scroll proof.

Do not allow non-scrollable placeholder images to be interpreted as scroll evidence.

### 5. Add hard gates

The live screenshot test must fail if:

- Cost & Time has identical above-fold/full-page/scroll hashes without proven not-scrollable status.
- Systems Administration has identical above-fold/full-page/scroll hashes without proven not-scrollable status.
- Any scrollable surface has a duplicate scroll segment.
- No surface proves meaningful scroll preservation.
- `full-page` remains 1280x720 and identical to above-fold without a not-applicable reason.

## Required Output

Update:

- screenshot artifact types if needed;
- capture helper;
- evidence writer;
- screenshot spec;
- closeout/evidence markdown structure.

## Required Validation

Run:

```bash
git status --short
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
PCC_EXPECTED_PACKAGE_VERSION="1.0.0.219" PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-06-v1.0.0.219-screenshot-reliability-rerun" pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec prettier --check e2e/pcc-live/pcc-live.screenshot-capture.ts e2e/pcc-live/pcc-live.screenshot.spec.ts e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts e2e/pcc-live/pcc-live.screenshot.types.ts
git diff --check
```

## Required Final Response

Return:

```text
Summary:
- ...

Full-page semantics:
- ...

Scroll-segment semantics:
- ...

Duplicate hash behavior:
- ...

Files changed:
- ...

Validation:
- ...

Evidence path:
- ...

Commit recommendation:
- ...
```
