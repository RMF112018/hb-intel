# 02 — B05 Document Authority and Cross-Reference Map

## 1. Governing hierarchy

### 1.1 Global precedence
For the My Dashboard initiative:

1. **Live repo truth**
2. **The applicable detailed batch artifact**
3. **The My Dashboard comprehensive outline**
4. **Older/historical references**

### 1.2 Local dev-plan precedence after B05 lands

| Artifact | Authority role |
|---|---|
| `README.md` | Folder authority index and reading order |
| `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Sections 0–5 |
| `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | Sections 6, 7, 8, 14, and 19 |
| `B03_My_Work_Shell_Navigation_And_UX_Development.md` | My Work shell/navigation/UX section set |
| `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md` | Sections 12, 13, 18, and 24 |
| `B05_Adobe_Sign_Integration_Architecture_Development.md` | Sections 15, 16, 17, and 20 |
| `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md` | Umbrella scaffold only where detailed batch authority does not yet exist |

---

## 2. B05-specific authority

B05 closes the following integration-architecture points:

| Topic | B05 authority |
|---|---|
| Live Adobe auth model | Delegated OAuth authorization-code flow |
| Acrobat Sign app posture | `CUSTOMER` |
| HB actor → Adobe grant key | Trusted tenant context + `claims.oid` |
| `upn` / email use | Display/diagnostics only, not authorization key |
| App-only token posture | Not eligible to drive a user Adobe queue |
| Principal resolution | Backend-only grant-record lookup |
| Shared principal fallback | Prohibited |
| Token storage | Backend-only encrypted refresh-token persistence |
| Search endpoint | Bounded `POST v6/search` |
| MVP Adobe statuses | Exact B04 six-status union |
| Row source handoff | Optional, backend-validated only |
| Guessed links | Prohibited |
| Signing URL as default row CTA | Prohibited |
| General Adobe launch | Optional backend-validated module-level fallback |
| Rate limiting | Respect `Retry-After`, no tight retry loops |

---

## 3. Relationship to predecessor batches

## 3.1 B01
B05 inherits B01’s product boundary and source-authority doctrine:
- My Dashboard is user-contextual, not PCC project-contextual.
- Adobe Sign Action Queue remains distinct from PCC `adobe-sign`.
- Source authority remains visible; HB Intel does not pretend to complete Adobe actions internally.

## 3.2 B02
B05 inherits:
- protected API posture,
- no third-party secrets in SPFx,
- no operational backend configuration in property pane,
- backend/fixture runtime transport separation.

## 3.3 B03
B05 inherits:
- module state rendering,
- authorization-required/source-unavailable UX expectations,
- source-state visibility in My Work shell and focused module.

## 3.4 B04
B05 inherits and must not disturb:
- exact two-route My Work read-model contract,
- exact source-status envelope taxonomy,
- exact six actionable Adobe status union,
- no actor override path/query semantics,
- optional `sourceOpenUrl` DTO seam,
- fixture-driven deterministic testing expectations.

---

## 4. Outline sections that must now defer to B05

| Outline section | Required posture after B05 |
|---|---|
| Section 15 | B05 governs actor normalization, grant lookup, and no email/UPN authorization keying |
| Section 16 | B05 governs delegated OAuth architecture and live-provider gating |
| Section 17 | B05 governs `POST v6/search`, query constraints, sorting caution, bounded enrichment, Retry-After mapping |
| Section 20 | B05 governs source-handoff CTA rules, signing URL prohibition as default row CTA, and module-level validated fallback |

The outline may summarize these sections, but it must not reintroduce pre-B05 draft assumptions.

---

## 5. No-confusion terminology and integration rules

| Concept | Correct B05 framing | Incorrect framing to remove |
|---|---|---|
| Actor identity | Stable actor key from trusted tenant context + `oid` | Email/UPN claim priority as authorization key |
| User display | `upn` may support copy/diagnostics | `upn` is the actor grant lookup key |
| Adobe connection | Backend grant record | Ad hoc email search or shared account fallback |
| Live auth | Delegated OAuth | Shared service principal queue read |
| Queue retrieval | Bounded `POST v6/search` | Broad agreements pull then client/server local filtering |
| Row handoff | Backend-supplied validated URL only | Guessed portal URLs |
| Signing URLs | Not the default queue-row open-link contract | Use signing URL simply to make every row clickable |
| Search sort | Source-supported sort must be verified | Guaranteed “expiration soon first” sort claim without API proof |

---

## 6. Cross-reference update map

### 6.1 `README.md`
Add B04/B05 artifact rows and later-batch inheritance language.

### 6.2 Comprehensive outline authority table
Add B03/B04/B05 so the table matches the actual plan family.

### 6.3 Outline Sections 15/16/17/20
Replace stale draft text with B05-compatible summary posture. Reference the B05 artifact where detailed decisions live rather than duplicating its entire contents.

### 6.4 Outline open-items list
Remove or reframe decisions already closed by B02/B04/B05. Keep only residual decisions that truly remain open.

---

## 7. Documents that should not be rewritten in this B05 package

| Document/category | Handling |
|---|---|
| B01–B04 artifacts | Read for inherited authority; do not rewrite |
| Runtime backend/SPFx source | Do not modify |
| Future B06/B07/B08 prompts or docs | Do not create |
| Security/resilience/testing implementation plans | Mention only as downstream inheritance, not as deliverables |
| External Adobe/Microsoft research references | Do not embed long quotations; summarize only where needed in notes/prompts |

---

## 8. Authority acceptance tests

After implementation:
- B05 artifact exists in the dev-plan folder,
- README indexes B04 and B05,
- outline authority table indexes B03/B04/B05,
- outline Sections 15/16/17/20 reflect B05,
- stale actor-email claim precedence is absent from the outline,
- “expiration soon first” is not presented as a guaranteed upstream sort unless deliberately reframed as conditional,
- the open-items section no longer keeps B05/B04/B02-closed decisions as open.
