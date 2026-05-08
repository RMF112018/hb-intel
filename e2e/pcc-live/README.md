# PCC Live SharePoint Playwright Lane (Prompt 01 Foundation)

## Purpose

This lane establishes a safe, opt-in Playwright harness for the Project Control Center (PCC) on a live SharePoint-hosted page.

## What Prompt 01 proves

- Live lane wiring exists with no local `webServer` dependency.
- Environment-gated, storageState-based execution with clear self-skip behavior.
- Minimal runtime smoke checks can detect PCC markers on the hosted page.

## What Prompt 01 does not prove

- Full evidence capture completion for EV-52 through EV-58.
- Final scorecard scoring or hard-stop pass status.
- Full screenshot, breakpoint, accessibility, or report pipelines.

## Required environment variables

- `PCC_LIVE_SITE_URL`
- `PCC_LIVE_PAGE_URL`
- `PCC_LIVE_STORAGE_STATE`
- `PCC_EVIDENCE_OUTPUT_DIR`
- `PCC_EXPECTED_PACKAGE_VERSION`

## Optional environment variables

- `PCC_LIVE_BRAVE_EXECUTABLE_PATH`
- `PCC_LIVE_EDIT_PAGE_URL`
- `PCC_LIVE_UNAUTHORIZED_STORAGE_STATE`
- `PCC_LIVE_UNAUTHORIZED_PAGE_URL`
- `PCC_LIVE_ENABLE_CONDITIONAL`

## Tenant target example

- Site: `https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject`
- Page: `https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/<actual-page>.aspx`

## Safe storageState capture

```bash
pnpm exec playwright codegen "$PCC_LIVE_PAGE_URL" --save-storage "$HOME/.config/hbc/pcc-live-storageState.json"
```

Store auth state outside the repo (prefer `$HOME/.config/hbc/`). Rotate periodically. Never paste storageState contents into chat, tickets, or docs.

## Commands

```bash
pnpm pcc:e2e:live:list
pnpm pcc:e2e:live
```

## Prompt 03 focused closeout sequence

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
```

## Optional Brave parity

Set `PCC_LIVE_BRAVE_EXECUTABLE_PATH` to enable the conditional `brave-optional` project.

## No-tenant-mutation rules

Do not script save/submit/approve/reject/delete/provision/sync actions in this lane. Prompt 01 is runtime harness only.

## Artifact policy

Preferred curated evidence path (repo-visible):

- `docs/architecture/evidence/pcc-live/<run-id>/`

Commit-eligible after operator review/scrub:

- evidence manifests
- markdown reports
- JSON summaries
- sanitized console/page-error summaries
- screenshot inventories
- scrubbed screenshots (operator-approved)

Never commit (local-only or sensitive):

- Playwright storageState files
- tenant cookies/session data
- raw traces/videos containing auth/session or tenant-sensitive data
- raw `test-results/`
- raw `playwright-report/`
- unsanitized console dumps
- any files containing secrets, tokens, cookies, personal data, or tenant auth context

## CI posture

This lane is opt-in only and is not required in default CI/test pipelines.

## Troubleshooting

- Missing env: lane self-skips with missing variable names.
- Missing storageState: lane self-skips with file-missing message.
- Wrong page URL: smoke test fails with clear instruction to update `PCC_LIVE_PAGE_URL`.
- Web part not installed: tab-marker test self-skips when `[data-pcc-tab-id]` is absent.
- Expired auth/session: refresh storageState and retry.
- Redirect/sign-in loops: verify authenticated storageState and correct tenant/page URL.

## EV / scorecard impact

Prompt 01 provides harness foundation only for future EV-52 through EV-58 evidence collection and future HS-08/HS-09 review. No EV item is marked captured by this prompt alone.

## Prompt 02 registry and manifest

Prompt 02 adds a typed EV registry and deterministic manifest/summary writer for traceability coverage (`EV-37..EV-106`, `EV-125..EV-134`).

- Registry purpose: define required evidence contracts and status posture without claiming final scoring.
- Manifest writer purpose: emit reproducible JSON/markdown traceability outputs for operator-reviewed curated evidence.
- Preferred curated evidence output path: `docs/architecture/evidence/pcc-live/<run-id>/`.
- This output is evidence traceability only and not a final 100-point scorecard result.

Run registry validation:

```bash
pnpm pcc:e2e:evidence:registry
```

## Prompt 04 surface smoke and baseline EV evidence

Prompt 04 adds a safe surface page object and live navigation smoke for all eight PCC surfaces:

- `project-home`
- `team-and-access`
- `documents`
- `project-readiness`
- `approvals`
- `external-systems`
- `control-center-settings`
- `site-health`

Safe navigation rule: tab navigation is limited to controls that are `role="tab"`, `data-pcc-tab-id="<surface-id>"`, and `type="button"`.

Prompt 04 baseline evidence scope supports EV-52 and EV-55 only (operator-review pending).

Evidence outputs written under `PCC_EVIDENCE_OUTPUT_DIR`:

- `pcc-live-surface-smoke.json`
- `pcc-live-surface-smoke.md`

Run-state metadata is included (`selfSkipped`, `runState`) so auditors can distinguish self-skipped vs completed live runs vs local writer-only runs.

Run command:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
```

Do not commit live evidence outputs until operator review/scrubbing is complete. Never commit storageState/auth/session files or raw Playwright artifacts.

This is baseline runtime traceability only and not a final scorecard result.

## Prompt 05 screenshots and DOM summaries

Prompt 05 adds opt-in screenshot and DOM summary tooling for initial evidence support:

- screenshot kinds: above-fold, full-page, scroll-segment;
- DOM summaries persist only `data-pcc-*` attributes plus short sanitized heading/aria-label fallback;
- initial EV support scope: `EV-37..EV-49` and `EV-125..EV-134`.

Artifacts are written under `PCC_EVIDENCE_OUTPUT_DIR` in a run folder:

- `pcc-live-screenshot-evidence.json`
- `pcc-live-screenshot-evidence.md`
- `pcc-live-screenshot-inventory.json`
- `pcc-live-dom-card-summary.json`
- `screenshot-contact-sheet.md`
- `screenshot-manifest-by-ev.json`
- `first-screen-review-index.md`
- `screenshots/*.png`

Policy boundary:

- screenshot PNG files are operator-review required and not auto-commit eligible;
- JSON/markdown metadata is commit-eligible only after review/scrubbing;
- raw Playwright outputs are never-commit.

Run command:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
```

This is evidence collection and traceability support only; it is not a final scorecard result.
Screenshot contact sheet / manifest / first-screen index are closeout support only and are not scoring authority.
