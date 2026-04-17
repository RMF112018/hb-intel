# Plan Summary — Enhanced Wave 02 Shell-Only Package

## Objective

Upgrade the homepage shell from “good future-state groundwork” into a shell architecture that is:

- governance-aware
- entry-stack-aware
- persistable without entropy
- prepared for a future maintainer control panel
- provable against the shell-entry breakpoint spec

## Executive conclusion

The attached Wave 02 package correctly identified the direction of travel but under-described the current repo state and under-shot the real shell-only gaps.

The live repo already contains:

- a shell governance registry
- protected/configurable decisions
- approved presets
- override parsing
- preview helpers
- container-aware entry-state resolution
- basic shell validation tests

That means the replacement package should not ask the local code agent to “add the basics.”
It should ask the agent to harden, bound, align, and prove the shell.

## What is actually missing

### 1. The shell lacks a shared entry-stack contract
The doctrine and breakpoint spec govern **hero + priority actions + first shell lane** as one composed entry sequence.

The runtime still mounts those as separate surfaces without a shared shell-owned conformance contract.

### 2. Persisted policy is under-specified
Current layout input is permissive enough for preview and lightweight overrides, but not strong enough for future control-panel persistence.

The shell needs a versioned, bounded, rejectable policy shape.

### 3. Presets exist, but preset governance is still too informal
The approved presets are real, but the shell still needs stricter canonical rules for:

- semantic-role integrity
- empty-band policy
- override permission boundaries
- code-governed vs maintainer-configurable decisions

### 4. Mode negotiation is weak
The shell computes comfort and render-mode decisions, but it does not yet own a robust mode-negotiation seam that future shell consumers and hosted surfaces can rely on as a first-class contract.

### 5. Closure proof is too shallow
Existing tests prove basic validation behavior.
They do not yet prove:

- shell-entry spec conformance
- first-lane pairing and stacking expectations across target states
- reflow-safe behavior under constrained conditions
- governance rejection of unsafe persisted inputs
- shared entry-stack contract behavior

## Recommended sequence

### Prompt 01
Harden the shell governance registry and decision model.

### Prompt 02
Define a versioned shell layout policy and persisted boundary.

### Prompt 03
Canonicalize presets, band semantics, and override permissions.

### Prompt 04
Establish a shared entry-stack breakpoint contract across hero, priority actions, and first lane.

### Prompt 05
Add shell-owned mode-negotiation and container conformance seams.

### Prompt 06
Build proof-grade conformance harnesses, tests, and closure artifacts.

## Why this sequence

- Prompt 01 clarifies what the shell owns.
- Prompt 02 constrains what can be stored or changed later.
- Prompt 03 prevents preset drift before cross-surface coordination is introduced.
- Prompt 04 closes the biggest doctrinal shell-only gap.
- Prompt 05 turns shell decisions into a reusable contract rather than passive diagnostics.
- Prompt 06 turns the whole program into something reviewable and approvable.

## Non-negotiable scope guardrail

This package remains shell-only.

If the local code agent reaches for module redesign as the primary answer, it is drifting.
The correct shell-only answer is to strengthen shell contracts, boundaries, and proof while keeping hosted surface work out of scope unless a minimal shell seam change requires a narrow integration touch.
