# Publisher Remediation Prompt Package

This package contains issue-specific prompts derived directly from the current repo-truth audit.

## Execution order

1. `Prompt-01-Fix-hosted-project-lookup-host-binding.md`
2. `Prompt-02-Close-republish-approval-bypass.md`
3. `Prompt-03-Make-archive-withdraw-fail-closed-on-binding-lookup.md`
4. `Prompt-04-Make-archive-withdraw-atomic-and-compensating.md`
5. `Prompt-05-Resolve-scheduled-state-dead-branch.md`
6. `Prompt-06-Resolve-milestone-legacy-branch-contradiction.md`

## Operating rules

- one prompt = one finding
- do not combine unrelated fixes
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- prove closure before moving to the next prompt
- create closure notes for each prompt

## Governing references to use throughout

- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/*`

