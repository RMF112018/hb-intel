# Prompt 04 — Render Path and Authoring Gap Closure

## Objective

Close the remaining non-pipeline gaps most likely to slow diagnosis or successful deployment of the PnP Operations webpart after package upload, with emphasis on render diagnostics and configuration authoring.

## Prompt

```text
You are now closing the remaining practical gaps around PnP Operations renderability and deployment readiness.

Primary paths:
- `apps/hb-webparts/src/webparts/pnp/`
- `apps/hb-webparts/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- any directly related property/config plumbing

Important working rule:
- Do not re-read files that are still within your active context or memory window unless needed for precision.

Known problem context:
A webpart can appear selectable/placeable, yet still fail to render meaningfully at runtime. The pipeline fixes are necessary, but not sufficient if runtime diagnostics and authoring/config surfaces remain weak.

Your job:
1. Audit the current PnP Ops render path from ShellWebPart -> mount -> PnpOps
2. Strengthen diagnostics so a failing page provides fast, actionable evidence
3. Audit whether PnP Ops has an adequate property/config authoring surface for real SharePoint deployment
4. Close any obvious gaps that make configuration fragile, implicit, or hidden
5. Review whether `hiddenFromToolbox` is intentional and still correct for the desired deployment/testing model
6. Tighten validation/guardrails around execution modes and runner URL assumptions where clearly warranted
7. Preserve legacy compatibility only where it remains deliberate and controlled

Required outputs:
1. Implemented code changes
2. A markdown note at:
   - `docs/architecture/reviews/pnp-ops-render-and-authoring-gap-closure.md`

That note must include:
- render path findings
- diagnostics improved
- authoring/config gaps closed
- any deliberate non-fixes and why
- any follow-up still required in tenant runtime validation

Preferred changes:
- clearer ShellWebPart failure telemetry
- clearer PnpOps runtime banners/errors when config is incomplete
- property-pane support for PnP-relevant fields if that is the correct repo-consistent approach
- tighter local/remote runner URL guardrails if current validation is too permissive

Do not make cosmetic-only changes. Prioritize faster isolation of actual runtime failures and safer deployment configuration.
```
