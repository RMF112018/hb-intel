# B07 — HB Intel My Dashboard Validation, Hosted Evidence, and Development Phase Sequence Development

**Artifact status:** Batch 07 authoritative development-planning artifact  
**Prepared:** 2026-05-13  
**Target initiative:** HB Intel **My Dashboard** SPFx domain, **My Work shell**, and **Adobe Sign Action Queue** first module  
**Repo continuation anchor:** `9a1cefddd8c484623875bee6036ed4aee3b73660`  
**Immediate predecessor:** `B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md`  
**Binding predecessors:**  
- `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md`
- `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md`
- `B03_My_Work_Shell_Navigation_And_UX_Development.md`
- `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md`
- `B05_My_Dashboard_Adobe_Sign_Integration_Architecture_Identity_Mapping_OAuth_Agreement_Search_And_Source_Handoff_Development.md`
- `B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md`

**Source outline:** `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md`  
**Batch scope:** Detailed development of plan Sections **25. Validation Matrix and Definition of Done** and **26. Development Phase Sequence**, with required hosted-validation refinements to:
- **6. Communication Site Hosting and SharePoint Deployment Contract**
- **8. Packaging and Runtime Registration Contract**
- **27. Risk Exposure Register**

**Session posture:** Closed-decision planning artifact. This is **not** runtime implementation and **not** a local code-agent prompt package.

---

# Executive Verdict

## Final verdict

**Proceed with the My Dashboard initiative only under a validation-first execution model that treats hosted SharePoint proof, package-truth proof, runtime-marker/version proof, sanitized evidence, and explicit stage gates as mandatory acceptance infrastructure—not as late-stage QA cleanup.**

Batch 07 closes the validation and execution architecture as follows:

1. **My Dashboard validation must inherit the PCC live evidence doctrine.**  
   The repo already contains a mature Playwright/evidence system in `e2e/pcc-live/` with:
   - environment-gated hosted execution,
   - auth-state externalization,
   - package-version prechecks,
   - evidence sanitization,
   - operator-pending conditional lanes,
   - package-completeness reporting,
   - explicit review-support disclaimers rather than false automated certification.

   My Dashboard should reuse the philosophy and structure under a dedicated lane:
   ```text
   e2e/my-dashboard-live/
   docs/architecture/evidence/my-dashboard-live/
   ```

2. **Hosted proof on the actual SharePoint communication site is mandatory.**  
   Microsoft’s full-width SPFx guidance confirms that the local SharePoint workbench does not validate full-width communication-site behavior; full-width web parts must be tested on a deployed communication-site page. [W1]  
   Therefore:
   - local/Vite/UI-review results are necessary but insufficient,
   - package generation is necessary but insufficient,
   - hosted MyDashboard communication-site evidence is a hard release gate.

3. **The current repo already contains a My Dashboard SPFx packaging/runtime scaffold, but not the final My Work runtime.**  
   At commit `9a1cef...`:
   - `apps/my-dashboard/src/mount.tsx` exists and publishes `__hbIntel_myDashboard`,
   - SPFx token-provider wiring exists,
   - runtime config and production-readiness modules exist,
   - the manifest and package solution exist,
   - `tools/build-spfx-package.ts` already includes My Dashboard as a fresh-build single-domain package with critical runtime paths and runtime marker identity,
   - the visible app body remains the B02 placeholder host.

   Batch 07 does **not** reopen B02; it tightens the remaining validation expectations around the future shell/module implementation.

4. **The current runtime marker proves identity, not a hosted package version by itself.**  
   `mount.tsx` exposes:
   - `runtimeMarkerId`

   It does **not** currently expose:
   - `runtimePackageVersion`
   - `runtimeBuildStamp`
   - another hosted self-describing version proof.

   **Closed Batch 07 recommendation:** before hosted acceptance is considered complete, implementation must expose a My Dashboard runtime version stamp derived from the package/version authority and have the hosted evidence lane assert:
   - marker ID,
   - runtime package version,
   - expected package version supplied to the hosted run,
   - no marker/version mismatch.

5. **The package-truth proof must be broadened as the real My Work runtime lands.**  
   The current My Dashboard critical runtime path list correctly covers the B02 scaffold:
   - mount,
   - placeholder app,
   - runtime config,
   - production readiness,
   - manifest,
   - Vite config,
   - package file.

   Once shell/client/module files land, the critical path list must be expanded to include the implementation seams that determine runtime behavior:
   - `MyWorkShell.tsx`,
   - shell router/state files,
   - backend client factory/client files,
   - Adobe queue module/card/focused surface adapter where appropriate.

6. **User-specific Adobe queue evidence must never become a data leak.**  
   Hosted evidence may prove:
   - shell presence,
   - Adobe card presence,
   - focused module presence,
   - source-state category,
   - controlled fixture-state rendering,
   - structural CTA availability when a safe URL is provided.

   Hosted curated evidence must not capture or serialize:
   - real agreement names,
   - sender names,
   - sender emails,
   - source-open URLs,
   - OAuth authorization URLs with query strings,
   - live queue row payload JSON,
   - tokens, cookies, auth state, or session materials.

7. **The exact test taxonomy is now closed.**  
   The development plan must require:
   - shared model/fixture tests,
   - shell state and navigation tests,
   - shell/hero semantic tests,
   - UI component and source-state tests,
   - frontend API client/factory tests,
   - backend route-registration and validation tests,
   - Adobe adapter/provider tests,
   - operational resilience tests where B06 requires them,
   - hosted Playwright evidence lanes.

8. **The exact hosted evidence lane is now closed.**  
   My Dashboard should use:
   ```text
   e2e/my-dashboard-live/
   docs/architecture/evidence/my-dashboard-live/
   ```

   with deterministic run roots:
   ```text
   docs/architecture/evidence/my-dashboard-live/
   └── my-dashboard-live-v<package-version>-<YYYYMMDDTHHMMSSZ>/
   ```

   and evidence-group directories inside each run root.

9. **Screenshot evidence must be treated as curated review support, not blind certainty.**  
   Playwright’s official screenshot guidance warns that visual comparisons vary across OS, browser version, hardware, headless mode, and environment. [W4]  
   PCC’s own screenshot forensics also proved that document-level full-page capture can be misleading in hosted SharePoint layouts and that clipping can first appear after tab navigation.  
   My Dashboard must therefore:
   - pair screenshots with structural DOM measurements,
   - assert no horizontal clipping/overflow independently,
   - not claim full-page coverage from image size alone,
   - preserve screenshot evidence as expert-review support.

10. **The development sequence is now dependency-driven, not chronological by convenience.**  
    Several streams can overlap, but the following cannot be parallelized past their gates:
    - route/backend implementation before model contract lock,
    - hosted production validation before package/app catalog/permission readiness,
    - “final done” declaration before hosted curated evidence,
    - hosted package-version proof before runtime version exposure exists.

11. **The risk register must treat hosted-validation failure as a first-class product risk.**  
    Section 27 must explicitly track:
    - local-only false confidence,
    - package/runtime drift,
    - full-width communication-site layout failure,
    - screenshot false positives/false completeness,
    - auth-state/evidence leakage,
    - user-specific queue evidence exposure,
    - state lane gaps where deterministic fixtures are not hosted.

12. **Final Definition of Done is now strict.**  
    My Dashboard is not complete when it renders locally or when a package builds. It is complete only when:
    - code/test gates pass,
    - package-truth proof passes,
    - deployment readiness gates pass,
    - hosted communication-site validation passes,
    - curated sanitized evidence exists,
    - conditional/operator-pending gaps are documented precisely,
    - downstream synthesis can incorporate the results without reopening validation architecture.

---

# 1. Governing Decisions Carried Forward

## 1.1 Binding decisions from prior batches

| Decision area | Binding decision carried into Batch 07 |
|---|---|
| Product/domain | My Dashboard is a standalone SPFx domain, not a PCC extension. |
| Shell basis | My Work shell inherits PCC shell construction concepts. |
| Host | SharePoint communication site `MyDashboard`. |
| First module | `adobe-sign-action-queue`. |
| Backend route family | `GET /api/my-work/me/home` and `GET /api/my-work/me/adobe-sign/action-queue`. |
| Browser/API posture | SPFx acquires API token; browser does not call Adobe directly. |
| Actor posture | Current user derived from authenticated claims; no user/actor query overrides. |
| OAuth baseline | Delegated Adobe user OAuth plan baseline. |
| Queue operation posture | Load on render, manual refresh in focused module only, no MVP auto-polling. |
| Cache posture | No durable queue cache in MVP. |
| Evidence posture | Inherit PCC redaction/sanitization doctrine and strengthen it for user-specific Adobe content. |

## 1.2 Batch 07 does not reopen

This batch does **not** reopen:
- scope,
- naming,
- route family,
- Adobe module identity,
- read-model envelope posture,
- Adobe OAuth baseline,
- B06 operational refresh/cache/privacy decisions.

It converts those decisions into:
- a rigorous validation matrix,
- hosted evidence architecture,
- readiness gates,
- a realistic execution phase sequence.

---

# 2. Audit and Research Method

## 2.1 Batch 07 objective

This audit answered the following implementation-grade questions:

