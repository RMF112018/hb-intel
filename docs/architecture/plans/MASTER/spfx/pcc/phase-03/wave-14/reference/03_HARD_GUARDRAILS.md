# Hard Guardrails

## Global Guardrails

- Work only in `/Users/bobbyfetting/hb-intel`.
- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Preserve Wave 14 as a PCC-native approval/checkpoint control layer.
- Preserve source-module ownership. Do not transfer source record ownership to Phase 14.
- Preserve Wave 13G as Estimating Workbench feature/UX authority.
- Backend posture is GET-only until a separate command gate is explicitly authorized.
- SPFx posture is fixture-first unless the repo-standard backend opt-in path is already present and explicitly used.
- Do not add live approval execution, command handlers, external-system writeback, SharePoint/Graph/PnP mutation, tenant/list/group/security mutation, package/dependency changes, workflow changes, CI changes, deployment, or production rollout.
- Do not add legal, claim, entitlement, compensability, delay-damages, pricing, award, or accounting authority behavior.
- HBI may summarize/cite visible evidence and explain policy requirements only. HBI must not approve, reject, waive, override, defer, cancel, supersede, manual-close, price, recommend award as authority, post accounting entries, or execute source-system mutations.
- Do not use Power Automate as an MVP runtime dependency. It is reference architecture only unless a future integration gate authorizes it.
- Do not run broad formatting across the repo.
- Do not mutate `package.json`, `pnpm-lock.yaml`, SPFx manifests, tenant config, or deployment/package-solution files unless the prompt explicitly authorizes it and you first stop for approval.
- Do not edit `docs/architecture/plans/**` unless the prompt explicitly authorizes a closeout/auditor artifact there.

## Additional Absolute Prohibitions

- Do not add POST, PUT, PATCH, DELETE backend routes for Wave 14.
- Do not add SPFx direct calls to Graph, SharePoint REST, PnP, Procore, Sage, Autodesk, AHJ portals, utility portals, DocCrunch, Adobe Sign, or Power Automate.
- Do not create SharePoint lists, columns, indexes, folders, permissions, groups, or app catalog artifacts.
- Do not sync, mirror, upload, download, or store evidence binaries.
- Do not create workflow timers, queues, schedulers, approval bots, external callbacks, or polling jobs.
- Do not infer contractual/legal obligations or create legal advice.
- Do not represent HBI output as a decision, approval, waiver, override, rejection, pricing recommendation, award recommendation, accounting posting, claim determination, or schedule forensic conclusion.
- Do not weaken redaction or audit controls to make the UI easier.
- Do not hide disabled action reasons.
