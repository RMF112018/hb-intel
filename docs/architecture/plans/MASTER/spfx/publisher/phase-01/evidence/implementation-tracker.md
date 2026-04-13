# Project Spotlight Publisher — Implementation Tracker

Initialized: 2026-04-13 (Wave 1 / Prompt-01 closure).

Single source of truth for wave-by-wave execution status. Update this file as each wave closes. Cross-reference closure artifacts under `evidence/`.

---

## Wave Status

| Wave | Prompt | Objective | Status | Closure Evidence |
|------|--------|-----------|--------|------------------|
| 1 | 01 | Repo truth + impact map | ✅ **COMPLETE** | `evidence/wave-01-repo-truth-and-impact-map.md` |
| — | — | Architecture authority + operating-rules adoption (phase-01 doc `02`) | ✅ **COMPLETE** | `evidence/operating-rules-adoption.md` |
| — | — | Definition-of-Done adoption + closure gate (phase-01 doc `03`) | ✅ **COMPLETE** | `evidence/definition-of-done-adoption.md` |
| — | — | Hosted verification runbook registered (phase-01 doc `04`) | ✅ **REGISTERED** (executed in Wave 9) | `evidence/hosted-verification-runbook.md` |
| 2 | 02 | List provisioning + domain contracts | ⬜️ Not started | — |
| 3 | 03 | Service layer + template resolution | ⬜️ Not started | — |
| 4 | 04 | XML-shell page-generation engine | ⬜️ Not started | — |
| 5 | 05 | Content mapping + page binding | ⬜️ Not started | — |
| 6 | 06 | Authoring UI + workflow | ⬜️ Not started | — |
| 7 | 07 | Validation, preview, governance | ⬜️ Not started | — |
| 8 | 08 | Team Viewer closure | ⏸ Team Viewer webpart itself complete; publisher-side closure pending | Commits `3bb8dd10` → `35b0f38c` (TeamViewer Phase-01) |
| 9 | 09 | Testing + hosted vetting + build proof | ⬜️ Not started | — |

Legend: ✅ complete · 🟡 in progress · ⬜️ not started · ⏸ partial / upstream dependency

---

## Wave 1 Outputs

- Repo-truth findings summary → `evidence/wave-01-repo-truth-and-impact-map.md`
- File-by-file impact map → same artifact, §4
- Recommended owning package/app → same artifact, §1 + §8 (`apps/hb-webparts` + local `homepage/data/projectSpotlight*` modules layered over `@hbc/sharepoint-platform`)
- Reuse / refactor / replace matrix → same artifact, §5
- Blocking unknowns → same artifact, §6
- Implementation tracker initialized → this file

---

## Blocking Unknowns Queue (resolve before / during Wave 2)

1. SharePoint Pages REST API path + auth model for ProjectSpotlight site.
2. Webpart property injection strategy at page-generation time.
3. Photo hydration timing (generation-time embed vs. runtime fetch).
4. Publish permissions / service principal on ProjectSpotlight.
5. Rollback / version-history policy.
6. Scheduled publishing inclusion + trigger mechanism.
7. OOB Image Gallery layout variant.

---

## Handoff Notes

- Do not re-read Architecture docs `00-10` unless scope changes; they are authoritative and locked.
- Do not modify `@hbc/sharepoint-platform` public API during Waves 2–9; extend only via local modules.
- Do not reintroduce Company Pulse, `HbcNewsroomSurface`, or dual-destination logic in publisher authoring.
- Do not force `hbSignatureHero` into v1 shell; architecture doc 10 must change first if a shell variant is added.
- Team Viewer webpart is ready to mount in generated pages; no renderer changes required there.
