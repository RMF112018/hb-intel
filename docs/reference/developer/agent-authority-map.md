# Agent Authority Map

Purpose: help agents and developers route quickly to the right authoritative source or specialist reviewer for a given HB Intel task without loading unnecessary doctrine into context.

This file is referenced by `CLAUDE.md` as a fast source-routing guide. It must stay aligned with:

- `CLAUDE.md`
- `.claude/rules.md`
- `.claude/agents/README.md`
- active project-specific rules under `.claude/rules/projects/`
- current repo truth

Historical plans, old summaries, and older broad blueprints guide prior intent only. They do not override live code, package manifests, exports, tests, closeouts, active prompt packages, or current governing docs.

---

## Fast Path

1. Identify the active scope:
   - package/app;
   - phase, wave, or prompt package;
   - docs-only update;
   - UI/SPFx work;
   - backend/provisioning/deployment work;
   - project-specific work such as PCC.
2. Read the nearest live files first:
   - local code;
   - local `README.md`;
   - package/app `package.json`;
   - exports;
   - tests;
   - nearby configs.
3. If the task is phase/wave-driven, read the active prompt package README, decision register, validation matrix, scope lock, and closeout docs before broad doctrine.
4. If the task is project-specific, read the current project governing docs before broad HB Intel architecture docs.
5. Use the specialist routing map when a focused reviewer will reduce main-context load or reduce risk.
6. Keep Claude working plans under `.claude/plans/**` unless the user explicitly requests a canonical plan artifact in `docs/**` or `docs/architecture/plans/**`.

---

## Source Routing Table

