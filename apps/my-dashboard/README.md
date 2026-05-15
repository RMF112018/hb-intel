# @hbc/spfx-my-dashboard

Standalone SPFx app domain for the HB Intel **My Dashboard** surface,
hosted on the SharePoint **MyDashboard** communication site as a
full-bleed section on the site home page.

## What this is

A single-page personal launch pad. The app renders one primary surface —
**My Work** — composed of a compact personalized greeting header and a
two-card bento grid:

1. **My Projects** — assigned projects with dual SharePoint + Procore
   launch handoffs.
2. **Adobe Sign Action Queue** — pending agreements that need the user's
   signature, approval, acceptance, acknowledgement, form-filling, or
   delegation.

There is no visible tab navigation, no module dropdown launcher, and no
focused-module route. Each card owns its full state matrix (loading,
unavailable, authorization-required, configuration-required,
principal-unresolved, partial, empty, populated) inline on the home
page.

## Current rendered posture

- **Header.** `MyWorkHeroBand` — authenticated time-of-day personalized
  greeting (no telemetry strip, no governance microcopy lane).
- **Body.** `MyWorkBentoGrid` containing exactly two production cards in
  static order: My Projects → Adobe Sign Action Queue.
- **Span choreography.** Locked per responsive mode via
  `MyWorkCardSpanOverrides` declared in
  `src/surfaces/home/MyWorkHomeSurface.tsx`:

  | Mode | My Projects | Adobe Sign |
  | --- | ---: | ---: |
  | phone | 1 | 1 |
  | tabletPortrait | 2 | 2 |
  | tabletLandscape | 6 | 6 |
  | smallLaptop | 8 | 8 |
  | standardLaptop | 6 | 4 |
  | largeLaptop | 7 | 5 |
  | desktop | 7 | 5 |
  | ultrawide | 7 | 5 |

- **Envelope-state variants.** When the read-model envelope is loading
  or in error, only the Adobe Sign card renders (it owns its loading
  and backend-unavailable states); My Projects rejoins as soon as the
  envelope resolves.

## Source-of-record handoff

The app renders launch affordances; it does not own the source systems.

- My Projects launches **SharePoint** and **Procore** via per-row
  read-model action items. Anchors are policy-approved, backend-derived
  URLs only — no synthesized handoffs.
- Adobe Sign agreement rows expose an `Open in Adobe Sign` anchor when
  the read-model item supplies a `sourceOpenUrl`; otherwise no anchor is
  rendered.

## Authentication

- Web API permission request: `HB SharePoint Creator` (scope
  `access_as_user`).
- Adobe Sign OAuth start is shell-wired (`MyWorkShell.onConnectAdobeSign`
  → backend `POST /api/my-work/me/adobe-sign/oauth/start`). The
  consolidated Adobe Sign card renders the **Connect Adobe Sign** CTA
  only when `sourceStatus === 'authorization-required'` AND the shell
  supplies the callback.

## Identity

| Field | Value |
| --- | --- |
| Workspace package | `@hbc/spfx-my-dashboard` |
| SPFx solution name | `hb-intel-my-dashboard` |
| Package artifact | `solution/hb-intel-my-dashboard.sppkg` |
| Web-part alias | `MyDashboardWebPart` |
| Toolbox group | HB Intel |
| Target host | SharePointWebPart (full-bleed, MyDashboard
  communication-site home) |

The SPFx manifest version is owned by `config/package-solution.json`.
Package-local commands below do not generate the `.sppkg` artifact;
SPFx packaging is a separate lane.

## Source tree

```text
apps/my-dashboard/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── config/
│   └── package-solution.json
└── src/
    ├── api/                  Backend read-model client + factory.
    ├── layout/               MyWorkBentoGrid, MyWorkCard, footprints,
    │                         container-breakpoint hook.
    ├── modules/
    │   ├── adobeSign/        Consolidated AdobeSignActionQueueCard.
    │   └── myProjects/       MyProjectsHomeCard (compressed launch pad).
    ├── runtime/              Read-model client provider, callback hook,
    │                         data-path stamping.
    ├── shell/                MyWorkShell, surface router, hero band,
    │                         OAuth callback banner, active-envelope
    │                         context.
    ├── state/                Pure selectors / view-models, source-status
    │                         copy, surface readiness, shell state hook.
    └── surfaces/home/        MyWorkHomeSurface (composes the two-card
                              bento under the locked choreography).
```

## Validation

Run from the repo root:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
```

- `check-types` — `tsc --noEmit`.
- `test` — Vitest run against `src/**/*.test.tsx?`.
- `build` — `tsc --noEmit && vite build` (package-local TypeScript +
  Vite build). Does **not** run SPFx gulp bundling and does **not**
  produce the `.sppkg` artifact; SPFx packaging is performed by a
  separate command in the packaging closeout lane.

Hosted-tenant evidence (app catalog upload, `.sppkg` upload, real
SharePoint screenshot proof) is operator-pending and is not produced by
the package-local commands above.

## Reference docs

Operator and diagnostic references that ship with this app live under:

- `docs/reference/spfx-surfaces/my-dashboard/adobe-sign-authorization-required-flow.md`
- `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md`
- `docs/reference/spfx-surfaces/my-dashboard/my-projects-diagnostics.md`
- `docs/reference/spfx-surfaces/my-dashboard/data-path-diagnostic.md`
