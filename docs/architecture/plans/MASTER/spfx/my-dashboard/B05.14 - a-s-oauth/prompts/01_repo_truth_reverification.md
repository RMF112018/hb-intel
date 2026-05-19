# Prompt 01 — Repo-Truth Reverification

## Objective

Conduct a focused repo-truth reverification before implementation of the Adobe Sign embedded modal architecture.


General execution rules for the local code agent:

- Work from current repo truth only.
- Do not assume prior plans are current if code differs.
- Do not re-read files that are still within your current context or memory.
- Do not implement unsupported Adobe behavior.
- Do not create a custom signing UI.
- Do not proxy Adobe signing content.
- Preserve existing behavior when the embedded feature flag is disabled.
- Keep changes incremental, testable, and reversible.
- Provide concise commit summaries and validation evidence after each prompt.


## Required Inspection Areas

Inspect and summarize the current state of:

```text
apps/my-dashboard/src/modules/adobeSign/
apps/my-dashboard/src/api/
apps/my-dashboard/src/config/
apps/my-dashboard/src/runtime/
backend/functions/src/hosts/my-work-read-model/
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/
packages/models/src/myWork/
```

## Specific Questions to Answer

1. What exact code path currently runs when a user clicks `Act Now`?
2. What backend route currently resolves Adobe Sign action/signing URLs?
3. What shared DTO currently models the result?
4. What feature flag/runtime config pattern should be reused?
5. What modal, popover, overlay, or shell primitives already exist?
6. What tests currently cover Adobe Sign action links?
7. Which files should be modified versus left untouched?

## Deliverable

Produce:

1. current repo-truth summary,
2. file-level implementation map,
3. risks or conflicts with the attached target architecture,
4. exact next implementation steps.

Do not write code in this prompt unless explicitly instructed after the audit.
