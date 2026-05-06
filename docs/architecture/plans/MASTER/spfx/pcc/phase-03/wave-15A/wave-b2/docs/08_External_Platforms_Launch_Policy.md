---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 08 — External Platforms Launch Policy

## Purpose

Define how PCC presents platforms hosted outside the SharePoint project site.

## Approved Naming

| Item | Approved Label |
|---|---|
| Tab label | External Platforms |
| Hero secondary title | External Platforms |
| Page title | External Platforms Launch Pad |
| Supporting copy | Platforms hosted outside the SharePoint project site. |

## Launch Behavior

| Scenario | Required Behavior |
|---|---|
| Platform link mapped | Open in new browser tab |
| Platform unmapped | Disabled/unavailable card state with reason |
| Platform mapping unknown | Show mapping status unknown; do not launch |
| Platform unavailable | Show unavailable state; do not fake active integration |
| Preview data | Clearly label mapping as preview/reference where needed |

## External Boundary Copy

Use language that makes the tenant boundary clear:

- `Hosted outside the SharePoint project site`
- `Launches in a separate platform`
- `Mapping required before launch`

Avoid:

- `integrated system` if only a launch link exists;
- `embedded` unless embedded content actually exists;
- `inside PCC` if the platform opens externally.

## Platform Card Minimums

Each platform entry should show:

- platform name;
- purpose;
- mapping status;
- launch availability;
- last verified only if real and relevant;
- disabled reason if unavailable.

## Acceptance Criteria

- External Platforms does not imply the platforms are inside SharePoint.
- Unmapped platform links are not clickable.
- Launch links open in a new tab.
- User-facing labels match approved taxonomy.
