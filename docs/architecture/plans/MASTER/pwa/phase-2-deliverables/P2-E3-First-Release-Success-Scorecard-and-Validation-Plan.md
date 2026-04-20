# P2-E3: First-Release Success Scorecard and Validation Plan

| Field | Value |
|---|---|
| **Doc ID** | P2-E3 |
| **Phase** | Phase 2 |
| **Workstream** | E — Multi-Role Context, Rollout, and Validation |
| **Document Type** | Active Reference |
| **Owner** | Adoption / Product + Support |
| **Update Authority** | Product lead; scorecard results updated by Adoption; changes to structure require Architecture review |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §7.1, §10.5, §14, §16, §17](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-C5](P2-C5-Pilot-Publication-and-Rollout-Readiness-Register.md); [P2-B3 §12](P2-B3-Freshness-Refresh-and-Staleness-Trust-Policy.md); [P2-E5](P2-E5-Pilot-Cohort-Rollout-and-Adoption-Sequencing-Note.md) |

---

## Register Statement

Phase 2 first-release success is measured by a balanced scorecard — not by a single KPI or subjective opinion. This register defines the scorecard structure, metric categories, measurement infrastructure, validation criteria, and pilot schedule. It is a living document updated with pilot data as the first release progresses. Exact KPI threshold bands are a carry-forward item (Phase 2 §17) — this register defines what is measured and how, not the final pass/fail numbers.

---

## Register Scope

### This register governs

- Scorecard structure and metric categories
- Per-category metric definitions
- Measurement infrastructure and telemetry dependencies
- Validation criteria structure (category pass/fail framework)
- Pilot validation schedule and check-in cadence
- Rollback trigger conditions
- Wave 2 expansion gate criteria

### This register does NOT govern

- Exact launch KPI bands and red/green thresholds — deferred (Phase 2 §17)
- Pilot cohort roster and sequencing — see P2-E5
- Publication readiness and launch checklist — see [P2-C5](P2-C5-Pilot-Publication-and-Rollout-Readiness-Register.md)
- Open decisions and deferred items — see P2-E4

---

## Definitions

| Term | Meaning |
|---|---|
| **Balanced scorecard** | A multi-dimensional success measurement model that evaluates adoption, engagement, trust, publication, and satisfaction — not a single metric |
| **Metric category** | One of five dimensions of success, each with multiple specific metrics |
| **Validation criterion** | A threshold or condition that a metric must meet for the category to pass |
| **Pilot validation window** | A defined time period during which metrics are collected and evaluated |
| **Rollback trigger** | A condition severe enough to pause or reverse the pilot rollout |
| **Expansion gate** | A set of scorecard results that must pass before rolling out beyond the pilot cohort |

---

## 1. Balanced Scorecard Model

Per Phase 2 §16 locked decision: **"First-release success model: Balanced scorecard."**

The scorecard measures five categories:

| Category | What It Measures | Why It Matters |
|---|---|---|
| **Adoption** | Are pilot users landing on and returning to the hub? | The hub only succeeds if users adopt it as their daily work surface |
| **Engagement** | Are users acting on work items, not just viewing? | Views without actions indicate the hub isn't driving work |
| **Trust** | Do users trust the data they see? | Stale or misleading data destroys operating-layer credibility |
| **Publication** | Are work sources publishing correctly? | Missing or broken sources make the hub incomplete |
| **Satisfaction** | Do users find the hub useful? | Adoption without satisfaction leads to eventual abandonment |

### Scorecard Invariant

Success requires passing in **all five categories** — strong adoption with poor trust, or strong engagement with broken publication, does not constitute success. The scorecard is balanced by design.

---

## 2. Adoption Metrics

| Metric | Definition | Telemetry Source |
|---|---|---|
| **Cohort activation rate** | % of pilot cohort users who have landed on `/my-work` at least once | Auth + route telemetry |
| **Daily active users (DAU)** | Distinct users who visit `/my-work` per day | Route telemetry |
| **Return rate** | % of users who return to `/my-work` on day 2, 7, 14 after first visit | Route telemetry with user tracking |
| **Landing compliance** | % of sessions where pilot users land on `/my-work` vs `/project-hub` | `resolveRoleLandingPath()` telemetry |
| **Session frequency** | Average sessions per user per week | Auth session telemetry |

