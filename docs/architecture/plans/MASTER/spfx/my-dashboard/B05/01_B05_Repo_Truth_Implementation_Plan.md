# 01 — B05 Repo-Truth Implementation Plan

## 1. Target end state

After execution, the repository should clearly communicate:

- B05 is the canonical detailed planning authority for Sections 15, 16, 17, and 20.
- B05 inherits B01–B04 and sits beside them in the My Dashboard dev-plan family.
- The folder README and outline accurately index B04 and B05.
- The outline does not contain stale draft guidance that conflicts with B05’s closed integration architecture.
- The outline’s open-items list no longer presents B02/B04/B05-closed decisions as unresolved.
- The repo remains docs-only; no runtime OAuth/provider work is performed.

---

## 2. Exact files to create/update

## 2.1 Create — canonical B05 artifact

### Path
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
```

### Purpose
Commit the authoritative B05 planning artifact supplied with the package/session into the canonical batch-artifact folder.

### Required handling
- Preserve the attached B05 artifact’s substantive content.
- Preserve its:
  - title,
  - prepared date,
  - continuation anchor,
  - predecessor declarations,
  - batch scope,
  - decisions closed register,
  - section development for 15/16/17/20,
  - dependency checklist,
  - downstream constraints,
  - final quality gate.
- Do not dilute closed decisions into “recommended only” language.

---

## 2.2 Update — folder authority index

### Path
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

### Purpose
Make the authority index current through B05.

### Required changes
1. Add B04 to the artifact index table.
2. Add B05 to the artifact index table.
3. State B05 authority:
   ```text
   Sections 15, 16, 17, and 20
   ```
4. Update the later-batch inheritance rule so later sessions know B05 must be read before any security/resilience/testing/live-integration implementation package.
5. Preserve the existing hierarchy:
   - live repo truth,
   - applicable detailed batch artifact,
   - umbrella outline,
   - older/historical references.

---

## 2.3 Update — outline batch-authority posture

### Path
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

### Purpose
Make the outline’s authority header consistent with the actual batch history.

### Required changes
1. Add B03, B04, and B05 to the authority artifact table.
2. State B05 governs:
   ```text
   Sections 15, 16, 17, and 20
   ```
3. Reinforce that this outline cannot override B05 for those sections.
4. Keep the outline as the umbrella scaffold rather than transforming it into a duplicate B05 artifact.

---

## 2.4 Update — outline Sections 15, 16, 17, and 20

### Path
Same outline path.

### Purpose
Replace older draft assumptions with B05-compatible planning posture.

### Required section-level target state

#### Section 15 — Authenticated Actor → Adobe Principal Resolution
Replace stale email/UPN claim-precedence framing with:
- stable actor key using trusted tenant context + `claims.oid`,
- `claims.upn` for display/diagnostics only,
- app-only token rejection for user queue reads,
- grant-record based principal resolution,
- no shared principal or email search fallback.

#### Section 16 — Adobe Authentication Architecture Gate
Replace “the final plan must choose one of two implementation paths” framing with:
- delegated OAuth authorization-code flow as the closed live-auth architecture,
- backend-controlled start/callback/token services,
- production-live provider gated until app registration, redirect URI, grant store, encryption, and protected backend prerequisites exist,
- fixture/configuration mode may still ship before live dependencies are present.

#### Section 17 — Adobe Sign API Query Contract
Replace or refine draft posture so it matches B05:
- `POST v6/search` baseline,
- exact six-status union inherited from B04,
- no raw search pass-through,
- page-size clamping/cursor opacity,
- no unsupported “expiration soon first” claim unless live Adobe search validation proves it,
- no unbounded detail enrichment loops,
- rate-limit/Retry-After translation to My Work state.

#### Section 20 — Adobe Sign Source Handoff Contract
Refine the source-handoff section to reflect:
- row CTA only from backend-supplied validated URL,
- no guessed links,
- signing URL endpoint is not the default row-open contract,
- optional validated module-level general Adobe launch via stored `web_access_point`,
- source link suppression must remain a valid state when no safe URL exists.

---

## 2.5 Update — outline open-items posture

### Path
Same outline path, especially Section 29.

### Required handling
The open-items list must not continue to present decisions already closed by earlier batch artifacts as unresolved.

At minimum:
- Remove or reframe the item about whether the Adobe OAuth onboarding architecture exists in MVP; B05 closes the architecture and introduces production-live dependency gates.
- Remove or reframe the source-unavailable transport choice as an open issue if B04 already closes that read-model behavior.
- Remove or reframe the actor-email-claim precedence item; B05 replaces this with stable actor-key binding.
- Remove or reframe the property-pane operational config exposure item if B02 already closes that posture.

Preserve genuinely residual items that remain outside B05’s scope, such as:
- final SharePoint page URL,
- queue cache posture if not closed elsewhere,
- final UX presentation of urgency thresholds if not closed,
- focused-module pagination UX posture if not closed.

---

## 3. Sequencing logic

### Prompt 01 — Canonical artifact first
Place B05 in the folder before updating the docs that point to it.

### Prompt 02 — README authority index
Update the folder’s reading order and artifact table to include B04/B05.

### Prompt 03 — Outline authority header
Make the outline’s batch posture current before reconciling body sections.

### Prompt 04 — Outline body and open items
Replace stale draft language with B05-compatible architecture and prune closed open items.

### Prompt 05 — Validate and close
Run path, grep, consistency, and docs-only checks.

---

## 4. Dependency logic

| Work item | Depends on | Why |
|---|---|---|
| Create B05 artifact | None | Canonical target file must exist before references update |
| Update README | B05 artifact exists | README should index files that exist |
| Update outline authority table | B05 artifact exists | Outline should point to canonical file |
| Reconcile Sections 15/16/17/20 | Authority table updated | Body should inherit the established authority chain |
| Prune open items | Body reconciliation underway | Prevents stale “open” markers after B05 is integrated |
| Validation | All prior prompts | Must prove final combined state |

---

## 5. Conflicts to avoid

Do not:
- implement runtime Adobe integration,
- over-convert the outline into a second B05 artifact,
- weaken B05 decisions into “optional” language,
- preserve the outline’s old claim-priority text alongside B05’s stable actor-key posture,
- leave "nearest expiration date first" as a guaranteed sort claim unless that wording is deliberately reframed as conditional/live-verification-dependent,
- imply signing URLs are the default row-level source handoff,
- reopen B04’s exact six-status union,
- reintroduce actor/user query override concepts.

---

## 6. Intended final repository truth

The finished repo should tell a later implementation team:

1. **Read B05 before writing any live Adobe integration prompt or code.**
2. **Use delegated OAuth and backend-only grant records.**
3. **Bind Adobe grants to stable HB actor identity, not mutable username/email fields.**
4. **Use bounded `POST v6/search`, not broad list pulls followed by local filtering.**
5. **Treat row-level source handoff as optional and backend-validated only.**
6. **Do not conflate signing URLs with durable queue-row open links.**
7. **Do not begin live provider implementation until the B05 dependency gates are satisfied.**
