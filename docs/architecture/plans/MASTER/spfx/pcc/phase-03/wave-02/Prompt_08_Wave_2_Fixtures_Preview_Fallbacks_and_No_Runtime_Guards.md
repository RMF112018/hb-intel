# Prompt 08 — Wave 2 Fixtures, Preview Fallbacks, and No-Runtime Guards

## Operating Instructions

You are executing this prompt in the live `RMF112018/hb-intel` repository. Treat the current repo as the source of truth. Do not assume files from memory are current. However, do not repeatedly re-read files that are still within your current context unless the file may have changed or the prompt specifically requires a freshness check.

Work to closure. Do not defer required analysis, do not ask broad clarification questions, and do not implement outside the allowed scope. If repo truth conflicts with this prompt, stop before code changes and document the conflict clearly.

## Objective

Harden the PCC shell frame with deterministic preview behavior, graceful fallback states, and source-scan tests that enforce Wave 2 boundaries.

## Required Preview/Fallback States

Implement standardized shell/card states for:

- loading;
- empty;
- error;
- missing configuration;
- fixture unavailable;
- unauthorized-persona display hint;
- preview-only mode;
- not-yet-implemented operation.

## Fixture Rules

- Prefer Wave 1 PCC fixtures from `@hbc/models/pcc`.
- App-local fixtures are allowed only for presentation gaps and must be deterministic, non-secret, and marked preview-only.
- No real tenant URLs. Use `example.invalid` or equivalent reserved/non-routable examples if URLs are needed.
- No real UPNs, tokens, API keys, client IDs, Procore identifiers, or secrets.

## No-Runtime Guards

Add tests/source scans to prove the PCC app does not include:

- `@pnp/*` live usage;
- Microsoft Graph client usage;
- Procore SDK/client/fetch path;
- backend route clients;
- SharePoint group/permission mutation calls;
- tenant mutation verbs;
- imports from homepage paired-row layout modules;
- direct imports from `apps/hb-webparts/src/webparts/hbHomepage/**`.

## Layout Guard

Add at least one test or static assertion that the Project Home card registry supports variable footprint/card spans and does not rely on fixed paired rows.

## Validation

Run package validation commands plus any new guard tests.

## Closeout

Create `Wave_2_Prompt_08_Closeout.md` documenting guard coverage and remaining acceptable preview limitations.
