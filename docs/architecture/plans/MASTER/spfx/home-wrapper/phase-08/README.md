# HB Homepage Shell Host-Aware Combined Audit + Remediation Package

## Objective
Replace the attached split audit package and implementation-prompt package with one stronger, repo-truth-aligned package for the `hbHomepage` shell host-aware rendering remediation.

This package is built to help a local code agent close the remaining shell-fit work against the live `main` branch of `RMF112018/hb-intel`.

## What this package replaces
- `hbHomepage-shell-host-aware-audit-package.zip`
- `hbHomepage-shell-implementation-prompt-package.zip`

## Audit basis
This replacement package was built from:
- the attached package contents
- the live `main` branch seams for the wrapper, shell, shell logic, and current proof surface
- repo doctrine governing SPFx page-canvas ownership, host-aware rendering, and shell container-awareness
- external subject-matter guidance on CSS box model behavior, `ResizeObserver`, and hosted cross-device validation

## Bottom line
The attached packages are directionally right, but they are not yet strong enough.

They correctly preserve the wrapper-vs-shell ownership boundary and correctly identify shell-fit closure as the real problem space. They are weaker where they need to be strongest:
- they overstate some root causes without enough repo-proof
- they under-specify what the authoritative width contract should actually be
- they do not separate outer envelope authority from inner visual inset policy clearly enough
- they are too light on closure diagnostics and hosted regression proof
- they likely need more than four prompts for clean closure

## Scope boundary
This package remains shell-focused.

Included:
- wrapper-owned entry-stack envelope authority
- shell-owned width governance
- authoritative measurement and usable-width accounting
- wrapper-owned actions-region containment contract
- shell diagnostics and proof
- hosted validation evidence

Excluded unless shell proof demands a boundary check:
- broad redesign of child surfaces
- backend changes
- list-schema or data-model redesign
- unrelated homepage modules

## Recommended execution order
1. Read `00-Executive-Summary.md`
2. Read `01-Repo-Truth-Architecture-and-Ownership-Map.md`
3. Read `04-Enhanced-Findings-Register.md`
4. Execute prompts in numeric order
5. Close with `07-Proof-Plan-and-Hosted-Validation-Matrix.md`

## Local code-agent posture
The code agent must:
- preserve the wrapper vs shell ownership boundary
- preserve shell orchestration seams that are already directionally strong
- avoid child-surface redesign as a substitute for shell-fit repair
- avoid fake closure through clipping or cosmetic masking
- prove the hosted result is fixed
- not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
