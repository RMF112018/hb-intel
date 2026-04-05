# Phase B Prompt Package — Top-Band Redesign

## Objective

This package instructs a local code agent to implement **Phase B** of the homepage premiumization program: the **top-band redesign**.

Phase B is intentionally limited to the homepage top band and its immediate shared dependencies. The goal is to convert the current top of the homepage from a competent but generic enterprise composition into a **signature branded experience** made up of:

- a materially upgraded **Personalized Welcome Header**
- a materially upgraded **HB Hero Banner**
- the necessary **`@hbc/ui-kit` homepage/top-band primitives** needed to support both surfaces cleanly
- the composition, accessibility, responsiveness, reduced-motion handling, and documentation required to ship the redesign safely

This package is grounded in the audit objective and scope captured in the attached deep UI audit prompt. fileciteturn0file0

## Package Contents

1. `Prompt-01-Phase-B-Repo-Truth-and-Top-Band-Contract.md`
2. `Prompt-02-Phase-B-Shared-UI-Kit-Top-Band-Primitives.md`
3. `Prompt-03-Phase-B-Personalized-Welcome-Header-Redesign.md`
4. `Prompt-04-Phase-B-HB-Hero-Banner-Redesign.md`
5. `Prompt-05-Phase-B-Homepage-Top-Band-Integration-and-Polish.md`
6. `Prompt-06-Phase-B-Validation-Hardening-and-Documentation.md`
7. `phase-b-implementation-summary.md`
8. `README.md`

## Recommended Execution Order

Run the prompts in numbered order.

The sequence is deliberate:

- Prompt 01 establishes repo-truth scope, design contract, acceptance gates, and implementation plan.
- Prompt 02 creates or refines the shared top-band primitives in `@hbc/ui-kit`.
- Prompt 03 rebuilds the Personalized Welcome Header on top of the new shared primitives.
- Prompt 04 rebuilds the HB Hero Banner on top of the new shared primitives.
- Prompt 05 integrates both surfaces into the homepage composition and completes polish.
- Prompt 06 performs validation, hardening, documentation, and release evidence capture.

## Hard Implementation Rules

- Treat **repo truth** as authoritative.
- Do **not** invent structure detached from the live repo.
- Do **not** re-read files that are already in the agent’s active context or memory unless necessary to confirm changed state.
- Do **not** widen the scope into the full homepage redesign.
- Keep the work centered on the **top band** and the **minimum shared-kit expansion** required to support it properly.
- Preserve SharePoint/SPFx runtime realism.
- Respect accessibility, reduced motion, responsive behavior, and theming constraints.
- Avoid flashy design. Target **premium, confident, elegant, composed**.

## Expected End State

At the end of Phase B, the homepage top band should:

- feel like a signature branded internal product surface
- establish a stronger first impression immediately on load
- deliver materially better visual hierarchy
- express the user greeting with more presence and personalization
- express the hero with more authority, better CTA treatment, and stronger editorial structure
- differentiate the welcome surface from the hero surface clearly
- remain maintainable and reusable through shared `@hbc/ui-kit` primitives
- pass accessibility and reduced-motion checks
- be documented well enough for follow-on phases

## Risk Exposure

### Primary risks
- shared-kit changes that unintentionally affect non-homepage surfaces
- over-design that exceeds SPFx/SharePoint runtime reality
- hero/welcome divergence without a clean shared top-band language
- accessibility regression from layered visuals or weak contrast
- responsive collapse at common SharePoint canvas widths
- implementation drift caused by bypassing repo-truth composition contracts

### Risk controls
- isolate homepage-specific primitives or variants where appropriate
- keep shared-kit additions explicit and well-scoped
- validate contrast, keyboard access, focus treatment, and reduced-motion handling
- test multiple viewport widths and realistic SharePoint hosting conditions
- document the contract between local homepage surfaces and shared-kit primitives

## Standards / Best Practices

- keep shared design logic in `@hbc/ui-kit` where it is truly reusable
- keep homepage-only authored composition in the homepage layer
- use intent-based tokens rather than one-off styling where practical
- prefer additive, well-named variants over brittle overrides
- preserve semantic structure and accessible heading hierarchy
- support reduced-motion preferences explicitly
- keep CTA treatment deliberate and consistent
- document usage constraints for any new top-band primitive

## Suggested Operator Workflow

1. Run Prompt 01 and review the implementation plan output.
2. Run Prompt 02 and inspect the shared-kit diff first.
3. Run Prompts 03 and 04 one at a time, reviewing rendered output after each.
4. Run Prompt 05 only after the two top-band surfaces are individually stable.
5. Run Prompt 06 last and keep the generated validation notes.

## Deliverable Expectation from the Agent

Each prompt asks the agent to produce:
- code changes
- a concise implementation summary
- explicit assumptions
- open issues, if any
- acceptance evidence tied to the prompt objective

