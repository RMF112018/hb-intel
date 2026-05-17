# Git Commit Guidance

## Recommended title
```text
feat(my-projects): add custom project resource links registry
```

## Recommended description
```text
Add the My Projects Custom Links Registry as an authenticated,
project-entitled resource layer beneath the existing fixed system launch
actions.

- Introduce a dedicated SharePoint child-list descriptor, provisioner,
  readiness verifier, and operator runbook for My Projects custom links.
- Add shared custom-link read-model and command contracts, including
  visibility modes, create/update/delete result unions, and additive
  `customLinks` support on each My Project item.
- Implement backend custom-link repository, validation, entitlement
  checks, and bearer-protected POST/PATCH/DELETE command routes.
- Join active private/project-visible links into the My Projects read
  model by project provenance IDs while preserving existing project
  assignment and source-of-record behavior.
- Extend the frontend client seam for custom-link commands and add a
  compact `More Project Resources` disclosure to each project tile with
  create/edit/remove affordances.
- Add the creation modal with the locked project-resource helper text,
  visibility guidance, field validation, and deterministic failure
  feedback.
- Refresh fixtures, tests, docs, and operator validation evidence for the
  new custom-links feature.
```
