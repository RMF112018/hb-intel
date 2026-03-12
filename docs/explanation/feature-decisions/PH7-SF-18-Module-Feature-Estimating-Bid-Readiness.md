
# PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md
## Shared Feature: Estimating – Bid Readiness Signal (Updated)

## Objective
Provide a continuously evaluated **Bid Readiness Signal** that indicates whether a pursuit is operationally prepared for submission. The signal replaces static bid-stage labels with a **dynamic readiness model** composed of eligibility gates, readiness scoring, and confidence indicators.

This update introduces **Eligibility Profiles** so immutable submission requirements vary appropriately by **project/bid type** (public hard bid, private negotiated, GMP proposal, conceptual estimate, etc.).

---

# Core Concept

Bid readiness is represented by **three coordinated signals**:

1. **Submission Eligibility**
2. **Bid Readiness Score**
3. **Estimate Confidence Indicator**

These signals together indicate whether a bid is:
- legally/commercially eligible to submit
- operationally prepared
- financially trustworthy

---

# Submission Eligibility

Submission eligibility determines whether the bid can be submitted from a **contractual or procedural standpoint**.

Eligibility is governed by **Eligibility Profiles**, which define immutable requirements for a pursuit type.

Eligibility status:

| Status | Meaning |
|------|------|
| Eligible | All immutable requirements satisfied |
| Conditionally Eligible | Core requirements met but conditional gates unresolved |
| Ineligible | One or more immutable requirements unmet |

Immutable requirements are **profile-driven**, not global.

---

# Eligibility Profiles

Eligibility Profiles define immutable submission requirements by pursuit type.

Profiles are configured using:

- delivery method
- owner type
- project category
- jurisdiction (optional)
- procurement type

### Example Profiles

#### Public Hard Bid
Immutable Gates:
- Bid Bond uploaded
- Addenda acknowledged
- Contractor license verified
- Required bid forms attached
- Compliance documentation validated

Conditional Gates:
- subcontractor listing required
- insurance verification required

#### Private Invited Bid
Immutable Gates:
- proposal narrative completed
- scope alignment confirmed
- executive pricing review

Conditional Gates:
- client clarification log updated
- design coordination review

#### Negotiated GMP
Immutable Gates:
- cost model finalized
- allowances documented
- VE log reviewed

Conditional Gates:
- owner review complete
- risk register acknowledged

#### Conceptual Budget
Immutable Gates:
- none

Readiness scoring still applies.

---

# Bid Readiness Score

The readiness score measures **operational preparation**, not submission legality.

Score Range:
0–100

Score components include:

- estimate completion
- subcontractor coverage
- document review status
- addenda impact review
- bid strategy alignment
- internal review completion

The readiness score answers:

> “How operationally prepared is this bid?”

Not:

> “Can this bid legally be submitted?”

---

# Estimate Confidence Indicator

Confidence measures **financial reliability** of the estimate.

Indicators include:

- percent of cost backed by vendor/sub quotes
- age of major assumptions
- variance to historical benchmarks
- proportion of allowances
- unresolved estimator notes

Confidence states:

| Level | Meaning |
|------|------|
| High | Estimate supported by current market inputs |
| Moderate | Some assumptions or limited quote coverage |
| Low | Significant placeholders or outdated assumptions |

---

# Subcontractor Coverage Quality

Coverage is evaluated by **quality and redundancy**, not just presence.

Coverage levels:

| Level | Description |
|------|------|
| None | No quotes |
| Minimal | One quote |
| Adequate | Two qualified quotes |
| Strong | Three or more qualified quotes |

Additional factors:

- quote recency
- subcontractor qualification status
- scope review completed
- exclusions normalized

---

# Addenda Impact Intelligence

Addenda processing includes:

- acknowledgment status
- cost-impact evaluation
- impacted CSI divisions
- impacted takeoff groups
- reviewer assignment

Addenda states:

- Issued
- Acknowledged
- Cost Impact Evaluated
- Impact Resolved

---

# Bid-Day Mode

As submission deadlines approach, the system transitions to **Bid-Day Mode**.

Trigger windows:

- 72 hours
- 24 hours
- 4 hours
- 1 hour

Bid-Day Mode features:

- simplified readiness dashboard
- final eligibility checklist
- submission packet preview
- unresolved blocker alerts
- responsibility handoff indicators

---

# Score Explainability

Users can open a **Why This Score?** panel.

The panel shows:

- criterion weight breakdown
- score deltas since previous evaluation
- top actions to increase readiness
- provenance of each data source

Sources may include:

- user-entered data
- document ingestion
- integrations
- administrative configuration

---

# Team Bid-Room Visibility

Bid readiness reflects **team operational state**, not just checklist completion.

Team view includes:

- criterion ownership (BIC)
- reviewer matrix
- outstanding approvals
- blocked dependencies
- signoff progression

---

# Metrics and Telemetry

Key performance metrics:

- average readiness score at submission
- bid-day blocker rate
- eligibility failure incidents
- estimator time-to-green
- bid preparation cycle time
- confidence variance by trade category

---

# Definition of Done

The feature is complete when:

- Eligibility Profiles configurable via admin interface
- Immutable gate logic enforced by profile
- Eligibility, readiness score, and confidence displayed together
- Score explainability panel implemented
- Addenda impact tracking functional
- Subcontractor coverage quality evaluated
- Bid-Day Mode operational
- Team visibility dashboard active
- Telemetry metrics captured

---

# Mold Breaker Impact

Traditional estimating systems track **bid artifacts**.

This feature tracks **bid readiness risk**.

The system provides:

- live submission eligibility validation
- readiness intelligence
- estimate confidence signals
- accountability routing
- operational bid-room visibility

The result is a system that actively reduces bid risk rather than simply managing bid documents.
