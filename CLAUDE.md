# HB Intel Claude Code Operating Brief

## Purpose

Build and evolve HB Intel with maintainable, production-grade code while preserving repo truth, package boundaries, documentation discipline, targeted verification, security posture, and premium UI quality where UI work is involved.

## Primary Objective

Optimize for:

- maintainable code;
- clear package boundaries;
- disciplined documentation;
- targeted verification;
- minimal context bloat;
- current repo-truth alignment;
- safe implementation boundaries;
- premium, signature-quality shared UI when the task touches cross-surface UX, SPFx surfaces, or `@hbc/ui-kit`.

---

## Rule Index

Use `.claude/rules.md` as the detailed rule index for:

- source-of-truth routing;
- architecture invariants;
- package boundaries;
- documentation standards;
- implementation quality;
- planning and proposals;
- plan review and execution gates;
- active context efficiency;
- project-specific rules.

`CLAUDE.md` is the operating brief. `.claude/rules.md` is the detailed rule router.

---

## Start Here

For each task, identify the active scope first:

- local package or app;
- phase, wave, or prompt package;
- project-specific architecture area;
- UI/SPFx surface;
- backend, provisioning, deployment, or tenant-sensitive area;
- docs-only update.

Read the smallest authoritative source set needed. Do not start by rereading the whole repo.

Use:

- `docs/reference/developer/agent-authority-map.md` for source routing when unclear;
- `docs/reference/developer/verification-commands.md` for validation routing;
- `docs/reference/developer/documentation-authoring-standard.md` for documentation updates;
- `.claude/rules.md` for detailed repo operating rules;
- `.claude/agents/README.md` for specialist-agent routing.

For UI, SPFx, shared UI, or `@hbc/ui-kit` work, use the UI governance routing section in this file before implementation.

Do not reread files already in current context unless they changed, the context is stale, line-level verification is needed, final validation requires proof, or scope expanded.

---

## Authority Hierarchy

Use current repo truth first.

Default order:

1. live files, package manifests, exports, tests, configs, and nearby README files in the touched area;
2. active prompt package README, decision register, validation matrix, scope lock, and closeout docs when phase/wave work is involved;
3. project-specific governing docs when the task names a product area;
4. `.claude/rules.md` and `.claude/rules/**`;
5. developer reference docs for source routing, verification, and documentation standards;
6. broad architecture docs only when local/project truth is insufficient.

Historical plans and old summaries are context only. They do not override current repo truth.

If legacy UI doctrine conflicts with live `@hbc/ui-kit` code, active migration work, newer basis-of-design assets, or verified consumer reality, treat verified repo state and current governing decisions as authoritative.

---

## UI Governance Routing

Before implementing or modifying UI, shared UI, SPFx surfaces, `@hbc/ui-kit`, brand assets, typography, layout systems, or UI documentation, read the smallest applicable set from this routing model.

### Required Entry Points

Start with these files when the task touches UI governance, UI implementation, SPFx surfaces, or `@hbc/ui-kit`:

1. `docs/reference/ui-kit/AGENT-USAGE-GUIDE.md`
2. `docs/reference/ui-kit/GOVERNANCE-MAP.md`
3. `docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md`

Use them to determine which doctrine, overlay, scoring, standard, pattern, or reference file applies.

### Precedence Rule

Apply UI guidance in this order:

1. runtime doctrine;
2. runtime overlays;
3. acceptance and scoring model;
4. active supporting standards;
5. active supporting patterns;
6. Layer 3 component/layout references.

Component docs, layout references, brand docs, old planning docs, and examples do not override runtime doctrine, overlays, or the acceptance/scoring model.

### Homepage SPFx Authority Chain

For homepage SPFx webparts and homepage shell work, use:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
4. `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
5. `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
6. `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md` when evidence or closeout is required.

Homepage-only rules do not automatically apply to full-page/PCC SPFx surfaces.

### Full-Page / PCC SPFx Authority Chain

For PCC, Project Sites, full-page SPFx apps, command-center surfaces, domain workbenches, and major SPFx widgets, use:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
3. `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
4. SPFx scorecard/evidence artifacts under `docs/reference/spfx-surfaces/`
5. active supporting standards under `docs/reference/ui-kit/standards/`
6. active supporting patterns under `docs/reference/ui-kit/patterns/`
7. Layer 3 component/layout references only after the governing doctrine chain is satisfied.

For PCC-style work, preserve the intended product posture: polished executive command center, premium custom-built HB product, and high-density project-controls cockpit where appropriate. Avoid generic enterprise-card-grid outcomes and fixed equal-height row traps when they harm hierarchy, density, or scan quality.

### PWA Authority Chain

For PWA surfaces, use:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md` when scoring/closure is required;
3. relevant standards/patterns only when they do not conflict with PWA doctrine;
4. component/layout references for API or usage detail only.

