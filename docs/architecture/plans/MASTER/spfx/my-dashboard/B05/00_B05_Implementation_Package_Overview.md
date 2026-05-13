# 00 — B05 Implementation Package Overview

## Objective

Implement the repository-facing documentation alignment required for:

```text
B05 — Adobe Sign Integration Architecture, Identity Mapping, OAuth, Agreement Search, and Source Handoff Development
```

B05 is a **closed-decision planning artifact** for Sections **15**, **16**, **17**, and **20** of the My Dashboard comprehensive plan. The repo implementation task is to commit that artifact into the canonical dev-plan folder and reconcile the folder/index/outline docs so later work inherits B05 correctly.

---

## Why B05 is a documentation/planning implementation batch

B05 resolves architecture questions that later code implementation must inherit, but it does not itself build the runtime subsystem. It defines:

- delegated Adobe OAuth architecture,
- Acrobat Sign app-domain posture,
- actor-to-grant identity binding,
- app-only token exclusion,
- grant-record based principal resolution,
- production-live provider dependency gates,
- bounded `POST v6/search` retrieval posture,
- source-handoff rules and row-link restrictions,
- downstream security, resilience, and testing constraints.

Those decisions need to exist in canonical repo planning documentation before a local code agent begins future live integration implementation.

---

## Key repo-truth findings that shape this package

### Finding 1 — B04 is already committed on live `main`
The B05 artifact correctly names the B04 commit as its continuation anchor. The live repo contains the B04 detailed planning artifact in the My Dashboard dev-plan folder.

### Finding 2 — The current folder README exists, but it is stale
The README indexes B01, B02, and B03, then states that B04 and later must extend the table. Because B04 already exists and B05 is now ready to be added, the README must be refreshed.

### Finding 3 — The outline’s batch authority header is incomplete
The outline’s “Batch Authority Posture” table currently lists B01 and B02 only, even though B03 and B04 exist and B05 will now be added. The authority map must be made current.

### Finding 4 — The outline still contains draft posture that B05 supersedes
The outline still includes:
- claim-precedence guidance using `preferred_username`, `upn`, and `email`,
- unresolved OAuth path framing,
- a sorting recommendation that could overstate what the live Adobe search request proves,
- a shallow source-handoff section that lacks B05’s signing-URL and validated-link rules.

### Finding 5 — The outline’s open-items section still lists decisions already closed elsewhere
At minimum, the following should no longer remain framed as unclosed architecture decisions:
- OAuth live-auth model and gating posture (closed by B05),
- source-unavailable HTTP posture (closed by B04),
- actor identity/key resolution posture (closed by B05),
- operational property-pane exposure posture (closed by B02).

Residual business/environment decisions may remain, but they must be separated from decisions already closed by batch artifacts.

---

## Package objective translated into repo work

The package makes the following state transition:

| Current repo condition | Required B05 repo condition |
|---|---|
| B05 attached but not canonical in dev-plan folder | B05 committed as authoritative batch artifact |
| README lists B01–B03 only | README lists B01–B05 accurately |
| Outline authority table lists B01/B02 only | Outline authority table lists B01–B05 accurately |
| Outline Section 15 contains stale claim-priority posture | Outline Section 15 defers to stable actor key and `oid`/tenant posture from B05 |
| Outline Section 16 leaves OAuth architecture/gating open | Outline Section 16 reflects B05’s backend-controlled delegated OAuth architecture and production-live gating |
| Outline Section 17 allows a sort interpretation B05 rejects | Outline Section 17 preserves B05’s source-supported sort vs. UI urgency distinction |
| Outline Section 20 is shallow | Outline Section 20 carries B05’s validated URL, no-guessed-link, and signing-URL-not-default-row-CTA rules |
| Outline Section 29 keeps closed items as unresolved | Section 29 is pruned/reframed so only genuinely residual items remain open |

---

## Closure standard

B05 implementation is closed only when:
1. the B05 artifact is present in the canonical dev-plan folder,
2. the README and outline point readers to B05 as the detailed authority for Sections 15/16/17/20,
3. the outline no longer contradicts B05 on identity, OAuth, query, or source handoff,
4. the docs remain planning-only with no runtime code changes,
5. validation proves the final document state.