### Adoption Signals

| Signal | Interpretation |
|---|---|
| High activation, low return | Users tried the hub but didn't find it useful enough to return |
| High DAU, low landing compliance | Users visit hub but are circumventing the default landing |
| Growing return rate over time | Users are forming a hub habit — positive signal |

---

## 3. Engagement Metrics

| Metric | Definition | Telemetry Source |
|---|---|---|
| **Items actioned per session** | Average count of feed mutations + navigations per session | `useMyWorkActions` telemetry |
| **Action type distribution** | Breakdown of mark-read, defer, pin, open, waiting-on actions | Feed mutation telemetry |
| **Team mode usage** | % of Executive users who use `my-team` mode at least once per week | Team mode toggle telemetry |
| **Feed mutation rate** | Mutations per user per day (mark-read, defer, pin) | Feed mutation telemetry |
| **Navigation-out rate** | % of items where user clicks "Open" to navigate to domain surface | Navigation telemetry |
| **Reasoning drawer usage** | % of users who open the reasoning drawer at least once | Reasoning drawer telemetry |

### Engagement Signals

| Signal | Interpretation |
|---|---|
| High view, low action | Hub is informational but not driving work completion |
| High mark-read, low open | Users are managing notifications, not acting on work |
| High navigation-out rate | Hub is successfully routing users to domain surfaces — positive signal |
| Low team mode usage (Executives) | Team portfolio view not providing value; needs investigation |

---

## 4. Trust Metrics

| Metric | Definition | Telemetry Source |
|---|---|---|
| **Staleness exposure rate** | % of sessions where `isStale === true` was displayed | `feed.freshness.stale` event (P2-B3 §12) |
| **Offline cache reliance** | % of sessions where cached feed was shown as fallback | `feed.connectivity.offline-cache-shown` event |
| **Degraded cache reliance** | % of sessions where degraded-state cache fallback was used | `feed.connectivity.degraded-cache-shown` event |
| **Freshness indicator visibility** | % of stale sessions where staleness indicator was actually visible | UI rendering telemetry |
| **Partial-load frequency** | % of feed refreshes that produced `partial` status | `feed.source.partial-load` event |
| **Sync-complete success rate** | % of offline mutation replays that succeeded on reconnect | `feed.connectivity.sync-complete` event |

### Trust Signals

| Signal | Interpretation |
|---|---|
| High staleness exposure | Feed refresh infrastructure may need tuning |
| Low freshness indicator visibility | Trust invariant violation — staleness not being communicated |
| High partial-load frequency | Source reliability issue; specific adapters may need attention |
| Low sync-complete success rate | Offline mutation replay failing; data reconciliation needs investigation |

---

## 5. Publication Metrics

| Metric | Definition | Telemetry Source |
|---|---|---|
| **Source publication rate** | Items published per source per day | `feed.freshness.refresh.complete` by source |
| **Source coverage** | % of registered sources producing items for the pilot cohort | Feed computation by source module |
| **Deduplication rate** | % of items merged during deduplication | Feed dedup telemetry |
| **Zero-item sessions** | % of sessions where the feed had 0 items in `do-now` lane | Feed computation results |
| **Cross-source item distribution** | Ratio of items per source module | Feed source breakdown |

### Publication Signals

| Signal | Interpretation |
|---|---|
| Source with 0 publication | Registration wiring incomplete or adapter broken for that source |
| High zero-item sessions | Pilot cohort may not be tied to active first-release source tranche |
| Very high dedup rate | Sources may be over-publishing for the same records |
| Uneven source distribution | Normal (domains have different volumes); extreme imbalance may indicate a gap |

---

## 6. Satisfaction Metrics

