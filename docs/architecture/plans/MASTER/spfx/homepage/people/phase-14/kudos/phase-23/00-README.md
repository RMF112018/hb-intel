# HB Kudos Major Findings Remediation Package

## Package objective

This package contains:

- the repo-truth audit report
- a README explaining execution order
- 10 unique prompt files for a local code agent
- one prompt per major finding identified in the audit

The prompts are written for the live repository:

- `https://github.com/RMF112018/hb-intel.git`

## Recommended execution order

Execute the prompts in this order:

1. `01-Prompt-Shared-UI-Kit-Kudos-Composer-Conformance-Rebuild.md`
2. `02-Prompt-Public-Runtime-Shared-Primitive-Adoption-and-Ownership-Reduction.md`
3. `03-Prompt-Public-Runtime-Inline-and-Injected-Style-Elimination.md`
4. `04-Prompt-Companion-Runtime-Decomposition-and-Surface-Cleanup.md`
5. `05-Prompt-Governance-Primitive-Layer-Hardening.md`
6. `06-Prompt-Accessibility-Keyboard-and-Focus-Compliance.md`
7. `07-Prompt-Flyout-Architecture-Harmonization-and-Focus-Restoration.md`
8. `08-Prompt-Token-Variant-and-CSS-Architecture-Unification.md`
9. `09-Prompt-Hosted-SPFx-Regression-and-Validation-Expansion.md`
10. `10-Prompt-Model-Reference-Standard-and-Closure-Governance.md`

## Execution rules

- Work against the live `main` branch unless a dedicated remediation branch is required by your normal process.
- Do not re-read files that are already in your current context window or active memory unless necessary for validation after edits.
- Treat repo truth as authoritative over older planning documents when they conflict.
- Preserve the public runtime / companion runtime ownership boundary.
- Do not collapse public and companion responsibilities back into one runtime.
- Prefer governed imports from `@hbc/ui-kit/homepage` over local reinvention.
- Reduce inline styles, injected `<style>` blocks, and ad hoc presentation logic wherever the prompt instructs.
- Each prompt should end with lint, typecheck, and targeted Playwright validation for the touched area.
- Do not stop at “working.” The closure target is production-grade, compliant, maintainable, and suitable to serve as the model for future homepage webparts.

## Key repo areas covered by this package

- `packages/ui-kit/src/HbcKudosComposer/`
- `packages/ui-kit/src/homepage.ts`
- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/`
- `apps/hb-webparts/src/homepage/shared/`
- `apps/hb-webparts/src/homepage/data/`
- `e2e/webparts/kudos/hosted/`

## Package contents

- `00-README.md`
- `01-Audit-Report-HB-Kudos-Major-Findings.md`
- `01-Prompt-Shared-UI-Kit-Kudos-Composer-Conformance-Rebuild.md`
- `02-Prompt-Public-Runtime-Shared-Primitive-Adoption-and-Ownership-Reduction.md`
- `03-Prompt-Public-Runtime-Inline-and-Injected-Style-Elimination.md`
- `04-Prompt-Companion-Runtime-Decomposition-and-Surface-Cleanup.md`
- `05-Prompt-Governance-Primitive-Layer-Hardening.md`
- `06-Prompt-Accessibility-Keyboard-and-Focus-Compliance.md`
- `07-Prompt-Flyout-Architecture-Harmonization-and-Focus-Restoration.md`
- `08-Prompt-Token-Variant-and-CSS-Architecture-Unification.md`
- `09-Prompt-Hosted-SPFx-Regression-and-Validation-Expansion.md`
- `10-Prompt-Model-Reference-Standard-and-Closure-Governance.md`
