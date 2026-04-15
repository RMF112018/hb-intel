# Prompt 04 — Prove closure with regression, build, and reporting

## Objective
Do not leave this remediation wave at “code changed, probably fine.”

This prompt closes the package by forcing the local code agent to prove that the implemented remediation work:
- compiles
- is test-covered where it needs to be
- does not regress the supported Project Spotlight path
- is documented in a closure-grade report

---

## Scope
This prompt runs **after** Prompts 01–03 are fully implemented.

It is not optional.
It is part of the remediation package’s definition of done.

---

## Required repo references
- `apps/hb-publisher/package.json`
- every code file changed by Prompts 01–03
- every test file changed or added by Prompts 01–03
- every closure report created by Prompts 01–03
- any existing Publisher closure index/readme that should reflect the new work

---

## Exact defect to close
The original remediation package did not force a hard closure proof step.

Without that, the package could end with:
- partial code changes
- shallow testing
- stale closure notes
- no clean proof that the app still builds and that the supported branch still works

That is not an execution-grade remediation package.

---

## Required implementation objective
Produce a closure-grade validation and reporting pass for the full enhanced remediation package.

### You must do all of the following

#### 1. Run the required technical validation commands
At minimum run:
- `pnpm --filter @hbc/spfx-hb-publisher check-types`
- `pnpm --filter @hbc/spfx-hb-publisher test`
- `pnpm --filter @hbc/spfx-hb-publisher build`

If one of these fails because of a pre-existing unrelated issue, you must:
- isolate whether it is truly pre-existing and unrelated
- state that explicitly in the final closure report
- still prove the remediation changes themselves are sound

Do not hide behind generic “there were test issues.”
Name them.

#### 2. Validate supported-branch behavior explicitly
Your closure proof must explicitly confirm that the currently supported branch still behaves correctly:
- destination: `projectSpotlight`
- operational content types only
- workflow progression through the supported lifecycle
- truthful save/readiness/health messaging after the new changes

#### 3. Validate the newly-closed defects explicitly
Your report must show proof for:
- first-persistence/save-readiness truthfulness
- template/bootstrap preflight health
- promotion-rule health truthfulness

#### 4. Consolidate closure reporting
Create one final consolidated closure report that:
- names every changed code file
- names every changed/added test file
- names every command run
- states pass/fail outcomes
- states any known unrelated residual failures, if any
- maps each prompt to the exact proof of closure

#### 5. Update package-level documentation if needed
If the Publisher closure/readme/index surface should be updated to reflect the new remediation closure, update it now.
Do not leave the docs behind the code.

---

## Strong implementation guidance

### Reporting quality standard
The final consolidated closure report must be useful to a future maintainer who did not watch this remediation happen.

That means it should answer:
- what changed
- why it changed
- what was proven
- what remains pre-existing and unrelated, if anything
- why this package is now considered closed

### Scope guard
Do **not** use this prompt to add unrelated features.
This is a proof-and-report step.

If you discover a new in-scope regression while running proof, fix it in the same wave and document it.
Do not defer it.

---

## Required deliverable
Create a final consolidated closure report in the Publisher closure docs.

Suggested content:
- summary verdict
- prompt-by-prompt closure proof
- changed files
- added/updated tests
- command results
- known unrelated residuals, if any
- final confidence statement for the supported Project Spotlight path

The report must be written as a real closure artifact, not a sparse scratch note.

---

## Mandatory operating instructions
- Work in the live local `hb-intel` repo.
- Do not skip commands because the changes “look small.”
- Do not hand-wave failing commands.
- Do not leave stale docs behind.
- If you find an in-scope regression during proof, close it now and document it.
- This prompt is complete only when the closure report exists and the validation evidence is recorded.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
