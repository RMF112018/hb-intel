# 05 — Template Registry Schema

## Purpose

The template registry no longer branches primarily by destination. It now resolves **Project Spotlight post families** onto a **Project Spotlight-compatible page shell**.

## Canonical shell authority

The current canonical shell is sourced from the Project Spotlight XML/page-template artifact:

- shell source site: `https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight`
- shell source page path: `SitePages/Templates/Project-Spotlight---In-Progress.aspx`

Treat that shell as:

- the canonical page-shell source
- the structural baseline for generated post pages
- the authority for current block order and current block presence
- the basis for shell-version tracking and regeneration rules

## Recommended template model

Separate these concepts:

### A. `PageShellKey`
Identifies the structural shell.

Example:
- `ps-shell-inprogress-oob-banner-team-gallery-v1`

### B. `TemplateKey`
Identifies the business/content profile that uses the shell.

Examples:
- `ps-inprogress-monthly-v1`
- `ps-inprogress-milestone-v1`
- `ps-inprogress-project-update-v1`

This separation allows multiple Project Spotlight content families to reuse the same shell while enforcing different field requirements.

## Current canonical shell block map

| Shell Slot | Current Block Owner | Source from XML | Notes |
|---|---|---|---|
| `banner` | SharePoint OOB Page Title / banner | Yes | Full-width image layout |
| `subhead` | SharePoint OOB Text | Yes | Single text block for subheading |
| `body` | SharePoint OOB Text | Yes | Single primary body block |
| `team` | `teamViewer` | Yes | Custom web part slot exists in shell |
| `gallery` | SharePoint OOB Image Gallery | Yes | Dedicated gallery section exists |

## Recommended control map payload

Store a control-map JSON payload in the registry so the generation engine knows which logical content goes into which shell control.

### Suggested logical mapping
```json
{
  "shellKey": "ps-shell-inprogress-oob-banner-team-gallery-v1",
  "controls": {
    "banner": {
      "webPartType": "PageTitle",
      "controlId": "cbe7b0a9-3504-44dd-a3a3-0e5cacd07788"
    },
    "subhead": {
      "webPartType": "Text",
      "controlId": "00dbc510-122b-4798-9d90-241e291eedc1"
    },
    "body": {
      "webPartType": "Text",
      "controlId": "d4061c71-b2b5-4e25-804d-ae92e8a56832"
    },
    "team": {
      "webPartType": "Custom",
      "controlId": "c2f1b4e7-3a48-4d21-9c5e-7b82d4a6f901"
    },
    "gallery": {
      "webPartType": "ImageGallery",
      "controlId": "af8be689-990e-492a-81f7-ba3e4cd3ed9c"
    }
  }
}
```

## Example template registry rows

### 1. `ps-inprogress-monthly-v1`

**Applies when**
- `PostFamily = monthlySpotlight`
- `SpotlightType = inProgress`
- shell compatibility = `ps-shell-inprogress-oob-banner-team-gallery-v1`

**Block profile**
- banner: required
- subhead: required
- body: required
- team: visible
- gallery: visible

**Renderer profile**
- banner: `oob-pagetitle-project-spotlight-v1`
- team: `teamviewer-project-spotlight-grid-v1`
- gallery: `oob-gallery-project-spotlight-v1`

**Validation profile**
- `val-ps-inprogress-monthly-v1`

---

### 2. `ps-inprogress-milestone-v1`

**Applies when**
- `PostFamily = milestoneSpotlight`
- `SpotlightType = milestone`
- shell compatibility = `ps-shell-inprogress-oob-banner-team-gallery-v1`

**Block profile**
- banner: required
- subhead: required
- body: required
- team: optional or required by business rule
- gallery: recommended

**Validation profile**
- `val-ps-inprogress-milestone-v1`

---

### 3. `ps-inprogress-project-update-v1`

**Applies when**
- `PostFamily = projectUpdate`
- `SpotlightType in {inProgress, update}`
- shell compatibility = `ps-shell-inprogress-oob-banner-team-gallery-v1`

**Block profile**
- banner: required
- subhead: required
- body: required
- team: optional
- gallery: optional

**Validation profile**
- `val-ps-inprogress-project-update-v1`

## Registry behavior rules

1. A template must reference exactly one active `PageShellKey`
2. A template must reference exactly one validation profile
3. A template must identify which blocks are visible vs optional
4. A template must identify the active banner renderer kind
5. A template must identify whether shell-version drift requires regeneration

## XML-template compatibility rules

The current XML shell implies these baseline rules:

- banner slot exists and should be treated as first-class
- subhead/body are discrete text controls rather than one blended narrative control
- `teamViewer` is structurally present in the shell
- gallery is structurally present in the shell
- no standalone OOB secondary-image slot exists in the current shell

That last point is important: any template profile that requires a dedicated secondary-image slot is **not compatible** with the current canonical shell and must either:
- be rejected, or
- point to a future shell variant that explicitly includes that slot

## Future shell-family growth

This schema intentionally allows future shell keys such as:

- `ps-shell-complete-oob-banner-team-gallery-v1`
- `ps-shell-milestone-hbsignaturehero-team-gallery-v1`
- `ps-shell-story-oob-banner-body-gallery-v2`

But those should be introduced explicitly with a new shell source and a new registry row, not inferred silently.