1. What parts of the PCC live evidence harness should My Dashboard inherit directly?
2. What needs to be renamed or re-scoped because My Dashboard is user-contextual rather than project-contextual?
3. How should hosted evidence prove shell/card/module behavior without leaking live Adobe queue data?
4. How should package truth prove the built `.sppkg` contains the intended runtime?
5. How should hosted evidence prove that the SharePoint page runs the expected package version?
6. What responsive, screenshot, and clipping lessons from PCC should be applied at the outset?
7. What exact unit/integration/adapter/hosted test categories are required?
8. What environment variables should the My Dashboard hosted lane consume?
9. What gates must be satisfied before implementation may advance between phases?
10. What can proceed in parallel, and what cannot?
11. What additional risks must be added to the Section 27 register?
12. What must be handed downstream into the final comprehensive plan synthesis?

## 2.2 Authority hierarchy

The audit used this order of authority:

1. **Live repository truth at commit `9a1cefddd8c484623875bee6036ed4aee3b73660`**
2. **Attached Batch 07 objective prompt**
3. **Attached My Dashboard comprehensive development-plan outline**
4. **Committed My Dashboard Batch 01–06 artifacts**
5. **Current official Microsoft, Playwright, and W3C/WAI guidance**
6. **Reasoned implementation guidance where sources do not define a product-specific decision**

---

# 3. Repo Audit Method and Files / Documents Inspected

## 3.1 Batch prompt and governing outline

| Source | Use |
|---|---|
| `07_Batch_07_Validation_Evidence_And_Development_Phase_Sequence.md` | Batch 07 objective, scope, required artifact contents, decisions to close |
| `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md` | Sections 6, 8, 25, 26, and 27 expansion baseline |

## 3.2 My Dashboard repo-truth files

| Path | Audit purpose |
|---|---|
| `apps/my-dashboard/src/mount.tsx` | Runtime marker, SPFx token-provider seam, mount/unmount lifecycle |
| `apps/my-dashboard/src/MyDashboardApp.tsx` | Current visible runtime state; confirms placeholder B02 host |
| `apps/my-dashboard/src/config/runtimeConfig.ts` | Backend mode, runtime injection, production-readiness prerequisites |
| `apps/my-dashboard/src/config/productionReadiness.ts` | Readiness contract export |
| `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json` | Webpart ID, full-bleed support, host posture |
| `apps/my-dashboard/config/package-solution.json` | Package identity, solution/feature versions, permission request metadata |
| `tools/build-spfx-package.ts` | Domain registry, critical runtime paths, package-truth proof, runtime marker registry |

## 3.3 PCC live evidence harness files and families

| Path / family | Audit purpose |
|---|---|
| `e2e/pcc-live/pcc-live.env.ts` | Environment resolution, package-solution version alignment, auth-state lookup |
| `e2e/pcc-live/pcc-live.page-object.ts` | Origin drift protection, root marker waits, structural result capture, redacted runtime error summaries |
| `e2e/pcc-live/pcc-live.surface-smoke.spec.ts` | Baseline hosted lane structure |
| `e2e/pcc-live/pcc-live.screenshot.spec.ts` | Screenshot evidence posture |
| `e2e/pcc-live/pcc-live.breakpoint.spec.ts` | Multi-viewport / layout checks |
| `e2e/pcc-live/pcc-live.accessibility.spec.ts` | Hosted accessibility evidence |
| `e2e/pcc-live/pcc-live.conditional.spec.ts` | Conditional/operator-pending lanes and sanitation safeguards |
| `e2e/pcc-live/pcc-live.evidence-writer.ts` | Curated evidence writing posture |
| `e2e/pcc-live/pcc-live.sanitization.ts` | Redaction and unsafe text/path handling |
| `e2e/pcc-live/pcc-live.package-completeness.ts` | Evidence package grouping, completeness reporting, non-certification disclaimer |

## 3.4 Responsive / screenshot issue evidence

| Source | Audit purpose |
|---|---|
| `SCREENSHOT_CAPTURE_FORENSICS.md` under PCC phase-06 evidence | Proof that SharePoint hosted screenshot capture can become misleading and that clipping appears after navigation |
| PCC screenshot reliability prompts and baseline findings | How My Dashboard should proactively avoid the same class of evidence weakness |

## 3.5 Existing test conventions

| Source | Audit purpose |
|---|---|
| `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` | Route wrapper / GET-only / `withAuth(withTelemetry(...))` pattern |
| `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts` | Route registration and envelope/validation test pattern |
| `apps/project-control-center/src/tests/projectShellViewModel.test.ts` | Semantic copy, metadata, and shell view-model contract testing pattern |
| Existing package proof code in `tools/build-spfx-package.ts` | How package proof and runtime proof are represented today |

---

# 4. Repo-Truth Findings

# 4.1 My Dashboard scaffold posture at `9a1cef...`

## Finding

The My Dashboard package/runtime shell is already partially implemented.

### Present in repo truth
- Standalone `apps/my-dashboard` domain.
- Runtime mount/unmount entry point.
- Published global marker:
  ```text
  __hbIntel_myDashboard
  ```
- Marker identity:
  ```text
  runtimeMarkerId = 412eb9fd-2eb2-4f7d-a4f1-7865e339a369
  ```
- SPFx API token provider creation seam.
- Runtime config:
  - `functionAppUrl`
  - `backendMode`
  - `allowBackendModeSwitch`
  - `apiAudience`
- Production-readiness helper.
- Manifest with:
  ```json
  "supportedHosts": ["SharePointWebPart"],
  "supportsFullBleed": true
  ```
- Package solution:
  ```text
  hb-intel-my-dashboard.sppkg
  ```
- Build orchestrator registration for `my-dashboard`, `packagingModel: 'single'`, `freshBuildRequired: true`.

### Not yet present
- Real My Work shell.
- My Work navigation.
- Adobe card and focused module.
- Frontend read-model clients.
- Hosted My Dashboard evidence lane.
- Runtime version stamp sufficient for self-proving hosted package version.

## Validation consequence

Batch 07 validation language must not pretend the app is unscaffolded, and must not pretend it is already feature-complete. The validation plan should distinguish:
- **already present scaffold validation**,
- **future runtime expansion validation**.

---

# 4.2 Package metadata cleanup item

## Finding

`apps/my-dashboard/config/package-solution.json` contains a feature description that says:

```text
Deploys the My Dashboard webpart assets to HBCentral.
```

The initiative’s target host is the MyDashboard communication site.

## Recommendation

Treat this as a downstream implementation cleanup item:
- update the feature description so it does not imply deployment to HB Central,
- keep product/site vocabulary aligned with the committed My Dashboard architecture.

This is not a Batch 07 code change, but it should be captured in the final comprehensive plan and any implementation package.

---

# 4.3 Package-truth proof already includes My Dashboard, but the critical runtime file map must evolve

## Finding

`tools/build-spfx-package.ts` already contains:
- `my-dashboard` in the domain registry,
- My Dashboard runtime marker mapping,
- My Dashboard critical runtime path list.

Current critical runtime paths:
```text
apps/my-dashboard/src/mount.tsx
apps/my-dashboard/src/MyDashboardApp.tsx
apps/my-dashboard/src/config/runtimeConfig.ts
apps/my-dashboard/src/config/productionReadiness.ts
apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json
apps/my-dashboard/vite.config.ts
apps/my-dashboard/package.json
```

## Recommendation

Keep the existing scaffold list intact, but expand it when B03/B04/B05 implementation surfaces land.

### Required future additions once implemented
At minimum:
```text
apps/my-dashboard/src/shell/MyWorkShell.tsx
apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx
apps/my-dashboard/src/state/useMyWorkShellState.ts
apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModule.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
```

### Why
The proof should cover:
- app entry,
- runtime identity,
- shell composition,
- route/client boundary,
- first module surface,
- the files that materially change user-visible and deployment-relevant behavior.

---

# 4.4 Hosted runtime marker proof is not yet version-complete

## Finding

Current My Dashboard `mount.tsx` publishes:
```ts
const api = {
  mount,
  unmount,
  runtimeMarkerId: MY_DASHBOARD_RUNTIME_MARKER_WEBPART_ID,
};
```

This proves:
- the correct runtime family is present,
- the runtime marker ID can be matched to the manifest ID.

It does **not** prove:
- which package version is running on the hosted page,
- whether the page reflects the just-built `.sppkg` rather than a prior deployment.

## Closed Batch 07 decision

Add a **runtime package version proof seam** before hosted closeout is treated as final.

### Recommended implementation posture
Expose:
```ts
runtimePackageVersion: '<resolved package solution version>'
```
or a semantically equivalent governed version stamp on:
```text
__hbIntel_myDashboard
```

### Hosted test requirement
The live evidence lane must assert:
- marker exists,
- marker ID equals the manifest web part ID,
- runtime package version equals `MY_DASHBOARD_EXPECTED_PACKAGE_VERSION`,
- evidence writes both values in sanitized proof summaries.

### Acceptable interim posture
Before the version stamp exists:
- the lane may report `runtime-marker-id observed`,
- it must mark hosted package-version proof as `operator-review-required` or `blocked`,
- it must not claim complete hosted version proof.

---

