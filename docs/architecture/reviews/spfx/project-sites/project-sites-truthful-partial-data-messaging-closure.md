# Project Sites Truthful Partial-Data and No-Context Messaging Closure

## Objective

Close Prompt-04 by making Project Sites explicit and truthful about scope/context resolution, partial data, and non-launchable records without turning the surface into a diagnostic dashboard.

## Final States and Messaging

## 1) Resolved scope source shown to users

Project Sites now surfaces concise context summary copy directly under the header:

- author override source
- host page Year source
- default-year fallback when no authoritative context exists
- all-projects fallback when no context and no valid year values exist
- user-selected scope changes

This summary tells users why they are seeing the current scope.

## 2) Partial-data and non-launchable record handling

When a scope returns records, summary messaging now includes truthful counts for:

- `attention-needed` records (data correction required)
- `provisioning` records (site not yet launchable)

This differentiates data issues from legitimate provisioning and avoids silent optimism.

## 3) Empty state copy

Empty state copy now says scope returned no records, instead of implying records simply "will appear".

Updated message:

- "No projects matched the current scope (...). This means no records were returned for that scope from the Projects list."

## Why this copy is truthful

- It describes what the system actually knows (scope source, returned counts, launchability classes).
- It avoids claiming hidden causes not proven by current data.
- It avoids admin-only diagnostic detail while still being operationally honest.

## Tests updated

- `ProjectSitesRoot.test.tsx`
  - verifies scope-empty wording
  - verifies context summary and partial-data count messaging for mixed attention/provisioning records

## Related trust model docs

This closure builds on and remains consistent with:

- `project-sites-launch-state-model-closure.md`
- `project-sites-authoritative-year-context-closure.md`
- `project-sites-repository-adapter-closure.md`
