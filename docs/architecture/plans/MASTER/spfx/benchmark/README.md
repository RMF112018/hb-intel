# HB Homepage Governance Package

## Purpose

This package establishes a formal governance system for all homepage webparts so the **HB Kudos public-facing webpart** remains the benchmark for:

- implementation quality
- architectural discipline
- backend interaction quality
- state management rigor
- UX completeness and sophistication
- accessibility and host-runtime behavior
- validation depth and closure discipline

This package does **not** require other homepage webparts to copy the Kudos UI.
It requires them to match the **same level of quality and sophistication relative to their own purpose**, while preserving a coherent HB brand language and design symmetry across `apps/hb-webparts`.

## Governing authority

For all homepage webpart work under `apps/hb-webparts`, the following documents are the governing authority:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

The benchmark package sits **under** those doctrine files.
The doctrine defines the rules.
HB Kudos Public defines the current **reference quality bar** for how homepage-grade work should feel and behave when those rules are executed well.

## Primary decisions

1. **Doctrine-first authority**
   - Homepage webpart work must first comply with the two doctrine files above.

2. **HB Kudos Public is the benchmark reference implementation**
   - HB Kudos Public remains the canonical example of homepage-grade implementation rigor inside `apps/hb-webparts`.

3. **Benchmark quality does not mean visual sameness**
   - The package must never push the system toward “the same webpart with a different title.”
   - Each homepage webpart must assume its own persona based on its content and mission.

4. **Branding and design symmetry must still hold**
   - Persona differences must sit inside a consistent HB design system.
   - Webparts should feel related, not cloned.

## Persona-fit rule

Each homepage webpart must express a **purpose-fit persona** derived from its content family.

Examples:
- **HB Kudos** → engaging, warm, celebratory, human
- **Project Spotlight** → professional, informative, confidence-building
- **Company Pulse** → newsroom/editorial, timely, scan-friendly
- **Tool Launcher / Work Hub** → utility-first, operational, efficient

This means:
- same quality class
- same implementation seriousness
- same brand family
- different surface personality where the content warrants it

## Anti-homogenization rule

The package explicitly prohibits outcomes where:
- layouts are copied with only text changes
- card recipes are duplicated without purpose-fit adaptation
- every webpart uses the same emotional tone
- the benchmark is interpreted as a demand for visual sameness
- “premium” is reduced to repeating the Kudos public treatment everywhere

## Package contents

- `00-Plan-Summary.md`
- `01-Homepage-Webpart-Conformance-Standard.md`
- `02-Kudos-Public-Benchmark-Reference.md`
- `03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
- `04-Conformance-Scoring-Matrix.md`
- `05-Code-Agent-Governance-Prompt-Template.md`
- `06-Closure-Checklist.md`
- `07-Persona-and-Design-Symmetry-Rule.md`

## How to use this package

1. Treat the two doctrine files as governing authority.
2. Use HB Kudos Public as the benchmark for **quality and rigor**, not for cloning layouts.
3. At the start of every homepage effort, define the target webpart’s persona.
4. Compare the target against the benchmark by conformance category.
5. Generate prompts that close quality gaps **while protecting persona-fit differentiation**.
6. Close only when doctrine compliance, benchmark quality, and persona-fit execution are all proven.

## Non-negotiable rule

No homepage webpart may be considered complete merely because it renders, looks improved, or resembles Kudos.
It must demonstrate:

- doctrine compliance
- homepage-grade quality
- purpose-fit persona
- brand/design symmetry with the rest of `hb-webparts`
- evidence-backed closure

## Intended audience

- you
- local code agent workflows
- future audit sessions
- PR review and acceptance processes
