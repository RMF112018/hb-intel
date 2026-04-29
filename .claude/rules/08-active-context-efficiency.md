# 08-active-context-efficiency

## Purpose

Reduce unnecessary repeated file reads while preserving repo-truth verification.

## Rule

Do not re-read files that are still within active context or memory unless one of the following applies:

- the file may have changed;
- line-level verification is needed;
- final validation or a closeout report requires proof;
- the scope expanded;
- the user asks for a repo-truth audit;
- the task involves post-execution validation;
- the file is a governing source of truth for the current task.

## Verification Exception

When in doubt, verify the current file rather than relying on stale memory.

Efficiency must not override repo-truth validation.