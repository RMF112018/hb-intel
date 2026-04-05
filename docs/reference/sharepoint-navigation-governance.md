# SharePoint Navigation Governance — Lane C

Authoritative governance model for HB Central navigation, home-site configuration, and information architecture. Lane C is the third lane in the [three-lane SharePoint architecture](./sharepoint-homepage-shell-boundaries.md).

## Purpose

Lane C governs navigation taxonomy, home-site posture, hub-site branding, and global-nav configuration using **supported SharePoint administration tools only**. It does not involve custom code packages.

## What Lane C owns

- SharePoint global navigation structure and taxonomy
- Hub-site navigation configuration
- Home-site designation and settings
- Navigation link ordering, grouping, and labeling
- Audience-targeted navigation visibility
- Navigation change-control and approval process

## What Lane C does NOT own

| Concern | Owned By | Why Not Lane C |
|---------|----------|---------------|
| Homepage page-canvas content | Lane A (`apps/hb-webparts`) | Custom webpart code, not nav config |
| Shell placeholder surfaces | Lane B (`apps/hb-shell-extension`) | SPFx extension code, not nav config |
| Suite bar / app bar behavior | Microsoft (SharePoint platform) | Not customizable by tenants |
| Quick-launch / left-nav per-site | Individual site owners | Not global governance |
| In-page navigation (anchors, tabs) | Page authors / webpart owners | Page-level, not nav-level |

## Relationship to Lane A and Lane B

```
Lane A — Homepage / Page-Canvas Product
  └── 10 webparts on the homepage page canvas
  └── NO navigation rendering — Lane A does not create nav elements

Lane B — Shell Extension Product
  └── Top ribbon: concise utility links (NOT tenant navigation)
  └── Alert band: announcements (NOT navigation)
  └── Footer rail: support links (NOT navigation)
  └── Lane B utility links must NOT duplicate global nav items

Lane C — Navigation & Governance (THIS DOCUMENT)
  └── Governs the SharePoint global nav, hub nav, and home-site config
  └── Operates through SharePoint admin UI — no custom code
  └── Provides the official navigation structure that Lane A/B must not duplicate
```

**Non-duplication rule:** If content is reachable through global navigation, Lane A webparts and Lane B utility links must not create parallel navigation to the same destination. Exceptions require architecture review.

## Supported governance actions

| Action | Mechanism | Approval Required |
|--------|-----------|-------------------|
| Add/remove global nav link | SharePoint Admin Center | Yes — nav owner |
| Reorder global nav links | SharePoint Admin Center | Yes — nav owner |
| Add/remove hub nav link | Hub site settings | Yes — hub owner |
| Change home-site designation | SharePoint Admin Center (PowerShell) | Yes — IT admin + architecture |
| Update nav link labels | SharePoint Admin Center | Yes — nav owner |
| Enable/disable audience targeting for nav | SharePoint Admin Center | Yes — nav owner |
| Change site logo / branding | Site settings | Yes — site owner |

## Prohibited governance actions

| Action | Why Prohibited |
|--------|---------------|
| Replace suite bar via code | Unsupported by Microsoft; violates architecture guardrails |
| Replace app bar via code | Unsupported; breaks platform behavior |
| Create custom navigation components in Lane A/B | Creates duplication; confuses users |
| Manipulate navigation DOM via JavaScript | Unsupported; fragile; breaks on platform updates |
| Use CSS to hide/override native nav elements | Unsupported shell manipulation |

## Ownership model

| Role | Responsibility |
|------|---------------|
| **Navigation Owner** | Maintains global and hub nav taxonomy; approves changes; Corporate Communications or IT representative |
| **Site Collection Admin** | Executes approved changes in SharePoint Admin Center |
| **Architecture Reviewer** | Reviews requests that affect nav structure, new top-level items, or cross-site navigation |
| **Department Leads** | May request nav items for their domain; must go through approval |
| **Page Authors** | May configure in-page navigation (anchors, webpart-level); do not modify global/hub nav |

## Change-control process

1. **Request** — Requestor submits nav change request (add, remove, reorder, rename) with justification
2. **Review** — Navigation Owner reviews for taxonomy alignment, duplication, and audience fit
3. **Architecture check** — If the request adds a new top-level bucket or cross-site link, Architecture Reviewer assesses structural impact
4. **Approval** — Navigation Owner approves or rejects with documented rationale
5. **Implementation** — Site Collection Admin makes the change in SharePoint Admin Center
6. **Verification** — Requestor confirms the change renders correctly in global/hub nav

## Escalation and exception rules

### When architecture review is required

- Adding or removing a top-level global nav bucket
- Creating cross-hub navigation links
- Requesting a new home-site designation change
- Any change that affects more than one hub site's navigation
- Any request to create navigation behavior through Lane A or Lane B code

### When a request should be redirected

| Request | Redirect To |
|---------|-------------|
| "Add a link to the homepage" | Lane A (homepage webpart content, not nav) |
| "Add a utility link to the ribbon" | Lane B (shell extension, not nav) |
| "Create a new department homepage" | Site provisioning + Lane A |
| "Change the site title/logo" | Site owner self-service |
| "Customize the suite bar" | Rejected — unsupported |

### When a request is rejected

- Duplicates an existing nav item at the same level
- Creates a deep link that bypasses the intended nav hierarchy
- Requires unsupported SharePoint customization
- Conflicts with an existing Lane A or Lane B surface
