# Prompt 04 — Strict Live Gates and Final Screenshot Reliability Closeout Rerun

## Role

You are my local code agent for `RMF112018/hb-intel`.

You have remediated horizontal clipping and full-page/scroll-segment evidence semantics. Your task is now to run the strict live evidence gate and produce a truthful closeout.

## Objective

Generate PCC 1.0.0.219 screenshot evidence that either passes all reliability gates or fails with explicit root-cause detail.

## Required Preflight

Run:

```bash
git status --short
git rev-parse HEAD
git log --oneline -8
PCC_EXPECTED_PACKAGE_VERSION="1.0.0.219" pnpm exec tsx -e "import { resolvePccLiveEnv } from './e2e/pcc-live/pcc-live.env.ts'; console.log(JSON.stringify(resolvePccLiveEnv(), null, 2));"
python3 - <<'PY'
import json
for f in ["apps/project-control-center/config/package-solution.json", "tools/spfx-shell/config/package-solution.json"]:
    p=json.load(open(f))
    print(f, "solution", p["solution"]["version"], "features", [x.get("version") for x in p["solution"].get("features", [])])
PY
```

The resolver must report `ready`.

## Required Test Run

```bash
PCC_EXPECTED_PACKAGE_VERSION="1.0.0.219" PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-06-v1.0.0.219-screenshot-reliability-rerun" pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
```

## Required JSON Hard Gates

After evidence is generated, run a deterministic JSON checker.

Fail if any of the following are true:

1. Fewer than 8 surfaces are present.
2. Cost & Time has any left clipping warning or negative relevant left bound.
3. Systems Administration has any left clipping warning or negative relevant left bound.
4. No meaningful scroll segment exists across the evidence set.
5. Any scrollable surface has above-fold/full-page/scroll all exact duplicates.
6. A duplicate scroll segment is classified as meaningful.
7. Full-page is identical to above-fold without an explicit not-applicable reason.
8. Any actual-scroll-mismatch exists.
9. Any raw/auth/sensitive artifact path is emitted.
10. Screenshot visual review is not completed.

## Required Focused Operator Screenshot Review

Open and review at minimum:

- Cost & Time above-fold
- Cost & Time full-page
- Cost & Time scroll segment
- Systems Administration above-fold
- Systems Administration full-page
- Systems Administration scroll segment
- Project Home above-fold
- Document Control above-fold

The closeout must state:

- no Cost & Time left clipping observed / observed;
- no Systems Administration left clipping observed / observed;
- whether full-page is meaningful or not applicable;
- whether scroll segment is meaningful or not applicable;
- whether native SharePoint assistant appears and is classified as environmental overlay;
- whether sensitive data appears.

## Required Closeout

Update or create:

```text
docs/architecture/evidence/pcc-live/phase-06-v1.0.0.219-screenshot-reliability-rerun/SCREENSHOT_CAPTURE_RELIABILITY_CLOSEOUT.md
```

Conclusion must be one of:

- PASS
- PASS WITH OPERATOR-PENDING
- FAIL
- BLOCKED

Do not use PASS unless all hard gates pass and focused screenshot review is complete.

## Required Commit Hygiene

Stage only:

- approved source/test files changed by remediation;
- generated evidence root after scrub/operator review;
- closeout markdown.

Never stage:

- trace/video/HAR/storageState/auth/cookies/tokens;
- raw `test-results` or `playwright-report`;
- unrelated evidence dirs;
- unrelated Phase 07 files.

## Final Response

Return:

```text
Summary:
- ...

Reliability verdict:
- ...

JSON hard gates:
- ...

Focused screenshot review:
- ...

Evidence root:
- ...

Files changed:
- ...

Git status:
- ...

Commit summary:
- ...

Commit description:
- ...
```
