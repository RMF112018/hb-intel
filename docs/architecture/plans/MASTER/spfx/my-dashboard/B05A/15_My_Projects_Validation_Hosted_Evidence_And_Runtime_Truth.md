# Prompt 15 — My Projects Validation, Hosted Evidence, and Runtime Truth

## Verdict
**FAIL (local matrix contains failing test suites) + OPERATOR-PENDING (tenant/hosted proof not executed in this run).**

## Branch / HEAD
- Branch: `main`
- HEAD: `bf96c48dd2cc832b5ff2b6e671666a6590639abb`

## Command Results Matrix

| Command | Exit Code | Outcome | Blocker Notes |
|---|---:|---|---|
| `pnpm --filter @hbc/models check-types` | 0 | PASS | None |
| `pnpm --filter @hbc/models test` | 0 | PASS | None |
| `pnpm --filter @hbc/functions check-types` | 0 | PASS | None |
| `pnpm --filter @hbc/functions test` | 1 | FAIL | Timeout in `src/hosts/my-work-read-model/read-models/my-work-read-model-provider-resolver.test.ts` (`preserves the project-links delegation across all modes`, 20000ms) |
| `pnpm --filter @hbc/spfx-my-dashboard check-types` | 0 | PASS | None |
| `pnpm --filter @hbc/spfx-my-dashboard lint` | 1 | FAIL | ESLint configuration missing in environment (`ESLint couldn't find a configuration file`) |
| `pnpm --filter @hbc/spfx-my-dashboard test` | 0 | PASS | None |
| `pnpm --filter @hbc/spfx-my-dashboard build` | 0 | PASS | None |
| `pnpm --filter @hbc/features-estimating check-types` | 0 | PASS | None |
| `pnpm --filter @hbc/features-estimating test` | 1 | FAIL | 3 failed suites from unresolved font asset import in `packages/ui-kit/dist/theme/fonts/index.js` (`./futura-lt-pro-book.otf`) |
| `pnpm --filter @hbc/spfx-project-setup build` | 0 | PASS | None |
| `pnpm --filter @hbc/spfx-project-setup test` | 1 | FAIL | 4 failed tests: `NewRequestPage.test.tsx`, `TeamStepBody.test.tsx` (2), `uiReviewProjectSetupClient.test.ts` |

## Static Verification Matrix

| Check | Status | Evidence |
|---|---|---|
| 14 canonical role fields + `procoreProject` present in schema/contracts/docs | VERIFIED | `rg -n "leadEstimatorUpns|warrantyManagerUpns|procoreProject" backend/functions/src packages/models/src docs/reference/sharepoint/list-schemas/hbcentral/lists` (hits in Projects contract/docs and Legacy Registry descriptor/docs) |
| `procoreProject?: 'Yes' \| 'No'` removed from active contracts | VERIFIED | `rg -n "procoreProject\\?: 'Yes' \\| 'No'|MatchStatus: 'matched'|MatchConfidence: 'high'|MatchMethod: 'no-match'" packages/models/src backend/functions/src/services/legacy-fallback` returned no Yes/No contract hit |
| Forced discovery writer override literals removed from implementation | VERIFIED | Same query produced no hits in `backend/functions/src/services/legacy-fallback`; only fixture-level fallback metadata (`fallbackMatchConfidence: 'high'`, `fallbackMatchMethod: 'no-match'`) remained under models fixtures |
| Project-links route/provider/client/model wiring exists | VERIFIED | `rg -n "my-work/me/project-links|getMyProjectLinks|MyProjectLinksReadModel" packages/models/src apps/my-dashboard/src backend/functions/src` |
| My Projects UI copy/actions/disclosure/empty/principal text exists | VERIFIED | `rg -n "My Projects|Open SharePoint Site|Open SharePoint Folder|SharePoint unavailable|Open Procore|Procore unavailable|View all My Projects|No assigned projects were found|We could not confirm your project assignment identity" apps/my-dashboard/src` |

## Package / Runtime Truth Matrix

| Artifact | Field | Value |
|---|---|---|
| `apps/my-dashboard/config/package-solution.json` | `solution.version` | `1.0.0.005` |
| `apps/my-dashboard/config/package-solution.json` | feature (`myDashboard`) version | `1.0.0.005` |
| `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json` | `version` | `1.0.0.005` |
| `apps/my-dashboard/config/package-solution.json` | API permission request | resource `HB SharePoint Creator`, scope `access_as_user` |

### Version movement assessment
- Prompt 15 performed no intentional version bumping.
- Worktree currently includes tracked modifications to:
  - `apps/my-dashboard/config/package-solution.json`
  - `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json`
- This run did not mutate those files; they are treated as pre-existing drift requiring operator/release-owner attribution.

## Tenant Provisioning / Backfill Proof Status
**TENANT PROOF OPERATOR-PENDING**

Not executed in this run:
- live schema provisioning verification,
- Projects backfill `--apply` proof,
- Legacy Registry mirror/backfill `--apply` proof,
- live tenant schema-read/write path proof refresh.

No additional operator-supplied tenant evidence was provided during this run.

## Hosted Evidence Status
**HOSTED EVIDENCE OPERATOR-PENDING**

Hosted SharePoint/UI capture not executed in this run for:
- ultrawide,
- desktop,
- standard laptop,
- tablet landscape,
- tablet portrait,
- phone portrait,
- short-height constrained state.

## Residual Blockers Before Prompt 16
1. Resolve `@hbc/functions` timeout failure in `my-work-read-model-provider-resolver.test.ts`.
2. Restore/provide ESLint config needed by `@hbc/spfx-my-dashboard lint` (or update lint command contract).
3. Resolve `@hbc/features-estimating test` font-asset import failures from `packages/ui-kit/dist/theme/fonts`.
4. Resolve `@hbc/spfx-project-setup test` failures (4 failing tests listed above).
5. Provide operator-run tenant proof bundle for provisioning/backfill apply gates.
6. Capture hosted evidence screenshots/videos across required breakpoints.

## Classification Summary
- Local static contract/wiring verification: **PASS**
- Local command matrix: **FAIL**
- Tenant mutation proof: **OPERATOR-PENDING**
- Hosted visual/runtime proof: **OPERATOR-PENDING**