| Metric | Definition | Collection Method |
|---|---|---|
| **User feedback score** | Likert-scale survey: "The Personal Work Hub helps me manage my work" | In-app survey (pilot week 2) |
| **Usefulness rating** | "How useful is the hub for your daily work?" (1–5 scale) | In-app survey |
| **Support ticket volume** | Hub-related support tickets per week | Support system tracking |
| **Opt-out rate** | % of pilot users who request to revert to `/project-hub` landing | Opt-out request tracking |
| **Qualitative feedback** | Open-ended feedback themes | Survey + support channel analysis |

### Satisfaction Signals

| Signal | Interpretation |
|---|---|
| High usefulness, low opt-out | Hub is delivering value — positive signal |
| Low usefulness, high opt-out | Hub is not meeting user needs; investigate engagement and trust metrics |
| High support volume | Hub may have usability issues or unclear behavior |
| Consistent qualitative themes | Actionable feedback for targeted improvements |

---

## 7. Measurement Infrastructure

### 7.1 Telemetry Dependencies

| Source | Events Required | Defined In |
|---|---|---|
| Feed freshness | `feed.freshness.stale`, `feed.freshness.refresh.complete`, `feed.freshness.refresh.failed` | P2-B3 §12.1 |
| Connectivity | `feed.connectivity.offline-cache-shown`, `feed.connectivity.degraded-cache-shown`, `feed.connectivity.sync-complete` | P2-B3 §12.2 |
| Source health | `feed.source.partial-load`, `feed.source.recovered` | P2-B3 §12.3 |
| Feed actions | Action dispatch events from `useMyWorkActions` | Existing feed telemetry |
| Route telemetry | Page view events for `/my-work`, `/project-hub`, `/admin` | Shell route telemetry |
| Auth telemetry | Session start, role resolution | `@hbc/auth` telemetry |

### 7.2 Survey Infrastructure

| Requirement | Specification |
|---|---|
| **Delivery** | In-app survey prompt at pilot week 2 |
| **Targeting** | Pilot cohort users only |
| **Format** | 3 Likert-scale questions + 1 open-ended |
| **Frequency** | Once during pilot (week 2); optional follow-up at pilot end |

---

## 8. Validation Criteria

### 8.1 Category Pass/Fail Framework

Each category is evaluated as **Pass**, **Caution**, or **Fail**:

| Rating | Meaning | Action |
|---|---|---|
| **Pass** | Metrics meet or exceed expectations | Continue pilot; prepare Wave 2 |
| **Caution** | Metrics are borderline or mixed | Continue pilot with targeted investigation; do not expand |
| **Fail** | Metrics are clearly below acceptable threshold | Pause pilot; investigate root causes; remediate before continuing |

### 8.2 Per-Category Criteria Structure

| Category | Pass Indicator | Fail Indicator |
|---|---|---|
| **Adoption** | Activation > threshold; return rate growing | Activation < threshold; return rate declining |
| **Engagement** | Items actioned per session > threshold; navigation-out rate healthy | Near-zero actions; users not engaging with items |
| **Trust** | Staleness exposure < threshold; freshness always visible | Trust invariant violations; users seeing stale data without indicator |
| **Publication** | All required sources publishing; zero-item sessions < threshold | Required source not publishing; high zero-item rate |
| **Satisfaction** | Usefulness > threshold; opt-out < threshold | Low usefulness; high opt-out rate |

### 8.3 Threshold Bands (Carry-Forward)

Per Phase 2 §17: "exact launch KPIs and red/green thresholds" are a carry-forward item. The threshold bands will be calibrated after:
1. Pilot Week 1 data establishes baseline
2. Domain leads confirm expected publication volumes
3. Product lead sets adoption expectations based on cohort size

---

## 9. Pilot Validation Schedule

