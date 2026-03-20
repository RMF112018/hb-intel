# P2-E5: Pilot Cohort Rollout and Adoption Sequencing Note

| Field | Value |
|---|---|
| **Doc ID** | P2-E5 |
| **Phase** | Phase 2 |
| **Workstream** | E — Multi-Role Context, Rollout, and Validation |
| **Document Type** | Note |
| **Owner** | Adoption / Product + Support |
| **Update Authority** | Product lead; changes require Adoption team review |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §7.1, §10.5, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-C5](P2-C5-Pilot-Publication-and-Rollout-Readiness-Register.md); [P2-E3](P2-E3-First-Release-Success-Scorecard-and-Validation-Plan.md); [P2-E4](P2-E4-Open-Decisions-and-Deferred-Items-Register.md) |

---

## Note Statement

Phase 2 first release uses a targeted pilot with phased expansion — not a company-wide switch on day one. This note defines how the pilot cohort is selected, what support they receive, how feedback is collected, and how expansion proceeds. The pilot validates the Personal Work Hub as a credible daily operating surface before broader rollout.

---

## Note Scope

### This note covers

- Pilot cohort selection criteria and composition guidance
- Three-wave adoption sequencing (pilot → expansion → general availability)
- Onboarding and support expectations
- Feedback collection mechanisms
- Expansion decision process
- Rollback and opt-out rules

### This note does NOT cover

