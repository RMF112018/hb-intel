# 03 — Target Shell / Host / Navigation Architecture

## Objective

Define the Wave B target architecture. This is not a surface redesign; it is the shared product frame that all later Wave 15A surface work must inherit.

## Target Shell Zones

1. **Host-safe outer root**
   - App-local root only.
   - No fake SharePoint shell duplication.
   - No fixed `100vh` dependency unless local tenant testing proves it is safe.
   - Stable data markers for tests: keep existing markers where needed, add Wave B markers without breaking existing test selectors unnecessarily.

2. **Compact identity / command header**
   - PCC identity visible but not dominant.
   - Header should be materially more compact than a hero.
   - Search/command is either scoped and clearly inert or visually reduced.
   - Product status/preview confidence is present but secondary.

3. **Persistent project context band**
   - Required fields where available:
     - project number,
     - project name,
     - project phase/status,
     - source confidence / fixture-backed / preview data cue,
     - active surface label,
     - current workflow group.
   - Must not duplicate full Project Home content.
   - Must remain visible across every routed surface.

4. **Operational navigation rail / strip**
   - Grouped by operational purpose:

```text
Command
- Project Home
- Project Readiness

Controls
- Documents
- Team & Access
- Approvals

Governance
- Site Health
- Control Center Settings

Connected Systems
- External Systems
```

   - Add status/risk cues only where existing data supports them.
   - Do not invent live health values.
   - Cues must not be color-only.

5. **Content canvas**
   - Shell chrome yields space to surface content.
   - No horizontal overflow at target widths.
   - No double-scroll trap in local browser or tenant host.
   - Bento children remain direct where current bento contract requires it.

## Header Height / Hierarchy Principles

- Compact desktop target: prefer a tight band over hero treatment.
- Tablet target: two-row maximum unless local evidence proves a better pattern.
- Narrow target: preserve project identity and navigation access; do not hide navigation without a replacement disclosure.
- Active surface context should be readable but not louder than project identity.

## Status Indicator Rules

- Use status text + shape/icon/pill; do not rely on color only.
- Use source confidence language such as:
  - `Preview data`
  - `Fixture-backed`
  - `Backend source unavailable`
  - `Tenant validation pending`
- Keep detailed diagnostics in secondary affordance/tooltip/panel/closeout evidence, not the primary header hierarchy.

## Search / Command Rules

Choose one during implementation based on local repo truth:

- **Reduced inert affordance:** remove the large search input and replace with compact “Search preview unavailable” or “Command search planned” indicator.
- **Scoped command launcher preview:** keep compact control but clearly label scope and disabled reason.

Do not leave a prominent, read-only search box that appears operational.

## Host Fit Rules

- Validate against local browser dimensions and SharePoint-like constrained containers.
- Validate tenant published mode and edit mode if tenant access is available.
- Avoid CSS that assumes the viewport equals the app-owned canvas.
- Add host-fit data markers/classes if needed for screenshot evidence.
- Document any unavoidable tenant-host assumptions.

## Accessibility Requirements

- Semantic `nav` with grouped labels.
- `aria-current="page"` on active surface.
- Explicit `:focus-visible` styling for nav and command controls.
- Keyboard path for expanded/icon/top-strip/narrow modes.
- No hover-only critical meaning.
- Disabled controls have reason/next-step when prominent.

## Tests Required

- Grouped nav order and labels.
- Active item state and `aria-current`.
- Keyboard focus traversal, Enter/Space activation, Home/End.
- Project context renders on all surfaces.
- Search/command semantics match its disabled/read-only state.
- Every surface routes and produces exactly one active surface panel where current tests require it.
- Responsive modes preserve reachable navigation.

## Screenshots Required

- Desktop wide.
- SharePoint-like constrained desktop.
- Tablet landscape.
- Tablet portrait.
- Phone/narrow container.
- Tenant published mode.
- Tenant edit mode.
- All eight current surfaces at least once after shell remediation.
