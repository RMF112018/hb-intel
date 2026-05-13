# 02 — B07 Document Authority and Cross-Reference Map

## 1. Governing hierarchy

For My Dashboard planning work:

1. **Live repo truth**
2. **Applicable detailed batch artifact**
3. **Comprehensive outline**
4. **Older or historical references**

The outline remains an umbrella scaffold. It must not override B07 where B07 has closed a decision.

---

# 2. Current developed batch coverage through B07

| Artifact | Developed authority |
|---|---|
| `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Sections 0–5 |
| `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | Sections 6, 7, 8, 14, and 19 |
| `B03_My_Work_Shell_Navigation_And_UX_Development.md` | My Work shell, navigation, hero, and UX section family governed by B03 |
| `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md` | Sections 12, 13, 18, and 24 |
| `B05_Adobe_Sign_Integration_Architecture_Development.md` | Sections 15, 16, 17, and 20 |
| `B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md` | Sections 22, 23, and 27, plus operational refinements to Section 18 |
| `B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md` | Sections 25 and 26, plus hosted-validation refinements to Sections 6, 8, and 27 |

---

# 3. Direct B07 cross-reference correction

## Current issue
B07 references a non-live long-form B05 filename.

## Correct repo-truth reference
```text
B05_Adobe_Sign_Integration_Architecture_Development.md
```

## Required correction posture
Replace the incorrect filename wherever it appears inside B07. Do not rename files.

---

# 4. B07 current-main reconciliation map

## 4.1 Statements that require correction or qualification

| B07 statement family | Current repo truth | Required reconciliation |
|---|---|---|
| “Visible app body remains B02 placeholder host” | `MyDashboardApp.tsx` now mounts `MyWorkShell` | Update to distinguish original audit anchor from current main |
| “Real My Work shell not yet present” | `MyWorkShell.tsx` exists | Mark landed on current main |
| “My Work navigation not yet present” | `MyWorkNavigation.ts`, shell state, and primary navigation exist | Mark landed on current main |
| “Package critical runtime map should broaden once shell runtime lands” | Shell/nav/hero runtime has landed, but package critical path list remains scaffold-only | Reframe as an immediate follow-up planning gap |

## 4.2 Current main runtime facts to mention
- `MyDashboardApp.tsx` renders `MyWorkShell`.
- `MyWorkShell.tsx` owns the shell root, command surface, active panel, and hero/nav composition.
- `MyWorkPrimaryNavigation.tsx` implements accessible tab/menu navigation.
- `MyWorkHeroBand.tsx` implements state-driven hero identity and summary copy.
- `useMyWorkShellState.ts` manages in-memory home/focused-module state.
- `MyWorkNavigation.ts` provides the typed primary surface/module registry.

## 4.3 Current main gaps that remain valid B07 concerns
- no dedicated `e2e/my-dashboard-live/` hosted lane yet,
- no `docs/architecture/evidence/my-dashboard-live/` curated evidence root yet,
- no hosted runtime package-version proof seam,
- no evidence of package critical-path expansion to include the newly landed shell runtime,
- later My Work read-model clients, surface router/bento runtime, and Adobe queue module/card remain unresolved where absent.

---

# 5. B07 section interaction with the outline

| Outline section | B07 effect |
|---|---|
| §6 | Hosted communication-site proof, page URL locking, production-host vs. review-host distinction |
| §8 | Package proof, runtime marker vs. runtime version proof, critical path expansion |
| §25 | Layered validation matrix and strict Definition of Done |
| §26 | Dependency-gated implementation phase sequence |
| §27 | Hosted-validation and evidence-specific risk register additions |

---

# 6. Acceptance posture

B07 documentation reconciliation is accepted only if:

- B07 references the correct B05 predecessor filename,
- B07 no longer misstates current main shell/navigation/hero runtime status,
- README authority coverage reaches B07,
- outline authority coverage reaches B07,
- Sections 6, 8, 25, 26, and 27 are aligned to B07,
- no runtime implementation was introduced.
