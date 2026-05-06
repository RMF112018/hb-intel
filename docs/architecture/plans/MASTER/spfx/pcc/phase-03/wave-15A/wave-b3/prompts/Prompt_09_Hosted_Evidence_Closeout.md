# Prompt 09 — Evidence, Documentation, and Closeout


# Operating Rules for the Local Code Agent

- Work only in the current repository.
- Do not re-read files that are still within your current context or memory. Use targeted reads only when verifying drift.
- Do not install packages.
- Do not change `pnpm-lock.yaml`.
- Do not modify backend/functions.
- Do not enable live integrations, mutations, saves, launches, approvals, repairs, sync, access changes, or HBI execution.
- Preserve read-only / preview-only / inert behavior.
- Preserve bento direct-child invariants.
- Preserve existing `data-pcc-*` markers unless the prompt explicitly instructs a replacement and test update.
- Run the required validation commands listed in this prompt.
- Close with commit-ready summary, files changed, validation output, and residual risks.


## Objective

Create the Prompt 02 evidence and closeout documentation after implementation and validation.

## Context


Use `08_SCREENSHOT_AND_HOSTED_EVIDENCE_PLAN.md`. If hosted SharePoint screenshots are not available to the local code agent, create a hosted-evidence checklist and clearly mark it as pending manual validation.


## Required Work


1. Create closeout folder if missing:
   `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-02/`
2. Add:
   - `PROMPT_02_CLOSEOUT.md`
   - `PROMPT_02_EVIDENCE.md`
3. Include:
   - implementation summary
   - files changed
   - primitive contract summary
   - surface card inventory after migration
   - tests run and exact output
   - lockfile hash
   - screenshot evidence table
   - hosted evidence status
   - residual risk
   - hard-stop checklist
4. Do not claim final 56/56 unless hosted screenshot evidence is actually captured and all hard stops pass.


## Validation


Run final validation:

```bash
git status --short
git rev-parse HEAD
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed files>
git diff --check
```


## Closeout Response Required


Report:
- closeout files created
- exact validation output
- whether hosted evidence is complete or pending
- commit-ready summary and description
