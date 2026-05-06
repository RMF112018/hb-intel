# 08 — Screenshot and Hosted Evidence Plan

## Objective

Define the evidence needed to prove Prompt 02 is visually and functionally successful.

## Evidence Modes

Capture screenshots after implementation in the following modes:

| Mode | Width / Context | Required Surfaces |
| --- | --- | --- |
| Hosted desktop | SharePoint read mode, desktop | All 8 surfaces |
| Hosted edit mode | SharePoint edit mode | Project Home, Documents, Approvals, External Systems, Site Health |
| Ultrawide | >= 1920px practical content width | Project Home, Project Readiness |
| Large laptop | 1450–1599px container | Project Home, Documents |
| Standard laptop | 1181–1440px container | All 8 surfaces |
| Small laptop | 1025–1180px container | Project Home, Approvals, External Systems |
| Tablet landscape | 769–1024px container | Project Home, Documents, Site Health |
| Tablet portrait | 480–768px container | Project Home, Settings |
| Phone | < 480px container | Project Home, Documents, Site Health |
| Short-height | <= 720px height | Project Home, Approvals, External Systems |

## Screenshot Naming

Use:

```text
evidence/prompt-02/<surface>/<mode>__<surface>__<yyyymmdd-hhmm>.png
```

Examples:

```text
evidence/prompt-02/project-home/standard-laptop__project-home__20260506-1540.png
evidence/prompt-02/documents/hosted-edit__documents__20260506-1548.png
```

## Screenshot Checklist

For every screenshot, verify:

- Tier 1 command card is visually obvious.
- Tier 2 operational cards do not look equal to Tier 3 reference cards.
- Deferred/state cards are visually honest and subordinate.
- No primary content is horizontally clipped.
- No card collapses to skeleton-like height.
- No wrapper broke bento layout.
- The first screen communicates surface purpose and operational state.
- SharePoint chrome does not collide with PCC shell or canvas.

## Evidence Document

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-02/PROMPT_02_EVIDENCE.md
```

Include:

- screenshot table
- test command outputs
- known limitations
- residual risks
- hosted-vs-local differences
- lockfile hash