| Question | Primary Source | Read When | Notes |
|---|---|---|---|
| What exists in the touched area right now? | Live files in the touched package/app/backend/docs area | Always start here for implementation work | Present-truth starts with current files, manifests, exports, tests, configs, and local README files. |
| What is the active execution scope? | Active prompt package README, decision register, validation matrix, scope lock, and closeout docs | Phase, wave, prompt-package, or plan-driven work | Active prompt packages govern execution scope; they do not override higher-level architecture boundaries. |
| What is the current completed status? | Current phase/wave closeout docs plus live package state | Any task referencing completed phases, wave status, readiness, or “repo truth” | Closeouts are completion evidence. Validate against live files when execution quality matters. |
| What package should own this concern? | Local package docs/manifests first, then `docs/architecture/blueprint/package-relationship-map.md` if needed | Adding dependencies, moving code, creating packages, evaluating ownership or layering | Use `hb-boundary-auditor` when ownership is unclear or cross-package. |
| What exists across the repo right now? | Verified live repo state; `docs/architecture/blueprint/current-state-map.md` only when current-state documentation is needed | Repo-wide current-state questions | Do not treat current-state docs as stronger than verified live files. |
| Where should documentation live? | `docs/README.md` and `docs/reference/developer/documentation-authoring-standard.md` | Docs creation or update tasks | Use `hb-docs-curator` for placement, drift, overlap, or source-of-truth conflict. |
| How should documentation be written? | `docs/reference/developer/documentation-authoring-standard.md` | Creating or updating docs, README work, developer-facing reference docs | Prefer links to canonical sources over duplicated long prose. |
| What verification should be run? | `docs/reference/developer/verification-commands.md` | Any task requiring tests, lint, typecheck, build, docs validation, or validation reporting | Use `hb-verification-runner` when scope or failure interpretation is non-obvious. |
| Where should Claude working plans go? | `.claude/rules/06-planning-and-proposals.md` | Planning help, plan persistence, draft plan generation, proposal writeups | Default working-plan location is `.claude/plans/**`; canonical plan docs require explicit user intent. |
| What is the intended target architecture? | Current project-specific governing docs first; broad architecture docs only if local/project truth is insufficient | Cross-cutting architecture work, structure changes, runtime model work | Do not let older target-state docs override active project docs, closeouts, or live code. |
| What is the broader product/program doctrine? | Broad architecture doctrine docs only after local/project truth is insufficient | Product thesis, operating doctrine, long-range alignment, narrative context | Narrative doctrine is context, not present-state authority. |
| What is the homepage vs shell-extension boundary? | `docs/reference/sharepoint-homepage-shell-boundaries.md` | Homepage webpart work, shell-extension planning, SharePoint customization scope questions | Also check current SPFx surface docs and active shell/homepage prompt packages. |
| What SharePoint customization is supported? | `docs/reference/sharepoint-homepage-shell-boundaries.md` §Supported Customization Posture | SharePoint hosting, SPFx extensions, full-page shells, or shell behavior | For deployment or tenant risk, use `hb-tenant-deployment-gatekeeper`. |
| Which UI-kit entry point should I use? | `docs/reference/ui-kit/entry-points.md` plus live `@hbc/ui-kit` exports | Adding UI imports, reviewing import guardrails, shared UI ownership | Verify older UI doctrine against live exports and current consumers. |
| Does this need an ADR? | Existing ADRs plus relevant current architecture docs | Durable architecture decisions, reversals, repo-wide rules | Do not create ADRs for routine local implementation detail. |
| How does this package work locally? | Package/app `README.md`, `package.json`, tests, nearby code | Local package or app implementation work | Prefer this before broad repo docs. |
| Do I need focused repo research before coding? | `.claude/agents/hb-repo-researcher.md` | Unfamiliar code areas, cross-package impact, authority/doc routing, plan-to-repo alignment | Read-only investigation helper. |
| Could this expose secrets or sensitive proof? | `.claude/agents/hb-security-and-secrets-auditor.md` | Auth, tokens, app settings, logs, generated reports, Key Vault, Graph/PnP, Procore, deployment proof | Do not print or preserve secret values. |
| Could this mutate tenant/deployment state? | `.claude/agents/hb-tenant-deployment-gatekeeper.md` | Tenant mutation, app catalog, Azure deployment, CI/CD, Graph/PnP live calls, SharePoint provisioning, permission mutation, rollout | Requires explicit user authorization. |
| Will this SPFx source actually run in SharePoint? | `.claude/agents/hb-spfx-runtime-parity-auditor.md` | SPFx source/build/manifest/runtime/hosted parity, Vite/IIFE mount, app catalog readiness | Source changes are not hosted proof. |
| Did the execution match approved scope? | `.claude/agents/hb-commit-diff-auditor.md` | Post-execution review, commit summaries, unrelated churn, manifest/package/lockfile drift | Use with `git status` and `git diff` evidence. |

---

## Project-Specific Routing

### PCC / SharePoint Project Control Center

If the task touches PCC, read `.claude/rules/projects/pcc-phase-3.md` and route to current PCC governing docs before broad architecture docs.

Current PCC governing sources:

- `docs/architecture/blueprint/sp-project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Closeout.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/`
- `packages/models/src/pcc/`
- `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` when UI/UX direction matters

PCC Phase 3 Wave 2 guardrails:

- target app: `apps/project-control-center/`;
- `apps/project-sites/` is a reference pattern only;
- shared PCC vocabulary/fixtures: `@hbc/models/pcc`;
- no backend APIs;
- no tenant mutation;
- no live Graph/PnP;
- no Procore runtime, secrets, mirror, write-back, or direct SPFx-to-Procore calls;
- no deployment or CI/CD changes unless explicitly authorized.

---

## Specialist Routing Map

Use specialist agents automatically when the task clearly fits their scope. If the fit is weak or the task is simple, stay with the main agent.

For the full index and examples, see `.claude/agents/README.md`.