| Timepoint | Activity | Decision |
|---|---|---|
| **Pre-launch** | Confirm P2-C5 launch checklist complete | Go/no-go for pilot start |
| **Day 1** | Activation rate check | Confirm pilot users are landing correctly |
| **Week 1** | Adoption + publication metrics review | Confirm sources publishing; identify early issues |
| **Week 2** | Full scorecard review + satisfaction survey | First balanced assessment; caution/fail triggers investigation |
| **Week 3** | Follow-up on Week 2 issues | Confirm remediation; assess trend direction |
| **Week 4 (pilot end)** | Final scorecard assessment | Wave 2 expansion gate decision |

### Schedule Invariants

- Minimum pilot duration: 2 weeks (per P2-C5 §6.1).
- Scorecard is reviewed at each timepoint — not just at pilot end.
- Any **Fail** rating triggers immediate investigation, not automatic rollback.
- Rollback requires Product-lead decision based on severity (§10).

---

## 10. Rollback Triggers

Per [P2-C5 §6.3](P2-C5-Pilot-Publication-and-Rollout-Readiness-Register.md):

| Trigger | Severity | Action |
|---|---|---|
| **Critical publication failure** — required source data not appearing | Critical | Pause pilot; revert affected cohort to `/project-hub` |
| **Trust-state failure** — stale data served without staleness indicator | Critical | Pause pilot; fix freshness indicators; resume |
| **Handoff failure** — items routing to wrong surface | High | Pause pilot; fix navigation routing; resume |
| **Negative feedback exceeding threshold** | Moderate | Pause pilot; Product/Adoption review; decide continue/revert |
| **Zero engagement** — users landing but never acting on items | Moderate | Investigate; may indicate source tranche mismatch with cohort |

### Rollback Invariants

- Rollback reverts the landing path to `/project-hub` — it does not destroy user data or feed state (P2-C5 §6.4).
- Rollback is a Product-lead decision — not automatic.
- Partial rollback (reverting specific users) is permitted if the issue is role-specific or source-specific.

---

## 11. Wave 2 Expansion Gate

Expansion beyond the pilot cohort requires:

| Criterion | Requirement |
|---|---|
| **Adoption** | Pass rating — activation and return rates meet threshold |
| **Engagement** | Pass or Caution — users are acting on items (Caution requires investigation plan) |
| **Trust** | Pass — no trust invariant violations |
| **Publication** | Pass — all required sources publishing correctly |
| **Satisfaction** | Pass or Caution — usefulness above threshold; opt-out below threshold |
| **Rollback triggers** | None active — all critical/high triggers resolved |
| **Product-lead approval** | Explicit sign-off on scorecard results and expansion readiness |

### Expansion Invariant

Wave 2 expansion is never automatic — it requires explicit Product-lead approval based on scorecard evidence.

---

## 12. Acceptance Gate Reference

| Field | Value |
|---|---|
| **Gate** | Pilot-readiness gate |
| **Pass condition** | Pilot cohort has defined rollout path and measurable success scorecard |
| **P2-E3 evidence** | Scorecard structure defined (§1); 5 metric categories specified (§2–§6); measurement infrastructure mapped (§7); validation schedule locked (§9) |
| **Primary owner** | Adoption / Product |

---

## 13. Locked Decisions

| Decision | Locked Resolution | P2-E3 Consequence |
|---|---|---|
| First-release success model | **Balanced scorecard** | Multi-dimensional measurement; no single-KPI judgment |
| Rollout posture | **Targeted pilot / phased rollout first** | Scorecard gates expansion; no broad rollout without evidence |

---

## 14. Register Precedence

| Deliverable | Relationship to P2-E3 |
|---|---|
| **P2-C5** — Rollout Readiness Register | P2-C5 defines when pilot can start; P2-E3 defines how pilot success is measured |
| **P2-B3** — Freshness Trust Policy | P2-B3 §12 defines the telemetry events P2-E3's trust metrics consume |
| **P2-E5** — Pilot Cohort Sequencing | P2-E5 defines who is in the pilot; P2-E3 defines how their experience is measured |
| **P2-E4** — Open Decisions Register | P2-E4 tracks threshold-band calibration as an open decision until pilot data arrives |

This register is updated with pilot data as it becomes available. Scorecard results are reviewed at each validation timepoint (§9).

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §10.5, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
