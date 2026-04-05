# Homepage Content Review Guide

Checklists and procedures for routine homepage review, content maintenance, and drift detection.

## Weekly homepage review checklist

**Who:** Each zone Content Owner
**When:** Monday or first business day

- [ ] All items in my zone are current and accurate
- [ ] No stale items exceed the zone's freshness cadence
- [ ] Featured items are still the most relevant for this week
- [ ] All links resolve to live, accessible destinations
- [ ] Alert severity (if set) still matches current conditions
- [ ] No duplicate content between my zone and other homepage zones
- [ ] No content that should be on a normal page instead of the homepage

## Monthly content cleanup checklist

**Who:** Navigation Owner + zone representatives
**When:** First week of each month

- [ ] Review all 10 webparts for content accuracy
- [ ] Identify any items approaching stale threshold (yellow)
- [ ] Confirm all Content Owners are active and responsive
- [ ] Check for orphaned links (destinations moved or deleted)
- [ ] Verify featured/secondary balance in editorial zones
- [ ] Confirm operational signals (project spotlight, safety) reflect current reality
- [ ] Review any pending update requests that haven't been processed
- [ ] Document any ownership changes since last month

## Quarterly drift / quality review checklist

**Who:** Architecture Reviewer + Product Owner + Corporate Communications
**When:** January, April, July, October

- [ ] Homepage still follows the 5-zone composition model
- [ ] No webparts have been added or removed without architecture approval
- [ ] No Lane A webparts appear on non-homepage pages
- [ ] Visual presentation is consistent with the homepage token system
- [ ] Brand tone is consistent with HB Central identity
- [ ] Zone balance is appropriate (no single zone dominating the page)
- [ ] Content quality meets premium homepage standard
- [ ] Authoring governance registry entries match actual webpart ownership
- [ ] Navigation governance has not drifted into homepage content or vice versa
- [ ] Shell-extension surfaces are not duplicating homepage content
- [ ] Page-template governance is not being bypassed through homepage workarounds
- [ ] Freshness policy is being followed (review stale-threshold reports)

## How to identify problems

### Duplicate destinations

A destination is duplicated when the same URL or resource appears in:
- A homepage webpart AND global/hub navigation
- Two different homepage webparts simultaneously
- A homepage webpart AND a Lane B ribbon/footer link

**Action:** Determine the primary location. Remove the duplicate. If uncertain, escalate to the monthly governance review.

### Outdated alerts

An alert is outdated when:
- The Welcome Header alert references an event that has passed
- A safety alert describes conditions that have been resolved
- An emergency message has been live for >24 hours without review

**Action:** Clear the alert or downgrade severity. Emergency content must be reviewed within 24 hours per the [freshness policy](../../reference/sharepoint-homepage-ownership-and-freshness.md#emergency-update-path).

### Stale spotlight/recognition content

Content is stale when:
- A project milestone has been "In Progress" beyond the expected completion
- A recognition entry references an event more than 4 weeks old
- An editorial summary references dates or events that have passed

**Action:** Replace with current content or remove. If no replacement is available, use the webpart's empty state (it will show the authoring governance message).

### Outdated links

A link is outdated when:
- It returns a 404 or redirect loop
- It points to a deprecated or archived site
- The destination content has moved to a new URL

**Action:** Update the link to the current destination. If the destination no longer exists, remove the link and notify the Content Owner.

## When to remove rather than revise

| Situation | Remove? | Revise? |
|-----------|:-------:|:-------:|
| Content is factually wrong | Remove immediately | Revise only if correction is ready |
| Content is outdated but still partially relevant | — | Revise |
| Content references a past event with no ongoing value | Remove | — |
| Featured item has no replacement ready | Remove (empty state is safer than stale) | — |
| Link destination no longer exists | Remove | — |
| Content duplicates another homepage item | Remove the duplicate | — |

## When to escalate

| Situation | Escalate To |
|-----------|-------------|
| Content Owner hasn't responded in 2 review cycles | Backup Owner |
| Content at red stale threshold (2× cadence) | Approval Role |
| Homepage has drifted from the 5-zone model | Architecture Reviewer |
| Lane A webparts found on non-homepage pages | Architecture Reviewer |
| Dispute between zone owners about content placement | Monthly governance review |
| Emergency content has been live >24 hours without review | Comms Lead |

---

## Related Documents

- [Homepage Authoring Governance](../../reference/sharepoint-homepage-authoring-governance.md) — who may author what
- [Homepage Operating Guide](./sharepoint-homepage-operating-guide.md) — admin request processing
- [Homepage Ownership & Freshness](../../reference/sharepoint-homepage-ownership-and-freshness.md) — freshness cadences and stale thresholds
