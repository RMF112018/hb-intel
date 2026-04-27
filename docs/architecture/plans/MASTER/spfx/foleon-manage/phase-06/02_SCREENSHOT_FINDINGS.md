# 02 — Screenshot Findings

## Observed UX Problems

The current hosted Manager surface presents the following issues:

1. **Technical title dominates**
   - `Foleon Connector` reads as infrastructure, not a product.
   - Recommended user-facing title: `Foleon Manager`.

2. **Diagnostics presented as the application**
   - Runtime readiness cards and raw key/value tables dominate the surface.
   - These are useful for admins and escalation, but not for daily marketing operations.

3. **Config appears too dominant**
   - Config either appears selected by default or visually overpowers the content-management flow.
   - The app should default to `Homepage Foleon Content`.

4. **Raw status labels are user-hostile**
   - Labels such as `TOKEN ACQUISITIONBlocked` require implementation knowledge.
   - Replace with task language: `API approval — Needs approval`.

5. **Consent-required state looks like a failure**
   - The UI should show a controlled limited mode, not a broken state.
   - API approval missing should be a calm warning with a next action.

6. **No clear marketing workflow**
   - The screenshot does not quickly answer:
     - What is live?
     - What needs setup?
     - What lane needs attention?
     - What can I do next?

7. **Tables and cards lack prioritization**
   - Every diagnostic row competes with the primary workflow.

## Remediation Mapping

| Screenshot problem | Remediation |
|---|---|
| `Foleon Connector` title | Rename primary title to `Foleon Manager`; move connector detail into diagnostics. |
| Raw readiness grid | Replace primary grid with compact status chips and Config health groups. |
| API consent warning as failure | Global `API approval required` banner with one next action. |
| Config dominance | Default to Homepage Foleon Content; Config remains second tab. |
| Raw config tables | Collapse under Diagnostics. |
| Missing lane workflow | Add lane summary cards and selected-lane workspace. |
| Dense bordered containers | Reduce container chrome; use section hierarchy, cards only where they add meaning. |

## Target First View

At desktop width, the first view should show:

1. Compact header:
   - eyebrow: `Marketing Operations`
   - title: `Foleon Manager`
   - subtitle: `Manage homepage Foleon content, placements, and publishing readiness.`
   - chips: Content lanes, API connection, Registry, Last sync
   - actions: `Sync content`, `Open Foleon`, `View diagnostics`

2. Conditional status banner:
   - only when action is required.

3. Tabs:
   - `Homepage Foleon Content` selected by default.
   - `Config` secondary.

4. Lane cards:
   - Project Spotlight
   - Company Pulse
   - Leadership Message

5. Selected-lane workspace:
   - active/staged content
   - publish readiness
   - placement status
   - quick actions
