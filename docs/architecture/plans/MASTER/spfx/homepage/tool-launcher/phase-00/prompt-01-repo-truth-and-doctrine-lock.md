# Prompt 01 — Repo-Truth Audit and Doctrine Lock

## Objective

Conduct a focused repo-truth audit of the Tool Launcher / Work Hub surface in the live `hb-intel` repo and lock the implementation posture to the governing SPFx doctrine and homepage overlay.

## Primary repo

- `https://github.com/RMF112018/hb-intel`

## Required files to inspect first

Inspect these files before forming conclusions:

- `apps/hb-webparts/README.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `packages/ui-kit/src/HbcLauncherSurface/index.tsx`

Also review any directly adjacent manifest, styles, helper, and shared homepage files that materially affect the Tool Launcher surface.

## Working rules

- repo truth first
- do not re-read files still in your current context unless needed
- do not broaden scope beyond the Tool Launcher / Work Hub and directly related homepage lane files
- do not redesign the launcher yet
- do not implement code yet unless the prompt explicitly instructs it
- do not treat stale plan assumptions as still valid if repo truth and updated planning inputs supersede them

## What you must determine

1. how the current Tool Launcher is actually wired
2. whether it is using local grouped config versus live data
3. which shared primitives it depends on
4. how it sits in the homepage lane and zone model
5. where the current implementation is aligned with doctrine
6. where it is underpowered versus the premium marketplace target

## Required output

Produce a markdown audit file named:

- `phase-00-repo-truth-doctrine-lock.md`

The file must include these sections:

### 1. Current Surface Summary
Summarize what the current launcher is, where it lives, and how it renders.

### 2. Current Data Contract
Document the current contract shape in practical terms.

### 3. Current Primitive Stack
List the local and shared primitives the launcher depends on.

### 4. Doctrine Lock
State the binding doctrine rules that control the launcher going forward.

### 5. Immediate Constraints
State what the next phase must respect.

### 6. Retired Assumptions
Call out assumptions that must be retired immediately.

## Required conclusion

End with a direct statement confirming that the next data-related phase is:

**Live SharePoint list wiring and data adapter foundation**

and not schema ideation or grouped-config polishing.
