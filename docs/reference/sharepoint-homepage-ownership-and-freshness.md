# Homepage Ownership and Freshness Policy

Canonical ownership, freshness, and operating review policy for the HB Central homepage.

## Purpose

The HB Central homepage is a curated front door — not a general-purpose posting surface. This document defines who owns each homepage surface, how fresh content must stay, what happens when content goes stale, and how the homepage is reviewed for quality.

## Scope

This policy governs the **Lane A homepage page-canvas product** (`apps/hb-webparts`) only. It does not govern:
- Lane B shell-extension surfaces (separate activation governance)
- Lane C navigation and branding (separate nav governance)
- Non-homepage SharePoint pages (separate page-template governance)

## Relationship to the three-lane architecture

| Lane | Governed By | Homepage Role |
|------|-------------|---------------|
| **Lane A** — Homepage | This document | 10 webparts in 5-zone composition — the homepage content itself |
| **Lane B** — Shell Extension | [Activation governance](./sharepoint-homepage-shell-boundaries.md) | Renders on all pages including the homepage, but does not own homepage content |
| **Lane C** — Navigation | [Navigation governance](./sharepoint-navigation-governance.md) | Provides the nav structure users see above the homepage, but does not own page-canvas content |

---

## Ownership Model

### By zone

| Zone | Primary Owner | Backup Owner | Approval Role |
|------|---------------|--------------|---------------|
| **Top Band** | Corporate Communications | Executive Communications | COO / VP Communications |
| **Utility** | Operations Support / IT | Operations Program Managers | IT Director |
| **Communications** | Corporate Communications | HR / Executive Communications | VP Communications |
| **Operational Awareness** | Operations Program Managers | Safety Department | VP Operations |
| **Discovery** | IT / Operations Support | Corporate Communications | IT Director |

### By webpart

| Webpart | Zone | Content Owner | Freshness Accountable | Cadence |
|---------|------|---------------|----------------------|---------|
| Personalized Welcome Header | Top Band | Corporate Communications | Corporate Communications | Daily (greeting is system-generated; support line is authored) |
| HB Hero Banner | Top Band | Corporate Communications | Corporate Communications | Weekly |
| Priority Actions Rail | Utility | Operations Support | Operations Support | Weekly |
| Tool Launcher / Work Hub | Utility | IT / Operations Support | IT | Monthly |
| Company Pulse | Communications | Corporate Communications | Corporate Communications | Weekly |
| Leadership Message | Communications | Executive Communications | Executive Communications | Biweekly |
| People & Culture | Communications | HR / Corporate Communications | HR | Weekly |
| Project / Portfolio Spotlight | Operational | Operations Program Managers | Operations Program Managers | Event-driven |
| Safety & Field Excellence | Operational | Safety Department | Safety Department | Weekly |
| Smart Search / Wayfinding | Discovery | IT / Operations Support | IT | Monthly |

### Ownership rules

1. **Content Owner** is the role responsible for authoring, updating, and curating the content that appears in a webpart
2. **Freshness Accountable** is the role accountable for ensuring content stays within its freshness cadence — they may or may not be the same person who edits
3. **Approval Role** approves significant changes (new content categories, structural changes, removal of a webpart from the homepage)
4. If a Content Owner leaves the role or becomes inactive for >2 weeks, the Backup Owner assumes freshness accountability until a replacement is designated

---

## Freshness Policy

### Cadence definitions

| Cadence | Meaning | Max Stale Threshold |
|---------|---------|---------------------|
| **Daily** | Content should be reviewed/updated every business day | 2 business days without review |
| **Weekly** | Content should be reviewed/updated each week | 10 calendar days without update |
| **Biweekly** | Content should be reviewed/updated every two weeks | 21 calendar days without update |
| **Monthly** | Content should be reviewed/updated each month | 45 calendar days without update |
| **Event-driven** | Content updates when significant events occur (project milestones, incidents) | Stale after `staleAfterHours` config (default 168 hours / 7 days) |
| **Evergreen** | Content changes rarely; remains valid indefinitely | No stale threshold — quarterly review only |

### What happens when content exceeds its stale threshold

