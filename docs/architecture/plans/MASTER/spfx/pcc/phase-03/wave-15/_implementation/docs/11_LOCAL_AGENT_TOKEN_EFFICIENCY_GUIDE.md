# Local Agent Token-Efficiency Guide

## Purpose

Reduce local agent token use by giving each prompt enough context to act without repeatedly rediscovering repository architecture.

## Required Instruction Phrase

Every prompt includes:

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## How to Use Context Efficiently

1. Start every prompt with the required repo-truth commands.
2. Read this package's reference files before opening broad repo files.
3. Read only the repo files listed in the prompt's required checklist.
4. Do not re-open files already inspected in the same session unless:
   - the file changed;
   - context is stale;
   - a validation error points to it;
   - a type seam requires precise local verification.
5. Use targeted `rg` searches instead of broad file browsing.
6. Preserve a concise execution log in the final response so the next prompt can reuse it.
7. Do not run broad formatting or test commands until after targeted implementation and targeted tests pass.
8. Use prompt closeout summaries as handoff memory for the next prompt.

## Recommended Agent Workflow

For each implementation prompt:

```text
1. Revalidate repo truth.
2. Confirm authorized file scope.
3. Inspect only required files.
4. Make a small implementation plan.
5. Implement scoped changes.
6. Run targeted tests.
7. Fix only in-scope failures.
8. Run required validation commands.
9. Capture lockfile MD5.
10. Commit if prompted and validations pass.
11. Return closeout with exact files changed and evidence.
```

## Avoid

- Re-reading entire docs directories after Prompt 01.
- Searching the entire repo for generic terms without path filters.
- Letting unrelated TypeScript failures expand the prompt scope without user approval.
- Installing dependencies to solve UI/state problems that can be solved with existing repo patterns.
- Copying large prompt text into commit messages.

## Suggested Closeout Payload for Next Prompt

Each prompt response should include:

```text
Context for next prompt:
- Branch:
- HEAD before:
- HEAD after:
- Lockfile MD5 before/after:
- Files changed:
- Tests run:
- Known residuals:
- Files now in current context:
- Stop conditions encountered:
```
