# PCC UI/UX Basis of Design

## Governing Asset

The PCC basis-of-design image has been saved in the live repo at:

```text
docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png
```

Future developers must inspect this image before implementing or materially changing PCC shell UI. The image is a visual-direction reference, not a pixel-perfect screenshot requirement.

## Basis-of-Design Intent

The Project Control Center shall feel like a modern construction project command center. It should combine executive-grade visibility with project-team operational utility.

The UI shall be:

- dark, confident, and high-contrast in the project intelligence/header zone;
- HB-branded through a strong orange application navigation rail;
- practical and task-oriented in the card grid;
- dense enough for daily project-team use;
- polished enough to feel like a flagship internal platform surface;
- host-safe inside SharePoint/SPFx.

## Visual Elements to Preserve

- Dark navy / blue project intelligence header.
- HB-orange left application navigation rail.
- Clear project identity: project name, PCC label, phase, health, action count.
- Search / command input in the header.
- Compact top-level controls and notification affordances.
- Project health or readiness trend visualization in the header.
- Floating summary card layer below the header.
- White/light cards with subtle shadows and rounded corners.
- Green/yellow/red health/status indicators.
- Tight dashboard card placement with varied card dimensions.

## PCC-Specific Adaptation

The left rail is **PCC application navigation**, not a duplicate SharePoint shell. It shall contain the eight MVP surfaces:

1. Project Home
2. Team & Access
3. Documents
4. Project Readiness
5. Approvals
6. External Systems
7. Control Center Settings
8. Site Health

## Layout Principle

The PCC shall not inherit the `hb-intel-homepage` fixed paired-row layout. PCC cards shall support unique sizes and content-driven height. The Project Home layout must pack cards tightly and avoid equal-height row waste.

## Included Wave 2 UI/UX Work

Wave 2 includes:

- app shell visual layout;
- left navigation rail;
- project intelligence header;
- search/command placeholder;
- MVP surface navigation;
- Project Home bento dashboard frame;
- Priority Actions rail/card;
- module preview cards;
- preview/fallback states;
- loading/empty/error states;
- responsive behavior;
- keyboard/focus behavior;
- no-runtime guardrails;
- design reference documentation.

Wave 2 excludes:

- live backend data;
- real access execution;
- real approval execution;
- real document-management workflows;
- live Site Health scans or repair;
- live Graph/PnP calls;
- Procore API/runtime/write-back;
- app catalog deployment;
- production rollout.

## Developer Acceptance Notes

A future reviewer should be able to compare the implemented PCC shell to `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` and confirm:

- the command-center visual hierarchy is recognizable;
- the left rail, header, and card system are coherent;
- the card layout is tighter and more flexible than homepage row pairing;
- the UI remains accessible, responsive, and SharePoint-host-safe;
- missing data still produces a credible preview/fallback experience.
