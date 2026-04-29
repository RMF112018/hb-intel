# 04 — Documentation Standards

## Purpose

Keep HB Intel documentation authoritative, navigable, current, and separated by purpose.

---

## Primary Rule

Documentation should clarify authority, not create competing sources of truth.

Do not place exploratory notes, scratch plans, or one-off analysis inside canonical documentation paths unless the user explicitly asks to promote them.

---

## Documentation Type Boundaries

Use this distinction:

| Type | Purpose |
|---|---|
| README | Orientation, navigation, source-of-truth hierarchy, how to use a directory. |
| Blueprint | Architecture doctrine, target architecture, product boundaries. |
| Roadmap | Sequencing, phase/wave status, acceptance criteria, execution plan. |
| Contract | Implementable structure, permissions, settings, validation, and MVP boundaries when named as source of truth. |
| Prompt package README | Scoped execution guidance for a specific prompt/package/wave. |
| Decision register | Frozen, deferred, runtime-configurable, proof-gated, or open decisions. |
| Validation matrix | Proof obligations and validation commands/results. |
| Scope lock | What is in/out of a particular execution step. |
| Closeout | Historical proof and completion evidence. |
| ADR | Durable architectural decision and rationale. |
| Working plan | Temporary or exploratory planning artifact. |

---

## Placement Defaults

Use:

- `docs/**` for approved repository documentation and canonical artifacts.
- `docs/architecture/plans/**` for canonical development plan library entries.
- `.claude/plans/**` for Claude-generated working plans, draft plans, exploratory outlines, and temporary planning artifacts when a file is useful.
- Inline chat output for most lightweight planning unless persistence adds real value.
- `.claude/rules/**` for Claude Code behavioral rules.
- `.claude/skills/**` for reusable workflow playbooks.
- `.claude/agents/**` for specialist agents.

Do not write exploratory or working plans into `docs/architecture/plans/**` unless the user explicitly asks to create, revise, or promote a canonical plan there.

---

## Documentation Update Triggers

Update documentation when a change affects:

- public behavior;
- package exports;
- source-of-truth hierarchy;
- validation commands;
- user workflow;
- setup, build, deployment, or provisioning process;
- runtime boundaries;
- app shell behavior;
- shared UI doctrine;
- agent/Skill/rule routing;
- prompt package status;
- phase/wave completion;
- architecture or security posture.

Do not update documentation just to restate code comments or add noise.

---

## Documentation Quality Standard

Good documentation is:

- current;
- concise;
- placed in the right authority layer;
- explicit about scope;
- clear about status;
- linked to governing sources;
- free of stale aspirational claims;
- specific enough for the next agent/developer to act.

Avoid:

- duplicating long blocks across docs;
- conflicting authority statements;
- mixing target state with completed state;
- using old summaries as current proof;
- vague claims like “fully aligned” without evidence;
- turning scratch notes into doctrine.

---

## Prompt Package Documentation

Prompt package docs should include:

- objective;
- scope;
- files to inspect;
- files allowed to modify;
- files forbidden to modify;
- governing docs;
- guardrails;
- validation expectations;
- deliverables;
- reporting format;
- commit summary/description requirements when applicable.

Prompt packages should not silently authorize:

- tenant mutation;
- live Graph/PnP;
- Procore calls;
- app catalog deployment;
- CI/CD edits;
- package/manifest version changes;
- dependency installs/upgrades;
- broad cleanup outside the stated scope.

Use `hb-prompt-package-builder` for repeatable package generation.

---

## Documentation Authority Cleanup

Use `hb-doc-authority-cleanup` or `hb-docs-curator` when:

- docs contradict each other;
- README points to missing/stale files;
- rule index points to the wrong file path;
- blueprint/roadmap/contract authority overlaps;
- old prompt package guidance conflicts with current closeout;
- documentation overstates implementation status;
- new Skills/agents/rules require routing updates.

---

## Formatting and Validation

For docs-only work, default validation is:

- inspect `git diff -- <changed docs>`;
- inspect `git status --short`;
- run `pnpm format:check` only when expected by repo convention, when Markdown formatting is material, or when requested.

Do not run broad builds/tests for docs-only work unless documentation affects generated files, command references, package behavior, or repo tooling.

---

## Closeout Documentation

Closeouts should state:

- what changed;
- files modified;
- validation run;
- validation result;
- guardrails preserved;
- what was not done;
- known gaps;
- commit summary;
- commit description.

Closeouts are proof of what happened. They are not governing target architecture unless explicitly promoted.
