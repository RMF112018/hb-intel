
# PH7-SF-21: Project Health Pulse — Portfolio‑Scale Leading Indicator Health Model (Enhanced)

**Priority Tier:** 2 — Application Layer (Project Controls / Portfolio Oversight)  
**Module:** Project Controls / Executive Oversight  
**Mold Breaker Source:** UX‑MB §4 (Universal Next Move), UX‑MB §6 (Confidence‑Aware Intelligence), con‑tech‑ux‑study §5 (Project Health Blind Spots)

---

# Problem Solved

Most construction platforms represent project health using simplistic red‑yellow‑green status indicators or narrow dashboards focused on cost and schedule. These views are typically lagging, subjective, and difficult for leadership teams to interpret or trust.

Project leaders must often answer difficult questions without clear system guidance:

• Which project actually needs attention first?  
• Is this deterioration real or caused by incomplete data?  
• What specifically changed since last week?  
• What action will improve the situation fastest?  

This produces three systemic problems:

1. **Lagging health awareness** — risks surface only after problems are visible in cost or schedule variance.  
2. **Untrusted dashboards** — users question whether data is complete or manually manipulated.  
3. **No prioritization signal** — leadership sees project status but not which intervention matters most.

The **Project Health Pulse** solves these issues by creating a structured, explainable project health system that combines leading indicators, lagging confirmation metrics, accountability signals, and data confidence into a single operational model.

---

# Mold Breaker Rationale

Traditional project dashboards show metrics.

**Project Health Pulse shows operational reality.**

The system prioritizes:

• leading indicators over lagging outcomes  
• accountability signals alongside operational metrics  
• confidence transparency over artificial precision  
• actionable insights rather than static status

Instead of simply describing project health, the system actively answers:

> What changed? Why did it change? What should we do next?

---

# Core Health Model

The Project Health Pulse aggregates four dimensions of project health:

• **Time Health**  
• **Cost Health**  
• **Field Health**  
• **Office Health**

Each dimension contributes to a composite score with a **70/30 weighting of leading vs lagging indicators**.

This weighting prioritizes predictive signals while preserving historical confirmation.

---

# Pulse Confidence Model (New)

Health scores are only trustworthy if the underlying data is trustworthy.

The **Pulse Confidence Model** provides a transparent confidence score for both the overall project pulse and each individual dimension.

### Pulse Confidence Tiers

• High Confidence  
• Moderate Confidence  
• Low Confidence  
• Unreliable

Confidence signals are derived from:

• source data freshness  
• missing integrations  
• manual overrides  
• excluded metrics  
• insufficient trend history

### Confidence Visualization

The UI surfaces:

• overall Pulse Confidence indicator  
• dimension‑level confidence indicators  
• explanation banner when confidence is degraded

Example:

> Pulse Confidence: Moderate — schedule data stale for 6 days.

This ensures leadership understands when scores may be misleading.

---

# Cross‑Dimension Compound Risk Logic (New)

Traditional health dashboards treat dimensions independently.

However, real project deterioration often occurs when **multiple dimensions reinforce one another**.

Examples:

• Field blockers causing schedule drift  
• Forecast lag masking emerging cost risk  
• Office inaction amplifying field constraints

The Pulse engine therefore evaluates **compound risk conditions**.

### Compound Risk Rules

Examples include:

• Time + Field deterioration multiplier  
• Cost + Time correlation escalation  
• Office backlog amplifying Field constraints

When compound risk is detected, the UI displays:

• **Compound Risk Warning**
• explanation of interacting signals
• higher prioritization in portfolio triage

---

# Health Dimensions

## Time Health

Time Health evaluates schedule stability and delivery predictability.

Metrics include:

• milestone drift  
• float consumption  
• schedule slippage velocity  
• constraint backlog  
• near‑critical path volatility

### Execution Quality Signals (New)

Additional predictive indicators include:

• look‑ahead reliability  
• schedule update quality  
• short‑interval plan completion rate

These metrics capture schedule realism rather than just milestone variance.

---

## Cost Health

Cost Health evaluates financial performance and forecast reliability.

Metrics include:

• cost burn vs plan  
• forecast trend  
• pending change order exposure  
• cost variance trajectory