### Component and Layout References

`docs/reference/ui-kit/Hbc*.md` files are Layer 3 component references.

`DashboardLayout.md`, `WorkspacePageShell.md`, and `ListLayout.md` are Layer 3 layout references.

Use these files for API/usage details only. They do not override runtime doctrine, overlays, acceptance/scoring, active supporting standards, or active supporting patterns.

Special constraints:

- `HbcAppShell.md` does not authorize fake SharePoint shell duplication.
- `HbcTypography.md` remains subject to runtime doctrine, brand governance, and the font-clearance record.

### Brand and Font Routing

Reusable brand assets must route through:

- `@hbc/ui-kit/branding`
- `packages/ui-kit/src/branding/assets/`

Do not import raw brand assets from `docs/reference/brand/` into product code.

For brand and logo usage, consult:

1. runtime doctrine for the consuming surface;
2. `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`;
3. `docs/reference/brand/BRAND-ASSET-INVENTORY.md`.

For fonts, consult:

1. `docs/reference/brand/FONT-LICENSE-CLEARANCE.md`;
2. governed UI-kit theme font exports/tokens under `packages/ui-kit/src/theme/fonts/` and related theme exports.

Current approved font usage, if present in repo truth, is limited to governed UI-kit theme tokens/registry. Raw app imports, app-local font placement, external redistribution, and expanded usage remain prohibited unless separately approved.

### UI Validation and Evidence

For UI/SPFx changes, select validation based on scope:

- changed-file or package-local checks first;
- `@hbc/ui-kit` type/build/test/lint when shared UI exports, theme, branding, or components change;
- SPFx source/build/manifest/runtime checks when hosted behavior is affected;
- screenshot/evidence artifacts when acceptance, scoring, or breakpoint/container-fit proof is required.

Do not claim UI completion from source inspection alone when hosted SPFx behavior is material.

---

## Specialist Routing

Use `.claude/agents/README.md` for the full agent index.

Use specialists only when the task clearly fits. Do not call specialists for trivial local work.

When a task spans concerns, use the highest-risk relevant specialist first.

Recommended risk order:

1. security/secrets;
2. tenant/deployment;
3. SPFx runtime parity;
4. package boundary;
5. implementation-plan review;
6. verification;
7. documentation;
8. UI/UX;
9. repo research.

This is not a rigid call order. If the area is unfamiliar, use `hb-repo-researcher` first to establish repo truth.

---

## Project-Specific Rules

When a task touches a named project or product area, check for project-specific rules under:

```text
.claude/rules/projects/
```

For PCC work, follow:

```text
.claude/rules/projects/pcc-phase-3.md
```

Project-specific rules supplement this root brief. They do not make the root configuration project-specific.

---

## Locked Invariants

Protect these unless the user explicitly asks to revisit them or a new ADR/governing decision supersedes them:

- HB Intel remains a multi-surface platform; PWA and SPFx constraints matter.
- Package dependency direction must remain architecturally correct.
- Feature packages must not become a web of direct cross-feature dependencies.
- Durable reusable visual UI belongs in `@hbc/ui-kit` or an explicitly approved successor shared UI boundary.
- Shared behavior spanning feature areas belongs in shared/platform packages, not copied across features.
- Shared UI should move toward token-first foundations, clear primitive families, and deliberate surface families.
- Preserve compatibility through adapters, wrappers, or export shims when evolving shared UI unless the task explicitly calls for a breaking rebuild.
- Durable architectural reversals require deliberate documentation, usually via ADR.

---

## Plan and Execution Gates

For prompt-package, phase/wave, risky, cross-cutting, architecture, SPFx, backend, provisioning, deployment, Graph/PnP, Procore, permission, or CI/CD work:

1. Produce a plan first.
2. Wait for user approval before execution.
3. Execute only the approved scope.
4. Do not expand into adjacent cleanup unless explicitly authorized.
5. Do not stage unrelated files.
6. Do not push unless explicitly instructed.
7. Report:
   - files inspected;
   - files modified;
   - validation commands run;
   - validation results;
   - guardrails preserved;
   - known gaps or uncertainty;
   - commit summary;
   - commit description.

Claims are not proof. Verify current files and command results before claiming completion.

Use:

- `.claude/rules/07-plan-review-and-execution-gates.md`;
- `.claude/agents/hb-implementation-plan-reviewer.md`.

---

## Sensitive-Operation Guardrails

