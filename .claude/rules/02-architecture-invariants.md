# 02 — Architecture Invariants

## Purpose

Protect durable HB Intel architecture decisions while allowing deliberate, documented evolution.

---

## Primary Rule

Do not make architectural reversals casually.

Any change that affects package direction, shared UI foundations, app shell behavior, auth boundaries, provisioning posture, tenant/runtime behavior, or integration patterns must be deliberate, verified, and documented.

---

## Platform Invariants

Protect these unless the user explicitly asks to revisit them or a newer ADR/governing decision supersedes them:

- HB Intel remains a multi-surface platform.
- PWA and SPFx constraints both matter.
- Package dependency direction must remain architecturally correct.
- Feature packages must not become a web of direct cross-feature dependencies.
- Durable reusable visual UI belongs in `@hbc/ui-kit` or an explicitly approved successor shared UI boundary.
- Shared behavior spanning feature areas belongs in shared/platform packages, not copied across features.
- Shared UI should move toward token-first foundations, clear primitive families, and deliberate surface families.
- Preserve compatibility through adapters, wrappers, or export shims when evolving shared UI unless the task explicitly calls for a breaking rebuild.
- Durable architectural reversals require deliberate documentation, usually through ADR or current governing architecture docs.
- Runtime integrations must respect explicit backend/proxy/security boundaries.
- SPFx surfaces must respect SharePoint host constraints, package manifests, and hosted/runtime parity requirements.

---

## App Shell and Surface Invariants

When touching shells or app surfaces:

- Distinguish full app routes from SPFx-hosted surfaces.
- Do not assume PWA layout behavior automatically works in SharePoint-hosted webparts.
- Preserve route ownership and host/container contracts.
- Do not introduce rigid layout patterns where current doctrine requires responsive or bento-style flexibility.
- Do not silently bypass shared shell or shared design-system expectations.
- Preserve accessible keyboard/focus behavior.
- Preserve error, empty, fallback, and preview states where user-facing content can be absent.

---

## Shared UI Invariants

When touching `@hbc/ui-kit`, shared tokens, shared primitives, SPFx surfaces, or basis-of-design assets:

- Think in layers:
  1. foundations;
  2. primitives;
  3. surface families;
  4. composed feature UI;
  5. product-specific authored experiences.
- Distinguish reusable primitives from route-specific or webpart-specific assemblies.
- Distinguish shared cross-surface UI from local product composition.
- Use token-first styling for shared UI.
- Preserve compatibility unless the task explicitly authorizes migration/breakage.
- Do not preserve legacy wrapper/layout patterns merely because they compile.
- Inspect named basis-of-design assets when referenced.
- Treat basis-of-design assets as visual direction, not pixel-perfect requirements, unless the prompt explicitly says otherwise.
- Flag stale or over-restrictive UI doctrine rather than silently working around it.

Use `hb-ui-doctrine-conformance` or `hb-ui-ux-conformance-reviewer` when UI ownership, reuse, doctrine drift, responsive behavior, accessibility, or basis-of-design fit is material.

---

## Backend / Integration Invariants

Do not introduce or modify backend/integration behavior without respecting explicit boundaries.

Unless explicitly authorized by the user and supported by current governing docs, do not:

- call live Graph/PnP;
- call Procore;
- mutate SharePoint tenants;
- add Procore secrets, mirrors, or write-back behavior;
- introduce direct SPFx-to-Procore calls;
- deploy to Azure or app catalog;
- edit CI/CD workflows;
- change package or manifest versions.

Use `hb-sensitive-operation-gate` and the tenant/deployment/security agents before sensitive execution.

---

## Provisioning Invariants

For SharePoint provisioning, project-site provisioning, list schema work, and tenant state:

- Prefer dry-run/proof artifacts first.
- Treat tenant mutation as explicitly gated.
- Preserve list schema truth and index discipline.
- Do not infer live tenant state from static files.
- Do not run PnP/M365/Graph/az mutation commands without explicit authorization.
- Keep proof artifacts redacted and deterministic.
- Separate read-only inspection from mutation.

---

## Documentation Invariants

Architecture docs define target state and boundaries.

Roadmaps define sequencing and acceptance criteria.

Contracts define implementable structures, permissions, settings, validation, and MVP boundaries when named as the implementation source of truth.

Prompt package READMEs define scoped execution guidance only.

Closeouts are historical proof and completion evidence.

Do not let these document types drift into overlapping authority without noting and correcting the overlap.

Use `hb-doc-authority-cleanup` or `hb-docs-curator` when documentation authority is material.

---

## When Architecture Changes Are Appropriate

Architecture may change when:

- current repo truth proves a documented rule is stale;
- the user explicitly approves a new direction;
- a current ADR or governing document supersedes older doctrine;
- a package boundary is proven wrong by implementation evidence;
- security, deployment, or runtime constraints require correction.

When changing architecture:

1. identify the prior governing source;
2. explain why it is changing;
3. update the appropriate canonical docs;
4. preserve compatibility or document migration;
5. validate affected contracts;
6. report residual risks.