# 4.5 PCC live environment resolution provides the My Dashboard blueprint

## Finding

`pcc-live.env.ts` already performs:
- repo root resolution,
- package-solution version extraction,
- feature version consistency check against solution version,
- default hosted page/site settings,
- external storage-state path resolution,
- evidence output root resolution,
- conditional lane enablement,
- self-skip when storage state is absent.

## Closed Batch 07 decision

Create an analogous:
```text
e2e/my-dashboard-live/my-dashboard-live.env.ts
```

It should:
- resolve repo root,
- read `apps/my-dashboard/config/package-solution.json`,
- reject feature/solution version mismatch,
- derive default expected package version from package solution,
- require/authenticate via external storage state,
- default evidence root to `docs/architecture/evidence/my-dashboard-live`,
- self-skip cleanly when hosted prerequisites are not present.

---

# 4.6 PCC evidence package completeness should be reused conceptually

## Finding

`pcc-live.package-completeness.ts` is especially valuable because it:
- enumerates expected evidence groups,
- distinguishes required vs. conditional groups,
- filters unsafe artifact paths,
- includes explicit review-support-only disclaimers,
- avoids claiming automated final scorecard truth,
- yields a final disposition such as:
  - `expert-review-required`
  - `operator-review-required`.

## Closed Batch 07 decision

My Dashboard should have an analogous package-completeness assembler:
```text
e2e/my-dashboard-live/my-dashboard-live.package-completeness.ts
```

### Required evidence groups
- `runtime-proof`
- `surface-smoke`
- `focused-module-workflow`
- `breakpoints`
- `accessibility`
- `content-and-copy`
- `source-state-review`
- `screenshots`
- `conditional`
- `package-completeness`

### Required disclaimer posture
The My Dashboard completeness markdown must state clearly:
- review support only,
- not an automated production approval,
- not proof that Adobe production auth is configured unless the relevant live lane actually validates it,
- not permission to ship if required deployment gates are unmet.

---

# 4.7 PCC conditional lanes solve the Adobe state-evidence problem

## Finding

`pcc-live.conditional.spec.ts` already provides a strong pattern for:
- operator-pending lanes,
- unavailable/not-configured statuses,
- sanitized writers,
- conditional environments that are not false-negative test failures merely because the operator did not configure a special state.

## My Dashboard-specific application

Adobe queue states such as:
- empty queue,
- authorization-required,
- configuration-required,
- principal-unresolved,
- source-unavailable,
- partial/degraded,

may not all be deterministically reachable in a live user’s real production-context hosted page.

## Closed Batch 07 decision

Use a split hosted strategy:

### A. Required production-host lane
Validates the real hosted page against the current deployed package:
- page loads,
- runtime marker observed,
- shell/root markers observed,
- app/hero/canvas fit the full-width host,
- no fatal console/page errors,
- source state observed without serializing queue rows,
- no horizontal clipping.

### B. Conditional hosted review-state lane
Uses a safe, deterministic review posture when deliberately enabled:
- `ui-review` / fixture-backed state if supported,
- or a dedicated safe review deployment/page,
- operator-configured and clearly marked,
- screenshots and state-card evidence generated only from non-sensitive deterministic data.

### If conditional hosted state evidence is not configured
The lane must report:
```text
operator-pending
```
or:
```text
not-configured
```
rather than inventing proof.

---

# 4.8 Screenshot reliability must be structurally supported

## Finding

PCC screenshot forensics at `1.0.0.219` identified:
- clipping appearing after tab navigation,
- host/container scroll drift,
- cases where document-level full-page screenshots remained effectively viewport-bounded,
- scroll-segment captures that produced duplicate hashes and therefore did not prove movement or extended coverage.

## Closed Batch 07 decision

My Dashboard screenshot evidence must:
- include structural measurements beside image evidence,
- verify viewport/page/container scroll widths,
- verify active shell panel bounding boxes,
- verify no negative left drift/clipping after module navigation,
- verify screenshots intended to show different segments are not silently duplicates,
- avoid calling an image a “full coverage screenshot” unless supporting DOM and scroll evidence confirms it.

### Minimum proactive no-clipping checks
For every required viewport and major state:
- `document.documentElement.scrollWidth <= clientWidth + tolerance`
- app root left bound not clipped,
- shell panel left bound not clipped,
- hero left bound not clipped,
- bento grid left bound not clipped,
- focused module container left bound not clipped,
- no persistent ancestor `scrollLeft` drift after module navigation.

---

# 4.9 Existing test conventions favor explicit contract tests, not loose render smoke

## Finding

The repo’s stronger tests do more than check “renders without crashing.”

Examples:
- PCC backend route tests assert:
  - exact route registrations,
  - GET-only posture,
  - auth wrapper presence,
  - no write-route drift,
  - expected response envelope behavior,
  - validation error shape.
- PCC shell view-model tests assert:
  - summary content,
  - copy constraints,
  - no forbidden developer-facing terms,
  - semantic metadata contracts,
  - stable fallback behavior.

## Closed Batch 07 decision

My Dashboard tests must inherit this specificity. The plan should not rely on:
- shallow snapshots only,
- generic “component renders” tests,
- mocked happy-path coverage without negative/business-state cases.

---

# 5. Web Research Findings with Citations

## 5.1 Source register

| ID | Source | Batch 07 use |
|---|---|---|
| **W1** | Microsoft Learn — *Use web parts with the full-width column* | Full-width communication-site hosting requirements; workbench limitation |
| **W2** | Playwright — *Authentication* | Stored auth-state patterns and warning against committing sensitive browser state |
| **W3** | Playwright — *Locators* | Prefer role-based locators; use test IDs/data attributes where semantic selectors are insufficient |
| **W4** | Playwright — *Visual comparisons* | Screenshot comparison environmental variance; consistency requirements |
| **W5** | WAI-ARIA APG — *Tabs Pattern* | Tablist/tab/tabpanel semantics and keyboard model |
| **W6** | WAI/W3C — *ARIA22: Using role=status to present status messages* | Non-disruptive status/live-region announcements |
| **W7** | WAI/W3C — *G91: Providing link text that describes the purpose of a link* | CTA/source-link naming expectations |

---

## 5.2 Hosted SharePoint validation must occur on the deployed communication site

Microsoft’s SPFx full-width guidance states:
- full-width columns are a communication-site layout feature,
- `supportsFullBleed: true` is required in the manifest,
- the SharePoint workbench does **not** support validating web parts in the full-width column,
- the web part must be deployed to a developer tenant / communication site for real validation. [W1]

### Batch 07 conclusion
The My Dashboard Definition of Done must include:
- deployment to the target MyDashboard communication site or a designated hosted validation page on the same communication-site layout model,
- page-level hosted evidence,
- full-width fit evidence,
- no reliance on local workbench for final acceptance.

---

## 5.3 Authenticated Playwright evidence must treat storage state as sensitive secret material

Playwright recommends:
- storing authenticated state in files,
- reusing it as `storageState`,
- excluding those files from source control,
- treating stored browser state as sensitive because it may contain cookies and headers capable of impersonation. [W2]

### Batch 07 conclusion
The My Dashboard live lane must:
- store auth state outside the repo,
- default to a home-directory-managed auth path rather than a committed folder,
- redact any accidental storage-state path references from evidence,
- reject or filter artifact paths containing auth/session/token materials,
- never commit raw Playwright auth state.

---

## 5.4 Locator strategy should prefer semantic roles, with data attributes for stable product-proof seams

Playwright recommends:
- role-based locators where possible,
- text/label locators where stable,
- test IDs when role/text are insufficient or when deterministic targeting is required. [W3]

### Batch 07 conclusion
My Dashboard hosted tests should:
- use accessible roles for tabs, buttons, links, and tabpanels,
- use visible link/button names for user-facing workflow checks where text is intentionally stable,
- use `data-my-work-*` attributes for:
  - shell ownership,
  - bento/grid identity,
  - module/card identity,
  - state-card classification,
  - hosted evidence proof points that should not depend on cosmetic copy.

---

## 5.5 Screenshot comparisons are useful but environment-sensitive

Playwright’s official visual comparison guidance warns that screenshots vary by:
- operating system,
- browser version,
- host machine settings,
- hardware,
- power mode,
- headless/headed differences. [W4]

### Batch 07 conclusion
Use screenshots as:
- curated evidence,
- visual review support,
- regression aid when run in controlled environments.

Do not use screenshots alone as:
- sole proof of layout integrity,
- sole proof of host-fit,
- sole proof of responsive correctness,
- sole proof of state correctness.

Every screenshot lane must pair images with:
- DOM measurements,
- selector counts,
- overflow/clipping assertions,
- state metadata summaries.

---

## 5.6 Tabs/tabpanels must follow actual accessibility semantics

The WAI-ARIA tabs pattern defines:
- tablist,
- tab,
- tabpanel,
- one active panel at a time,
- associated selection state and panel relationship. [W5]

### Batch 07 conclusion
My Work shell validation must assert:
- correct tablist/tab/tabpanel structure if tab controls are used,
- one semantic active panel owner,
- active selection state,
- keyboard navigation behavior appropriate to the chosen tab pattern,
- no nested invalid interactive controls that break semantic expectations.

