# Personal Work Hub — Dependency Readiness

**Purpose:** Critical-path dependency review for the Personal Work Hub, confirming readiness of every package the Work Hub directly depends on.
**Date:** 2026-03-15
**Governing primitive:** `@hbc/my-work-feed` (SF29, ADR-0115)

---

## 1. Critical-Path Dependencies

These packages are required for the Personal Work Hub to function. All must be **Ready** or **Ready with Restrictions** before Wave 1 Work Hub implementation begins.

| Package | Role in Work Hub | Version | Tests | Readiness | Risk |
|---------|-----------------|---------|-------|-----------|------|
| `@hbc/my-work-feed` | Core aggregation — adapters, ranking, deduplication, supersession, display | 0.0.1 | 37 files | **Ready** | Low — most tested Category C package; full pipeline implemented |
| `@hbc/bic-next-move` | Primary source adapter (weight 0.9) — ownership, urgency, expected action | 0.1.0 | 9 files | **Ready** | Low — full implementation; Tier-1 mandatory |
| `@hbc/workflow-handoff` | Handoff adapter (weight 0.8) — inbound work transfers | 0.1.0 | 8 files | **Ready** | Low — proven in Wave 0 completion flow |
| `@hbc/notification-intelligence` | Notification adapter (weight 0.5) — lifecycle signals | 0.0.2 | 11 files | **Ready** | Low — standalone primitive; no heavy dependencies |
| `@hbc/session-state` | Offline cache, mutation queue, draft persistence | 0.0.1 | 10 files | **Ready** | Low — proven in Wave 0 PWA offline-queuing |
| `@hbc/auth` | User identity, role resolution, permission evaluation | 0.2.0 | 26 files | **Ready** | Low — proven in Wave 0; most tested core package |
| `@hbc/complexity` | Tier-based display gating (essential/standard/expert) | 0.1.0 | 9 files | **Ready** | Low — Tier-1 mandatory; full implementation |
| `@hbc/ui-kit` | All visual components (badge, tile, panel, feed, cards) | 2.1.0 | 3 files | **Ready** | Low — most mature package; 117 exports |
| `@hbc/shell` | Navigation, workspace management, active-workspace tracking | 0.0.1 | 18 files | **Ready** | Low — navigation registry, workspace routing |
| `@hbc/smart-empty-state` | Guided onboarding for empty Work Hub states | 0.0.1 | 8 files | **Ready** | Low — standalone primitive |

### Restricted dependencies

| Package | Role in Work Hub | Version | Tests | Readiness | Restriction |
|---------|-----------------|---------|-------|-----------|-------------|
| `@hbc/project-canvas` | Dashboard canvas for personal work layout | 0.0.1 | 14 files | **Ready with Restrictions** | `@dnd-kit/core` drag-drop not yet proven in SPFx iframe context. Safe for PWA-only use in Wave 1. |
| `@hbc/related-items` | Cross-module record relationships for contextual work items | 0.0.1 | 9 files | **Ready** | Low risk |

---

## 2. Non-Critical Dependencies

These packages may be consumed by the Work Hub in Wave 1 but are not on the critical path. Their readiness does not block Work Hub implementation.

| Package | When Relevant | Version | Tests | Readiness |
|---------|--------------|---------|-------|-----------|
| `@hbc/ai-assist` | AI-powered action suggestions in Work Hub | 0.0.1 | 14 files | Ready with Restrictions (requires backend Foundry endpoint) |
| `@hbc/score-benchmark` | Score-driven work items from BD | 0.0.1 | 12 files | Ready |
| `@hbc/strategic-intelligence` | Heritage/strategic intelligence items from BD | 0.0.1 | 11 files | Ready |
| `@hbc/post-bid-autopsy` | Post-bid learning loop items | 0.0.1 | 13 files | Ready |
| `@hbc/versioned-record` | Version history context in work item detail | 0.0.1 | 9 files | Ready |
| `@hbc/field-annotations` | Annotation threads in work item context | 0.1.0 | 7 files | Ready |
| `@hbc/acknowledgment` | Sign-off actions surfaced as work items | 0.1.0 | 9 files | Ready |

---

## 3. Packages NOT on the Work Hub Critical Path

These packages are consumed by Wave 1 features but do not directly affect the Work Hub:

| Package | Why Not Critical | Readiness |
|---------|-----------------|-----------|
| `@hbc/health-indicator` | Used by Estimating bid readiness, not by Work Hub directly | **Must Be Hardened** (0 tests) |
| `@hbc/data-seeding` | Dev/demo tooling only | Ready |
| `@hbc/sharepoint-docs` | Document lifecycle; not consumed by Work Hub | Ready with Restrictions |

---

## 4. Dependency Graph Summary

```
@hbc/my-work-feed (core)
├── @hbc/bic-next-move (adapter source)
│   ├── @hbc/complexity
│   ├── @hbc/notification-intelligence
│   └── @hbc/ui-kit
├── @hbc/workflow-handoff (adapter source)
│   ├── @hbc/bic-next-move
│   ├── @hbc/session-state
│   ├── @hbc/acknowledgment
│   ├── @hbc/field-annotations
│   └── @hbc/ui-kit
├── @hbc/notification-intelligence (adapter source)
├── @hbc/session-state (offline support)
├── @hbc/complexity (display gating)
└── @hbc/ui-kit (visual components)
```

Maximum dependency depth: 3 levels. No circular dependencies.

---

## 5. Verdict

**All critical-path Work Hub dependencies are Ready or Ready with Restrictions.**

- No critical dependency is classified "Must Be Hardened" or "Do Not Use"
- The one restriction (`@hbc/project-canvas` drag-drop in SPFx) does not block PWA Work Hub
- `@hbc/health-indicator` (Must Be Hardened) is not a Work Hub dependency — it affects Estimating only
- **Wave 1 Work Hub implementation can proceed**

---

## Related Documents

- [Work Hub Runway Definition](./runway-definition.md)
- [Wave 1 Dependency Matrix](../developer/wave-1-dependency-matrix.md)
- [Shared-Package No-Go Rules](../developer/shared-package-no-go-rules.md)
- [Work Hub Publication Model](./publication-model.md)
