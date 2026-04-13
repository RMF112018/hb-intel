# Phase-01 Operating Rules Adoption

**Adopted:** 2026-04-13
**Scope:** binds all Phase-01 prompt executions (Waves 1-9) for the Project Spotlight publisher SPFx app.
**Source of authority:** `docs/architecture/plans/MASTER/spfx/publisher/phase-01/02-Architecture-Authority-and-Operating-Rules.md`.

This artifact memorializes adoption of the Phase-01 operating charter and records the concrete execution posture the code agent will hold for Waves 2-9. It does not restate the authority doc; it commits to it and maps each non-negotiable rule to enforcement evidence.

---

## 1. Binding architecture inputs

All 11 architecture docs (`README.md`, `00-Plan-Summary.md` ... `10-Implementation-Notes-and-Evolution-Rules.md`) plus the canonical Project Spotlight XML page template in the same folder are bound as implementation authority.

Enforcement:
- No code change will contradict a locked schema, contract, or rule stated in those documents.
- If a wave discovers a gap in an architecture doc, the gap is raised in `implementation-tracker.md` (blocking unknowns) rather than silently patched in code.
- Architecture docs are not re-read per prompt unless drift is suspected or a doc has been updated since the last read.

## 2. Governing posture alignment

Repo governance layered on top of the Phase-01 charter:
- `CLAUDE.md` + `.claude/rules/**` (authority hierarchy, package boundaries, docs standards, implementation quality, planning discipline).
- `docs/reference/developer/agent-authority-map.md` for source routing.
- `docs/reference/developer/verification-commands.md` for targeted validation selection.
- `@hbc/ui-kit` doctrine for shared visual ownership.
- `@hbc/sharepoint-platform` public API as the boundary-safe data primitive layer.

Enforcement:
- New reusable visual primitives land in `@hbc/ui-kit`, not feature packages.
- New data primitives do not fork or duplicate `@hbc/sharepoint-platform` functionality.
- Any intentional deviation from shared patterns is documented inline and in the tracker.

## 3. Non-negotiable rule ledger

| # | Rule | Enforcement mechanism in this phase |
|---|------|-------------------------------------|
| 1 | Project Spotlight is the only destination. | No destination toggle, enum fan-out, or dual-target router lands in code. All publishing calls hardcode the ProjectSpotlight site seam behind a single `publishTarget` constant. |
| 2 | The XML file is the canonical v1 shell authority. | Page-generation driver (Wave 4) treats the XML as the input template, not a reference. Any shell variant requires a new architecture-doc entry before code lands. |
| 3 | Current shell = OOB banner + OOB text (subhead) + OOB text (body) + `teamViewer` + OOB Image Gallery. | Page-generation emits exactly this control set for v1. No additional webparts or OOB controls are injected unless a template-registry entry explicitly allows it. |
| 4 | Destination page is a rendered shell, not editorial truth. | No feature reads content back from the live SharePoint page for editorial purposes. All reads go to list-backed records. |
| 5 | Structured list-backed post records are authoritative. | Master record = `HB Articles`. Child records = `HB Article Team Members` / `HB Article Media`. Publisher UI writes exclusively to these lists. |
| 6 | Publish and republish are mediated by durable page bindings. | `HB Article Destination Pages` rows are required for every published article. No ad-hoc page creation without a binding row write. |
| 7 | Shell and template versioning is explicit. | `PageShellVersion` and `RenderVersion` are stamped on every binding row and compared on republish. |
| 8 | Preview and publish share one resolution pipeline. | Preview renderer and publish generator call the same template-resolver + content-mapper functions; no parallel logic. |
| 9 | `hbSignatureHero` is a future-compatible renderer path, not a v1 replacement. | v1 page-generation does not reference `hbSignatureHero`. Swap-in is deferred to a future template-registry shell variant + architecture update. |
| 10 | No silent fallback into the old dual-destination publisher model. | Wave 1 audit confirmed no such code exists today (see `wave-01-repo-truth-and-impact-map.md` §2). Future waves will not reintroduce it; any such temptation is rejected in review. |

## 4. Operational rules adopted

- Do not re-read files already in active context unless drift or uncertainty demands it.
- Do not perform unrelated refactors inside phase-01 commits.
- Do not treat a successful build as proof of correct wiring; require behavioral or evidence-based confirmation.
- Do not leave docs stale after substantive schema or contract changes.
- Do not close a prompt on intent; close on evidence captured under `evidence/`.

## 5. Required evidence posture per prompt

Every subsequent Wave/Prompt closure in Phase-01 will leave behind at least one of:
- updated code,
- updated docs (architecture or README),
- updated provisioning scripts,
- test output,
- hosted verification notes,
- explicit known-gap log entry in `implementation-tracker.md`.

Prompt-02 will update this artifact if its closure reveals a rule requiring sharper enforcement.

## 6. Rule-vs-Wave-1-findings conformance check

Cross-checking the Wave 1 impact map against the ten non-negotiable rules:

- Rules 1, 10: Wave 1 audit found no dual-destination or legacy `article-publisher` code. Confirmed conformant.
- Rule 2: Canonical XML is referenced (not redefined) by Wave 1. Confirmed conformant.
- Rule 3: Wave 1 identified TeamViewer as landed and locked (Phase-01 Prompts 01-06). Confirmed conformant.
- Rules 4-7: No code yet; enforcement deferred to Waves 2-5 where those paths are implemented.
- Rule 8: Deferred to Wave 7 (validation, preview, governance).
- Rule 9: Wave 1 explicitly flagged `hbSignatureHero` as reference-only, not v1. Confirmed conformant.

No rule violations present as of Wave 1 closure. Rules 4-8 are forward-facing obligations for Waves 2-7.

---

## 7. Closure

Prompt-02 leaves behind this adoption artifact + a tracker update recording Wave-level closure. No code, schema, or provisioning script needed change at this stage; the governing charter is purely anchoring future implementation work.
