# Prompt 03 — PCC SPFx Shell Design Spec, Planning Only

## Objective

Create a documentation-only SPFx shell design specification for the Project Control Center (PCC). The spec must map the future PCC shell to repo UI doctrine, SPFx host constraints, benchmark-grade quality expectations, breakpoint behavior, state-model requirements, and contract-backed PCC regions.

Do not create or modify SPFx code. Do not create `apps/project-control-center/`. Do not edit existing apps, packages, manifests, stylesheets, components, or build configuration.

## Context

The PCC shell is a future full-page SharePoint-hosted operating surface for project sites. Phase 3 may plan the shell now, but implementation remains blocked until Phase 2 proof, mutation, validation, and closeout gates are stable.

The design must satisfy the repo’s SPFx UI doctrine and should target flagship-grade rigor without cloning hbKudos or the HBCentral homepage.

## Primary Question

What should the future PCC SPFx shell look like, how should it behave across SharePoint host conditions, and what evidence will be required before implementation can be accepted?

## Required Repo Sources

Inspect current repo truth:

```text
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/**
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md
docs/reference/ui-kit/doctrine/**
docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md
docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md
docs/reference/spfx-surfaces/benchmark/**
```

Search for benchmark/source patterns:

```text
hbKudos
homepage launcher
Priority Actions Rail
Safety Field Excellence
Project Sites
Foleon reader
Foleon manager
Company Pulse
Project Spotlight
Leadership Message
SPFx
full-page shell
breakpoint
hosted breakpoint evidence
```

## Allowed Files

Create documentation only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_SPFX_Shell_Design_Spec.md
```

Optional:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_SPFX_UI_Doctrine_Mapping.md
```

## Forbidden Files

Do not modify:

```text
apps/**
packages/**
backend/**
tools/**
.github/**
scripts/**
SPFx manifests
package files
CSS / SCSS / TS / TSX implementation files
deployment workflows
```

## Required Deliverable — `PCC_SPFX_Shell_Design_Spec.md`

Include:

1. Objective
2. Governing repo sources
3. Shell purpose
4. Shell non-goals
5. Host environment assumptions
6. Required shell regions
7. Region-by-region UX specification
8. Information hierarchy
9. Interaction model
10. State model
11. Breakpoint and shell-fit specification
12. Accessibility requirements
13. UI doctrine mapping
14. Scorecard target
15. Data/read-model assumptions
16. Backend dependency assumptions
17. Phase 2 dependency map
18. Implementation gate checklist
19. Evidence required before acceptance
20. Risks
21. Open decisions
22. Recommended next prompt

## Required Shell Regions

Specify:

- Project Hero / Identity Header
- Priority Actions Rail
- Today / This Week panel
- Project Readiness Cards
- My Responsibilities
- Work Center Navigation
- Project Activity / Recent Changes placeholder
- Control Center Settings entry
- Team & Access entry
- Site Health indicator
- External System launcher/context area
- Incomplete provisioning / preview fallback surface

## Required State Model

Define UX expectations for:

- loading
- empty
- missing Project Profile
- incomplete provisioning
- partial configuration
- no access / insufficient role
- stale Site Health
- drift detected
- repair pending
- archived/read-only project
- external system not configured
- Procore mapping missing
- backend unavailable
- unsupported viewport/narrow container fallback
- edit-mode / authoring-safe rendering

## Required Breakpoint Matrix

Include at minimum:

```markdown
| Mode | Practical Usable Width | Layout Behavior | Content Priority | Hidden/Collapsed Content | Acceptance Criteria |
|---|---:|---|---|---|---|
```

Cover:

- ultrawide desktop
- standard desktop/laptop
- tablet landscape
- tablet portrait
- phone portrait
- phone landscape / short-height
- constrained SharePoint section/nested mode
- high zoom / reduced usable width

## Required UI Doctrine Mapping

Include:

```markdown
| Doctrine Requirement | PCC Design Response | Evidence Needed Before Implementation Acceptance |
|---|---|---|
```

Map to:

- host-aware polish
- no fake shell duplication
- page-canvas ownership
- premium authored composition
- non-generic visual identity
- explicit breakpoint behavior
- state-model completeness
- accessibility
- reduced motion
- keyboard/touch safety
- loading/empty/error states
- package/hosted parity evidence

## Required Scorecard Target

State a target threshold. Recommended:

- Minimum target: homepage-grade 40+/56
- Preferred target: flagship / benchmark-grade 48+/56
- No hard-stop failures permitted

## Validation

Run:

```bash
git status --short
```

If documentation-only:

```text
No build/typecheck required because no code changed.
```

If any implementation file is modified, revert it before closeout.

## Required Final Response

Return only:

```text
Commit summary
Commit description
Validation results
Open decisions
Recommended next prompt
```

## Recommended Commit Summary

```text
docs(pcc): add phase 3 spfx shell design spec
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: no package or SPFx version change; documentation-only Phase 3 shell design step.

Adds the PCC SPFx Shell Design Spec under docs/architecture/blueprint/sp-project-control-center/phase-3/. Defines the future PCC full-page shell regions, interaction model, state model, breakpoint behavior, accessibility requirements, UI doctrine mapping, scorecard target, and evidence expectations.

Preserves all Phase 3 implementation gates:
- no SPFx implementation;
- no app/package creation;
- no backend changes;
- no provisioning changes;
- no tenant mutation;
- no Graph/PnP calls;
- no Procore runtime.

Validation:
- git status --short
- documentation-only; no build/typecheck required because no code changed
```
