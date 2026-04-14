# Closure Note — Phase 06 UI / Phase 0 / Prompt 02

**Step:** Close visible naming and branding drift (Wave 0 Step 02)
**Status:** Closed. No author-facing rebrand drift remains in scope; no
runtime code change required.

## Audit summary

A repo-truth scan of the touched seams listed in the prompt found **no
author-facing UI string or label that still identifies the app as "Project
Spotlight Publisher" or uses drifted terms like "Untitled spotlight"**.

### Findings by category

1. **App identity strings** — already rebranded.
   - `ArticlePublisherWebPart.manifest.json` → `title.default = "Article
     Publisher"`, group `"HB Intel"`.
   - `ArticlePublisher.tsx` page heading fallback uses `"(Untitled)"` and
     the default draft title is `"Untitled article"` — no "Untitled
     spotlight" string remains anywhere under `apps/hb-webparts/src`.
   - `mount.tsx` registers the webpart under the rebranded identity; no
     legacy app-name leak.

2. **Destination-subject language** — allowed by the prompt and preserved.
   - `Project Spotlight` appears only where the destination is the subject,
     e.g. webpart description `"Current sprint supports Project Spotlight
     article workflows, hosted on the HBCentral publisher page..."`,
     `SpotlightType` field labels, `Destination='projectSpotlight'` default,
     and destination-identity comments in `publisherEnums.ts` /
     `publisherAdapter/index.ts`. These are legitimate destination labels,
     not app-identity labels.
   - The ProjectPortfolioSpotlight homepage webpart and the
     `HbcProjectSpotlightSurface` ui-kit surface are the destination render
     targets and remain named for the destination by design.

3. **Technical GUID lineage** — intentionally retained in a comment.
   - `runtimeContract.ts` keeps a single block comment noting the GUID was
     preserved from the original "Project Spotlight Publisher" identity so
     deployment lineage stays stable. The comment is purely technical and
     is explicitly sanctioned by Prompt 02 ("Keep legacy deployment
     lineage confined to technical comments where justified.").

### Acceptance criteria mapping

| Criterion | Result |
|-----------|--------|
| No author-facing UI string suggests the app is still named `Project Spotlight Publisher` | Verified — zero occurrences under `apps/hb-webparts/src` |
| Destination-specific language used only where the destination is the subject | Verified — all remaining `Project Spotlight` usage refers to destination identity, field values, or content-type semantics |
| Manifest/runtime identity remains technically correct while UI is consistently rebranded | Verified — webpart GUID, alias, and manifest title remain stable; author-facing title is `Article Publisher` |

## Files changed

None (runtime code). Only the closure note is added:

- `docs/architecture/plans/MASTER/spfx/publisher/phase-06-UI/phase-0/Closure-Prompt-02.md`

## Implementation summary

No rebrand drift was found in the focus seams, so no code remediation was
required. Prompt 01 regenerated the hosted bundle against the current
rebranded source, so the hosted authoring surface now presents the already
clean strings. This note constitutes the naming audit required by the
step's deliverables.

## Validation performed

- `grep -in "Untitled spotlight\|Project Spotlight Publisher\|Spotlight
  Publisher"` across `apps/hb-webparts` → only the single sanctioned
  technical comment in `runtimeContract.ts`.
- `grep -in "spotlight"` across
  `apps/hb-webparts/src/webparts/articlePublisher` → only destination,
  content-type, and field-value usages.
- `grep -n "Untitled"` across `apps/hb-webparts/src` → `"Untitled
  article"` and `"(Untitled)"` only; no "Untitled spotlight" drift.

## Hosted / deployment follow-up

None specific to this step. The refreshed hosted bundle already produced
by Prompt 01 (feature `1.0.0.264` / solution `1.0.0.253`) carries the
already rebranded strings; no additional redeploy is required for Prompt
02's findings.

## Residual risk

None. All author-facing surfaces present the product as Article Publisher
while the destination remains correctly labeled Project Spotlight. If a
future destination is added, it will need its own clearly scoped label
separate from the app identity — the current code base already supports
that by modeling destinations as a `Destination` enum rather than baking
any destination name into the app chrome.
