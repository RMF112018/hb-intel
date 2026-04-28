# Prompt 04 — Tests, Package, and Hosted Proof

## Objective

Complete evidence-backed closure for the Leadership Message reader rescue. Add final tests, run package proof, validate the hosted result, and document screenshots and package truth.

Do not re-read files that are still within your current context or memory unless needed to verify repo truth or resolve a contradiction.

## Files to inspect

```text
packages/foleon-reader/src/readers/__tests__/**
apps/hb-homepage/config/package-solution.json
apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
packages/homepage-launcher/src/constants.ts
tools/build-spfx-package.ts
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/12_TEST_AND_PACKAGE_PROOF_PLAN.md
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/13_FINAL_ACCEPTANCE_CRITERIA.md
```

## Files likely to change

```text
packages/foleon-reader/src/readers/__tests__/LeadershipMessageReaderLayout.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
apps/hb-homepage/config/package-solution.json
apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
packages/homepage-launcher/src/constants.ts
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/evidence/**
```

Only update versions if the package policy requires it for deployment.

## Guardrails

- Do not accept a package just because build passes.
- Prove source truth made it into the `.sppkg`.
- Do not skip hosted validation.
- Do not ignore SharePoint cache/stale bundle risk.
- Do not regress sibling lanes.

## Required validation commands

```bash
git status --short
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Adjust package filters only if repo truth shows different package names.

## Hosted screenshots required

Capture:

- homepage row where Leadership Message appears;
- Leadership Message live state;
- preview/sample state;
- no live message state;
- blocked/unavailable state;
- mobile/narrow state;
- full-window viewer launch;
- focus return after viewer close;
- SharePoint edit mode;
- 100% zoom;
- 75% zoom;
- short-height condition.

## Package proof requirements

Document:

- package filename/path;
- package version;
- manifest version;
- webpart version;
- SHA/checksum;
- grep for new copy strings in packaged JS;
- grep that forbidden old strings are absent from packaged JS, except docs/tests if applicable.

## Evidence files

Create:

```text
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/evidence/HOSTED_SCREENSHOT_INDEX.md
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/evidence/PACKAGE_PROOF.md
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/evidence/TEST_OUTPUT.md
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/evidence/FORBIDDEN_COPY_SCAN.md
```

## Acceptance criteria

- All required commands pass or any blocked command has a precise documented environment reason.
- Package proof demonstrates updated source is included.
- Hosted screenshots demonstrate the visual change.
- No forbidden strings in hosted runtime.
- Viewer launch works.
- Focus return works.
- Sibling lanes are visually and functionally stable.
- Final scorecard target: 48+/56, no hard-stop failures.

## Commit message

```text
Foleon reader: prove Leadership Message rescue package and hosted behavior

Completes test, package, and hosted validation proof for the Leadership Message reader rescue, including forbidden-copy coverage, package-truth evidence, screenshot matrix, and final acceptance documentation.
```