---

## 5.7 Empty/error/refresh states should announce non-disruptive status updates

WAI/W3C technique ARIA22 describes `role="status"` as a live region suitable for advisory status messages, with polite announcement behavior. [W6]

### Batch 07 conclusion
My Dashboard state/refresh UI should be validated for:
- readable status text,
- appropriate use of status/live-region semantics for non-critical async updates,
- no focus stealing for routine queue refresh updates,
- deliberate error semantics only when interruption is warranted.

---

## 5.8 CTA links must say what they do

WAI/W3C link-purpose guidance emphasizes descriptive link text rather than ambiguous labels. [W7]

### Batch 07 conclusion
Adobe source links should be validated against a meaningful accessible purpose.

Acceptable examples:
- `Open in Adobe Sign`
- `Open agreement in Adobe Sign`

Avoid:
- `Open`
- `View`
- `Click here`

unless fully disambiguated by accessible name/context and deliberately approved.

---

# 6. Hosted-Validation Refinements to Section 6 — Communication Site Hosting and SharePoint Deployment Contract

## 6.1 Refined Section 6 objective

Section 6 should establish that the product is not merely deployed “somewhere in SharePoint.” It must be validated in the actual host class that defines its layout constraints:

```text
SharePoint communication site page with full-width section support
```

## 6.2 Closed hosted page posture

### Target production host
```text
https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard
```

### Target validation page posture
The final implementation plan should lock an exact hosted validation page before live evidence execution begins. The preferred acceptance page remains:

```text
/SitePages/Home.aspx
```

if the My Dashboard surface is intended to live on the site home page.

If a separate hosted validation page is used, the final plan must record:
- the page path,
- why it differs from production landing placement,
- whether it shares the same section/layout behavior,
- whether the evidence is acceptance-grade or only preflight-grade.

## 6.3 Required SharePoint hosting gates

Before hosted closeout can occur:
- My Dashboard `.sppkg` is produced through the governed packaging orchestrator.
- The `.sppkg` is uploaded/available through the approved deployment channel.
- API permission request is approved when backend production-mode validation is required.
- The target page contains the My Dashboard web part.
- The page is in the full-width section layout intended for the final experience.
- The page is accessible with the designated test account represented by the external Playwright storage-state file.
- The hosted evidence lane reads the exact page URL from env, not from hardcoded ad hoc test code.

## 6.4 Required hosted checks for communication-site fit

Hosted acceptance must verify:
- full-width page placement,
- shell does not collapse due to host margins/padding,
- hero, command surface, and bento canvas remain visually and semantically coherent,
- no horizontal overflow on target breakpoint set,
- no clipping after module navigation,
- no layout regression caused by SharePoint page chrome or section constraints.

## 6.5 Production host vs. review-state host

Section 6 should explicitly distinguish:
- **production hosted validation page** — proves real deployment/host/runtime package wiring,
- **conditional review-state page or mode** — proves state cards/screenshots for deterministic fixture conditions.

This prevents a false requirement that the real production queue must happen to be empty, unavailable, or authorization-required at the moment of evidence capture.

---

# 7. Hosted-Validation Refinements to Section 8 — Packaging and Runtime Registration Contract

## 7.1 Refined Section 8 objective

Section 8 should govern:
1. source package identity,
2. build orchestration,
3. package-truth proof,
4. hosted runtime identity/version proof.

These are related but not identical.

## 7.2 Repo-truth package baseline

At `9a1cef...`, My Dashboard already has:
- standalone package solution,
- webpart manifest,
- orchestrator domain registration,
- runtime marker ID,
- critical runtime path list,
- fresh-build-required posture.

The final comprehensive plan should present this as **existing repo truth**, not as future speculative work.

## 7.3 Required package-truth proof expectations

The package-truth proof for My Dashboard must verify:

### Identity alignment
- solution ID expected,
- feature ID expected,
- webpart manifest ID expected,
- runtime marker ID expected.

### Version alignment
- solution version exists,
- feature version equals solution version,
- webpart manifest version equals solution version or follows the repo’s governed deployment convention,
- expected package version recorded in proof output.

### Build-freshness proof
- fresh Vite build required,
- source bundle fingerprint recorded,
- packaged bundle fingerprint recorded,
- packaged bundle matches source bundle fingerprint where the orchestrator enforces that invariant.

### Runtime marker proof
- packaged JavaScript contains the expected My Dashboard runtime marker seam,
- runtime marker ID equals manifest ID,
- hosted page exposes the marker after deployment.

### Future version proof addition
- hosted page exposes a governed `runtimePackageVersion` or equivalent,
- live evidence asserts it equals the expected package version.

### Critical runtime source proof
The critical runtime file fingerprint list must evolve from the scaffold baseline to the real runtime surface once those files exist.

## 7.4 Hosted runtime proof matrix

| Proof item | Source package proof | Hosted page proof | Required for final closeout |
|---|---:|---:|---:|
| My Dashboard domain included in orchestrator | Yes | N/A | Yes |
| Package solution / feature version alignment | Yes | N/A | Yes |
| Manifest webpart ID | Yes | Marker cross-check | Yes |
| Runtime marker ID | Yes | Yes | Yes |
| Runtime package version | Recommended implementation | Yes | Yes before final hosted acceptance |
| Correct hosted page URL | N/A | Yes | Yes |
| Correct SharePoint origin | N/A | Yes | Yes |
| Webpart root marker observed | N/A | Yes | Yes |

## 7.5 Required environment-controlled package version expectation

The live lane must support:
```text
MY_DASHBOARD_EXPECTED_PACKAGE_VERSION
```

Default behavior:
- if omitted, derive from `apps/my-dashboard/config/package-solution.json`.

Validation behavior:
- reject/mismatch if feature and solution versions drift,
- reject/mismatch if live runtime version marker exists and disagrees with expected package version,
- report operator review required if live version proof seam has not yet been implemented.

---

# 8. Fully Developed Section 25 — Validation Matrix and Definition of Done

# 8.1 Validation doctrine

The My Dashboard validation program must answer five questions:

1. **Did we implement the right product contract?**
2. **Did the code preserve the route/auth/source-state boundaries?**
3. **Did the package actually contain the intended runtime?**
4. **Did the runtime behave correctly in the hosted SharePoint communication site?**
5. **Can we prove that safely, without leaking actor-specific Adobe queue data?**

A “yes” requires more than green unit tests.

---

# 8.2 Test taxonomy — exact categories

The initiative must require the following test groups.

| Category | Required | Purpose |
|---|---:|---|
| Shared model and fixture tests | Yes | Lock My Work envelope, source-state vocabulary, summary math, deterministic scenarios |
| Shell state/navigation tests | Yes | Lock home vs. focused-module state, invalid module fallback, selection transitions |
| Shell/hero semantic contract tests | Yes | Lock production copy boundaries, data attributes, hero summary posture, active panel semantics |
| UI component tests | Yes | Lock card/module/state-card rendering and CTA visibility rules |
| Frontend API client/factory tests | Yes | Lock route URLs, auth token usage, config/readiness fallback, malformed response behavior |
| Backend route tests | Yes | Lock exact routes, GET-only posture, auth wrapper posture, query validation, envelope behavior |
| Adobe adapter/provider tests | Yes | Lock status normalization, queue mapping, null safety, rate-limit/state mapping, source URL posture |
| Operational resilience tests | Yes where B06 rules apply | Lock manual refresh rules, no auto-polling, in-flight duplicate suppression, stale-state semantics |
| Package-truth proof tests/checks | Yes | Prove packaged runtime identity/freshness/version alignment |
| Hosted Playwright evidence | Yes | Prove communication-site host behavior, runtime marker, full-width fit, responsive/no-overflow, evidence safety |
| Conditional hosted review-state evidence | Required where configured; operator-pending otherwise | Prove empty/auth/degraded state cards without leaking live queue content |

---

# 8.3 Shared model and fixture test matrix

## Required model-test locations
Recommended:
```text
packages/models/src/myWork/
```

## Required contract areas

| Test area | Required assertion |
|---|---|
| Envelope source-status union | Exactly the approved source statuses are supported |
| `readOnly: true` posture | No editable/source mutation posture appears in read models |
| Home read model | Summary totals remain internally coherent |
| Adobe queue summary | Counts equal normalized item classes |
| Action category mapping | Adobe raw statuses map to stable My Work categories |
| Expiring-soon logic | Window remains deliberate and deterministic |
| Empty queue fixture | Available state with zero rows, not an error |
| Authorization-required fixture | Correct source state and user-safe message seam |
| Configuration-required fixture | Correct source state and user-safe message seam |
| Principal-unresolved fixture | Correct source state and no fallback actor |
| Source-unavailable fixture | Correct controlled degradation |
| Partial fixture | Warning contract present; safe UI state supported |
| Long/missing field fixtures | Null-safe model integrity, no malformed labels |

## Fixture determinism requirement

All fixtures used in screenshots and model tests must:
- be stable,
- be non-sensitive,
- contain no real names, real agreements, or real email addresses,
- avoid lorem/debug/test copy,
- follow the production copy tone established in earlier batches.

---

# 8.4 Shell state and navigation test matrix

