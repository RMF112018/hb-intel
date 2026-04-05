# Phase 06-01 Completion Note — Homepage Ownership and Freshness Policy

## Status

**Complete.** Homepage content ownership, freshness cadences, stale thresholds, review model, and emergency update path are established.

## Files created

| File | Purpose |
|------|---------|
| `docs/reference/sharepoint-homepage-ownership-and-freshness.md` | Canonical ownership and freshness policy: zone-by-zone and webpart-by-webpart ownership matrix, freshness cadence definitions (daily/weekly/biweekly/monthly/event-driven/evergreen), stale thresholds with yellow/orange/red escalation, evergreen vs time-sensitive classification, metadata requirements, weekly/monthly/quarterly review cadence, architecture review triggers, emergency update path |
| `Phase-06-01-Completion-Note.md` | This completion note |

## Files updated

| File | Change |
|------|--------|
| `docs/README.md` | Added Homepage Ownership & Freshness link to SharePoint section |
| `docs/architecture/blueprint/current-state-map.md` | Added classification entry for ownership/freshness doc |

## Major decisions locked

1. **Zone-level ownership** — each of the 5 homepage zones has a designated Primary Owner, Backup Owner, and Approval Role
2. **Webpart-level freshness cadence** — each of the 10 webparts has an explicit cadence: daily (welcome header support line), weekly (hero, priority actions, company pulse, people & culture, safety), biweekly (leadership message), monthly (tool launcher, smart search), event-driven (project spotlight)
3. **Stale threshold escalation** — yellow (1.5×), orange (exceeds threshold → backup owner), red (2× threshold → approval role)
4. **Review model** — weekly owner review, monthly governance review, quarterly drift/quality audit
5. **Emergency update path** — verbal approval from Approval Role, 24-hour retroactive documentation, use hero banner or welcome header alert (not Lane B alert band for homepage-level emergencies)
6. **Homepage is stricter** — homepage governance explicitly stricter than normal page-template governance; homepage is not an ordinary communications page

## Alignment with existing governance

- Freshness cadences in this document are consistent with the `HOMEPAGE_AUTHORING_GOVERNANCE_REGISTRY` in `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts` which defines the same 10 webpart entries with matching zone classifications and cadence types
- Zone ownership model aligns with the 5-zone architecture documented in `Homepage-Zone-Architecture.md` (Phase 03)
- Non-homepage page governance defers to the [page-template governance](../../reference/sharepoint-branding-and-page-templates.md) from Phase 05

## Verification

No code changes. Documentation verified for:
- Internal consistency between ownership matrix and freshness cadences
- Alignment with the authoring governance registry in code (10 webpart entries match)
- Correct cross-references to Lane A/B/C boundary docs
- Non-contradiction with homepage singularity and supported SharePoint posture
- Escalation paths are practical and don't create circular dependencies

## Deferred to Prompt 02

- Content authoring workflow tooling (approval forms, reminder automation)
- Freshness monitoring dashboard or reporting mechanism
- Integration between stale-threshold policy and runtime behavior (currently policy-level only; runtime `staleAfterHours` exists in operational webparts)
- Detailed audience/role mapping for freshness notifications
