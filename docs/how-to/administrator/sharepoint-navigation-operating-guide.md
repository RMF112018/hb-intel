# SharePoint Navigation Operating Guide

Procedural guide for site owners and administrators managing HB Central navigation through supported SharePoint configuration.

## Who this guide is for

- **Site Collection Admins** — execute approved global/hub nav changes
- **Hub Site Owners** — manage hub-level navigation
- **Site Owners** — manage site-level left navigation
- **Navigation Owner** — approve requests and maintain taxonomy

## Self-service vs approval-required

| Action | Self-Service? | Approval Required? |
|--------|:------------:|:-----------------:|
| Edit site left-nav links | Yes | No |
| Change site logo / title | Yes | No |
| Edit hub nav sub-links | Yes (hub owner) | No |
| Add hub nav top-level link | No | Hub owner + Nav Owner |
| Edit global nav sub-links | No | Nav Owner |
| Add global nav top-level item | No | Nav Owner + Architecture |
| Remove global nav item | No | Nav Owner |
| Change home-site designation | No | IT Admin + Architecture |
| Enable audience targeting on nav | No | Nav Owner |

## How to make global navigation changes

### Step 1: Submit a request

Send the Navigation Owner a request including:
- **What:** The exact change (add, remove, rename, reorder)
- **Why:** Business justification
- **Where:** Which bucket and level
- **Audience:** Who should see this item (all, or audience-targeted group)
- **Destination URL:** The SharePoint site or page it should link to

### Step 2: Wait for approval

The Navigation Owner will:
- Check for duplication against the [nav taxonomy](../../reference/sharepoint-nav-taxonomy.md)
- Verify the destination exists and is accessible
- Assess whether the change needs architecture review (new top-level bucket, cross-hub link)
- Approve, modify, or reject with rationale

### Step 3: Implementation (Site Collection Admin)

Once approved:
1. Navigate to **SharePoint Admin Center** → **Settings** → **Global navigation**
2. Make the approved change (add, remove, rename, reorder)
3. If audience targeting is needed, configure the target group
4. Save and verify the change appears correctly

### Step 4: Verification

- Check global nav from the home site
- Check global nav from at least one hub site
- If audience-targeted, verify with a test account in the target group
- Confirm the link resolves to the correct destination

## How to make hub navigation changes

Hub owners can manage their own hub navigation:

1. Go to the hub site → **Site settings** → **Hub site navigation**
2. Add, remove, or reorder links
3. For new top-level hub links, get Navigation Owner approval first
4. Keep hub nav complementary to global nav — do not duplicate global items

## When to route to product / architecture

Route the request instead of self-servicing when:

| Situation | Route To |
|-----------|----------|
| "I want a link to appear on the homepage" | Product — this is Lane A webpart content |
| "I want an alert/utility in the ribbon" | Product — this is Lane B shell extension |
| "I want to create a new top-level nav bucket" | Architecture — requires taxonomy review |
| "I want to change the home site" | IT + Architecture — requires admin privileges |
| "I want custom navigation behavior" | Architecture — likely unsupported or Lane A/B scope |
| "I want a department-specific nav experience" | Architecture — assess audience targeting vs hub nav |

## Common mistakes to avoid

| Mistake | Why It's Wrong | What To Do Instead |
|---------|---------------|-------------------|
| Adding the same link to global nav and a homepage webpart | Creates duplication and maintenance burden | Choose one location based on persistence vs prominence |
| Deep-nesting nav items (3+ levels) | Mobile-unfriendly, hard to discover | Flatten to 2 levels max |
| Using nav labels as sentences | Clutters the nav bar | Use 1–3 word labels |
| Adding temporary links to global nav | Nav is persistent; clutter accumulates | Use Lane B alert band for temporary announcements |
| Skipping the approval process | Creates taxonomy drift and duplication | Always request through the Navigation Owner |

## Related documents

- [Navigation Governance Model](../../reference/sharepoint-navigation-governance.md) — ownership, change-control, escalation rules
- [Navigation Taxonomy Reference](../../reference/sharepoint-nav-taxonomy.md) — recommended structure, buckets, anti-sprawl guardrails
- [Homepage & Shell Boundaries](../../reference/sharepoint-homepage-shell-boundaries.md) — three-lane architecture