| Specialist | Use For | Do Not Use For | Typical Outcome |
|---|---|---|---|
| `hb-repo-researcher` | Read-only repo investigation, unfamiliar code areas, cross-package impact analysis, authority routing, plan-to-repo alignment, locating the smallest relevant source set | Routine local edits, final validation execution, formal docs curation when the docs impact is already obvious | Focused research summary + recommended next move |
| `hb-boundary-auditor` | Package ownership, dependency legality, export placement, cross-package coupling, deciding whether code belongs in a feature package, shared package, app, backend, or `@hbc/ui-kit` | Running tests, writing docs, generic repo exploration, broad product strategy questions | Boundary finding + recommended next move |
| `hb-implementation-plan-reviewer` | Pre-execution plan review, post-execution validation, phase/wave execution review, scope control, guardrail enforcement | Acting as the implementation agent | Approval/refinement/block decision + copy-ready steering prompt |
| `hb-verification-runner` | Choosing the right validation scope, running targeted checks, separating new failures from pre-existing failures, summarizing what was and was not verified | Package ownership decisions, documentation placement, UI/UX quality review | Verification result + recommended next move |
| `hb-docs-curator` | Whether docs need updates, where docs belong, doc conflicts with current-state truth, authority overlap, package README vs developer reference vs explanation vs plan placement | Code ownership questions, generic code review, test execution | Documentation impact + recommended next move |
| `hb-ui-ux-conformance-reviewer` | Reusable UI ownership, `@hbc/ui-kit` alignment, cross-surface UI consistency, basis-of-design review, mold-breaker UX fit, feature-level UI reuse decisions | Test execution, generic package-boundary review outside UI concerns, broad docs routing | UI/UX conformance finding + recommended next move |
| `hb-security-and-secrets-auditor` | Secrets, tokens, app settings, auth proofs, Key Vault, Graph/PnP, Procore, sensitive logs/reports, redaction posture | General package placement or routine validation | Security finding + remediation / rotation recommendation |
| `hb-tenant-deployment-gatekeeper` | Tenant mutation, app catalog deployment, Azure deployment, CI/CD, Graph/PnP live calls, SharePoint provisioning, permission mutation, rollout gates | Normal local implementation review when no tenant/deployment risk exists | Gate decision + required authorization/remediation |
| `hb-spfx-runtime-parity-auditor` | SPFx source/build/manifest/runtime/hosted parity, Vite/IIFE mounts, full-page shell behavior, app catalog readiness review | General UI aesthetics or non-SPFx package review | Runtime parity finding + next proof step |
| `hb-commit-diff-auditor` | Post-execution diff scope, unrelated churn, package/manifest/lockfile drift, commit summary accuracy | Initial planning or implementation | Diff decision + cleanup/follow-up prompt |

---

## Specialist Escalation Priority

When multiple specialists could apply, use the highest-risk relevant specialist first:

1. `hb-security-and-secrets-auditor`
2. `hb-tenant-deployment-gatekeeper`
3. `hb-spfx-runtime-parity-auditor`
4. `hb-boundary-auditor`
5. `hb-implementation-plan-reviewer`
6. `hb-verification-runner`
7. `hb-docs-curator`
8. `hb-ui-ux-conformance-reviewer`
9. `hb-repo-researcher`

This is not a rigid call order. Use `hb-repo-researcher` first when the area is unfamiliar and repo truth must be established before risk can be classified.

---

## Conflict Handling

If sources disagree, use this order:

1. verified live code and configuration;
2. current package manifests, exports, tests, and closeouts;
3. active prompt package scope files for current execution boundaries;
4. project-specific governing docs;
5. `current-state-map.md` and package relationship docs when current-state/ownership docs are needed;
6. `docs/README.md` for docs routing;
7. broad target-state architecture docs;
8. scoped task plans;
9. historical plans and old summaries.

Historical plans do not override present repo truth.
Narrative doctrine does not replace verified implementation state.
Claude working plans under `.claude/plans/**` do not override canonical repository docs.

If a conflict would change architecture, package ownership, runtime boundaries, deployment posture, or security posture, stop and surface the conflict before implementing.

---