## Required test locations
Recommended:
```text
apps/my-dashboard/src/state/
apps/my-dashboard/src/shell/
apps/my-dashboard/src/tests/
```

## Required assertions

| Test area | Required assertion |
|---|---|
| Initial state | Home surface is active by default |
| Focused module selection | Selecting Adobe queue enters focused module state |
| Return-to-home state | Returning from focused module restores home state |
| Invalid module input | Normalizes safely back to home / safe state |
| No URL-routing dependency | State remains in-memory for MVP |
| No localStorage dependency | No persisted preference is required |
| Home-to-card CTA | “View queue” selects Adobe focused module |
| Active panel ownership | Exactly one semantic active panel owner |
| Data attributes | Namespaced `data-my-work-*` markers exist where defined |

---

# 8.5 Shell / hero semantic contract tests

## Required purpose

These tests should follow the PCC precedent of validating product semantics, not only DOM existence.

## Required assertions

| Test area | Required assertion |
|---|---|
| Primary title | Uses **My Dashboard** |
| Secondary title | Uses **My Work** or the approved active surface label |
| Copy hygiene | No developer-only words such as TODO, debug, placeholder, stub, repo, prompt |
| Hero summary | Does not duplicate the detailed Adobe queue list |
| Command surface | Present and semantically separated from card content |
| Navigation | Uses approved labels/IDs only |
| Active panel | One owner, valid role/semantic binding if tabs are used |
| Read-only posture | No copy implies in-HB signing/approval execution |
| Source authority | Adobe remains source of action completion |

---

# 8.6 UI component test matrix

## Required module/card tests

| Component/state | Required assertion |
|---|---|
| Adobe dashboard card | Visible on My Work Home |
| Focused Adobe module | Renders after selection |
| Ready queue state | Summary + rows render from deterministic fixture |
| Empty queue state | Clear no-action-required message |
| Authorization required | Clear state card; no fake rows |
| Configuration required | Clear state card; no fake rows |
| Principal unresolved | Clear state card; no fallback data |
| Source unavailable | Calm degraded state card |
| Partial state | Warnings shown without invalidating safe rows |
| CTA visibility | Source link only renders when safe `sourceOpenUrl` exists |
| CTA accessible name | Describes destination, not generic “Open” |
| Manual refresh button | Focused module only; disabled while in flight |
| No dashboard auto-refresh UI drift | Card does not invite uncontrolled polling |
| Long-title/missing-field rows | Layout survives and text remains usable |

---

# 8.7 Frontend API client and factory test matrix

## Required files
Recommended:
```text
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts
apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts
```

## Required assertions

| Test area | Required assertion |
|---|---|
| Home route URL | Constructs `/api/my-work/me/home` |
| Queue route URL | Constructs `/api/my-work/me/adobe-sign/action-queue` |
| Query boundedness | Only approved `pageSize` and `cursor` reach queue route |
| No actor override | No `email`, `user`, `principal`, or equivalent query accepted |
| Authorization header | Backend client requests token and sends Bearer header |
| Token provider failure | Maps to controlled backend-unavailable/production-readiness state as designed |
| Missing function URL | Fails through `ConfigError` / readiness posture, not opaque fetch failure |
| Malformed JSON | Safe fallback state |
| Malformed envelope | Safe fallback state |
| Non-2xx | Mapped according to approved error taxonomy |
| Fixture mode | Does not call backend |
| Production mode | Does not silently fall back to fixture content |
| Backend mode switch | Only operates where deliberately allowed |

---

# 8.8 Backend route test matrix

## Required route posture

```http
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
```

## Required assertions

| Test area | Required assertion |
|---|---|
| Route count | Exactly the approved My Work GET routes exist |
| HTTP methods | GET only; no POST/PUT/PATCH/DELETE drift |
| Wrapper posture | `withAuth(withTelemetry(...))` or repo-standard equivalent applied |
| Actor source | Actor derived from auth context, not query/path override |
| Home route | Returns success envelope for expected business/source states |
| Queue route | Returns success envelope for expected business/source states |
| Invalid `pageSize` | 400 validation error |
| Invalid/bounded cursor posture | Controlled according to B04 route contract |
| No actor override query | Query rejected or ignored in a provable non-overriding way |
| Unhandled backend error | 500 standardized error response |
| Authorization-required | 200 envelope, not raw provider 401 passthrough |
| Principal-unresolved | 200 envelope, not cross-user fallback |
| Configuration-required | 200 envelope |
| Source-unavailable | 200 envelope |
| Request ID | Preserved/extracted using repo convention |

---

# 8.9 Adobe adapter/provider test matrix

## Required test areas

| Test area | Required assertion |
|---|---|
| Adobe raw status mapping | All approved WAITING_FOR_MY_* statuses normalize correctly |
| Unknown raw status | Controlled fallback or intentional exclusion according to provider contract |
| Sender fields | Optionality handled safely |
| Missing expiration | No invented due date |
| Expiring soon | Calculates only from approved source field and configured window |
| Source-open URL | Only accepted when backend validates/generates it |
| Invalid access point | Controlled source/config state |
| Principal unresolved | Maps to source state, no shared principal fallback |
| OAuth refresh failure | Maps to `authorization-required` |
| 429 throttling | Controlled degraded state + safe telemetry class |
| Retry policy | Bounded, no runaway retry loop |
| Provider body redaction | No raw Adobe payload leakage into errors/log-facing exceptions |
| Pagination/cursor | Stable envelope output, no unsafe query echo |
| Partial provider response | Warning contract retained, rows rendered only where safe |

---

# 8.10 Operational resilience tests required by B06

| Rule | Required proof |
|---|---|
| No auto-polling | No timer-driven queue refetch exists in MVP |
| Manual refresh only in focused module | Dashboard summary/card does not expose unnecessary refresh affordance |
| In-flight duplicate suppression | Repeated refresh clicks do not create overlapping requests |
| Debounce | Rapid user requests are bounded |
| Last-refreshed semantics | `generatedAtUtc` shown accurately where intended |
| Stale state semantics | `isStale` is not falsely used merely because time passed |
| No durable cache | No UI or backend path presents persisted last-known queue as current MVP truth |

---

# 8.11 Package-truth validation matrix

| Proof area | Required proof |
|---|---|
| Domain registration | Orchestrator contains `my-dashboard` |
| Build freshness | `freshBuildRequired: true` retained |
| Runtime marker identity | Marker ID equals webpart manifest ID |
| Package version alignment | Solution/feature/manifest versions aligned per governed convention |
| Package output | Expected `.sppkg` generated |
| Critical runtime files | Fingerprints captured |
| Packaged bundle fingerprint | Captured and matched where supported |
| Deployment posture | Single-domain package posture preserved |
| Host compatibility | Manifest contains `SharePointWebPart` and `supportsFullBleed: true` |
| Future runtime version seam | Runtime exposes package version before hosted final acceptance |

---

# 8.12 Hosted Playwright evidence matrix

## Required hosted production lane

| Check | Required |
|---|---:|
| HTTPS page load | Yes |
| Same-origin no-drift assertion | Yes |
| Webpart root marker visible | Yes |
| Runtime marker ID observed | Yes |
| Runtime package version observed and matched, once implemented | Yes |
| Hero/command surface/canvas markers | Yes |
| Home card region rendered | Yes |
| Adobe dashboard card structural presence | Yes |
| Focused module navigation works | Yes |
| Focused module structural presence | Yes |
| No fatal page errors | Yes |
| Console error summary captured and sanitized | Yes |
| Horizontal overflow check | Yes |
| Clipping/bounds check after navigation | Yes |
| Accessibility smoke | Yes |
| Curated evidence files written | Yes |

## Required conditional hosted review-state lane

| Check | Required when configured |
|---|---:|
| Empty queue state | Yes |
| Authorization-required state | Yes |
| Configuration-required state | Yes |
| Principal-unresolved state | Recommended |
| Source-unavailable state | Yes |
| Partial/degraded state | Recommended |
| Deterministic screenshot evidence | Yes |
| No live queue content serialized | Yes |
| Operator-pending state if not configured | Yes |

---

# 8.13 Accessibility evidence matrix

| Area | Required proof |
|---|---|
| Tab semantics | Tablist/tab/tabpanel contract, if tabs are used |
| Keyboard path | Navigate tab/module controls without mouse |
| Focus visibility | Focus remains visible in command surface and CTA areas |
| Status/live regions | Refresh/status messaging uses approved non-disruptive semantics where needed |
| State cards | Error/degraded/empty messages are announced/readable |
| CTA links | Link purpose is descriptive |
| Buttons | Accessible names match actual action |
| No false affordance | Disabled or unavailable states are semantically coherent |
| Heading hierarchy | Shell and module headings remain ordered and meaningful |

---

# 8.14 Screenshot and structural evidence matrix

## Required breakpoint set

Use the PCC-style broad mode set unless a later app-specific responsive basis of design formally changes it:

| Mode | Suggested viewport |
|---|---:|
| Phone | `390 x 844` |
| Tablet portrait | `768 x 1024` |
| Tablet landscape | `1024 x 768` |
| Small laptop | `1280 x 800` |
| Standard laptop | `1440 x 900` |
| Large laptop | `1680 x 1050` |
| Desktop | `1920 x 1080` |
| Ultrawide | `2560 x 1440` |

