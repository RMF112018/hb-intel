# Prompt 07 — PCC SPFx Shell Scaffold, Gated Implementation

## Objective

Create the initial Project Control Center SPFx shell scaffold only if the Phase 3 Implementation Gate Review explicitly authorizes SPFx implementation.

This prompt is blocked by default. Do not execute unless Prompt 06 produced a ready decision that explicitly authorizes SPFx shell scaffold work.

## Required Gate

Before starting, verify:

- Phase 3 Implementation Gate Review exists.
- Gate decision authorizes SPFx shell scaffold.
- Phase 2 outputs required by the gate are stable.
- UI doctrine mapping and shell design spec exist.
- No implementation binds to unstable `@hbc/project-site-provisioning` exports.
- No direct provisioning execution is required.
- No direct Graph/PnP mutation from SPFx is required.
- No direct SPFx-to-Procore call is required.

If any item fails, stop and produce a blocked closeout.

## Required Repo Sources

Audit before implementation:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Implementation_Gate_Review.md
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_SPFX_Shell_Design_Spec.md
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/reference/ui-kit/doctrine/**
docs/reference/spfx-surfaces/**
apps/**
packages/**
```

## Allowed Files

Allowed files must be determined by the gate review.

Likely future targets may include:

```text
apps/project-control-center/**
```

or an existing SPFx host package path if the gate review determines that is repo-correct.

Only modify files explicitly required for the scaffold.

## Forbidden Scope

Always forbidden:

- backend executor implementation
- tenant mutation
- Graph/PnP live mutation
- direct SPFx provisioning
- direct SPFx-to-Procore calls
- Procore runtime code
- Procore secrets
- Procore mirror/write-back
- deployment workflow changes
- production rollout
- package/version bumps unless explicitly authorized by repo policy and gate review

## Required Implementation Constraints

If authorized:

- Build a thin shell scaffold only.
- Use repo UI doctrine and `@hbc/ui-kit` standards.
- Include professional loading, empty, partial-configuration, and access-denied states.
- Include no live tenant mutation.
- Use mock/static placeholder data only unless a stable approved read model exists.
- Keep all provisioning controls disabled or read-only.
- Include clear TODO/gate comments only where repo standards permit.
- Do not create fake SharePoint shell chrome.
- Do not duplicate native SharePoint navigation unnecessarily.
- Do not clone hbKudos; use comparable quality discipline.

## Required Closeout Documentation

If implementation proceeds, create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Prompt_07_SPFx_Shell_Scaffold_Closeout.md
```

Include:

- Gate evidence
- Files changed
- What was implemented
- What remains blocked
- Validation commands
- UI doctrine compliance notes
- Known limitations
- No tenant/provisioning mutation confirmation
- Recommended next prompt

## Validation

Run only the validation appropriate to touched files.

At minimum:

```bash
git status --short
```

Likely if SPFx/package code changes:

```bash
pnpm check-types
```

Run narrower package/app commands if repo structure provides them.

Do not run deployment or tenant commands.

## Required Final Response

Return only:

```text
Commit summary
Commit description
Validation results
Gate evidence
Recommended next prompt
```

## Recommended Commit Summary

```text
feat(pcc): scaffold project control center spfx shell
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: <fill only if repo policy required a package/SPFx version change; otherwise state no version change>

Adds the gated initial PCC SPFx shell scaffold authorized by the Phase 3 Implementation Gate Review. Establishes the future project-site operating surface structure without tenant mutation, backend executor behavior, Graph/PnP mutation, or Procore runtime.

Validation:
- <fill exact commands and results>

Gate evidence:
- <cite Phase 3 Implementation Gate Review decision>

No tenant mutation. No backend executor. No direct SPFx provisioning. No direct SPFx-to-Procore calls. No Procore secrets, mirror, or write-back.
```
