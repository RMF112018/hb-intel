# 06 — Planning and Proposals

## Purpose

Define how Claude Code should prepare plans, proposals, prompt packages, and saved planning artifacts for HB Intel.

---

## Primary Rule

Plans should be actionable, scoped, evidence-based, and approval-gated when risk is material.

Do not turn a proposal into execution without explicit user approval when the work is risky, cross-cutting, sensitive, or phase/wave-driven.

---

## When to Plan First

Produce a plan before execution when the work touches:

- prompt packages;
- phase/wave work;
- cross-package changes;
- architecture;
- SPFx runtime or hosted parity;
- backend behavior;
- provisioning;
- deployment;
- Graph/PnP;
- Procore;
- permissions;
- CI/CD;
- package versions;
- manifest versions;
- security/secrets;
- tenant mutation;
- broad UI doctrine;
- broad documentation authority.

For simple local edits, direct execution may be acceptable if the user clearly requested the change and no gate applies.

---

## Plan Content Standard

A good implementation plan includes:

- objective;
- current repo-truth sources to inspect;
- files/directories in scope;
- files/directories out of scope;
- implementation steps;
- guardrails;
- validation plan;
- expected deliverables;
- approval requirement;
- known risks or assumptions.

For phase/wave work, also include:

- governing prompt package;
- decision register;
- validation matrix;
- scope lock;
- closeout requirements;
- commit summary/description expectations.

Use `hb-plan-gate-review` when reviewing a plan.

---

## Prompt Package Standard

A prompt package should be copy-ready and non-ambiguous.

It should include:

- title;
- objective;
- mandatory repo-truth inspection requirements;
- allowed changes;
- forbidden changes;
- relevant files and directories;
- guardrails;
- exact deliverables;
- validation requirements;
- reporting requirements;
- no-deferral language;
- instruction not to reread files still in current context unless needed;
- commit summary and description format if execution is expected.

Use `hb-prompt-package-builder` when generating prompt packages.

---

## Better-Path Recommendations

When a user proposes a path that is workable but suboptimal, recommend a better path when:

- it reduces risk;
- it avoids tenant/deployment exposure;
- it preserves package boundaries;
- it avoids documentation authority drift;
- it improves validation;
- it avoids over-engineering;
- it prevents rework.

Keep recommendations decision-useful, not academic.

---

## Saved Planning Artifacts

Default:

- Use inline chat for lightweight plans.
- Use `.claude/plans/**` for Claude-generated working plans, exploratory outlines, draft implementation plans, or temporary planning files.
- Use `docs/architecture/plans/**` only for canonical plan library artifacts when explicitly requested.
- Use project-specific docs only when the plan is being promoted to canonical project documentation.

Do not put scratch planning into canonical docs.

---

## Proposal vs Execution Boundary

A proposal may recommend:

- files to change;
- validations to run;
- docs to update;
- risks to address;
- prompts to execute.

A proposal must not:

- mutate files unless requested;
- stage or commit changes;
- run high-risk commands;
- deploy;
- call live tenant systems;
- broaden scope into adjacent cleanup.

---

## Review Standard

When reviewing an agent plan, check:

- Does it inspect the right repo-truth sources?
- Does it respect scope?
- Does it overreach?
- Does it mutate sensitive systems?
- Does it alter package/manifests/CI/CD without approval?
- Does it identify validation?
- Does it include docs where needed?
- Does it preserve known guardrails?
- Does it avoid re-reading unnecessary files while preserving evidence?

Use `hb-plan-gate-review`.

---

## Reporting Standard

Planning output should state:

- recommended path;
- assumptions;
- required decisions;
- risks;
- validation expectations;
- next prompt or execution package if requested.
