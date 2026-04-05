# Phase D Prompt Package — Editorial / Operational Differentiation

## Purpose

This package instructs a local code agent to implement **Phase D** of the homepage premiumization program for `hb-intel`.

Phase D focuses on **editorial / operational differentiation** across these homepage surfaces:

- Company Pulse
- Leadership Message
- People & Culture
- Project / Portfolio Spotlight
- Safety & Field Excellence

The intent is to eliminate the current pattern where these surfaces feel too closely related because they share the same broad card posture, content cluster rhythm, and insufficiently distinct visual grammar.

## Phase D objective

Create **clearly differentiated surface families** for:
- editorial/news content
- executive/leadership content
- people/recognition content
- project/portfolio operational spotlight content
- safety/field signal content

The result should preserve system cohesion while materially improving:
- first-glance recognizability
- hierarchy
- polish
- scanning efficiency
- branded quality
- perceived product maturity

## Recommended execution order

1. `Prompt-01-Phase-D-Repo-Truth-and-Surface-Family-Contract.md`
2. `Prompt-02-Phase-D-Shared-UI-Kit-Surface-Families-and-Primitives.md`
3. `Prompt-03-Phase-D-Company-Pulse-and-Leadership-Message.md`
4. `Prompt-04-Phase-D-People-and-Culture.md`
5. `Prompt-05-Phase-D-Project-Portfolio-Spotlight.md`
6. `Prompt-06-Phase-D-Safety-and-Field-Excellence.md`
7. `Prompt-07-Phase-D-Homepage-Integration-Validation-and-Documentation.md`

## Expected outcomes

By the end of this phase, the codebase should have:
- differentiated homepage surface primitives in `@hbc/ui-kit` and/or `@hbc/ui-kit/homepage`
- clearly distinct visual and structural treatment for editorial vs executive vs people vs operational vs safety content
- more premium metadata, status, and CTA patterns
- stronger content-specific hierarchy without introducing visual chaos
- updated docs and validation artifacts proving the new system is intentional and maintainable

## Hard gates

- Repo truth is authoritative.
- Do not re-read files that are already in the agent's active context or memory unless required to resolve uncertainty.
- Do not introduce visual ideas that break SharePoint/SPFx hosting reality.
- Do not create one-off local styling that bypasses the shared kit when a reusable primitive is the correct abstraction.
- Do not collapse all five surfaces back into one generalized card pattern.

## Notes

This package is intentionally limited to **Phase D** and should not be mixed with:
- top-band redesign work from Phase B
- launcher / search / action-rail premiumization from Phase C
- macro page composition and zone restructuring from Phase E
