# Objective and Current Wave 13 Context

## Objective

Update PCC documentation so the Procore data-layer roadmap is explicit, machine-readable, and safe for code-agent execution while PCC is progressing through Phase 3 / Wave 13 (`Buyout Log` / `Buyout Control Center`).

## Current Context to Verify

The executing agent MUST audit repo truth before editing. Expected but not assumed current state:

- Phase 3 roadmap places Buyout Log at Wave 13.
- Wave 13 documentation planning has closed.
- Wave 13 implementation may already include model contracts and backend GET-only mock route/provider.
- SPFx surface/client status may be in progress and must be verified.
- Procore runtime remains forbidden unless a future prompt explicitly authorizes a controlled live-read proof.

## Required Interpretation

The Procore data layer is not Wave 15 External Systems and not a separate PCC module. It is a source-system data layer that feeds Project Home, Priority Actions, Project Readiness, Team & Access, Document Control, Constraints Log, Responsibility Matrix, Buyout Log, Site Health, External Systems, and future HBI grounding.