## Required structural measures per breakpoint

- viewport width/height,
- document scroll width,
- app root bounds,
- shell bounds,
- command surface bounds,
- hero bounds,
- active panel bounds,
- bento grid bounds,
- focused module bounds where applicable,
- horizontal overflow status,
- clipping status,
- screenshot hash metadata when used for segment differentiation.

---

# 8.15 Final Definition of Done

The My Dashboard initiative may be considered complete only when **all** of the following are true:

## A. Code and contract quality
- Required model, client, route, shell, UI, adapter, and operational tests pass.
- No prohibited write-back or actor-override behavior exists.
- Adobe queue states map to the approved read-model/source-state contract.
- User-facing copy is production-grade and does not contain developer/debug language.
- The product preserves the earlier scope locks.

## B. Packaging and runtime proof
- My Dashboard package builds through the governed SPFx packaging orchestrator.
- Package-truth proof is generated.
- Version alignment is proven.
- Runtime marker identity is proven.
- Runtime package version is exposed and hosted proof is possible before final acceptance.
- Critical runtime path list reflects the real runtime, not only the B02 scaffold.

## C. SharePoint deployment readiness
- `.sppkg` deployment path is approved and documented.
- API permission approval is complete where production backend validation requires it.
- The MyDashboard communication-site page URL is locked.
- Full-width section placement is confirmed.
- Test account/page access is confirmed.

## D. Hosted evidence
- Hosted production lane passes.
- Conditional review-state lane passes where configured, or operator-pending statuses are explicitly documented.
- Responsive/no-overflow evidence exists.
- Accessibility evidence exists.
- Screenshot evidence is paired with structural measurement evidence.
- Curated evidence output is sanitized and excludes credential/session/user-sensitive queue materials.

## E. Documentation and downstream handoff
- Validation outcomes are documented.
- Any blocked/operator-pending lane is recorded with recommended action.
- Risk register updates are incorporated.
- Final synthesis can carry forward Batch 07 without reopening the validation architecture.

---

# 9. Full Playwright / Hosted Evidence Plan

# 9.1 Canonical lane path

```text
e2e/my-dashboard-live/
```

## Recommended initial file map

```text
e2e/my-dashboard-live/
├── README.md
├── my-dashboard-live.env.ts
├── my-dashboard-live.env.test.ts
├── my-dashboard-live.sanitization.ts
├── my-dashboard-live.sanitization.spec.ts
├── my-dashboard-live.page-object.ts
├── my-dashboard-live.runtime-proof.ts
├── my-dashboard-live.runtime-proof.spec.ts
├── my-dashboard-live.surface-smoke.spec.ts
├── my-dashboard-live.workflow.spec.ts
├── my-dashboard-live.breakpoints.spec.ts
├── my-dashboard-live.accessibility.spec.ts
├── my-dashboard-live.screenshot.spec.ts
├── my-dashboard-live.conditional.spec.ts
├── my-dashboard-live.evidence-writer.ts
├── my-dashboard-live.package-completeness.ts
├── my-dashboard-live.package-completeness.spec.ts
├── my-dashboard-live.types.ts
└── my-dashboard-live.surfaces.ts
```

This is a planning target, not a code mandate that every file must be created in one step. The actual implementation package may subdivide the work.

---

# 9.2 Canonical evidence root and run-id scheme

## Root
```text
docs/architecture/evidence/my-dashboard-live/
```

## Run root
```text
docs/architecture/evidence/my-dashboard-live/
└── my-dashboard-live-v<package-version>-<YYYYMMDDTHHMMSSZ>/
```

## Example
```text
docs/architecture/evidence/my-dashboard-live/
└── my-dashboard-live-v1.0.0.0-20260513T071500Z/
```

## Inside-run group directories
```text
runtime-proof-<run-id>/
surface-smoke-<run-id>/
workflow-<run-id>/
breakpoints-<run-id>/
accessibility-<run-id>/
screenshots-<run-id>/
source-states-<run-id>/
conditional-<run-id>/
package-completeness-<run-id>/
```

---

# 9.3 Required evidence files by group

## Runtime proof
```text
my-dashboard-live-runtime-proof.json
my-dashboard-live-runtime-proof.md
```

## Surface smoke
```text
my-dashboard-live-surface-smoke.json
my-dashboard-live-surface-smoke.md
```

## Workflow
```text
my-dashboard-live-workflow-evidence.json
my-dashboard-live-workflow-evidence.md
```

## Breakpoints
```text
my-dashboard-live-breakpoint-evidence.json
my-dashboard-live-breakpoint-evidence.md
my-dashboard-live-breakpoint-matrix.json
my-dashboard-live-breakpoint-bounds.json
my-dashboard-live-breakpoint-issue-register.json
my-dashboard-live-breakpoint-issue-register.md
```

## Accessibility
```text
my-dashboard-live-accessibility-evidence.json
my-dashboard-live-accessibility-evidence.md
my-dashboard-live-axe-summary.json
my-dashboard-live-keyboard-focus-summary.json
my-dashboard-live-aria-semantics-summary.json
my-dashboard-live-accessibility-issue-register.json
my-dashboard-live-accessibility-issue-register.md
```

## Screenshots
```text
my-dashboard-live-screenshot-evidence.json
my-dashboard-live-screenshot-evidence.md
my-dashboard-live-screenshot-inventory.json
screenshot-contact-sheet.md
screenshot-manifest.json
```

## Source states / conditional
```text
my-dashboard-live-source-state-evidence.json
my-dashboard-live-source-state-evidence.md
my-dashboard-live-conditional-evidence.json
my-dashboard-live-conditional-evidence.md
```

## Package completeness
```text
evidence-package-completeness.json
evidence-package-completeness.md
```

---

# 9.4 Hosted selector contract

## Runtime / app markers
```text
[data-my-dashboard-app-root="true"]
```

## Proposed My Work markers
```text
[data-my-work-shell]
[data-my-work-shell-mode]
[data-my-work-command-surface]
[data-my-work-hero]
[data-my-work-active-surface-panel]
[data-my-work-bento-grid]
[data-my-work-card]
[data-my-work-module]
[data-my-work-adobe-sign-queue]
[data-my-work-state]
```

## Validation principle
- Use roles and accessible names first.
- Use `data-my-work-*` markers where the product needs durable evidence seams independent of copy styling.
- Do not rely on brittle CSS class names or nth-child selectors for acceptance-grade tests.

---

# 9.5 Runtime proof lane

## Required checks
- page opens under expected HTTPS origin,
- SharePoint host page remains on expected origin,
- My Dashboard runtime marker exists on global object,
- runtime marker ID equals known manifest ID,
- runtime package version equals expected package version once version seam exists,
- app root marker is visible,
- evidence writer records a sanitized result.

## Required failure taxonomy
- `marker-missing`
- `marker-id-mismatch`
- `version-proof-unavailable`
- `runtime-version-mismatch`
- `page-origin-drift`
- `app-root-missing`

---

# 9.6 Surface smoke lane

## Required checks
- app root visible,
- shell marker visible,
- command surface visible,
- hero visible,
- active panel visible,
- bento grid visible,
- My Work Home rendered,
- Adobe Sign dashboard card present structurally,
- no immediate fatal runtime/page errors,
- no unsupported redirect/origin drift.

---

# 9.7 Workflow lane

## Required checks
- Adobe Sign dashboard card exposes approved “View queue” affordance,
- selecting the card transitions to focused Adobe module state,
- focused module root appears,
- return/back/home behavior returns to My Work Home where designed,
- no semantic active-panel duplication after navigation,
- no clipping drift appears after module transition.

---

# 9.8 Source-state lane

## Production-host lane
- Record observed source state category only.
- Do not serialize queue item text.
- Do not store source-open URLs.
- Do not expose actor identity in evidence.

## Conditional hosted review-state lane
When enabled:
- capture deterministic fixture-backed empty state,
- capture authorization-required state,
- capture configuration-required state,
- capture source-unavailable state,
- optionally capture principal-unresolved and partial states,
- write screenshot/DOM evidence only from controlled non-sensitive fixture content.

---

# 9.9 Breakpoint lane

## Required views
- home shell,
- focused Adobe queue module,
- at least one state-card view where configured.

## Required measures
- document/client width,
- shell bounds,
- hero bounds,
- active panel bounds,
- bento bounds,
- focused module bounds,
- scroll width vs. client width,
- clipping flags.

## Required issues to detect
- horizontal overflow,
- negative left drift,
- shell/card clipping,
- command surface wrapping that breaks usability,
- CTA loss or off-canvas positioning,
- inaccessible/reflow-broken queue rows.

---

# 9.10 Accessibility lane

## Required behavioral checks
- keyboard access to tabs/module actions,
- visible focus,
- accessible names for primary buttons/links,
- descriptive Adobe link purpose,
- semantic active panel,
- status messaging / `role="status"` where non-disruptive refresh or state updates are used,
- no false affordance implying in-HB approval/signing.

---

# 9.11 Screenshot lane