- Publication readiness and launch checklist — see [P2-C5](P2-C5-Pilot-Publication-and-Rollout-Readiness-Register.md)
- Success scorecard and metrics — see [P2-E3](P2-E3-First-Release-Success-Scorecard-and-Validation-Plan.md)
- Open decisions and deferred items — see [P2-E4](P2-E4-Open-Decisions-and-Deferred-Items-Register.md)
- Role entitlements — see [P2-D1](P2-D1-Role-to-Hub-Entitlement-Matrix.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Pilot cohort** | The first group of users who receive `/my-work` as their default PWA landing |
| **Adoption sequencing** | The phased plan for expanding hub access from pilot to general availability |
| **Wave** | A rollout phase with defined scope, success criteria, and expansion gate |
| **Onboarding** | The support and guidance provided to users transitioning to the hub as their default surface |
| **Opt-out** | A user's ability to revert their default landing to `/project-hub` during pilot |

---

## 1. Pilot Cohort Selection Criteria

Per [P2-C5 §4](P2-C5-Pilot-Publication-and-Rollout-Readiness-Register.md) and Phase 2 Plan §7.1:

### 1.1 Selection Priorities

The pilot cohort SHOULD prioritize:

| Priority | Criterion | Rationale |
|---|---|---|
| 1 | **Users whose workflows are tied to the first-release source tranche** | They will have real work items from Provisioning, Estimating, BD, and Project Hub — the hub will be immediately useful |
| 2 | **Users who benefit most from a credible daily work surface** | Users currently reconstructing their workday across multiple tools will see the most value |
| 3 | **Elevated roles who need the hybrid personal + team/portfolio experience** | Validates Executive team-mode landing, delegated visibility, and portfolio counts |

### 1.2 Selection Requirements

| Requirement | Rationale |
|---|---|
| Must include at least one `Administrator` user | Validates admin landing and cross-role navigation |
| Must include at least one `Executive` user | Validates hybrid team-mode landing and portfolio cards |
| Must include `Member`-only users | Validates the core personal-first experience |
| Must include at least one multi-role user | Validates P2-E1 multi-role context behavior |
| Should span at least 2 business domains | Validates cross-source publication and deduplication |

---

## 2. Cohort Composition

### 2.1 Size Guidance

| Parameter | Guidance | Rationale |
|---|---|---|
| **Minimum cohort** | 10–15 users | Enough for meaningful adoption/engagement data; small enough for direct support |
| **Recommended cohort** | 20–30 users | Better statistical significance; can still provide hands-on support |
| **Maximum cohort** | 50 users | Beyond this, pilot becomes a soft launch — requires broader support readiness |

### 2.2 Role Mix

| Role | Recommended % | Purpose |
|---|---|---|
| `Member` (standard users) | 60–70% | Core experience validation |
| `Executive` (elevated roles) | 20–30% | Team mode and portfolio validation |
| `Administrator` | 5–10% | Admin-specific behavior and cross-role validation |

### 2.3 Source Coverage

The cohort should include users who actively work with:

| Source | Coverage Target |
|---|---|
| Provisioning | At least 3 users with active provisioning requests |
| Estimating Bid Readiness | At least 2 users with active pursuits |
| BD Score Benchmark | At least 2 users with active scoring work |
| Project Hub Health Pulse | At least 2 users with active project oversight |

---

## 3. Adoption Sequencing

### Wave 1: Pilot

| Aspect | Specification |
|---|---|
| **Scope** | Pilot cohort receives `/my-work` as default landing |
| **Start gate** | P2-C5 launch checklist complete (all pre-launch items passed) |
| **Duration** | Minimum 2 weeks; recommended 4 weeks |
| **Support level** | High-touch: dedicated support channel, daily check-ins for first week |
| **Measurement** | P2-E3 scorecard tracked from day 1 |
| **Expansion gate** | P2-E3 §11 criteria met; Product-lead approval |

### Wave 2: Expansion

| Aspect | Specification |
|---|---|
| **Scope** | Expanded to additional user groups beyond pilot cohort |
| **Start gate** | Wave 1 scorecard passes; all Wave 1 issues resolved |
| **Duration** | 2–4 weeks |
| **Support level** | Medium-touch: documented FAQ, support channel, weekly check-ins |
| **Measurement** | Same scorecard; broader data set |
| **Expansion gate** | Wave 2 scorecard passes; no new critical issues; Product-lead approval |

### Wave 3: General Availability

| Aspect | Specification |
|---|---|
| **Scope** | All eligible users receive `/my-work` as default landing |
| **Start gate** | Wave 2 scorecard passes; support team trained for scale |
| **Duration** | Ongoing |
| **Support level** | Standard: documentation, help resources, normal support channels |
| **Measurement** | Ongoing adoption metrics; periodic satisfaction surveys |

### Sequencing Invariants

- Each wave requires explicit Product-lead approval — no automatic promotion.
- Wave 2 cannot start until Wave 1 issues are resolved, not just identified.
- Wave 3 (general availability) is not a Phase 2 commitment — it is gated on cumulative evidence.
- Users in earlier waves retain the hub experience during later waves (no regression).

---

## 4. Support and Onboarding

### 4.1 Pre-Pilot Preparation

| Activity | Owner | Timing |
|---|---|---|
| Prepare hub orientation guide (what the hub does, how to use it) | Product/Adoption | 1 week before pilot |
| Set up dedicated pilot support channel (Slack/Teams) | Support | 1 week before pilot |
| Brief pilot cohort on what to expect | Product | 2–3 days before pilot |
| Confirm opt-out mechanism is functional | Experience/Shell | Pre-launch checklist |

### 4.2 First Week Support

| Activity | Owner | Cadence |
|---|---|---|
| Monitor adoption metrics daily | Adoption | Daily |
| Respond to support channel within 4 hours | Support | Business hours |
| Conduct brief 1-on-1 check-ins with 3–5 users | Product | Days 2–4 |
| Triage and escalate reported issues | Support → Platform | As needed |
| Share daily pilot status summary with stakeholders | Adoption | Daily |

### 4.3 Ongoing Pilot Support

| Activity | Owner | Cadence |
|---|---|---|
| Monitor scorecard metrics | Adoption | Weekly |
| Support channel monitoring | Support | Business hours |
| Issue escalation and resolution tracking | Platform | As needed |
| Pilot status report | Adoption | Weekly |

---

## 5. Feedback Collection

### 5.1 Channels

| Channel | Purpose | Owner |
|---|---|---|
| **In-app survey** | Structured Likert-scale + open-ended feedback (P2-E3 §7.2) | Product |
| **Pilot support channel** | Real-time questions, issues, and suggestions | Support |
| **Opt-out tracking** | Users who request reversion to `/project-hub` | Adoption |
| **1-on-1 check-ins** | Deep qualitative feedback from selected users | Product |
| **Telemetry** | Automated adoption, engagement, trust, publication metrics (P2-E3) | Platform |

### 5.2 Survey Timing

| Survey | Timing | Format |
|---|---|---|
| Initial feedback | Pilot Week 2 | 3 Likert-scale questions + 1 open-ended |
| Follow-up feedback | Pilot end (Week 4) | Same format + "Would you recommend the hub?" |

### 5.3 Feedback Processing

| Activity | Owner | Timing |
|---|---|---|
| Categorize feedback themes | Product | Weekly |
| Prioritize actionable items | Product + Platform | Weekly |
| Report feedback summary to stakeholders | Adoption | Weekly status report |
| Update P2-E4 register if feedback reveals hidden deferrals | Architecture | As needed |

---

## 6. Expansion Decision Process

### 6.1 Decision Framework

Per [P2-E3 §11](P2-E3-First-Release-Success-Scorecard-and-Validation-Plan.md) (Wave 2 Expansion Gate):

| Criterion | Requirement |
|---|---|
| Adoption scorecard | Pass |
| Engagement scorecard | Pass or Caution (with investigation plan) |
| Trust scorecard | Pass |
| Publication scorecard | Pass |
| Satisfaction scorecard | Pass or Caution |
| Active rollback triggers | None |
| Product-lead approval | Explicit sign-off |

### 6.2 Decision Meeting

| Aspect | Specification |
|---|---|
| **When** | End of each wave (Week 4 for Wave 1, Week 6–8 for Wave 2) |
| **Attendees** | Product lead, Adoption lead, Experience lead, Architecture lead, Support representative |
| **Input** | P2-E3 scorecard results, feedback summary, issue log, P2-E4 open items |
| **Outcomes** | Approve expansion / Continue current wave / Pause / Rollback |

---

## 7. Rollback and Opt-Out

### 7.1 User-Level Opt-Out

| Aspect | Specification |
|---|---|
| **Mechanism** | User requests reversion via support channel or settings |
| **Effect** | User's `resolveRoleLandingPath()` returns `/project-hub` instead of `/my-work` |
| **Data preservation** | Hub data and session-state drafts are preserved — user can return to hub voluntarily |
| **Tracking** | Opt-out is logged as a satisfaction metric (P2-E3 §6) |
| **Reversible** | User can opt back in at any time |

### 7.2 Cohort-Level Rollback

Per [P2-C5 §6.3](P2-C5-Pilot-Publication-and-Rollout-Readiness-Register.md):

| Trigger | Action |
|---|---|
| Critical publication failure | Revert entire cohort to `/project-hub` landing |
| Trust-state failure | Revert affected cohort; fix indicators; resume |
| Handoff failure | Revert affected cohort; fix routing; resume |
| Negative feedback exceeding threshold | Product-lead decision on continue/revert |

### 7.3 Rollback Invariants

- Rollback reverts landing path only — it does NOT destroy feed data, session state, or user preferences (P2-C5 §6.4).
- Rollback is a Product-lead decision — not automatic.
- Partial rollback (specific users or roles) is permitted when the issue is scoped.
- After rollback remediation, the cohort can resume the pilot without re-onboarding.

---

## 8. Acceptance Gate Reference

| Field | Value |
|---|---|
| **Gate** | Pilot-readiness gate |
| **Pass condition** | Pilot cohort has defined rollout path and measurable success scorecard |
| **P2-E5 evidence** | Cohort selection criteria (§1), composition guidance (§2), adoption sequencing (§3), support plan (§4), feedback collection (§5), expansion process (§6) |
| **Primary owner** | Adoption / Product |

---

## 9. Locked Decisions

| Decision | Locked Resolution | P2-E5 Consequence |
|---|---|---|
| Rollout posture | **Targeted pilot / phased rollout first** | Three-wave sequencing; no day-one company-wide switch |
| First-release success model | **Balanced scorecard** | Expansion gated on scorecard results, not opinion |

---

## 10. Note Precedence

| Deliverable | Relationship to P2-E5 |
|---|---|
| **P2-C5** — Rollout Readiness Register | P2-C5 defines when the pilot can start (launch checklist); P2-E5 defines who is in it and how it's supported |
| **P2-E3** — Success Scorecard | P2-E3 defines what is measured; P2-E5 defines how feedback is collected and how expansion decisions are made |
| **P2-E4** — Open Decisions Register | P2-E4 tracks cohort roster as open decision OD-1; P2-E5 provides the selection framework |
| **P2-D1** — Entitlement Matrix | P2-D1 defines role-based entitlements; P2-E5 ensures the cohort includes users from each role category |

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §7.1, §10.5](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
