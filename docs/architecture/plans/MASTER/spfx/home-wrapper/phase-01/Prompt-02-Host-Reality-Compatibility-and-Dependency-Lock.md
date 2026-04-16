# Prompt Title

Prompt 02 — SharePoint/SPFx Host Reality, Compatibility, and Dependency Lock

## Objective

Lock the external technical realities that must shape the `hb-homepage` implementation before architecture and coding begin.

## Why this prompt exists now

The original package jumped from repo-truth to architecture too quickly. That left critical technical issues under-specified:

- full-width host reality
- communication-site limitations
- workbench validation limits
- SPFx compatibility boundaries
- the repo’s React 18 + Vite + shell-packaging posture
- dependency reuse versus duplicate installation
- reduced-motion/accessibility obligations

Those issues must be explicitly locked before the architecture prompt, or the code agent will fill gaps with unsafe assumptions.

## Current repo truth

The live repo already shows:

- `apps/hb-webparts` uses React 18 and Vite build scripts
- `@microsoft/sp-webpart-base` is pinned at SPFx 1.20 in `apps/hb-webparts`
- `packages/ui-kit` already contains doctrine-approved packages such as `motion`, `lucide-react`, `@floating-ui/react`, Radix packages, `class-variance-authority`, and `clsx`
- the packaging pipeline explicitly drives SPFx shell packaging through Node 18 and custom asset/manifest handling

## Intended future state

At completion of this prompt, the package has a clear, documented technical lock on:

- what host behavior can be assumed
- what cannot be assumed
- what compatibility model must be preserved
- what dependency posture must be followed
- what accessibility/motion standards must be proven later

## Research-informed technical considerations

You must research and explicitly translate into implementation rules:

1. SharePoint full-width support for SPFx webparts
2. communication-site versus generic page assumptions
3. workbench limits for full-width validation
4. SPFx version compatibility relevant to Node and React
5. reduced-motion obligations for interaction-triggered animation
6. whether doctrine-approved packages already present in `@hbc/ui-kit` should be reused instead of reinstalled locally

The output must explain how those findings apply to **this repo**, not just summarize docs.

## Required implementation scope

Create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/02-Host-Reality-Compatibility-and-Dependency-Lock.md`

The document must include:

1. full-width host reality and testing rules
2. communication-site validation rules
3. workbench limitations
4. SPFx/Node/React compatibility implications for this repo
5. explicit rule about preserving the current Vite + SPFx shell model unless later prompts intentionally broaden scope
6. dependency posture:
   - reuse `@hbc/ui-kit/homepage` first
   - no casual local reinstallation of premium-stack packages
7. reduced-motion, focus, keyboard, sparse-state, and partial-config obligations
8. exact implementation consequences for Prompts 03–09

## Explicit non-scope

- Do not implement the architecture yet
- Do not add dependencies yet
- Do not create `hb-homepage` yet
- Do not modify packaging yet

## Required verification / burden of proof

The document must state, without ambiguity:

- whether `hb-homepage` should be authored as full-width-capable
- what environment is required to prove that behavior
- what dependency additions are currently justified or unjustified
- what compatibility “cleanup” must be avoided during Phase 01

## Required output artifact(s)

- `02-Host-Reality-Compatibility-and-Dependency-Lock.md`

## Completion standard

This prompt is complete only when later prompts can rely on a settled technical boundary instead of guessing about host, compatibility, dependency, or accessibility rules.