Unless explicitly authorized by the user and supported by the governing prompt, do not:

- mutate SharePoint or any tenant resource;
- call live Graph/PnP;
- call Procore;
- add Procore secrets, mirrors, or write-back behavior;
- introduce direct SPFx-to-Procore calls;
- deploy to app catalog;
- generate or upload `.sppkg` packages;
- edit CI/CD workflows;
- change package or manifest versions;
- push commits;
- run destructive git or shell commands;
- stage unrelated files.

Use:

- `hb-security-and-secrets-auditor` for secrets, auth-proof, app-setting, token, or sensitive artifact risk;
- `hb-tenant-deployment-gatekeeper` for tenant, deployment, app catalog, Azure, Graph/PnP, CI/CD, permission, or rollout risk.

---

## UI-System Posture

When the task touches `@hbc/ui-kit`, shared tokens, shared primitives, SPFx surfaces, basis-of-design assets, or broad UI doctrine:

- follow the UI Governance Routing section before implementation;
- think in layers: foundations → primitives → surface families → consumers;
- treat premium authored quality as a first-class requirement;
- distinguish reusable primitives from feature-specific compositions;
- distinguish shared cross-surface UI from route-specific or webpart-specific authored assemblies;
- preserve compatibility through adapters or staged migration when needed;
- flag stale or over-restrictive UI doctrine instead of silently working around it;
- do not preserve legacy wrapper/layout patterns just because they compile;
- inspect saved basis-of-design assets when they are named by the task;
- treat basis-of-design assets as visual direction, not pixel-perfect requirements, unless the prompt explicitly says otherwise.

Use `hb-ui-ux-conformance-reviewer` when ownership, reuse, premium direction, basis-of-design fit, accessibility, responsive behavior, or doctrine drift is materially in play.

---

## Execution, Verification, and Docs

For implementation work:

1. inspect the touched area;
2. read only relevant authority docs;
3. make the smallest correct change;
4. verify the changed scope;
5. update docs when behavior, exports, boundaries, workflows, public expectations, or shared UI expectations change.

Use the smallest meaningful verification set first:

1. changed-file or package-local checks;
2. affected-package lint, typecheck, and tests;
3. broader workspace validation only when cross-cutting, release-critical, or requested.

Do not claim completion without stating what was actually verified.

For docs-only work, default validation is:

- `git diff -- <changed docs>`;
- `git status --short`;
- `pnpm format:check` only if expected by repo convention or requested.

For documentation work, follow:

- `docs/reference/developer/documentation-authoring-standard.md`;
- `.claude/rules/04-documentation-standards.md`.

---

## Documentation and Planning Artifact Defaults

Keep working artifacts out of canonical documentation unless explicitly promoted.

Default distinction:

- `docs/**` contains repository documentation and approved canonical artifacts.
- `docs/architecture/plans/**` is the canonical development plan library.
- `.claude/plans/**` is the default location for Claude-generated working plans, draft plans, exploratory outlines, and temporary planning artifacts when a file is useful.
- Inline chat output remains the default for most planning unless persistence adds real value.

Do not write exploratory or working plans into `docs/architecture/plans/**` unless the user explicitly asks to create, revise, or promote a canonical plan document there.

---

## Active Context Efficiency

Do not reread files that are still within active context or memory unless:

- the file may have changed;
- line-level verification is needed;
- final validation or closeout reporting requires proof;
- the scope expanded;
- the user asks for a repo-truth audit;
- the task involves post-execution validation;
- the file is a governing source of truth for the current task.

When in doubt, verify the current file rather than relying on stale memory.

Efficiency must not override repo-truth validation.

---

## Response Style

Be direct and efficient.

- Avoid ritualized preambles.
- Reference governing sources only when they materially affect the decision.
- Keep answers focused on the task.
- Separate evidence from recommendation.
- State assumptions and uncertainty explicitly.
- Prefer bullets and clear sections.
- When corrective action is needed, provide a copy-ready prompt or instruction for the next agent step.

---

## When Unsure

Use `.claude/rules.md` first.

Use `hb-repo-researcher` when uncertainty crosses code, ownership, architecture, or documentation boundaries.

Use `hb-implementation-plan-reviewer` when a plan or execution report needs approval before proceeding.

Use `hb-security-and-secrets-auditor` or `hb-tenant-deployment-gatekeeper` when the uncertainty involves secrets, auth, tenant mutation, deployment, Graph/PnP, Procore, or CI/CD.

Use `hb-spfx-runtime-parity-auditor` when uncertainty involves SPFx source/build/manifest/runtime/hosted parity.

State uncertainty explicitly rather than guessing.
