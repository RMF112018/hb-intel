# @hbc/spfx-my-dashboard

Standalone SPFx app domain for the HB Intel **My Dashboard** surface, hosted
on the SharePoint **MyDashboard** communication site as a full-width
section on the site home page.

## Scope (B02)

B02 is the **runtime/package/auth foundation** batch for this app. This
package is brought into existence at B02 to carry:

- The standalone SPFx package/manifest identity (`hb-intel-my-dashboard.sppkg`).
- The runtime configuration and production-readiness primitives (Prompt 02).
- The `mount.tsx` bootstrap with the protected-API token-provider seam (Prompt 03).
- The packaging-orchestrator/domain-registry/runtime-marker integration (Prompt 04).
- B02 closeout and packaging-validation posture (Prompt 05).

**B02 does NOT implement:**

- My Work shell UI, navigation, router state, or queue UI.
- Adobe Sign Action Queue UI or Adobe OAuth/provider/token-store machinery.
- Backend `/api/my-work/me/...` routes.
- Microsoft Graph / PnP / SharePoint REST runtime.
- Procore / Document Crunch runtime.
- Read-model contracts beyond compile safety.
- SharePoint page authoring.
- Hosted Playwright evidence lane.
- Any property-pane configuration surface.

UI shell, navigation, read models, backend routes, and provider wiring are
delivered by **later batches (B03 – B08)** built on top of this foundation.

## Identity

| Field | Value |
| --- | --- |
| Workspace package | `@hbc/spfx-my-dashboard` |
| SPFx solution name | `hb-intel-my-dashboard` |
| Package artifact | `solution/hb-intel-my-dashboard.sppkg` |
| Web-part alias | `MyDashboardWebPart` |
| Toolbox group | HB Intel |
| Target host | SharePointWebPart (full-bleed, MyDashboard communication-site home) |

## Protected API posture

The package declares the following web-API permission request, consumed
once the runtime auth bootstrap lands in Prompt 03:

| Resource | Scope |
| --- | --- |
| `hb-intel-api-production` | `access_as_user` |

No live API call is issued from this app at B02 Prompt 01. Provider, token
store, and bootstrap-time auth handshake land in later prompts of this
batch and are gated by a B02-level integration plan.

## File Tree (B02 Prompt 01 scaffold)

```text
apps/my-dashboard/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── config/
│   └── package-solution.json
└── src/
    └── webparts/
        └── myDashboard/
            └── MyDashboardWebPart.manifest.json
```

`src/mount.tsx`, `src/MyDashboardApp.tsx`, and any runtime config / token
provider / read-model client land in Prompts 02 – 04 of B02.
