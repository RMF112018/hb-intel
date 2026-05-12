# My Dashboard Development Plan — Authority Index

**Artifact status:** Folder-level authority index for the My Dashboard development-plan family
**Prepared:** 2026-05-12
**Target initiative:** HB Intel **My Dashboard** SPFx domain, **My Work** shell experience, and **Adobe Sign Action Queue** first module
**Folder governed:** `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/`
**Role:** Authority map and reading order for batched development-plan artifacts. Planning documentation only — not runtime implementation.

---

# 1. Folder Purpose

This folder houses the authoritative staged development-plan artifacts for **HB Intel My Dashboard**, the **My Work** operating shell inside My Dashboard, and the **Adobe Sign Action Queue** first module. The artifacts are produced in batches (B01, B02, B03, …) so that closed foundation decisions, hosting/packaging/auth/runtime decisions, and shell/UX decisions are recorded as discrete authoritative documents rather than absorbed back into an umbrella outline.

These documents are planning artifacts. They are not runtime code, runtime configuration, or local-agent execution packages. The presence of an artifact in this folder must not be read as evidence that the corresponding runtime application, package, or backend route already exists in the repository.

---

# 2. Authority Hierarchy

When any planning agent, reviewer, or implementer reads from this folder, the following order is mandatory:

1. **Live repo truth** — current files, manifests, exports, tests, configs, READMEs, and canonical current-state documentation in the working tree.
2. **The applicable detailed batch artifact** — the B-numbered artifact that governs the section, surface, or concern in question (B01, B02, B03, and any later batch).
3. **The umbrella outline** — `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md`, used as a topic scaffold only.
4. **Older or historical references** — including superseded or archived planning material referenced for context only.

Two consequences of this hierarchy are non-negotiable:

- **live repo truth outranks every planning document in this folder.** If a planning artifact and the current code, manifest, or canonical current-state doc disagree, the live repo controls and the planning artifact must be reconciled, not the other way around.
- **A detailed batch artifact outranks the umbrella outline for its developed section set.** Where B01, B02, B03, or any later batch has developed a section into detailed closed decisions, the outline cannot override or weaken those decisions. The outline serves only as the topic map for sections that have not yet been developed into a batch artifact.

---

# 3. Artifact Index

| Artifact | Role |
|---|---|
| `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md` | Umbrella scaffold and topic map for the full My Dashboard development plan. Source of section numbering only. Does not override developed batch artifacts. |
| `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Authoritative detailed development for **Sections 0–5**. Closes product/domain identity, taxonomy, and repo-truth foundation. |
| `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | Authoritative detailed development for **Sections 6, 7, 8, 14, and 19**. Closes hosting, packaging, protected-API authentication, and runtime decisions. |
| `B03_My_Work_Shell_Navigation_And_UX_Development.md` | Authoritative detailed development for the My Work shell, navigation, hero, and dashboard UX section set governed by Batch 03. |

Artifacts added to this folder later (B04 and beyond) must extend this table and follow the same authority rules.

---

# 4. B01 Closed Foundation Decisions

The following decisions were closed by B01 and must not be reopened by later batches, the outline, or local implementation agents without an explicit predecessor-batch amendment:

- **My Dashboard is a standalone SPFx product/domain, not a Project Control Center extension.**
- **My Work is the user-facing operating shell/surface inside My Dashboard**, not a parallel product.
- **Adobe Sign Action Queue is the first My Dashboard module.**
- **Project Control Center (PCC) is a shell-construction reference only.** Its project-context product semantics do not transfer to My Dashboard.
- **HB Homepage is a host-fit and shell-boundary reference only.** It is not the My Work shell family or product grammar.
- **`@hbc/my-work-feed` and the existing Personal Work Hub architecture already exist** in the repository and must not be duplicated, forked, or silently contradicted by My Dashboard work. Later batches must reuse, bridge to, or explicitly differentiate from that primitive with documented rationale.
- **PCC `adobe-sign` and My Dashboard `adobe-sign-action-queue` remain distinct concepts.** They must not be merged or silently aliased.

These decisions are the foundation taxonomy for every subsequent batch in this folder.

---

# 5. B02 Governed Sections

B02 authoritatively governs **Sections 6, 7, 8, 14, and 19** (hosting, packaging, protected-API authentication, runtime, and the corresponding closed-decision posture). These sections must not be re-derived from the umbrella outline or from B01; later batches must read B02 directly when their scope intersects hosting, packaging, auth, or runtime.

---

# 6. Later Batch Inheritance Rule

Planning for any later batch (B04 through the final batch of this plan family) must follow this reading order, in this order, before authoring:

1. **This README** — to fix the authority hierarchy and taxonomy guardrails.
2. **Live repo truth** — to verify what actually exists in the working tree (manifests, exports, current-state docs, related apps and packages).
3. **B01 and B02 (and B03 and any other prior batch)** — for already-closed foundation, hosting/packaging/auth/runtime, and shell/UX decisions that constrain the new batch.
4. **The applicable later batch artifact** — once it exists, as the detailed authority for its own section set.
5. **The umbrella outline** — only as a topic scaffold for sections that have not yet been developed into a batch artifact.

The umbrella outline cannot override a more detailed batch artifact for any section that batch has developed. Later batches must explicitly acknowledge the prior closed decisions they inherit and must not silently re-litigate them.

---

# 7. Scope Boundary

The artifacts in this folder are planning documentation. They define product scope, taxonomy, hosting/packaging posture, authentication contracts, runtime posture, and shell/UX intent for HB Intel My Dashboard. They are not runtime code and not local-agent execution prompts.

In particular:

- This folder does not create or modify `apps/my-dashboard` or any runtime application scaffold.
- The presence of B01, B02, B03, or any later batch must not be read as evidence that the corresponding SPFx web part, backend route, package, or tenant configuration already exists in the repository.
- Runtime implementation belongs to later code-agent execution packages, governed by their own prompt packages, plan gates, and validation evidence.
- Tenant mutation, app catalog deployment, `.sppkg` generation, Graph/PnP/Procore calls, Azure deployment, CI/CD changes, and package/manifest version changes remain out of scope for this folder.

Use this README as the first reading anchor whenever new work touches the My Dashboard development plan family.
