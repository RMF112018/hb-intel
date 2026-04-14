# Publisher Remediation Prompt Package

This package contains one prompt per finding from the current repo-truth wiring/workflow audit.

## Execution order
Run the prompts in numeric order.

## Rules
- One prompt at a time.
- Do not combine unrelated fixes.
- Prove closure before moving to the next prompt.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Use the live local repo as the implementation authority.
- Use `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md` as the tenant-schema authority.
