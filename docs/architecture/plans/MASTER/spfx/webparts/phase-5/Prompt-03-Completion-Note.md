# Prompt-03 Completion Note — Tenant Validate All Webparts

## Status

**Package truth: confirmed** (P5-02).
**Tenant validation: requires manual operator action.**

This note provides the complete tenant validation protocol, evidence collection template, and acceptance criteria for the operator to execute.

---

## Deployment steps

1. Navigate to the SharePoint App Catalog site → Apps for SharePoint
2. Upload `dist/sppkg/hb-webparts.sppkg` (overwrite existing)
3. Trust the app when prompted
4. Confirm App Catalog shows version `1.0.0.24`

### Cache sanity (if stale behavior suspected)

- DevTools → Application → Service Workers → Unregister `spserviceworker.js`
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Confirm CDN is serving the new bundle (`hb-webparts-app-ab43ba83.js`)

---

## Validation matrix

Complete this matrix for each webpart in the specified order. Use the manifest ID to match if toolbox titles differ.

### Regression checks (previously validated)

| # | Webpart | Manifest ID | Toolbox visible | Add to page | Renders | Load error absent | Notes |
|---|---------|-------------|:---:|:---:|:---:|:---:|-------|
| 1 | HB Hero Banner | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` | | | | | |
| 2 | Priority Actions Rail | `b3f07190-79cf-437d-a1d6-ecbf3f77e616` | | | | | |

### Remaining homepage webparts

| # | Webpart | Manifest ID | Toolbox visible | Add to page | Renders | Load error absent | Notes |
|---|---------|-------------|:---:|:---:|:---:|:---:|-------|
| 3 | Company Pulse | `0b53f651-fd92-4f7f-a9da-f7797017f5eb` | | | | | |
| 4 | Leadership Message | `e8fa8a84-a48a-41d2-85a6-b7c7df70aeca` | | | | | |
| 5 | People Culture | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` | | | | | |
| 6 | Tool Launcher Work Hub | `cb7060f5-b852-4600-b912-a5f6f7221ce2` | | | | | |
| 7 | Project Portfolio Spotlight | `8370ab0c-b6df-4db0-82f1-24b54750f508` | | | | | |
| 8 | Personalized Welcome Header | `46bfde64-f0cb-4f62-9f6b-a466f8fadc1f` | | | | | |
| 9 | Safety Field Excellence | `89ca5ff3-21f4-4b23-a953-4b7306ea1029` | | | | | |
| 10 | Smart Search Wayfinding | `11d72b36-a92f-4e2d-9918-75df2cb0d11e` | | | | | |

---

## Evidence collection per webpart

For each webpart, capture:

1. **Toolbox presence**: Edit page → Add webpart → "HB Intel" group → webpart title visible
2. **Add to page**: Click the webpart → it inserts without error
3. **Renders**: The component's UI appears (card, heading, content, or empty state)
4. **Load error absent**: Console filtered on the webpart's manifest ID shows no `Could not load {id}_1.0.0 in require`
5. **No crash shell**: No SharePoint "technical details" error overlay for the target webpart

### Network checks (once per session, not per webpart)

| Asset | Expected |
|-------|----------|
| `shell-web-part_33c64341ed81ee506c2a.js` | 200 OK |
| `hb-webparts-app-ab43ba83.js` | 200 OK |
| `shell-entry-{webpartId}-{hash}.js` (per active webpart) | 200 OK |

### Console filter strings

Use these to isolate webpart-specific loader issues:

```
0b53f651    (CompanyPulse)
11d72b36    (SmartSearchWayfinding)
27ac10f4    (PeopleCulture)
39762a4d    (HbHeroBanner)
46bfde64    (PersonalizedWelcomeHeader)
8370ab0c    (ProjectPortfolioSpotlight)
89ca5ff3    (SafetyFieldExcellence)
b3f07190    (PriorityActionsRail)
cb7060f5    (ToolLauncherWorkHub)
e8fa8a84    (LeadershipMessage)
```

Do **not** treat unrelated page-level console noise (from Microsoft's own webparts, telemetry, etc.) as a proof-case failure unless the error references one of these IDs, `hb-webparts-app`, or `shell-web-part`.

---

## Acceptance criteria

### Full pass (cumulative model proven)

All 10 rows in the validation matrix show:
- Toolbox visible: yes
- Add to page: yes
- Renders: yes
- Load error absent: yes

### Partial pass (isolate failures)

If some webparts pass and others fail:
1. Record the exact failure per webpart (loader error, render error, crash shell)
2. Distinguish **loader failures** (`Could not load ... in require`) from **render failures** (component throws after successful load)
3. Loader failures indicate a package/shim defect
4. Render failures indicate a component/runtime defect — the loader contract is still working

### Fail

If both regression-check webparts (HbHeroBanner, PriorityActionsRail) fail with loader errors, the cumulative package has regressed and the shim model needs investigation.

---

## Expected render behavior per webpart

| Webpart | Expected render (with default preconfigured properties) |
|---------|--------------------------------------------------------|
| HB Hero Banner | Blue gradient card with headline "Build with confidence.", message, metadata, CTA link |
| Priority Actions Rail | Card with "Priority Actions" heading, "Today" and "Approvals" groups, action links with badges |
| Company Pulse | Card with "Company Pulse" heading, featured + secondary items |
| Leadership Message | Card with leadership message content, author, metadata |
| People Culture | Card with people/culture events, event type badges |
| Tool Launcher Work Hub | Card with tool groups, icon-mapped tool links |
| Project Portfolio Spotlight | Card with project spotlight, milestones, status badges |
| Personalized Welcome Header | Greeting with user display name (requires `spfxContext.pageContext.user`) |
| Safety Field Excellence | Card with safety metrics, indicator badges, status rendering |
| Smart Search Wayfinding | Card with search input and discovery surface items |

Webparts with no backend data or unconfigured properties will show their authoring empty-state message — this is **correct behavior**, not a failure.
