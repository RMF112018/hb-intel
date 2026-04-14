# Publisher Backend Remediation Prompt Package

This package was derived directly from the accompanying repo-truth audit.

Repo root assumed by every prompt:
`/Users/bobbyfetting/hb-intel`

Execution posture:
- one prompt per finding
- close findings in order
- do not combine unrelated fixes
- prove closure of each issue before moving to the next

Primary authorities every prompt may cite as needed:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/*`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`

Package contents:
- `Plan-Summary.md`
- `Prompt-01-Resolve-stale-template-resolution.md`
- `Prompt-02-Scope-or-complete-milestone-path.md`
- `Prompt-03-Rework-promotion-rule-defaults-and-gating.md`
- `Prompt-04-Close-or-remove-stranded-scheduled-workflow-branch.md`
- `Prompt-05-Isolate-unsupported-destinations-from-current-surface.md`
