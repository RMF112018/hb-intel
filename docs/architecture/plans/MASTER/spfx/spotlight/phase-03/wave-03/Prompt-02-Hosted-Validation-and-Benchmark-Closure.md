# Prompt-02-Hosted-Validation-and-Benchmark-Closure.md

## Objective

Prove the Spotlight is materially improved in real hosted SharePoint and close the remaining runtime-quality risk with explicit evidence.

## Non-negotiable rules

- Use the live `main` branch as repo truth.
- Do not preserve a weak visual or interaction pattern just because it already exists.
- Do not broaden scope beyond the files and seams named below unless a dependency proves unavoidable.
- Do not re-read files that are still within your active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.
- Preserve the thin-webpart ownership boundary: data / normalization local, presentation shared unless the prompt explicitly says otherwise.
- Provide proof of closure: touched-file list, before/after explanation, test or story updates, and hosted/runtime evidence where requested.
- Do not stop at “compiles.” Close the runtime behavior.


## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`

## Files / seams to inspect first

- Spotlight stories / tests
- any existing homepage hosted validation patterns
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/README.md`
- any closure-report or evidence directory already used for homepage work

## Required breakpoint / device validation

Capture and evaluate the Spotlight at minimum in the same classes used by the audit:

- 2560x1440
- 1920x1080
- ~1512x982 retina laptop
- 1024x1366 tablet portrait
- 430x932 phone portrait
- 390x844 phone portrait

## Required implementation outcome

- produce a concise closure report showing what changed and why it is now acceptable
- attach hosted screenshots or proof artifacts
- confirm there are no dead controls in the primary Spotlight path
- confirm no console errors in the exercised runtime
- explicitly state whether the surface is still below benchmark in any category

Do not write a victory memo without evidence.

## Proof of closure required

Provide:

1. hosted screenshots for the validated widths
2. a scorecard rerun
3. console / dead-control status
4. remaining exceptions, if any
5. a go / no-go statement on homepage-grade acceptance
