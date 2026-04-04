# 00 — Implementation Summary

## Objective

Build the **first release of the HB Central premium SharePoint homepage webpart system** in the live `RMF112018/hb-intel` repo.

The system must deliver a distinctive, premium, branded homepage experience that:

- feels custom and unmistakably Hedrick Brothers
- preserves SharePoint-native page composition
- uses a coordinated set of custom webparts
- remains credible under SPFx performance, accessibility, governance, and authoring constraints

## Core Product Position

This is **not** a “single homepage app.”
It is a **premium homepage system** made of:

- coordinated homepage webparts
- a homepage-safe shared visual/component layer
- explicit content ownership and configuration patterns
- repeatable layout and governance rules

## Locked First-Release Component Inventory

| Component                     | Class                      |                 Default Lane | Primary Purpose                                      |
| ----------------------------- | -------------------------- | ---------------------------: | ---------------------------------------------------- |
| Personalized Welcome Header   | Editorial / orientation    | Lightweight homepage webpart | premium greeting + first impression                  |
| HB Hero Banner                | Editorial                  | Lightweight homepage webpart | authored visual tone + featured message              |
| Priority Actions Rail         | Utility / navigation       | Lightweight homepage webpart | role-aware quick access and urgent actions           |
| Tool Launcher / Work Hub      | Utility / navigation       | Lightweight homepage webpart | premium replacement for generic quick links          |
| Company Pulse                 | Editorial / communications | Lightweight homepage webpart | curated internal updates with hierarchy              |
| Leadership Message            | Editorial / communications | Lightweight homepage webpart | executive message channel                            |
| People and Culture            | Editorial / human layer    | Lightweight homepage webpart | new hires, recognition, anniversaries, culture       |
| Project / Portfolio Spotlight | Operational / intelligence | Lightweight homepage webpart | featured work, milestones, strategic visibility      |
| Safety and Field Excellence   | Operational / intelligence | Lightweight homepage webpart | reinforce safety culture and field discipline        |
| Smart Search / Wayfinding     | Utility / discovery        | Lightweight homepage webpart | guided findability for tools, forms, policies, teams |

## Packaging and Architecture Position

### Governing rule

Use **multiple coordinated homepage webparts** on a SharePoint page.

### Default lane

Use the repo’s **lightweight homepage webpart path** by default.

### Exception rule

Only use a richer app-style interaction island when a component genuinely requires app-grade behavior.
That is **not approved by default** for the first release scope above.

## Homepage-Safe UI Contract

`@hbc/ui-kit` is the visual backbone, but not the unrestricted implementation contract.

The homepage program should:

- create or enforce a **homepage-safe entry-point / subset**
- avoid broad imports when narrow imports are sufficient
- add homepage-specific shared primitives where necessary
- preserve token, accessibility, density, motion, and visual-governance rules

## Brand Foundation

Use Hedrick Brothers brand direction as a hard design input:

- primary blue: `rgb(34, 83, 145)`
- secondary orange: `rgb(229, 126, 70)`
- premium, established, polished, operational
- not startup-like
- not generic SharePoint
- not flashy
- not cluttered

The homepage should feel:

- warm but disciplined
- editorial but useful
- premium without becoming fragile
- distinctly HB from first load

## Signature Greeting Requirement

The Personalized Welcome Header must support:

- `Good morning, {First Name}.`
- `Good afternoon, {First Name}.`
- `Good evening, {First Name}.`

The greeting is a defining signature element, not a small utility label.

### Behavior requirements

- first name from Microsoft 365 identity / preferred profile source
- local-time-aware greeting logic
- sensible fallback if first name is unavailable
- no manual profile maintenance requirement unless unavoidable

## Required Content / Configuration Philosophy

The homepage must be maintainable by site owners.

Normal operation should favor:

- property pane configuration
- SharePoint list-backed curation
- authored content sources
- audience-aware visibility where appropriate

Normal operation should **not** require code changes for:

- hero content swaps
- leadership message updates
- spotlight item rotation
- resource list maintenance
- people/culture card maintenance

## Recommended Homepage Zone Mapping

### Top band

- Personalized Welcome Header
- HB Hero Banner
- optional alert state support

### Quick-use / work zone

- Priority Actions Rail
- Tool Launcher / Work Hub

### Awareness zone

- Company Pulse
- Leadership Message
- People and Culture

### Operational awareness zone

- Project / Portfolio Spotlight
- Safety and Field Excellence

### Discovery zone

- Smart Search / Wayfinding

## Definition of Success

The first release is successful if:

- employees immediately recognize it as custom HB Central
- the greeting becomes a signature first-impression element
- the page is useful enough to become a real start-of-day destination
- the webparts feel coordinated, not assembled from random modules
- site owners can maintain it
- performance and accessibility hold up on real SharePoint pages
- the shared foundation is reusable for future homepage variants and related site surfaces

## Hard Gates for the Prompt Set

Every implementation prompt should protect these:

1. homepage system, not monolith
2. lightweight homepage webparts by default
3. no shell recreation inside tiles
4. premium composition under SharePoint constraints
5. homepage-safe `ui-kit` usage
6. performance budgets and diagnostics validation
7. accessibility and responsive behavior as release gates
8. authoring / governance / maintainability as first-class requirements
9. no placeholder production code
10. no stale-doc assumptions when repo truth disagrees

## Prompt-01 Closure Artifacts

Prompt 01 deliverables are locked and must be treated as authoritative inputs for Prompts 02–10:

- `01A_Component_Inventory_Matrix.md`
- `01B_Lane_Assignment_Decision_Record.md`
- `01C_Repo_Structure_and_Prompt_Sequence.md`

## Resolved Decisions Register (Prompt 01)

| Decision ID | Decision                                                                                         | Status |
| ----------- | ------------------------------------------------------------------------------------------------ | ------ |
| D1          | First-release lane defaults to lightweight standalone homepage webparts                          | Closed |
| D2          | Routed mini-app behavior is not allowed by default for first release                             | Closed |
| D3          | Implementation package naming is locked to `hb-webparts`                                         | Closed |
| D4          | Prompt 02 must enforce homepage-safe `@hbc/ui-kit` usage contract                                | Closed |
| D5          | Packaging ambiguity outcome: manifest patch bump is deferred until `hb-webparts` manifest exists | Closed |

## Prompt-01 Handoff Note

- Inventory, lane assignment, ownership, repo structure, and sequence dependencies are now explicit.
- No first-release component remains in a `decide later` state.
- Manifest version bump action is intentionally deferred until downstream scaffolding creates the `hb-webparts` package manifest target.
