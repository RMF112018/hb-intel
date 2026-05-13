# 03 — B05 Validation and Closeout Requirements

## 1. Validation objective

Prove that B05 documentation alignment is complete, repo-truth-consistent, and docs-only.

---

## 2. Required path checks

```bash
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

## 3. Required content checks

## 3.1 B05 artifact presence and scope
```bash
rg -n "B05 — HB Intel My Dashboard Adobe Sign Integration Architecture|Repo continuation anchor|4514a4fda765a0ac40801006374f277beddd7c5a|Sections \\*\\*15\\*\\*, \\*\\*16\\*\\*, \\*\\*17\\*\\*, and \\*\\*20\\*\\*" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
```

## 3.2 README authority index through B05
```bash
rg -n "B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|Sections 15, 16, 17, and 20|B05" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

## 3.3 Outline authority header through B05
```bash
rg -n "B03_My_Work_Shell_Navigation_And_UX_Development|B04_My_Work_Read_Models_Routes_And_Fixtures_Development|B05_Adobe_Sign_Integration_Architecture_Development|Sections 15, 16, 17, and 20" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## 3.4 Outline Section 15 identity/principal-resolution posture
```bash
rg -n "claims\\.oid|tenant context|configured tenant|app-only|grant record|shared principal|authorization-required|principal-unresolved" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## 3.5 Outline Section 16 OAuth/gating posture
```bash
rg -n "delegated OAuth|authorization-code flow|redirect|callback|grant store|refresh-token|production-live provider|configuration mode" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## 3.6 Outline Section 17 search/query posture
```bash
rg -n "POST v6/search|pageSize|cursor|source-supported sort|urgency|Retry-After|bounded enrichment|six" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## 3.7 Outline Section 20 source-handoff posture
```bash
rg -n "sourceOpenUrl|validated|guessed|Signing URL|signingUrls|web_access_point|Open Adobe Sign|policy" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

## 4. Required contradiction checks

## 4.1 Stale actor-email claim priority must not remain
```bash
! rg -n "normalized `preferred_username`|normalized `upn`|normalized `email`|Final exact claim precedence for actor email resolution" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## 4.2 Unsupported guaranteed sort language must not remain
```bash
! rg -n "nearest expiration date first" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

## 4.3 Open-item drift must be pruned/reframed
```bash
! rg -n "Final exact claim precedence for actor email resolution" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

If the agent keeps a residual note about OAuth release dependencies, it must not be framed as an unresolved **architecture choice** once B05 is committed.

---

## 5. Docs-only scope validation

Run:

```bash
git diff --name-only
git diff --stat
```

Expected changed paths must be limited to:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

No runtime source, manifests, lockfiles, package manifests, or build tooling should change.

---

## 6. Formatting / lint posture

Use the repo’s established Markdown formatter/checker if a targeted command exists.

Minimum acceptable evidence:
- Markdown formatting is consistent,
- tables render correctly,
- links/path references are internally coherent,
- code fences are balanced,
- headings retain logical nesting.

If the repo exposes a specific Prettier/check command for changed Markdown, run it and report it. Do not invent a command.

---

## 7. Required closeout report

The local agent’s final closeout must include:

1. **Final verdict:** PASS / FAIL
2. **Branch / HEAD**
3. **Docs created**
4. **Docs updated**
5. **Validation commands executed**
6. **Validation outcomes**
7. **Formatting/lint results if available**
8. **Confirmation that runtime code/manifests/lockfiles were untouched**
9. **Residual production-live dependencies intentionally left out of scope**
10. **Recommended commit summary and description**

---

## 8. Recommended commit language

### Commit summary
```text
docs(my-dashboard): add B05 Adobe integration architecture plan and reconcile authority
```

### Commit description
```text
- add the canonical B05 Adobe Sign integration architecture artifact for Sections 15/16/17/20
- refresh the My Dashboard dev-plan README to index B04 and B05 and preserve batch authority order
- update the comprehensive outline batch-authority map for B03/B04/B05
- reconcile outline identity, OAuth, query, and source-handoff guidance to B05 closed decisions
- prune stale open-item drift where prior batches already closed the architecture posture
- preserve docs-only scope with no runtime implementation changes
```
