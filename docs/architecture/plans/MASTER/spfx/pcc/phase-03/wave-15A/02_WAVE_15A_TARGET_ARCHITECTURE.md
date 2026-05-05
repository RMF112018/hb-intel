# 02 — Wave 15A Target Architecture

## 1. Purpose

This file defines the target UX/UI architecture for PCC after Wave 15A. It describes how PCC must look, behave, and communicate to qualify as a 56/56 doctrine-conformant SPFx product surface.

## 2. Target Product Definition

PCC is the project-specific operational command center inside HB Central. It connects project health, document control, team/access, readiness, approvals, external systems, site health, and settings into one coherent project control experience.

PCC must not feel like:

- a generic SaaS dashboard,
- a set of disconnected cards,
- an internal developer preview,
- a SharePoint page with embedded test panels,
- or a route coverage demonstration.

## 3. Target Information Architecture

### Command Layer

- Project Home
- Priority Actions
- Project Readiness

### Operational Controls Layer

- Documents
- Team & Access
- Approvals

### Governance and Health Layer

- Site Health
- Control Center Settings

### Connected Systems Layer

- External Systems

Navigation should present these as operational groups, with status indicators where useful.

## 4. Target Shell Architecture

The shell must contain:

1. Compact product identity.
2. Project context band.
3. Surface navigation.
4. Surface state indicators.
5. Search or command input only if useful.
6. Diagnostics/preview state moved to a subordinate position.

### Required Shell Qualities

- Compact.
- Tenant-aware.
- Project-centered.
- Low visual noise.
- Supports keyboard traversal.
- Does not compete with content.
- Does not assume standalone app viewport.

## 5. Target Surface Header Architecture

Every surface must start with a standardized surface header.

Required fields:

- Surface name.
- Surface purpose.
- Project number.
- Project name.
- Lifecycle phase or operational category.
- Surface state.
- Primary next action or key limitation.
- Source freshness/confidence when applicable.

Example:

```text
Documents
Formal project record, working files, and connected document systems for 26-999-99 HB Central Test.

Status: SharePoint Project Record connected · Procore preview · OneDrive working files available
Next action: Review Project Record binding health.
```

## 6. Target Layout Architecture

Every surface must define:

- One primary command region.
- One or more operational content regions.
- Supporting/reference content regions.
- Responsive collapse behavior.
- Empty-state behavior.
- Preview/read-only behavior.

No surface may be left as a single placeholder panel unless the surface is intentionally blocked and the blocked state is itself the operational content.

## 7. Target Card Architecture

### Tier 1 — Command Cards

Purpose: make the highest-priority state/action obvious.

Examples:

- Project health summary.
- Access posture.
- Readiness blocked state.
- Site Health top risk.
- Document control binding status.

### Tier 2 — Operational Cards

Purpose: support actual project work.

Examples:

- Action queue.
- Document lanes.
- Team roster.
- Approval queue.
- Health checks.

### Tier 3 — Reference Cards

Purpose: provide supporting facts.

Examples:

- Policy notes.
- System mappings.
- Last run metadata.
- Diagnostic facts.

## 8. Target State Architecture

State must be operationally meaningful.

Required state variants:

- `live`
- `preview`
- `readOnly`
- `unavailable`
- `setupRequired`
- `degraded`
- `blocked`
- `error`
- `empty`
- `loading`

Each state must answer:

1. What is available?
2. What is not available?
3. Why?
4. What can the user do next?
5. Who owns resolution, if applicable?

## 9. Target Visual Architecture

Required qualities:

- Strong but restrained HB identity.
- Semantic status language.
- Reduced decorative dominance.
- Clear scan path.
- Compact project-operations density.
- Consistent headings and labels.
- Professional SharePoint-hosted fit.
- No false precision or misleading controls.

## 10. Target Tenant Architecture

PCC must be validated in:

- SharePoint published mode.
- SharePoint edit mode.
- Standard laptop width.
- Constrained browser width.
- At least one large desktop width.
- Any supported tablet/constrained breakpoints.

## 11. Target User Outcomes

After Wave 15A, a user should be able to answer these questions within seconds:

- What project am I viewing?
- Is the project operationally healthy?
- What needs my attention today?
- Which module am I in?
- What can I do here?
- What is live versus preview/read-only?
- What is blocked or degraded?
- Where do I go next?
