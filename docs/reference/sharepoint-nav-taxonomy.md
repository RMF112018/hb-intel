# SharePoint Navigation Taxonomy Reference

Recommended navigation structure, bucket definitions, and anti-sprawl guardrails for HB Central.

## Home-site posture

HB Central is the designated **SharePoint home site** for the Hedrick Brothers tenant. This means:

- It appears as the default landing experience in the SharePoint app bar
- Its global navigation propagates to all sites in the tenant
- It is the tenant-wide starting point for HB Intel's intranet presence
- Its branding and navigation set the standard for all connected hub sites

Home-site designation is managed through SharePoint Admin Center (or PowerShell) and requires IT admin + architecture approval to change.

## Recommended global navigation structure

The global nav should be flat and concise — no more than 7–9 top-level items. Deep nesting creates confusion and mobile usability problems.

### Primary navigation buckets

| Position | Bucket | Purpose | Audience |
|----------|--------|---------|----------|
| 1 | **Home** | HB Central homepage (Lane A webparts) | All |
| 2 | **Projects** | Project hub, portfolio views, project sites | Operations, Leadership |
| 3 | **Safety** | Safety center, field notices, protocols | Field, Safety |
| 4 | **Operations** | Daily reports, scheduling, field systems | Operations, Field |
| 5 | **People** | HR resources, directory, culture hub | All |
| 6 | **Finance** | Accounting, estimating, budget tools | Finance, Leadership |
| 7 | **Resources** | Policies, forms, training, knowledge base | All |
| 8 | **Admin** | IT control center, system health, config | IT, Admins |

### Bucket governance rules

- **Max top-level items:** 9 (hard limit to prevent sprawl)
- **Max depth:** 2 levels (top-level → one level of sub-links)
- **No orphan links:** Every nav item must belong to a bucket
- **No duplicates:** A destination should appear in exactly one bucket at one level
- **Labels:** Short, action-oriented or noun-based (e.g., "Projects" not "Project Management System Portal")

## Hub navigation

Hub sites may have their own local navigation in addition to the global nav. Hub nav should:

- Complement global nav, not duplicate it
- Focus on hub-specific destinations (e.g., department sites, team channels)
- Follow the same label and depth rules as global nav
- Be owned by the hub site owner, with taxonomy review by the Navigation Owner

## Audience targeting

SharePoint global nav supports audience targeting (security groups, Microsoft 365 groups). Use audience targeting to:

- Show field-specific items only to field audiences
- Show admin/IT items only to admin audiences
- Keep the default nav experience clean for most users

Do NOT use audience targeting to create entirely separate navigation experiences per role — that creates maintenance burden and user confusion.

## Anti-sprawl guardrails

| Guardrail | Rule |
|-----------|------|
| Top-level cap | No more than 9 global nav items |
| Depth cap | No more than 2 levels |
| Label length | Max 25 characters per nav label |
| One location | Each destination appears in one nav bucket only |
| Quarterly review | Navigation Owner reviews full taxonomy quarterly to prune stale items |
| Request justification | Every new nav item requires a written justification |
| Architecture gate | New top-level buckets require architecture review |

## Ownership and approval matrix

| Nav Level | Owner | Approver | Executor |
|-----------|-------|----------|----------|
| Global nav (top-level) | Navigation Owner | Architecture Reviewer | Site Collection Admin |
| Global nav (sub-links) | Navigation Owner | Navigation Owner | Site Collection Admin |
| Hub nav | Hub Site Owner | Navigation Owner | Hub Site Owner |
| Site left-nav | Site Owner | Site Owner | Site Owner |
| In-page nav | Page Author | Page Author | Page Author |

## What does NOT belong in navigation

| Item | Why | Where It Belongs |
|------|-----|------------------|
| Temporary announcements | Nav is persistent; announcements are ephemeral | Lane B alert band or Lane A Company Pulse |
| Individual project links | Too granular for global nav | Project hub / Lane A webparts |
| Tool launcher items | Utility shortcuts, not navigation | Lane A Tool Launcher or Lane B ribbon |
| Status dashboards | Operational views, not destinations | Lane A webparts |
| External vendor portals | Not part of the HB intranet nav | Resources bucket sub-link (if persistent) |
