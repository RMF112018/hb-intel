# My Dashboard Load-Time Audit Validation & Remediation Package

## Purpose

This package guides a local code agent through a disciplined, evidence-backed remediation of the current My Dashboard load-time posture.

The current repo-truth audit established four central conclusions:

1. **A real frontend orchestration defect is proven.**
   - `MyWorkHomeSurface` withholds the **My Projects** card during home-envelope loading and error variants.
   - Because **My Projects** owns a separate `/project-links` fetch, this delays that backend request behind the `/home` request instead of allowing both to resolve concurrently.

2. **The initial page does not resolve from one data request.**
   - `GET /api/my-work/me/home` serves the Adobe Sign action-queue home projection.
   - `GET /api/my-work/me/project-links` serves My Projects.
   - Adobe Sign **Recent Completions** is correctly deferred until the user switches to the completed view.

3. **Backend latency remains under-instrumented.**
   - Existing handler telemetry is useful, but it is not sufficient to prove whether the dominant contributor is:
     - Azure Function host startup,
     - Adobe Sign token/search stages,
     - Microsoft Graph / SharePoint list loading,
     - project-link reconciliation,
     - or a combination.

4. **The highest-ROI remediation should be staged.**
   - First, correct the frontend load choreography and module independence.
   - Second, improve client-seam ownership and timing instrumentation.
   - Third, add backend stage-duration telemetry.
   - Fourth, collect evidence and decide whether larger backend/caching/infrastructure changes are warranted.

---

## Package Contents

### Core assessment and plan
- `00_Comprehensive_Audit_Assessment.md`
- `01_Proposed_Implementation_Plan.md`
- `02_Target_Architecture_And_Closed_Decisions.md`
- `03_Validation_Matrix_And_Acceptance_Criteria.md`
- `04_Observability_And_Telemetry_Plan.md`
- `05_Risk_Register_And_Rollback_Guide.md`
- `06_Exact_File_Level_Targets.md`

### Supporting field guides
- `supporting/HAR_Capture_And_Browser_Waterfall_Checklist.md`
- `supporting/Application_Insights_Validation_Queries.md`
- `supporting/Performance_Evidence_Closeout_Template.md`

### Prompt series
- `prompts/Prompt_00_Audit_Validation_And_Repo_Drift_Lock.md`
- `prompts/Prompt_01_Render_Both_Primary_Cards_During_Load_And_Error.md`
- `prompts/Prompt_02_Unify_My_Projects_Client_Ownership_And_Remove_Local_Factory_Use.md`
- `prompts/Prompt_03_Add_Frontend_Load_Performance_Marks_And_Useful_State_Measures.md`
- `prompts/Prompt_04_Add_Backend_Stage_Duration_Telemetry_For_Home_And_Project_Links.md`
- `prompts/Prompt_05_End_To_End_Validation_And_Performance_Evidence_Closeout.md`
- `prompts/Prompt_06_Evidence_Based_Follow_On_Backend_Optimization_Decision.md`

---

## Required Execution Order

Run the prompts in this order:

1. **Prompt 00** — validate repo truth and drift against this package; do not edit.
2. **Prompt 01** — fix the proven card-mount gating issue.
3. **Prompt 02** — normalize My Projects client ownership to the app-provided client.
4. **Prompt 03** — add frontend user-timing instrumentation.
5. **Prompt 04** — add backend stage-duration telemetry.
6. **Prompt 05** — run validation, collect evidence, produce closeout.
7. **Prompt 06** — decide whether to pursue a second remediation package for caching, project-link source optimization, or Function hosting changes.

Do **not** skip Prompt 00. The repo has been changing rapidly. The code agent must verify that the assumptions in this package still match the live branch before editing.

---

## Non-Negotiable Remediation Decisions

These decisions are already made for this package:

### 1. My Projects must mount during page loading and page-error variants
The surface must preserve the two-card primary-page composition:
- My Projects
- Adobe Sign Agreement Activity

The cards may have different internal state, but the **cards themselves must not disappear** while the home envelope is loading.

### 2. `/home` and `/project-links` must begin as independently as React mounting allows
The UX goal is to move from:

```text
home request completes
  -> My Projects mounts
      -> project-links request starts
```

to:

```text
home request starts
project-links request starts
cards resolve independently
```

### 3. My Projects should consume the shared read-model client from context
The package recommends removing local factory construction from `MyProjectsHomeCard` and using:

```ts
useMyWorkReadModelClient()
```

This aligns My Projects with the app-level provider seam already used elsewhere and removes unnecessary local client ownership.

### 4. The package does not preemptively implement caching, server-side projections, or Function plan changes
Those may be warranted, but only after the timing instrumentation and evidence pass. This package prepares the repo for an evidence-based second pass rather than making speculative architecture changes.

### 5. Frontend performance instrumentation must be privacy-safe
Do not record:
- user display name,
- UPN/email,
- project names/numbers,
- Adobe agreement titles,
- URLs,
- tokens,
- raw vendor payload data.

Only use route IDs, module IDs, status classes, and durations.

### 6. Backend telemetry must extend or complement current safe telemetry patterns
Do not leak:
- access tokens,
- refresh token references,
- raw Graph bodies,
- raw Adobe bodies,
- actor identifiers,
- project payload data.

---

## Recommended Validation Commands

Use workspace filters where available:

```bash
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard check-types

pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions check-types
```

Run more targeted tests first if desired, but always close with the package-level validation above before committing.

---

## Expected End State After This Package

After successful execution:

- The page shell and **both primary module cards** appear immediately.
- My Projects begins loading in parallel with the home-envelope request rather than being delayed behind it.
- Frontend timing marks can prove:
  - shell mount,
  - `/home` request span,
  - `/project-links` request span,
  - Adobe useful-state time,
  - My Projects useful-state time.
- Backend telemetry can begin distinguishing:
  - Adobe principal resolution,
  - Adobe token acquisition,
  - Adobe search duration,
  - Project Links source loading,
  - Project Links reconciliation.
- The team will be positioned to make a justified follow-on decision regarding:
  - stale-while-revalidate,
  - server-side caching,
  - project-link preprojection,
  - Graph query narrowing,
  - Function hosting/warm-path evaluation.

---

## Commit Strategy

Recommended commits:

1. `my-dashboard: render primary cards independently during home loading`
2. `my-dashboard: use shared read-model client for my projects`
3. `my-dashboard: add frontend load performance marks`
4. `functions(my-work): add stage duration telemetry for dashboard read models`
5. `docs(my-dashboard): close load-time remediation evidence pass`

---

## Final Guidance for the Code Agent

- Work from repo truth, not memory.
- Do not re-read files that remain within current context or memory unless they have changed or you need a missing section.
- Preserve current production copy quality.
- Preserve the compact two-card primary-page layout.
- Preserve the Adobe Sign completed-view deferred-fetch strategy.
- Avoid speculative infrastructure changes in this package.
- Make tests prove the improved UX contract rather than merely updating snapshots.
