# Prompt 03 — Validation, Proof, and Closure

## Objective
Validate that the People & Culture + HB Kudos test suite now operates with **device-login-first** live authentication and that bearer-token-only operation is no longer the normal live-run model.

## Repo
- `https://github.com/RMF112018/hb-intel`
- Branch: `main`

## Required posture
- Work from repo truth only.
- Do not re-read files that are still within your active context window or already inspected during the current step unless needed for accuracy.
- Validate code, not just docs.
- Be direct if any bearer-token-first residue still remains.

## Validation scope
At minimum validate:
- runner usage/help/examples
- auth helper behavior
- config model
- persistent token cache wiring
- device code callback / operator message flow
- silent token reuse logic
- fallback token behavior and whether it is truly fallback-only
- docs alignment with the implemented code
- package dependencies and imports

## Required proof points
You must verify whether the code now supports all of the following:
1. `--live` can operate without `--token`
2. the normal live path attempts cache reuse before prompting
3. missing cache triggers device code flow rather than immediate failure demanding a bearer token
4. dry-run still avoids auth entirely
5. fallback token mode does not override the normal device-login-first design
6. docs match actual code

## Required outputs
Write a closure validation report to:
- `docs/architecture/reviews/people-kudos-device-login-auth-closure-report.md`

The report must include:
- executive conclusion
- validated auth flow
- validated CLI/config behavior
- validated docs alignment
- remaining gaps, if any
- explicit go / no-go statement for human-operated live use

## Required final section in the report
Include a section called:
- `Residual Risk / Follow-Up`

Address at minimum:
- app registration dependency
- tenant consent dependency
- cache reset / token cache troubleshooting
- whether account-switch support is good enough or needs follow-up

## Acceptance criteria
Do not mark closure complete unless repo truth proves that device login is now the primary live auth path and that bearer-token injection is no longer required for normal live runs.

