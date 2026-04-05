# Homepage Administrator Operating Guide

Practical guide for administrators processing homepage update requests, routing decisions, and recognizing misuse.

## Processing homepage update requests

### Step 1: Classify the request

| Request Type | Route To | Approval |
|-------------|----------|----------|
| Text refresh (headline, summary, metadata) | Zone Content Owner | Self-service |
| Link/CTA update to approved destination | Zone Content Owner | Self-service |
| New CTA destination | Zone Content Owner → Approval Role | Requires sign-off |
| Alert severity change (warning/critical) | Corporate Communications → Comms Lead | Requires sign-off |
| New content category | Zone Content Owner → Approval Role | Requires sign-off |
| Add/remove webpart from homepage | Architecture Reviewer | Architecture review |
| Structural/zone change | Architecture Reviewer | Architecture review |

### Step 2: Route the request

**If self-service:** Confirm the requestor is the zone Content Owner. Proceed.

**If approval required:** Forward to the zone Approval Role (see [ownership matrix](../../reference/sharepoint-homepage-ownership-and-freshness.md)). Wait for documented approval before implementing.

**If architecture required:** Forward to the Architecture Reviewer with:
- What is being requested
- Which zone/webpart is affected
- Why the current composition is insufficient
- Any urgency factors

### Step 3: Implement and verify

1. Make the approved change in the webpart configuration
2. Verify the change renders correctly on the homepage
3. Confirm no unintended side effects on other zones
4. Document the change in the zone's update log

## When to approve directly

| Situation | Direct Approval OK? |
|-----------|:-------------------:|
| Content Owner refreshing their own zone's text | Yes |
| Swapping a featured item with another from the same category | Yes |
| Updating a link to a new URL for the same destination | Yes |
| Rotating leadership message to the next scheduled entry | Yes |
| Adding a new recognition entry to People & Culture | Yes |

## When to require Communications or Operations sign-off

| Situation | Sign-off From |
|-----------|--------------|
| Hero banner message changes tone or emphasis | Comms Lead |
| Company Pulse features a topic not previously covered | Comms Lead |
| Priority Actions adds a new action group | IT Director |
| Project Spotlight flags a project as strategically emphasized | VP Operations |
| Safety alert at warning or critical severity | Safety Director + Comms Lead |

## When to send to architecture

| Situation | Why |
|-----------|-----|
| "Can we put homepage webparts on the department page?" | Violates homepage singularity |
| "Can we add a new section to the homepage?" | Changes the 5-zone architecture |
| "Can we build a custom webpart for X?" | Requires Lane A product engineering |
| "Can we automate homepage content updates?" | Requires engineering assessment |
| "Can we change how the greeting works?" | Changes mount/dispatch seam behavior |

## Recognizing homepage misuse

Watch for these patterns and escalate:

| Pattern | Risk | Action |
|---------|------|--------|
| Same content appearing on homepage AND a communications page with no differentiation | Duplication drift | Ask: which is the curated summary and which is the full article? |
| Homepage zone used for content that belongs in navigation | Lane confusion | Route to [navigation governance](../../reference/sharepoint-navigation-governance.md) |
| Frequent emergency alerts that aren't actually emergencies | Alert fatigue | Enforce the emergency update path (24-hour review requirement) |
| Content Owner hasn't updated their zone in >2× the freshness cadence | Stale content | Trigger backup-owner escalation per [freshness policy](../../reference/sharepoint-homepage-ownership-and-freshness.md) |
| Request to "just add one more thing" to the homepage repeatedly | Scope creep | Redirect to normal page creation per [page-template governance](../../reference/sharepoint-branding-and-page-templates.md) |

## Handling stale or abandoned content

1. **Identify** using the stale-threshold model (yellow/orange/red)
2. **Notify** the Content Owner with the specific stale items
3. **Escalate** to Backup Owner after one missed notification cycle
4. **Escalate** to Approval Role if content reaches red threshold (2× cadence)
5. **Replace or remove** only with Approval Role authorization — do not silently delete content

## Coordinating with other governance docs

| If the request involves... | Coordinate with... |
|---------------------------|-------------------|
| Navigation links | [Navigation governance](../../reference/sharepoint-navigation-governance.md) |
| Page creation outside homepage | [Page-template governance](../../reference/sharepoint-branding-and-page-templates.md) |
| Site branding changes | [Branding rules](../../reference/sharepoint-branding-and-page-templates.md) |
| Shell-extension alerts/ribbon | Lane B activation governance (separate from homepage) |
| Content freshness policy | [Ownership & freshness](../../reference/sharepoint-homepage-ownership-and-freshness.md) |

---

## Related Documents

- [Homepage Authoring Governance](../../reference/sharepoint-homepage-authoring-governance.md) — who may author what
- [Homepage Ownership & Freshness](../../reference/sharepoint-homepage-ownership-and-freshness.md) — ownership matrix and review cadence
- [Navigation Operating Guide](./sharepoint-navigation-operating-guide.md) — nav change procedures
- [Page Authoring Guide](./sharepoint-page-authoring-guide.md) — non-homepage page creation
