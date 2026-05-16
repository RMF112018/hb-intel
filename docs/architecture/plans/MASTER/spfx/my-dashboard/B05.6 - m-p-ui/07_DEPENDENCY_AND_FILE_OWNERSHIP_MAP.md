# 07 — Dependency and File Ownership Map  
## Final implementation map, dependencies, and prompt ownership

---

## 1. Existing files expected to change

| File | Reason |
|---|---|
| `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx` | orchestrate new tile grid/browser/menu model |
| `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css` | remove metrics/launch shell; add card-grid/state styling |
| `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx` | replace obsolete UI assertions |
| `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx` | update copy assertions only if needed |
| `apps/my-dashboard/package.json` | add premium dependencies if absent |
| workspace lockfile | dependency resolution only |

---

## 2. New files to create

| File | Purpose |
|---|---|
| `ProjectPortfolioTile.tsx` | tile component |
| `ProjectPortfolioTile.module.css` | tile-specific styling |
| `ProjectLaunchMenu.tsx` | Floating UI anchored project launch menu |
| `ProjectLaunchMenu.module.css` | menu-specific styling |
| `ProjectLaunchMenu.test.tsx` | menu contract tests |
| `ProjectPortfolioBrowser.tsx` | modal full-portfolio browser |
| `ProjectPortfolioBrowser.module.css` | browser overlay styling |
| `ProjectPortfolioBrowser.test.tsx` | browser behavior tests |
| `myProjectPortfolioPresentation.ts` | sorting, search, visible-count helpers |
| `myProjectPortfolioPresentation.test.ts` | helper tests |

All new files should live under:

`apps/my-dashboard/src/modules/myProjects/`

---

## 3. Dependencies to add and use if not already package-accessible

Use repo-standard versions already present elsewhere in the monorepo where applicable:

```json
{
  "@floating-ui/react": "^0.27.0",
  "@radix-ui/react-tooltip": "^1.1.0",
  "@radix-ui/react-separator": "^1.1.0",
  "@radix-ui/react-scroll-area": "^1.2.0 or repo-aligned available version",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "lucide-react": "^0.475.0",
  "motion": "^12.0.0"
}
```

### Version instruction

Use the exact versions already present in the repo/workspace when available. Do not introduce mismatched versions if the monorepo already standardizes them elsewhere.

---

## 4. Ownership by prompt

| Prompt | Primary ownership |
|---|---|
| Prompt 01 | repo truth, no-churn scope lock |
| Prompt 02 | card shell reset and copy/KPI/launch-region removal |
| Prompt 03 | tile primitive + identity layout + display sort helper scaffold |
| Prompt 04 | launch menu implementation + unavailable-action behavior |
| Prompt 05 | portfolio browser + search + responsive overlay |
| Prompt 06 | visual polish, motion, responsive modes, premium state treatment |
| Prompt 07 | full test rewrite/hardening and DOM contracts |
| Prompt 08 | final validation, hosted evidence, closeout |

---

## 5. Files explicitly not to change unless compile truth proves a narrow necessity

- backend provider files;
- models/read-model contracts;
- Adobe Sign module files;
- bento grid column-span logic;
- MyWork surface span constants;
- unrelated dashboard cards;
- deployment workflows.

---

## 6. No-op handling

If a prompt inspects a file and the target state is already present:

1. do not churn;
2. document that the requested condition is already closed;
3. run the required validation;
4. return the standard closeout report.
