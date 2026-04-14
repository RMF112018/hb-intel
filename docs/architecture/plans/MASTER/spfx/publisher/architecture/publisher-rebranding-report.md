# Publisher Rebranding Report — `projectSpotlightPublisher` → `articlePublisher`

## 1. Objective
Pure rebrand of the publisher webpart app from the narrow identity **Project Spotlight Publisher** to the generic **Article Publisher** identity. The app continues to support the Project Spotlight article workflow that the first sprint implemented, and is now named/described in a way that lets a future sprint extend it to additional article destinations (e.g. Company Pulse) without further renaming.

No functional, architectural, workflow, destination, schema, validation, or UX changes were made.

## 2. Scope

### In scope
- Webpart package directory and file names in `apps/hb-webparts/src/webparts/`
- Component, props type, and runtime-contract constant names
- Manifest alias, title, and description for both the source manifest and the packaged release manifest
- Mount-map imports and registration comment in `apps/hb-webparts/src/mount.tsx`
- CSS module file name and import
- Code header comments that framed the app as permanently Project-Spotlight-only
- SPFx feature + solution version bumps for the packaged change

### Explicitly out of scope (intentionally preserved)
- `'projectSpotlight'` destination/site-key values (e.g. `TARGET_SITE_KEY_VALUES`, `TargetSiteKey: 'projectSpotlight'`) — these describe the Project Spotlight *destination*, which is still a real, shipped destination. Renaming them would be a functional change.
- `composeProjectSpotlightPage`, `parseProjectSpotlightShellXml`, and all `publisherAdapter/**` tests that reference Project Spotlight destination logic — destination-specific, not app-identity.
- `packages/sharepoint-docs/infrastructure/provision-project-spotlight-publisher-lists.ps1` — filename reflects the *destination* lists the script provisions on the ProjectSpotlight site, not the publisher-app identity. Retained unchanged; the single comment in `publisherAdapter/publisherEnums.ts` that points to this script name was also retained so the pointer still resolves.
- `packages/ui-kit/**` `HbcProjectSpotlightSurface` / `useProjectSpotlightData` / `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/**` — unrelated homepage display surfaces, not part of the publisher app.
- Historical wave evidence under `docs/architecture/plans/MASTER/spfx/publisher/phase-01/evidence/**` and the phase-02 audit — frozen point-in-time records of work done under the old name. Left untouched so history reads accurately.
- SPFx web part GUID — see §5.

### Explicit non-goals
- No business logic, publish logic, workflow logic, page-binding logic, shell/template behavior, list schemas, validation, or supported destinations were touched.
- No nearby-code "cleanup" outside what the rename strictly required.

## 3. Files changed

Source webpart (directory renamed `projectSpotlightPublisher/` → `articlePublisher/`):
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` — renamed from `ProjectSpotlightPublisher.tsx`; header doc, interface name, component name, and CSS-module import updated.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json` — renamed from `ProjectSpotlightPublisherWebPart.manifest.json`; alias, title, and description updated; GUID preserved.
- `apps/hb-webparts/src/webparts/articlePublisher/index.ts` — updated barrel exports to the new symbols.
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts` — const name updated, header comment updated, GUID value unchanged; added a brief note that the GUID is preserved across the rebrand.
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css` — renamed from `project-spotlight-publisher.module.css`; header comment updated.
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css.d.ts` — renamed (contents unchanged).

Consumers:
- `apps/hb-webparts/src/mount.tsx` — import paths + const name + registration comment updated. Registration continues to key the same GUID into the mount map.

Release manifest copy (file name is the GUID; retained):
- `tools/spfx-shell/release/manifests/1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10.manifest.json` — `alias`, `preconfiguredEntries.title`, and `preconfiguredEntries.description` updated to the Article Publisher branding.

Packaging version bumps (4-part SharePoint schema):
- `tools/spfx-shell/config/package-solution.json` — solution `1.0.0.209 → 1.0.0.210`; feature `1.0.0.220 → 1.0.0.221`.

New doc:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/publisher-rebranding-report.md` — this report.

## 4. Symbol / name changes

| Old | New |
|-----|-----|
| `projectSpotlightPublisher/` (dir) | `articlePublisher/` |
| `ProjectSpotlightPublisher` (component) | `ArticlePublisher` |
| `ProjectSpotlightPublisherProps` (interface) | `ArticlePublisherProps` |
| `PROJECT_SPOTLIGHT_PUBLISHER_WEBPART_ID` (const) | `ARTICLE_PUBLISHER_WEBPART_ID` |
| `ProjectSpotlightPublisherWebPart` (manifest alias) | `ArticlePublisherWebPart` |
| `ProjectSpotlightPublisher.tsx` | `ArticlePublisher.tsx` |
| `ProjectSpotlightPublisherWebPart.manifest.json` | `ArticlePublisherWebPart.manifest.json` |
| `project-spotlight-publisher.module.css` | `article-publisher.module.css` |
| `project-spotlight-publisher.module.css.d.ts` | `article-publisher.module.css.d.ts` |
| Header comment: "Project Spotlight Publisher — authoring surface (v1)." | "Article Publisher — authoring surface for structured article publishing." |

