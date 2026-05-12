# 02 — B01 Document Authority and Cross-Reference Map

## 1. Governing hierarchy

### 1.1 Global precedence
For the My Dashboard initiative:

1. **Live repo truth**
2. **Current batch artifact applicable to the plan section**
3. **Master outline**
4. **Older plans / historical references**

### 1.2 Local My Dashboard dev-plan precedence
Within:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/
```

the target authority chain should be:

| Artifact | Authority role |
|---|---|
| `README.md` | Folder index and authority map |
| `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Authoritative foundation for Sections 0–5 |
| `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | Authoritative detailed plan for Sections 6, 7, 8, 14, and 19 |
| `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md` | Umbrella scaffold / topic map; superseded by batch detail where batch detail exists |

---

## 2. B01-specific authority

B01 closes the following non-negotiable foundation points:

| Topic | B01 authority |
|---|---|
| Product boundary | My Dashboard is a standalone SPFx product/domain, not a PCC extension |
| Shell identity | My Work is the user-facing operating surface/shell inside My Dashboard |
| First module | Adobe Sign Action Queue |
| PCC role | shell-construction reference only |
| HB Homepage role | communication-site host-fit and shell-boundary reference only |
| My Work doctrine | must align with implemented Personal Work Hub / `@hbc/my-work-feed` truth |
| Adobe Sign distinction | PCC `adobe-sign` ≠ My Dashboard `adobe-sign-action-queue` |
| B01 scope | planning foundation for Sections 0–5, not runtime implementation |

---

## 3. No-confusion taxonomy map

| Term | Canonical meaning | Must not be confused with |
|---|---|---|
| **My Dashboard** | SharePoint-hosted standalone SPFx product/domain | PCC, PWA Personal Work Hub |
| **My Work** | User-facing shell/surface inside My Dashboard | A new cross-module primitive that replaces `@hbc/my-work-feed` |
| **Personal Work Hub** | Existing PWA/product concept around personal work orchestration | My Dashboard product identity |
| **`@hbc/my-work-feed`** | Existing canonical shared package for personal work aggregation | A future-only or research-stage concept |
| **PCC `adobe-sign`** | Project-context Document Control external-source/launch reference | Personal authenticated-user action queue |
| **My Dashboard `adobe-sign-action-queue`** | Future user-context read-model-driven action queue | PCC launch-only Adobe Sign concept |

---

## 4. Stale/conflicting doc handling

## 4.1 `my-work-alignment-contract.md`
### Current issue
It says `@hbc/my-work-feed` does not exist and is research-stage only.

### Required handling
- Keep the file for provenance.
- Mark it as superseded/archival at the top.
- Add a clear supersession notice.
- Point to current authority docs.
- Do not let active docs describe it as a current implementation authority.

---

## 4.2 Active docs that must be updated because they still point to the stale contract

| File | Required handling |
|---|---|
| `docs/reference/work-hub/runway-definition.md` | Reword related-doc link as legacy/superseded archival context |
| `docs/reference/provisioning/work-hub-publication-contract.md` | Remove the stale contract from the “Key Source Files” role or recast it as legacy-only note |
| `docs/reference/workflow-experience/primitive-integration-checklist.md` | Correct related-doc reference; update any “future My Work implementation” rationale to implemented `@hbc/my-work-feed` authority |

---

## 4.3 Active SF29 ADR drift

| File | Current issue | Required correction |
|---|---|---|
| `SF29-My-Work-Feed.md` | Header references nonexistent `ADR-0114-my-work-feed.md` | Point to `ADR-0115-my-work-feed-architecture.md` |
| `SF29-T09-Testing-and-Deployment.md` | Objective, checklist, heading, and grep command reference ADR-0114 | Normalize to ADR-0115 |

This correction is within B01 scope because it directly affects the repo’s My Work authority chain.

---

## 5. Documents that should not be broadly rewritten in B01

| Category | Handling |
|---|---|
| Historical archive plans | Leave intact unless a prompt explicitly targets one; they may preserve valid historical wording |
| Runtime source | No changes |
| B02 detailed artifact | Do not rewrite under B01 |
| PCC code/docs | Use as cited repo truth; do not modify for B01 |
| HB Homepage shell docs/code | Use as cited repo truth; do not modify for B01 |

---

## 6. Later-batch inheritance rule

Later B02–B08 sessions should begin with the following explicit operating rule:

> **Read live repo truth, then the My Dashboard dev-plan README, then the batch artifact governing the sections under development. Never treat the outline as overriding a developed batch artifact.**

For foundation questions, B01 is the authority unless:
1. live repo truth has materially changed, or
2. a newer approved B01 revision explicitly supersedes it.

---

## 7. Authority map acceptance tests

After implementation:

- the `dev-plan/README.md` exists,
- it lists B01 and B02 correctly,
- it explains outline vs. batch authority,
- the outline repeats the same precedence posture,
- no active My Work authority doc frames `@hbc/my-work-feed` as nonexistent or future-only,
- SF29 docs consistently identify ADR-0115 as the My Work Feed ADR.
