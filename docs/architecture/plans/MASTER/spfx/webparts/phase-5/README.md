# Cumulative All-Webparts Phase Package — Full Implementation + Full Validation

## Objective

This phase package is for implementing the cumulative `hb-webparts` package using the build/runtime parameters already proven by the first two successful webparts:

- `HbHeroBannerWebPart`
- `PriorityActionsRailWebPart`

The goal of this phase is **not** to validate only those two webparts again in isolation.

The goal is to:

1. implement the cumulative package architecture for **all homepage webparts**
2. preserve the working parameters proven by the first two proof cases
3. build and inspect the resulting full `.sppkg`
4. tenant-validate **all webparts in the package**, with hero + rail used only as regression checks at the start of validation

## Package contents

- `Phase-Summary-Cumulative-All-Webparts-Full-Implementation.md`
- `Prompt-01-Implement-Cumulative-All-Webparts-Architecture.md`
- `Prompt-02-Build-Inspect-and-Prove-Full-Package.md`
- `Prompt-03-Tenant-Validate-All-Webparts.md`
- `Prompt-04-Capture-Closure-and-Next-Phase-Handoff.md`

## Required posture

This package must treat the first two webparts as **established references**, not as the only validation target.

The implementation must target the full `hb-webparts` homepage package:
- CompanyPulse
- SmartSearchWayfinding
- PeopleCulture
- HbHeroBanner
- PersonalizedWelcomeHeader
- ProjectPortfolioSpotlight
- SafetyFieldExcellence
- PriorityActionsRail
- ToolLauncherWorkHub
- LeadershipMessage

## Hard constraints

- Do not revert to single-target proof-case replacement behavior.
- Do not exclude previously validated webparts from the package.
- Do not limit validation to hero + rail.
- Do not claim the cumulative model is proven until all packaged webparts have been validated in tenant.
- Do not re-read files that are already in active context unless needed for verification.