Exports from the barrel (`index.ts`):
| Old | New |
|-----|-----|
| `export { ProjectSpotlightPublisher }` | `export { ArticlePublisher }` |
| `export type { ProjectSpotlightPublisherProps }` | `export type { ArticlePublisherProps }` |
| `export { PROJECT_SPOTLIGHT_PUBLISHER_WEBPART_ID }` | `export { ARTICLE_PUBLISHER_WEBPART_ID }` |

## 5. Manifest / package changes

| Field | Before | After |
|-------|--------|-------|
| Source manifest `alias` | `ProjectSpotlightPublisherWebPart` | `ArticlePublisherWebPart` |
| Source manifest `preconfiguredEntries.title.default` | `Project Spotlight Publisher` | `Article Publisher` |
| Source manifest `preconfiguredEntries.description.default` | `Authoring surface for Project Spotlight posts. Hosted on the HBCentral publisher page; writes the post master + child records and publishes pages on the ProjectSpotlight site.` | `Authoring surface for structured article publishing. Current sprint supports Project Spotlight article workflows, hosted on the HBCentral publisher page; future sprints may extend to additional article destinations such as Company Pulse.` |
| Release manifest `alias` | `ProjectSpotlightPublisherWebPart` | `ArticlePublisherWebPart` |
| Release manifest title/description | as above | as above |
| Solution version | `1.0.0.209` | `1.0.0.210` |
| Feature version | `1.0.0.220` | `1.0.0.221` |

**GUID preservation.** The SPFx web part ID `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10` is unchanged in every location where it appears (source manifest `id`, release manifest `id`, release manifest file name, `package-solution.json` `componentIds[]`, mount-map key, `runtimeContract.ts` value). Deployment lineage is continuous — this is a rebrand of the existing webpart, not a new product identity.

No technical blocker to GUID preservation was encountered.

## 6. User-facing copy changes

- **Title**: "Project Spotlight Publisher" → "Article Publisher". The title no longer frames the app as permanently limited to a single destination.
- **Description**: Rewritten to describe the app generically as an authoring surface for structured article publishing, while truthfully naming Project Spotlight as the current-sprint destination.
- **Future-destination framing**: Company Pulse is named only as a *possible future extension* — no copy claims it is already implemented.
- **Header comments** in `ArticlePublisher.tsx`, `runtimeContract.ts`, `article-publisher.module.css`, and `mount.tsx` were updated to match this framing.
- Internal UI labels within the component (tab names, form field labels, workflow badges, etc.) were **not** changed; those describe the authoring surface's controls, not the app's identity.

## 7. Verification

Performed in the live repo:

1. **Scoped grep** across `apps/**` and `tools/spfx-shell/release/**` for `projectSpotlightPublisher` / `ProjectSpotlightPublisher` / `PROJECT_SPOTLIGHT_PUBLISHER` / `project-spotlight-publisher`: the only remaining hits are the two intentionally retained ones — the out-of-scope PowerShell provisioning script name in `packages/sharepoint-docs/**` and its single reference comment in `publisherAdapter/publisherEnums.ts`, plus a deliberate single lineage-note reference inside the new `runtimeContract.ts` comment. Historical docs under `docs/architecture/plans/MASTER/spfx/publisher/phase-01/evidence/**` and `phase-02/audit/**` were intentionally not rewritten.
2. **Typecheck**: `pnpm --filter @hbc/spfx-hb-webparts check-types` (`tsc --noEmit`) — clean, zero errors. Confirms imports, exports, registration const, CSS module import, and consumer wiring all resolve under the new names.
3. **Tests**: `pnpm --filter @hbc/spfx-hb-webparts test` — 600 passing / 17 pre-existing failures. The 17 failures are identical before and after the rename (verified by stashing changes and rerunning), and none reference the publisher app or its symbols. No new regressions were introduced by the rename.
4. **Mount registration check**: `WEBPART_RENDERERS[ARTICLE_PUBLISHER_WEBPART_ID]` still maps to `ArticlePublisher` at the preserved GUID `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10`.
5. **Manifest integrity check**: source manifest `id`, release manifest `id`, release manifest filename, `package-solution.json` `componentIds[]` entry, and the runtime-contract value all still equal the preserved GUID.
6. **Packaging versions**: solution and feature versions bumped in `tools/spfx-shell/config/package-solution.json` (4-part SharePoint scheme).

Residual low-risk leftovers (intentional, flagged here for future readers):
- `packages/sharepoint-docs/infrastructure/provision-project-spotlight-publisher-lists.ps1` (destination-scoped filename).
- Historical wave/audit docs that reference the old app name as the name it had at the time.

## 8. Outcome

Rebrand is complete. The Article Publisher app has a generic, destination-neutral identity; the Project Spotlight article workflow continues to work unchanged; the SPFx web part GUID, manifest linkage, mount registration, and packaging are intact; and no functional behavior was modified.

Follow-up recommendations (only if and when a later sprint picks them up): evaluate whether the `provision-project-spotlight-publisher-lists.ps1` script should be renamed alongside any future Company Pulse list-provisioning script, as a deliberate destination-provisioning-naming pass — not part of this rebrand.
