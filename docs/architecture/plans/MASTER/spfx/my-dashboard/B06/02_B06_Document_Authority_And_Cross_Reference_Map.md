# 02 — B06 Document Authority and Cross-Reference Map

## 1. Governing hierarchy

For My Dashboard planning work:

1. **Live repo truth**
2. **Applicable detailed batch artifact**
3. **Comprehensive outline**
4. **Older or historical references**

The outline remains an umbrella scaffold. It must not override B06 where B06 has closed a decision.

---

# 2. Current developed batch coverage through B06

| Artifact | Developed authority |
|---|---|
| `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Sections 0–5 |
| `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | Sections 6, 7, 8, 14, and 19 |
| `B03_My_Work_Shell_Navigation_And_UX_Development.md` | My Work shell, navigation, hero, UX choreography |
| `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md` | Sections 12, 13, 18, and 24 |
| `B05_Adobe_Sign_Integration_Architecture_Development.md` | Sections 15, 16, 17, and 20 |
| `B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md` | Sections 22, 23, and 27, plus required refinements to Section 18 |

---

# 3. B06 carry-forward map

## 3.1 Decisions that must surface in the README and outline

| B06 decision | README | Outline Section |
|---|---:|---|
| No auto-polling | Summary only | §22 |
| Manual refresh only in focused module | Summary only | §22 |
| No durable queue cache | Summary only | §22 and §29 open-items cleanup |
| Freshness semantics | Not necessary | §22 |
| Retry / `Retry-After` posture | Not necessary | §22 and §18 |
| Webhooks future-state only | Summary optional | §22 |
| Telemetry allow/prohibit matrix | Not necessary | §23 |
| Evidence sanitation inheritance | Summary optional | §23 |
| Sanitized provider errors before telemetry | Not necessary | §23 and §18 |
| Route taxonomy refinement | Not necessary | §18 |
| Risk register | Not necessary | §27 |

---

# 4. Direct cross-reference correction required inside B06

## Current issue
B06 references a non-live long-form B05 filename in its predecessor metadata.

## Correct repo-truth reference
```text
B05_Adobe_Sign_Integration_Architecture_Development.md
```

## Required correction posture
Replace only the incorrect filename references. Do not alter B06’s substantive decisions.

---

# 5. B06 section interaction with prior batches

## Section 18
B04 owns the base route/error taxonomy.  
B06 refines it operationally.

**Interpretation:**  
The outline should state that B06 refines, rather than replaces, B04’s route contract.

## Section 22
B06 fully closes:
- refresh posture,
- no auto-polling,
- no durable cache,
- staleness semantics,
- throttling and retry behavior,
- webhook future-state.

## Section 23
B06 fully closes:
- token secrecy posture,
- telemetry allow/prohibit rules,
- queue metadata minimization,
- evidence sanitation inheritance,
- provider error sanitization before generic telemetry capture.

## Section 27
B06 converts risk handling from a short note set into an implementation-grade risk register.

---

# 6. Open-items cleanup map

| Existing open item | B06 status | Required action |
|---|---|---|
| Final backend source-unavailable transport choice | Closed by B04/B06 | Remove or rewrite as closed |
| Final backend queue cache posture | Closed by B06 | Remove or rewrite as closed |
| Final actor claim precedence | B05 matter, not B06 | Do not silently re-close under B06; record residual if still stale |
| Final OAuth onboarding scope | Not fully closed by B06 | Leave unless already closed elsewhere |
| Final expiration/urgency threshold | Not B06 | Leave |
| Final pagination posture | Not B06 | Leave |
| Final page URL | Not B06 | Leave |
| Property-pane exposure posture | Primarily B02 | Leave unless already reconciled by prior package execution |

---

# 7. Acceptance posture

B06 documentation reconciliation is accepted only if:

- B06 points to the correct B05 filename,
- README authority coverage reaches B06,
- outline authority coverage reaches B06,
- Section 18/22/23/27 are aligned to B06,
- open items no longer imply B06-closed decisions are unresolved,
- no runtime implementation was introduced.
