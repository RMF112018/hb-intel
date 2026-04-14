# Publisher Remediation Prompt Package

This package contains one issue-bounded prompt per finding from the audit.

## Execution rule
Run the prompts in numeric order. Do not skip ahead unless the earlier prompt explicitly says it is fully closed.

## Package contents
- `Plan-Summary.md`
- `Prompt-01-Close-publish-path-transactionality-and-orphan-page-risk.md`
- `Prompt-02-Make-archive-withdraw-and-manual-transitions-atomic.md`
- `Prompt-03-Resolve-the-scheduled-state-gap.md`
- `Prompt-04-Close-or-remove-the-live-milestoneSpotlight-branch.md`
- `Prompt-05-Fully-wire-promotion-rules.md`
- `Prompt-06-Map-advanced-HB-Articles-presentation-fields.md`
- `Prompt-07-Expose-remaining-team-member-schema-fields.md`

## Prompt rules
Every prompt:
- is bounded to one issue,
- references exact files and symbols,
- requires an exhaustive scrub of the affected code path,
- requires proof of closure,
- forbids unrelated changes,
- includes the instruction not to re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
