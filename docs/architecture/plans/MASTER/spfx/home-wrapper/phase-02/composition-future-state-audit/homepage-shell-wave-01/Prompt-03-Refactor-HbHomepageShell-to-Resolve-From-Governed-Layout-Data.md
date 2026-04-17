# Prompt 03 — Refactor HbHomepageShell to Resolve From Governed Layout Data

## Objective
Refactor the shell so the rendered composition resolves from the governed shell schema and module registry rather than from hard-coded JSX ordering alone.

## Governing authority
- the two doctrine files
- benchmark plan summary and conformance standard
- current `hbHomepage` host plan files under `docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/`

## Exact repo seams to inspect
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/**`
- the new shell schema / registry files from Prompts 01-02

## Current gap
The shell currently hardcodes the sequence of zones in one component body.

## Required implementation outcome
Make the shell resolve:
- current shell preset
- slots/bands
- allowed placements
- zone rendering order
from governed data.

Preserve the existing module boundaries and error isolation.
Keep the code readable and strongly typed.

## Proof of closure required
Provide:
- before/after explanation of composition resolution
- resulting render flow
- evidence that the intended current order is preserved through data, not only through JSX
- evidence that the shell can support alternate approved presets later without architectural churn

## Prohibited
- do not create a fragile meta-framework
- do not mix shell logic into child modules unnecessarily
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
