# Prompt-05 — HB Kudos Public Responsive, Accessibility, and Polish Pass

```md
Objective

Conduct a focused implementation pass on the **responsive behavior, accessibility, interaction polish, and real-world SharePoint fit** of the public HB Kudos surface and composer.

Primary Intent

The public HB Kudos experience should not only look better in ideal conditions. It must behave better at ordinary desktop zoom, tighter viewport widths, and real SharePoint-hosted interaction conditions.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain strict compliance with `@hbc/ui-kit`, homepage doctrine, and accessibility obligations.
- Keep the work UI-focused.
- Fix issues at their proper layer; do not paper over structural problems with brittle hacks.

Focus

Tighten:
- desktop zoom resilience
- narrower-width and mobile-width behavior where applicable
- footer/action-area safety
- overlap/overflow defects
- visible focus and keyboard-safe behavior
- flyout/dialog interaction polish
- spacing and rhythm inconsistencies
- helper-text density where it materially affects readability

Target Outcomes

The rendered result should move toward:
- stronger behavior at ordinary viewing conditions
- no obvious action obstruction or overlap issues
- cleaner footer/action zones
- better focus visibility and input interaction rhythm
- higher confidence that the surface is genuinely production-ready from a UI standpoint

Implementation Freedom

Choose the best path, including:
- layout refinement
- breakpoint behavior changes
- footer/action restructuring
- safer overlay internals
- focus-state improvements
- helper-text and spacing cleanup

Do not assume only one of those is needed.

Do Not

- treat this as a tiny CSS cleanup pass if real interaction defects remain
- leave known overlap or responsive action-area conflicts in place
- claim accessibility closure without real UI evidence in the implementation

Deliverables

1. Implement the responsive/accessibility/polish improvements.
2. Update shared primitives or ui-kit/homepage components where appropriate.
3. Provide a concise summary of what changed.
4. State which remediation-matrix rows were advanced or closed.
5. Explicitly call out any remaining known UI risk.

Acceptance Standard

This prompt is successful only if the public HB Kudos experience behaves more reliably and cleanly across practical viewing and interaction conditions, with obvious polish defects materially reduced or eliminated.
```