### Forecast Confidence Signals (New)

Forecast reliability is evaluated using:

• age of last forecast update  
• percent of exposure covered by committed costs  
• unresolved change order aging

This prevents falsely optimistic cost signals.

---

## Field Health

Field Health captures operational execution conditions.

Metrics include:

• constraint backlog  
• inspection results  
• unresolved issues  
• production bottlenecks

### Production Signals (New)

Additional indicators include:

• work plan completion reliability  
• rework trend indicators  
• production throughput consistency

These signals reflect actual field productivity rather than just issues logged.

---

## Office Health

Office Health measures administrative execution and accountability.

Signals include:

• overdue action items  
• pending approvals  
• response latency  
• unresolved coordination tasks

### Noise Suppression Logic (New)

To prevent alert fatigue, Office Health includes:

• duplicate action clustering  
• suppression of low‑impact reminders  
• severity‑weighted overdue signals

This ensures the dimension reflects meaningful risk rather than task backlog volume.

---

# Top Recommended Action Model (Enhanced)

The Project Health Pulse generates a single **Top Recommended Action**.

This action answers three critical questions:

• What should be done now?  
• Who should do it?  
• Why is this the most important step?

### Prioritization Factors

The recommendation engine evaluates:

• urgency  
• potential impact  
• reversibility window  
• responsible owner  
• confidence level

Each action includes a **reason code** explaining the selection.

Example:

> Recommended Action: Resolve 5‑day‑old electrical constraint — blocking two upcoming schedule milestones.

---

# Explainability Layer (Enhanced)

Users must understand why a project’s health changed.

The Pulse includes a dedicated **Explainability Drawer** containing:

• **Why this status** — key drivers of current health state  
• **What changed** — metric deltas since last snapshot  
• **Top contributors** — metrics with highest impact  
• **Best leverage move** — fastest improvement opportunity

This eliminates guesswork in interpreting health signals.

---

# Portfolio Triage Mode (New)

Portfolio oversight users require prioritization rather than reporting.

The **Portfolio Triage Mode** provides focused leadership views:

• Attention Now — highest intervention priority  
• Trending Down — deterioration velocity detection  
• Data Quality Risk — projects with low Pulse Confidence  
• Recovering — projects improving after intervention

Sorting options include:

• deterioration velocity  
• compound risk severity  
• unresolved action backlog

This enables PX and VP users to focus attention where it matters most.

---

# Manual Entry Governance (New)

Manual metric entries are sometimes necessary during MVP stages.

However, they introduce potential bias.

The system therefore implements governance controls.

### Override Requirements

Manual entries require:

• justification reason  
• contributor identity  
• timestamp

### Oversight Controls

The UI indicates:

• manually entered metrics  
• override aging indicators  
• projects heavily influenced by manual data

In sensitive cases, overrides may require approval.

This ensures transparency and prevents score manipulation.

---

# Telemetry Model

The system tracks operational effectiveness metrics including:

• intervention lead time  
• false alarm rate  
• deterioration detected before lagging confirmation  
• action adoption rate  
• portfolio review cycle time

These KPIs measure whether the Pulse is improving decision quality.

---

# Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | Action ownership |
| `@hbc/project-canvas` | My Work surfacing |
| `@hbc/complexity` | progressive disclosure |
| `@hbc/notification-intelligence` | escalation alerts |
| `@hbc/versioned-record` | historical snapshots |

---

# Offline / PWA Support

The Pulse dashboard supports offline viewing with:

• cached project health snapshots  
• offline metric review  
• background synchronization when connectivity returns

---

# Priority & ROI

**Priority:** P1 — enables proactive project intervention.

**Estimated implementation effort:** 5–6 sprint weeks.

Expected benefits:

• earlier detection of project risk  
• improved portfolio oversight  
• faster intervention cycles  
• higher trust in project health analytics

---

# Definition of Done

• Pulse Confidence model implemented  
• compound risk detection active  
• enhanced Time/Cost/Field signals integrated  
• Top Recommended Action engine implemented  
• explainability drawer available  
• portfolio triage mode operational  
• manual entry governance active  
• Office Health noise suppression functioning  
• telemetry instrumentation complete