## Recommended Reading Patterns

### Local Package or App Change

Read:

- local code;
- local tests;
- package or app `README.md`;
- package or app `package.json`;
- local exports and configs.

Escalate only if the change affects ownership, boundaries, architecture, shared behavior, documentation outside the local area, runtime posture, or deployment posture.

### Phase / Wave / Prompt-Package Work

Read:

- active prompt package README;
- validation matrix;
- decision register;
- scope lock;
- closeout docs;
- governing architecture docs named by the package;
- live files in the touched area.

Use `hb-implementation-plan-reviewer` for plan/execution review.
Use `hb-commit-diff-auditor` after execution when scope adherence matters.

### Cross-Package or Shared Primitive Change

Read:

- local code in all touched packages;
- package manifests;
- relevant exports;
- package relationship docs when ownership is unclear;
- active scoped plan files when the task is plan-driven.

Use `hb-boundary-auditor` when package ownership or dependency direction is unclear.
Use `hb-repo-researcher` first if the impacted surface is not already clear.

### Architecture or Platform Doctrine Question

Read:

- live repo truth in touched area;
- active project-specific governing docs;
- active phase/wave closeouts;
- current-state/package-relationship docs only when needed;
- broad architecture docs only when local/project truth is insufficient;
- relevant ADRs.

Use `hb-repo-researcher` when the question spans multiple areas and the right source set is not obvious.

### Documentation Update

Read:

- nearest affected doc;
- `docs/README.md`;
- `docs/reference/developer/documentation-authoring-standard.md`;
- package README when the change is local;
- current project-specific governing docs when the docs update touches a product area;
- active closeouts when status language is involved.

Use `hb-docs-curator` when placement, update scope, authority overlap, or doc conflict is unclear.

### Verification Planning or Execution

Read:

- `docs/reference/developer/verification-commands.md`;
- root or affected package `package.json`;
- nearest README if package-specific validation guidance exists;
- active prompt package validation matrix when phase/wave work is involved.

Use `hb-verification-runner` when the right validation scope is non-obvious or when failures need triage.

### UI or UX Review

Read:

- local component code;
- `@hbc/ui-kit` exports and nearby usage patterns;
- active basis-of-design asset if named;
- package relationship docs if reusable ownership is unclear;
- relevant design-decision docs when the change affects user experience direction.

Use `hb-ui-ux-conformance-reviewer` when reusable visual ownership, surface consistency, basis-of-design fit, or UX quality needs review.

### Security / Secrets / Auth-Proof Review

Read:

- touched files;
- generated logs/reports;
- local env/config references;
- active prompt package guardrails;
- relevant backend/auth docs only if needed.

Use `hb-security-and-secrets-auditor`.
Do not print or preserve secret values.

### Tenant / Deployment / External-System Review

Read:

- active prompt package;
- touched deployment/config files;
- package manifests and SPFx manifests when relevant;
- CI/CD workflow files when relevant;
- closeout/gating docs.

Use `hb-tenant-deployment-gatekeeper`.
Require explicit user authorization before tenant/deployment/external-system actions.

### Working Plan Creation

Read:

- `.claude/rules/06-planning-and-proposals.md`;
- the relevant local code and scoped plan docs;
- `docs/README.md` only if the user explicitly wants the plan promoted into canonical docs.

Default persistence for working plans is `.claude/plans/**`.
Write into `docs/architecture/plans/**` only when the user explicitly requests a canonical plan artifact or update.

---

## Efficiency Rules

- Do not start every session by reading all major architecture docs.
- Do not reread files already in current session context unless something changed, line-level verification is needed, or the task widened.
- Prefer the nearest authoritative source that answers the question.
- Escalate to broader doctrine only when local/project sources are insufficient.
- Use specialist agents when the task clearly fits and they can reduce main-context load.
- Keep Claude working plans in `.claude/plans/**` unless the user explicitly requests a canonical docs-library write.