| Severity | Condition | Action |
|----------|-----------|--------|
| **Yellow** | Content is within 1.5× the stale threshold | Automated or manual reminder to Content Owner |
| **Orange** | Content exceeds the stale threshold | Escalate to Backup Owner; flag in weekly review |
| **Red** | Content exceeds 2× the stale threshold | Escalate to Approval Role; consider temporary replacement or removal |

### Evergreen vs time-sensitive

| Content Type | Freshness Model | Examples |
|-------------|-----------------|---------|
| **Evergreen** | Quarterly review only | Tool Launcher items, Smart Search categories, static utility links |
| **Authored editorial** | Weekly or biweekly | Hero banner headline, Company Pulse items, Leadership Message |
| **Operational signals** | Event-driven + stale threshold | Project Spotlight status, Safety highlights |
| **System-generated** | Always fresh (no manual update needed) | Personalized Welcome Header greeting, time-of-day greeting |

### Minimum metadata for time-sensitive content

All time-sensitive homepage content (weekly, biweekly, event-driven) must include:
- A visible freshness indicator or date/timestamp where the webpart contract supports it
- An `updatedAt` or equivalent field in the webpart configuration
- A clear owner attribution in the authoring governance registry

---

## Review Cadence

### Weekly owner review

- **Who:** Each zone's Content Owner
- **When:** Monday or first business day of the week
- **What:** Review all webparts in their zone for accuracy, freshness, and relevance
- **Output:** Update stale content or confirm content is current

### Monthly governance review

- **Who:** Navigation Owner + one representative from each zone
- **When:** First week of each month
- **What:** Review homepage zone health, ownership changes, freshness compliance, and any pending requests
- **Output:** Monthly status summary; escalation of any red-flag items

### Quarterly drift / quality review

- **Who:** Architecture Reviewer + Product Owner + Corporate Communications
- **When:** Quarterly (January, April, July, October)
- **What:** Full homepage quality audit — visual consistency, zone balance, content relevance, template compliance, authoring governance registry accuracy
- **Output:** Drift report with remediation assignments; update to this policy if governance rules need adjustment

### Architecture review triggers

An architecture review is required when:
- A zone owner requests adding or removing a webpart from the homepage
- A new content category is proposed for an existing webpart
- Homepage content is requested to appear on non-homepage pages
- The 5-zone structure is proposed to change
- A new editorial concept doesn't fit any existing zone

### Emergency update path

For urgent homepage messaging (safety incidents, severe weather, company-wide announcements):
1. **Who may initiate:** Any zone Content Owner or Executive Communications
2. **Approval:** Verbal approval from Approval Role (documented retroactively within 24 hours)
3. **Mechanism:** Update the relevant webpart content (typically Hero Banner alert or Company Pulse featured item)
4. **Duration:** Emergency content must be reviewed within 24 hours and either converted to standard content or removed
5. **Do NOT use Lane B alert band for homepage-level emergencies** — use the homepage Hero Banner or Welcome Header alert severity; Lane B alerts are for tenant-wide shell notifications

---

## Alignment with Page-Template Governance

- Homepage governance is **stricter** than normal SharePoint page authoring
- The homepage is NOT an ordinary communications page — it follows the 5-zone composition model, not freeform section layouts
- Homepage custom surfaces (Lane A webparts) are **reserved and governed** — they cannot be added to or removed from the homepage without architecture approval
- All non-homepage pages follow the [page-template governance](./sharepoint-branding-and-page-templates.md) instead of this document
- Content that belongs on a communications page should NOT be promoted to the homepage without review against the zone/webpart ownership model

---

## Related Documents

- [Homepage & Shell Boundaries](./sharepoint-homepage-shell-boundaries.md) — three-lane architecture
- [Navigation Governance](./sharepoint-navigation-governance.md) — Lane C nav rules
- [Branding and Page Templates](./sharepoint-branding-and-page-templates.md) — non-homepage page governance
- [Per-Webpart Contract Reference](../architecture/plans/MASTER/spfx/homepage/phase-01/Homepage-Per-Webpart-Contract-Reference.md) — technical webpart contracts
- [SPFx Homepage Overlay](./ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md) — visual doctrine for homepage surfaces
