# Local Agent Execution Checklist

## Before editing

- [ ] Run `git status --short`.
- [ ] Run `git branch --show-current`.
- [ ] Record `md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml`.
- [ ] Review the current prompt, README, target architecture, and implementation plan.
- [ ] Review only necessary Project Home files.
- [ ] Do not re-read files that are still within current context or memory.
- [ ] Confirm unrelated dirty files will not be touched.
- [ ] Confirm baseline evidence path: `docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/`.

## During implementation

- [ ] Keep Project Home changes local unless the prompt allows otherwise.
- [ ] Preserve fixture-only and read-model paths.
- [ ] Preserve exactly one Project Home active panel marker.
- [ ] Preserve direct-child bento behavior.
- [ ] Do not nest dashboard cards.
- [ ] Do not introduce live actions or external launches.
- [ ] Keep HBI advisory.
- [ ] Keep source-of-record boundaries visible.
- [ ] Avoid global primitive edits.
- [ ] Avoid package/manifest/lockfile edits.

## Before closeout

- [ ] Run prompt-specific tests.
- [ ] Run typecheck.
- [ ] Run prettier check.
- [ ] Run `git diff --check`.
- [ ] Confirm lockfile hash unchanged.
- [ ] Confirm no package/manifest edits.
- [ ] Summarize changed files.
- [ ] Summarize validation results.
- [ ] Summarize residual risks.
