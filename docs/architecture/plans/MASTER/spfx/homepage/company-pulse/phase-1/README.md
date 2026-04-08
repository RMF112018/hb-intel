# CompanyPulse Premium Newsroom — Remaining Waves Package

This package corrects the sequence based on the current execution state:

- **Completed:** Waves 00–03
- **Remaining:** Waves 04–06

Use this package **instead of** the previously issued continuation package that started at Wave 05.

## Why this replacement exists

Repo truth shows that `CompanyPulse` has already been rebuilt into a lead/secondary/tertiary newsroom composition, but the current implementation is still overly dependent on large inline style objects and local presentational wrappers. That is materially limiting the surface quality ceiling and preventing the webpart from becoming a truly premium, top-of-class newsroom module.

This package therefore starts with a **new Wave 04** that forces a premium surface-architecture remediation **before** hardening and package proof.

## Execution order

1. Wave 04 — Premium Surface Architecture Remediation
2. Wave 05 — Authoring, Sparse-State, and Governance Hardening
3. Wave 06 — Packaging, Validation, and SharePoint Proof

## Working assumptions

- Waves 00–03 have already been executed.
- The current repo state includes the Wave 03 newsroom rebuild.
- The next work should **not** reopen product-direction discovery already settled in earlier waves.
- The remaining work should be narrowly focused on elevating `CompanyPulse` into a true flagship newsroom surface and proving that the packaged SharePoint result matches that objective.

## General operating instructions

- Work from **live repo truth**.
- Do **not** re-read files that are already in your active context or memory unless needed to verify drift, confirm current state, or resolve uncertainty.
- Keep changes tightly scoped to the minimum files required to complete the wave coherently.
- Do **not** accept an outcome that is merely “better than before.” The target is a **premium**, **visibly non-generic**, **production-ready** newsroom surface.
- Do **not** leave work unbuilt or unvalidated.

## Primary target files

- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx`
- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulseWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/companyPulse/index.ts`

## Likely adjacent files

- company-pulse normalization/contracts only if directly required
- newsroom primitives already introduced under homepage shared/newsroom
- narrow `@hbc/ui-kit/homepage` exports only if directly required by the premium-surface remediation
- packaging/build files only in Wave 06

## Completion expectation

When all remaining waves are complete, the webpart should:

- look unmistakably premium in SharePoint
- no longer read as an inline-style-driven composition experiment
- survive sparse data and authoring states gracefully
- compile, build, package, and render correctly inside the cumulative `hb-webparts.sppkg`
