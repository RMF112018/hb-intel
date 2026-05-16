# 06 — Test, Validation, and Hosted Evidence Matrix  
## Closure proof required for the My Projects flagship rebuild

---

## 1. Validation objective

Tests must no longer preserve the obsolete expanded-row/metrics model. They must enforce the new target-state contract.

---

## 2. Unit-test changes

### Update `MyProjectsHomeCard.test.tsx`

Remove or revise assertions that require:

- metrics strip in populated state;
- launch region wrapper;
- `Launch List`;
- visible source badge labels;
- persistent two-slot action rail;
- inline five-row full expansion as the final overflow interaction.

Add assertions that verify:

- eyebrow = `My Portfolio`;
- title = `My Projects`;
- support copy updated;
- KPI strip absent;
- `Launch List` absent;
- source pills absent;
- project tile grid renders;
- project name and number render together within the tile contract;
- `Open` trigger renders per tile;
- `View all projects` appears only when item count exceeds current mode visible-count threshold;
- full browser opens and closes;
- search filters by project name and project number;
- no-result state renders;
- degraded banners remain truthful.

### Add `ProjectLaunchMenu.test.tsx`

Validate:

- trigger semantics;
- open/close behavior;
- available anchor semantics;
- unavailable non-link semantics;
- Escape focus restoration;
- one-open-menu behavior when feasible.

### Add `ProjectPortfolioBrowser.test.tsx`

Validate:

- dialog semantics;
- initial focus behavior;
- close behavior;
- search filtering;
- empty search result state;
- item rendering in browser context.

### Add `myProjectPortfolioPresentation.test.ts`

Validate:

- UI sort order: project name → number → record key;
- search normalization;
- visible-count function by responsive mode;
- no mutation of source arrays.

---

## 3. Home-surface tests

Update `MyWorkHomeSurface.test.tsx` only where card-copy assertions mention old copy. Preserve span and ordering assertions.

---

## 4. Validation commands

### Prompt-local validation
Each prompt should run the smallest meaningful validation lane first.

### Final closure validation
Before final closeout:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard lint
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
```

---

## 5. Hosted evidence matrix

Capture hosted SharePoint screenshots for:

| Evidence | Required |
|---|---|
| Desktop resting card | Yes |
| Standard laptop resting card | Yes |
| Tablet landscape resting card | Yes |
| Tablet portrait resting card | Yes |
| Phone portrait resting card | Yes |
| Phone landscape / short-height state | Yes |
| Open launch menu | Yes |
| Open portfolio browser — desktop-class | Yes |
| Open portfolio browser — phone-class | Yes |
| Search result state | Yes |
| No-search-results state | Yes |
| Partial/degraded state if fixture or host posture permits | Desirable |
| SharePoint edit mode / authoring posture | Desirable |

---

## 6. Visual acceptance criteria

Close only when:

1. five-project state is materially more compact than the current screenshots;
2. the adjacent Adobe Sign card no longer appears visually oversized solely because My Projects remains too tall;
3. tile composition reads as intentionally authored;
4. name/number pair is the dominant scan block;
5. support metadata is distributed rather than clustered;
6. action affordance is clear without oversized persistent controls;
7. modal portfolio browser feels complete and not like a workaround.

---

## 7. Flagship score target

The module should credibly support a **flagship / benchmark-grade** posture under the attached scoring framework:

- target qualitative equivalent of 48+/56 readiness;
- no unresolved hard-stop failures;
- no major accessibility regression;
- no host-fit instability;
- evidence-backed closure.

This package does not require producing a formal numerical score unless the operator requests it, but the implementation must be strong enough to justify that class of closure.

---

## 8. Closeout report expectation

Prompt 08 must produce a concise final closeout that includes:

- files changed;
- validation commands/results;
- hosted evidence captured;
- acceptance criteria status;
- any deferred non-critical follow-ons, if unavoidable.