## Required screenshot classes
- wide desktop My Work Home,
- wide desktop focused Adobe module,
- laptop home,
- tablet state,
- mobile state,
- deterministic empty/auth/degraded state shots when conditional lane is configured.

## Requirements
- pair screenshots with structural metadata,
- suppress/avoid volatile UI where appropriate,
- avoid live queue data capture,
- avoid full-page claims unless scroll evidence proves meaningful coverage,
- maintain explicit review-support posture.

---

# 9.12 Package completeness lane

## Required group status vocabulary
- `present`
- `missing`
- `operator-pending`
- `not-configured`
- `self-skipped`
- `blocked`
- `unavailable`

## Final disposition
Use a controlled disposition such as:
- `expert-review-required`
- `operator-review-required`

Do not output:
- “fully production approved”,
- “hard stops passed”,
- “ship authorized”,

unless a separate explicit governance framework exists and actually calculates that posture.

---

# 10. Environment Variable Specification

# 10.1 Required / defaulted variables

| Variable | Required? | Default if omitted | Purpose |
|---|---:|---|---|
| `MY_DASHBOARD_LIVE_SITE_URL` | No if default locked | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard` | Hosted site origin |
| `MY_DASHBOARD_LIVE_PAGE_URL` | Yes unless default acceptance page is formally locked | None or approved target page default | Exact SharePoint page for hosted validation |
| `MY_DASHBOARD_LIVE_STORAGE_STATE` | No if default external home-path exists | `~/.my-dashboard-live-auth/my-dashboard-live-storage-state.json` | Authenticated browser state path |
| `MY_DASHBOARD_EVIDENCE_OUTPUT_DIR` | No | `docs/architecture/evidence/my-dashboard-live` | Evidence root |
| `MY_DASHBOARD_EXPECTED_PACKAGE_VERSION` | No | Derived from My Dashboard package-solution version | Package/version expectation |
| `MY_DASHBOARD_LIVE_ENABLE_CONDITIONAL` | No | `false` | Enables conditional hosted review-state lane |

# 10.2 Optional variables

| Variable | Purpose |
|---|---|
| `MY_DASHBOARD_LIVE_BRAVE_EXECUTABLE_PATH` | Optional browser executable override when operator uses Brave matching PCC patterns |
| `MY_DASHBOARD_LIVE_EDIT_PAGE_URL` | Optional hosted edit/page authoring lane if later required |
| `MY_DASHBOARD_LIVE_UNAUTHORIZED_STORAGE_STATE` | Optional unauthorized-state lane |
| `MY_DASHBOARD_LIVE_UNAUTHORIZED_PAGE_URL` | Optional unauthorized page proof lane |
| `MY_DASHBOARD_LIVE_REVIEW_PAGE_URL` | Optional deterministic hosted review-state page URL if separate from production page |
| `MY_DASHBOARD_LIVE_REVIEW_MODE` | Optional `ui-review`/equivalent review posture selector only if architecture permits it safely |

# 10.3 Auth-state handling rules

- Auth files must live outside the repository.
- Evidence writers must redact storage-state paths.
- Completeness assemblers must exclude auth/session/token file paths.
- Tooling must self-skip or mark operator-pending rather than writing sensitive auth artifacts into evidence.

---

# 11. Deployment and Readiness Gates

# 11.1 Gate model

| Gate | Meaning | Must pass before |
|---|---|---|
| G0 — Scope lock | Prior batch decisions accepted; B07 validation standard adopted | Detailed implementation prompts |
| G1 — Package scaffold truth | Scaffold/packaging repo truth understood; package metadata corrections recorded | Runtime shell expansion |
| G2 — Model/fixture contract | Shared My Work read models and fixtures locked | Backend and UI implementation can proceed cleanly |
| G3 — Shell contract | My Work shell, state model, selectors, and accessibility semantics implemented/tested | Module integration and hosted shell smoke |
| G4 — Backend route/client contract | Routes, clients, auth posture, envelopes validated | Live module wiring |
| G5 — Adobe provider contract | Adapter/provider/OAuth-seam behavior validated without privacy drift | Production-like Adobe module validation |
| G6 — Package-truth proof | Fresh package proof, marker identity, version alignment, critical paths | Hosted deployment acceptance |
| G7 — SharePoint readiness | Page URL, app deployment, permissions, storage state ready | Hosted Playwright evidence |
| G8 — Hosted evidence | Required production-host and configured conditional lanes complete | Final Definition of Done |
| G9 — Closeout synthesis | Risks, evidence, and operator-pending gaps documented | Final plan synthesis / implementation closeout |

---

# 11.2 Non-parallelizable gates

The following must **not** be shortcut or reordered:

1. **No backend implementation before read-model contract lock.**  
   Routes/providers depend on the envelope and source-state vocabulary.

2. **No real hosted production validation before package and permission readiness.**  
   Without app catalog deployment and permission approval, failures become ambiguous.

3. **No final hosted package-version proof before a runtime version seam exists.**  
   Marker identity alone is insufficient to prove hosted package version.

4. **No “done” status before hosted evidence exists.**  
   Local code/test/package success is not final acceptance.

5. **No curated live evidence that captures real Adobe queue rows.**  
   Privacy/sanitization gates precede evidence curation.

---

# 11.3 Workstreams that may be parallelized

| Workstream | Parallelizable with | Conditions |
|---|---|---|
| Evidence lane scaffolding | Shell/UI implementation | Use agreed selector contract; lane can begin with self-skip placeholders |
| Shared fixtures | UI shell build | Contract vocabulary must be stable |
| Backend route host | Shell component implementation | Model contract already locked |
| Adobe provider tests | UI module visual implementation | Adapter contract agreed; source data mocked |
| Package proof expansion | Runtime shell implementation | Add files as they land; do not freeze scaffold list too early |
| Conditional hosted review-state plan | Production host deployment prep | Does not depend on real production queue state |

---

# 12. Fully Developed Section 26 — Development Phase Sequence

# 12.1 Phase 0 — Scope lock, repo-truth reconciliation, and Batch 07 adoption

## Objective
Make the final implementation plan truthfully reflect:
- current scaffold posture,
- earlier batches,
- Batch 07 validation requirements.

## Required outcomes
- Commit anchor recorded.
- B01–B06 binding decisions recognized.
- B07 artifact adopted as validation/sequence authority.
- Known package-description wording cleanup item recorded.
- Version-proof gap recorded as required implementation enhancement.

## Hard gate
Do not generate implementation prompt chains until this phase is complete.

---

# 12.2 Phase 1 — Package/runtime proof baseline closure

## Objective
Close any remaining deployment-proof weaknesses before the full feature runtime grows.

## Required work
- Preserve existing My Dashboard domain registration in packaging orchestrator.
- Preserve `freshBuildRequired: true`.
- Confirm solution/feature/manifest version alignment posture.
- Correct package metadata wording drift if implementation work includes packaging cleanup.
- Add or plan runtime package version stamp exposure.
- Define the final My Dashboard package-truth proof fields.

## Required validation
- package orchestrator recognizes the domain,
- scaffold `.sppkg` generation remains valid,
- package-truth proof fields are understood,
- hosted version-proof requirement is not forgotten.

## Hard gate
Hosted final acceptance cannot occur until the version-proof seam is implemented.

---

# 12.3 Phase 2 — Shared My Work models, fixture matrix, and test backbone

## Objective
Lock the reusable personal-work contract that both backend and UI consume.

## Required work
- My Work read-model envelopes.
- Home read model.
- Adobe queue read model.
- Source-state vocabulary.
- Summary math.
- Deterministic fixture matrix.
- Model/fixture unit tests.

## Required validation
- model tests,
- fixture scenario tests,
- action/status mapping tests,
- summary calculation tests.

## Parallelization
Can proceed in parallel with:
- initial shell visual scaffolding,
provided the model vocabulary is not altered casually.

---

# 12.4 Phase 3 — My Work shell, navigation state, selector contract, and accessibility foundation

## Objective
Implement the reusable personal command surface before binding in the Adobe module complexity.

## Required work
- My Work shell composition.
- Hero band.
- Horizontal tabs/module launcher if retained by final implementation.
- Active panel semantics.
- Bento canvas and surface router.
- `useMyWorkShellState`.
- Namespaced `data-my-work-*` evidence markers.
- Shell-level responsive policy.

## Required validation
- shell state tests,
- navigation normalization tests,
- semantic copy tests,
- active panel tests,
- no duplicate panel owner tests,
- basic responsive unit/component tests where practical.

## Parallelization
Can overlap with:
- backend route scaffolding,
- Playwright lane scaffolding.

---

# 12.5 Phase 4 — Frontend My Work clients and backend read-model route host

## Objective
Connect the shell to typed read-model sources while preserving the backend-mediated and auth-derived actor posture.

## Required work
- frontend client factory,
- fixture client,
- backend client,
- production readiness handling,
- My Work backend route host,
- two exact GET routes,
- query validation,
- provider interface,
- mock provider for deterministic scenarios.

## Required validation
- frontend API client tests,
- backend route registration tests,
- GET-only posture,
- auth wrapper posture,
- no actor override posture,
- envelope/error taxonomy posture.

## Hard gate
No live Adobe provider wiring should be treated as valid before this phase passes.

---

# 12.6 Phase 5 — Adobe Sign Action Queue UI module and source-state UX

## Objective
Deliver the first production-shaped user-specific external work queue in a controlled shell context.

## Required work
- Adobe dashboard card.
- Focused Adobe queue module.
- Summary component.
- Queue row/list component.
- Empty/configuration/authorization/principal/source-unavailable/partial state cards.
- CTA logic for source links.
- Manual refresh UI only in the focused module.
- Long-title and missing-field layout resilience.

## Required validation
- UI component tests,
- state-card tests,
- CTA visibility/accessibility tests,
- focused module workflow tests,
- refresh interaction tests.

## Parallelization
Can proceed with Phase 6 provider implementation where the adapter contract is already locked, using fixtures until the provider is ready.

---

# 12.7 Phase 6 — Adobe provider seam, OAuth/principal resolution support, and operational resilience

## Objective
Implement the backend integration architecture defined in B05/B06 without weakening privacy or state semantics.

## Required work
- provider interface implementation,
- Adobe status adapter,
- agreement search client,
- principal resolver,
- OAuth/token seam if required for the MVP execution scope,
- source URL governance,
- throttling/retry behavior,
- sanitized provider errors,
- authorization-required mapping,
- no durable queue cache.

## Required validation
- provider/adapter tests,
- throttling and refresh-failure mapping tests,
- no raw provider-body leakage tests where practical,
- source URL validation tests,
- telemetry-safe error classification tests.

## Hard gate
Do not claim live source readiness until:
- provider seam tests pass,
- auth/config prerequisites are actually available,
- failure modes map correctly to read-model states.

---

# 12.8 Phase 7 — Local integrated validation and package-critical path expansion

## Objective
Before deployment, reconcile the full runtime into package proof and run integrated local validation.

## Required work
- update My Dashboard critical runtime path list to reflect the real shell/client/module implementation,
- run complete code/test matrix,
- verify no scaffold-era path list remains too narrow,
- confirm package metadata and runtime version seam,
- package build/proof local run.

## Required validation
- typecheck/build/test sweep,
- package-truth proof generation,
- runtime marker/version fields present in output as designed.

## Hard gate
Do not advance to hosted acceptance with a stale critical-runtime path list.

---

# 12.9 Phase 8 — SharePoint deployment readiness and hosted production lane

## Objective
Deploy the package into the intended host class and prove the real page loads the intended runtime.

## Required work
- app catalog / deployment action,
- API permission approval if production backend lane is included,
- target page insertion in full-width section,
- external storage-state auth setup,
- environment configuration,
- hosted runtime proof lane,
- hosted surface smoke lane.

## Required validation
- site/page accessible,
- runtime marker ID/version proof,
- host fit,
- shell/card/module structural smoke,
- origin drift protection,
- runtime/page error summary.

## Hard gate
Hosted acceptance cannot be bypassed with local or workbench evidence.

---

# 12.10 Phase 9 — Hosted responsive, accessibility, workflow, and screenshot evidence

## Objective
Complete the hosted evidence package with structural proof that the runtime works across the designed page and viewport conditions.

## Required work
- breakpoint evidence,
- no-horizontal-overflow/no-clipping proof,
- workflow proof,
- accessibility lane,
- curated screenshot evidence,
- conditional review-state lane where configured,
- package-completeness report.

## Required validation
- evidence files exist,
- unsafe artifacts excluded,
- screenshots paired with DOM measurements,
- conditional gaps marked operator-pending if not configured,
- completeness disposition generated.

---

# 12.11 Phase 10 — Closeout synthesis and final Definition of Done

## Objective
Convert implementation and evidence into a truthful release posture.

## Required work
- final DoD evaluation,
- risk register status update,
- unresolved operator-pending items documented,
- downstream plan synthesis updated,
- any non-final acceptance disclaimers preserved.

## Final release posture
Only after this phase may the initiative be described as:
- implementation-complete,
- hosted-validation-complete,
- evidence-curated,
- ready for the next synthesis or rollout decision.

---

# 13. Hosted-Validation Refinements to Section 27 — Risk Exposure Register

## 13.1 New or strengthened risks

| Risk | Why it matters | Mitigation / required proof |
|---|---|---|
| Local-only false confidence | Full-width communication-site layout cannot be proven in workbench | Hosted MyDashboard page evidence required |
| Package/runtime drift | Built package may differ from hosted runtime | Package truth + runtime marker/version proof |
| Runtime version not self-proving | Current marker identity does not prove hosted package version | Add runtime version seam; hosted assertion |
| Critical runtime path list too narrow | Proof may ignore files that materially change runtime behavior | Expand list as shell/client/module lands |
| Horizontal clipping after navigation | PCC proved clipping can begin after state transition | Bounds/overflow checks after module navigation |
| Full-page screenshot false completeness | PCC proved image output may not prove actual scroll coverage | Pair screenshots with scroll/bounds evidence |
| Auth/session artifact leakage | Storage state can impersonate test account | External auth path; redaction; unsafe-path filtering |
| Real queue-content evidence leakage | Agreement names/senders/source URLs can be sensitive | No live queue payload curation; review-state fixtures for screenshots |
| Deterministic state lane absent | Production page may not naturally show empty/auth/degraded states | Conditional review-state lane; operator-pending status when absent |
| Ambiguous CTA link purpose | “Open” is not sufficient | Descriptive source-link text and accessibility tests |
| Status updates inaccessible | Refresh/degraded updates may not be announced | `role=status`/approved live-region testing where used |
| Deployment page drift | Evidence may target a different page than production | Exact page URL env and documented acceptance page |
| Permissions not approved | Backend failures may be misread as app failures | Deployment readiness gate before hosted production validation |
| Overclaiming from evidence completeness | Completeness report could be misread as release authority | Explicit review-support disclaimer posture |

---

# 14. Downstream Constraints for Final Synthesis

The final comprehensive My Dashboard development plan must incorporate these Batch 07 constraints without reopening them casually:

1. **Validation is layered.**
   - Unit/integration/package/hosted evidence are all required.
   - No single lane substitutes for the others.

2. **Hosted communication-site proof is mandatory.**
   - Workbench/local proof is insufficient for final acceptance.

3. **Runtime package version proof must be implemented.**
   - Marker ID alone is not enough.

4. **Critical runtime package proof must evolve with the implementation.**
   - The current scaffold path list must not remain the final list after shell/module/client code lands.

5. **Live user queue data may not be serialized into curated evidence.**
   - Structural/source-state proof is allowed.
   - Sensitive queue content is not.

6. **Conditional state evidence must use deterministic safe review paths or be marked operator-pending.**
   - Never fake production proof.

7. **Screenshot evidence must be supported by structural metrics.**
   - No image-only acceptance.

8. **The phase sequence is dependency-driven.**
   - Gates must survive prompt packaging and agent execution.

9. **Risk Section 27 must retain hosted-validation risks.**
   - This is not a documentation footnote; it is an execution control.

10. **Definition of Done must remain strict.**
    - Final closeout requires hosted curated evidence and readiness proof.

---

# 15. Source Register

## 15.1 Web sources cited in this artifact

- **[W1]** Microsoft Learn — *Use web parts with the full-width column*.
- **[W2]** Playwright — *Authentication*.
- **[W3]** Playwright — *Locators*.
- **[W4]** Playwright — *Visual comparisons*.
- **[W5]** WAI-ARIA Authoring Practices — *Tabs Pattern*.
- **[W6]** WAI/W3C Technique ARIA22 — *Using role=status to present status messages*.
- **[W7]** WAI/W3C Technique G91 — *Providing link text that describes the purpose of a link*.

## 15.2 Repo authorities referenced in this artifact

- `apps/my-dashboard/src/mount.tsx`
- `apps/my-dashboard/src/MyDashboardApp.tsx`
- `apps/my-dashboard/src/config/runtimeConfig.ts`
- `apps/my-dashboard/src/config/productionReadiness.ts`
- `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json`
- `apps/my-dashboard/config/package-solution.json`
- `tools/build-spfx-package.ts`
- `e2e/pcc-live/pcc-live.env.ts`
- `e2e/pcc-live/pcc-live.page-object.ts`
- `e2e/pcc-live/pcc-live.conditional.spec.ts`
- `e2e/pcc-live/pcc-live.package-completeness.ts`
- PCC screenshot reliability evidence and forensics closeout
- PCC route/view-model test patterns

---

# 16. Final Closed-Decision Summary

Batch 07 closes the My Dashboard validation/evidence/phase-sequencing posture as follows:

- My Dashboard gets its own hosted evidence lane under `e2e/my-dashboard-live/`.
- Hosted proof on the SharePoint communication site is a hard gate.
- The existing B02 scaffold is recognized as repo truth.
- The runtime marker must become version-aware before final hosted acceptance.
- Package truth must expand with the real shell/client/module surfaces.
- Test categories are exact and mandatory.
- Hosted checks are exact and include runtime proof, shell smoke, focused workflow, responsive/no-overflow, accessibility, and sanitized evidence.
- User-specific Adobe queue evidence must never become a privacy leak.
- The development sequence is dependency-gated and designed to prevent late-stage hosted surprises.
- Final “done” status requires evidence, not inference.

