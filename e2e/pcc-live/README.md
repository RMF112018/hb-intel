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
