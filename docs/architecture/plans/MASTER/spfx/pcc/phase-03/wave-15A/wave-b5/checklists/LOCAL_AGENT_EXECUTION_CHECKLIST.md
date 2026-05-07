# Local Agent Execution Checklist

## Before editing

- [ ] Run `git status --short`.
- [ ] Identify branch.
- [ ] Review this package README, implementation plan, and current prompt.
- [ ] Review current Project Readiness files only as needed.
- [ ] Do not re-read files that are still within your current context or memory.
- [ ] Confirm no unrelated dirty files will be touched.

## During implementation

- [ ] Preserve direct-child bento invariant.
- [ ] Do not nest cards.
- [ ] Keep read-model hooks unconditional.
- [ ] Keep non-selected detail modules absent from DOM.
- [ ] Mark local view controls clearly.
- [ ] Avoid action-like labels on enabled controls.
- [ ] Preserve read-only/source confidence copy.
- [ ] Avoid shared primitive changes.
- [ ] Avoid package/manifest/lockfile changes.

## Before commit

- [ ] Run targeted tests.
- [ ] Run type check.
- [ ] Run prettier check.
- [ ] Run `git diff --check`.
- [ ] Run `git status --short`.
- [ ] Confirm `pnpm-lock.yaml` unchanged.
- [ ] Confirm no package or manifest files changed.
- [ ] Summarize changed files and residual risks.
