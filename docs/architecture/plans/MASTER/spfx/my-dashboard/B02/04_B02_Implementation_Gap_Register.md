# 04 — B02 Implementation Gap Register

## Objective

Enumerate the concrete repo gaps that the B02 prompt package must close. This register is intended to prevent the implementation agent from either under-scoping the work or inventing unrelated work.

---

## Gap register

| ID | Gap | Current repo-truth posture | B02 resolution | Prompt |
|---|---|---|---|---|
| B02-G01 | No runtime `apps/my-dashboard` domain | absent | create app package scaffold | P01 |
| B02-G02 | No My Dashboard SPFx package solution | absent | create standalone package-solution JSON | P01 |
| B02-G03 | No My Dashboard web-part manifest | absent | create SharePoint-only, full-bleed manifest | P01 |
| B02-G04 | No My Dashboard runtime config/readiness | absent | implement injection/env fallback + readiness contract | P02 |
| B02-G05 | No My Dashboard mount/auth bootstrap | absent | implement SPFx context/auth/token provider/global runtime marker | P03 |
| B02-G06 | No My Dashboard runtime marker | absent | expose `runtimeMarkerId` matching manifest GUID | P03 |
| B02-G07 | No My Dashboard orchestrator domain entry | absent | register domain in `tools/build-spfx-package.ts` | P04 |
| B02-G08 | No My Dashboard package-truth critical path set | absent | add critical runtime path fingerprints | P04 |
| B02-G09 | No My Dashboard runtime marker proof mapping | absent | add runtime marker registry mapping | P04 |
| B02-G10 | No compile/package validation for new domain | absent until implementation | run app checks/build/package proof if toolchain allows | P05 |

---

## Non-gaps that should **not** be solved in B02

| Item | Why not B02 |
|---|---|
| My Work shell components | B03 shell batch |
| My Work navigation registry/state/router | later shell/navigation batch |
| My Work read-model domain package | later read-model batch |
| Backend `/api/my-work/me/...` host | later backend batch |
| Adobe Sign provider/OAuth/token store | Adobe integration batch |
| Adobe Sign queue cards and focused module | queue UI batch |
| Hosted Playwright evidence suite | hosted validation/evidence batch |
| Actual SharePoint page deployment | operator/deployment event after package exists |

---

## Gaps likely to tempt overreach

### Temptation 1 — creating a fake queue to make the app look useful
Do not do this. B02 is a runtime foundation. Fake Adobe data would become throwaway code and could mislead downstream implementation.

### Temptation 2 — building read-model clients because Section 7 sketches future API folders
Do not assume B02 must instantiate every future directory in the comprehensive outline. Section 7 establishes placement; B02 implementation should create only what is necessary for the runtime/package/auth foundation.

### Temptation 3 — exposing deployment config in the property pane
Do not do this. B02 explicitly keeps backend URL, audience, mode, and integration authority out of page-author controls.

### Temptation 4 — inventing a new My Dashboard-specific public env namespace
Do not do this. The current shell injection pattern already standardizes shared build/env names.

---

## Practical resolution rule

If the implementation agent encounters a choice not explicitly covered here:

1. inspect the B02 artifact,
2. inspect the nearest live repo precedent,
3. prefer the smallest implementation that satisfies B02 without preempting later batches,
4. document the decision in the closeout.
