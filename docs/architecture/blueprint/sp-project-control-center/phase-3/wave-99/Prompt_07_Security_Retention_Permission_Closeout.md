# Wave 99 — Prompt 07 Security, Retention, and Permission Closeout

**Wave:** Phase 3 / Wave 99 — Unified Gaps.
**Prompt stream:** Prompt 07 — Security, Retention, Permission posture (Prompts 07A–07D).
**Status:** Closed.
**Authority:** Closes Wave 99's security/retention/permission stream. Tenant-hosted, live-integration, and legal/compliance evidence remain OPERATOR-PENDING.

This is the closeout commit for Prompt 07D. It records the Prompt 07 evidence trail, finalizes the canonical Ask-HBI refusal-reason taxonomy in the model contract, and locks the closeout posture for downstream waves.

---

## 1. Prompt sequence summary

| Prompt | Commit               | Stream                           | Scope                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------ | -------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 07A    | `1d840cb36`          | Documentation / doctrine         | Canonical PCC security, redaction, persona-permission, evidence-link, HBI grounding, and qualitative retention architecture policy.                                                                                                                                                                                                                                                                             |
| 07B    | `21220bf4e`          | Model / fixture hardening        | Canonical refusal-reason taxonomy + type, executive-note and pursuit-note fixtures, universal `PccSecurityPosture` sweep, refusal-taxonomy and sensitivity invariants. Left `UnifiedSearchRefusal.refusalReason` typed as `string` because one SPFx test fixture used a non-canonical literal.                                                                                                                  |
| 07C    | `1f7268f48`          | SPFx rendering / guard hardening | Aligned the synthetic SPFx refusal literal to the canonical taxonomy, added per-canonical-reason render coverage, multi-status restricted-envelope leak guards, scoped source-of-truth claim language scan, and extended `pcc-import-guards` with LLM/vector/brand-SDK module specifiers and the `WebSocket` / `EventSource` / `navigator.sendBeacon` executable seams plus an Ask-HBI scoped no-runtime guard. |
| 07D    | this closeout commit | Closeout + model finalizer       | Narrowed `UnifiedSearchRefusal.refusalReason` from `string` to `PccHbiRefusalReason`, added a compile-time `expectTypeOf` assertion, and authored this closeout document.                                                                                                                                                                                                                                       |

---

## 2. Final security posture decisions

The 15 sections of `docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md` (Prompt 07A) are the canonical authority. No open questions remain in this wave's security/retention/permission stream.

- **Security classes:** `project-internal | need-to-know | restricted | privileged`. Every PCC-native record carries a class; PCC-derived records inherit the most restrictive class of any constituent input.
- **Redaction levels:** `none | masked | withheld`. Applied at read time, not at storage time. Behavior matrix per class × surface is locked in 07A §2.
- **Role / persona permission rules:** Lenses filter shared project truth; never separate workspaces. Persona groupings (estimating, preconstruction, operations, field, accounting, closeout, warranty, executive, admin, future-pursuit-reference) and the per-group default visibility profile are locked in 07A §3. `PccPersona` literals power `security.allowedPersonas`; `PccProjectLensType` literals power `eligibleLensTypes`. The two vocabularies are not interchangeable.
- **Pursuit / estimating sensitivity:** Pursuit notes default to `need-to-know`; pricing/strategy/deal terms escalate to `restricted`. Cross-project reuse permitted only via the `future-pursuit-reference` lens with summary-safe outputs.
- **Executive-only notes:** `restricted` by default; escalate to `privileged` for personnel/dispute/privileged matters. Withheld for non-executive personas; never reused across projects.
- **Warranty / no-blame evidence:** Responsibility surfaces require obligation-trace lineage + execution-evidence link + supporting closeout/field-execution evidence. Insufficient evidence → explicit insufficient-evidence indicator; PCC and HBI must not infer responsibility.
- **Closed-project access:** Active vs closed vs archive/future-reference tiers. Closed-project read-only; cross-project reuse gated through `future-pursuit-reference` lens with summary-safe outputs and explicit reuse blockers.
- **Cross-project search restrictions:** Governed mode only. Allowed-return list and never-return list locked in 07A §8. Not a system-of-record change.
- **HBI / source-truth restrictions:** HBI is never the system of record. No uncited grounded answers; refusal taxonomy is closed; preview surfaces are fixture-grounded; cross-project queries require explicit authorization; warranty/responsibility refusals when evidence is insufficient.
- **Qualitative retention posture:** Categories `source-system retained | project lifecycle retained | closed-project archive | restricted executive retention | warranty-period retention | audit-log retained | purge / block candidate`. This wave does not establish legal retention periods, statutory destruction rules, litigation-hold procedures, or records-disposition schedules — those are tenant-readiness gates (Section 5).
- **Summary-safe vs raw-record exposure:** Summaries safe when class permits, no reuse blocker applies, and source lineage is preserved. Raw records gated by audience + class + audit log.
- **Reuse blockers:** Twelve enumerated conditions in 07A §13 (privileged, restricted-without-summary-safe-approval, withheld redaction, executive-only note, active litigation, privacy-sensitive warranty, owner/client confidential, sub pricing not approved, missing source lineage, evidence threshold not met, low traceability confidence, source-system access denied).
- **Tenant-readiness gates:** Eight gates in 07A §15 (tenant permission validation, audit logging, access review, security review, retention review, legal/compliance review, M365 boundary validation, HBI grounding attestation). All remain OPERATOR-PENDING.

---

## 3. Evidence table

| Posture area                              | 07A doc                                                     | 07B model artifact                                                                                                                                       | 07C SPFx artifact                                                                                                                                 | 07D finalizer                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Security classes                          | §1 of `PCC_Knowledge_Reuse_Security_And_Retention_Model.md` | `PCC_SECURITY_CLASSIFICATIONS` + `PccSecurityPosture` (existing in `packages/models/src/pcc/UnifiedLifecycle.ts`); universal sweep in `Fixtures.test.ts` | —                                                                                                                                                 | —                                                                                               |
| Redaction levels                          | §2                                                          | `PCC_REDACTION_LEVELS`; sweep in `Fixtures.test.ts`                                                                                                      | Multi-status leak guard in `AskHbiGroundingPreviewPanel.test.tsx` for all six non-`available` `PccReadModelSourceStatus` values                   | —                                                                                               |
| Persona / lens rules                      | §3                                                          | Sweep validates `security.allowedPersonas` against `PCC_PERSONAS`; cross-project ref lens vocabulary asserted in `UnifiedLifecycleReadModels.test.ts`    | —                                                                                                                                                 | —                                                                                               |
| Pursuit / estimating sensitivity          | §4                                                          | `SAMPLE_PURSUIT_NOTE_RECORD` in `fixtures/unifiedLifecycle.ts`; pursuit-note posture invariant in `UnifiedLifecycle.test.ts`                             | —                                                                                                                                                 | —                                                                                               |
| Executive-only notes                      | §5                                                          | `SAMPLE_EXECUTIVE_NOTE_RECORD`; executive-note posture invariant                                                                                         | —                                                                                                                                                 | —                                                                                               |
| Warranty / no-blame evidence              | §6                                                          | Existing `SAMPLE_WARRANTY_TRACE_INSUFFICIENT_EVIDENCE_RECORD` + recommendation evidence invariant in `UnifiedLifecycle.test.ts`                          | —                                                                                                                                                 | —                                                                                               |
| Closed-project reference mode             | §7                                                          | —                                                                                                                                                        | Future-pursuit visibility test in `UnifiedLifecycleReadModels.test.ts`; lens routing through `eligibleLensTypes`                                  | —                                                                                               |
| Cross-project search restrictions         | §8                                                          | `crossProjectAllowed` invariant in `UnifiedLifecycle.test.ts`                                                                                            | Routed-surface markers and source-truth claim language scans in `PccProjectHomeAskHbiSection.test.tsx` and `AskHbiGroundingPreviewPanel.test.tsx` | —                                                                                               |
| Source-owned vs PCC-native vs PCC-derived | §9                                                          | `PCC_RECORD_OWNERSHIP_POSTURES`; existing fixture data uses both ownership categories; SoR-text guard in tests                                           | —                                                                                                                                                 | —                                                                                               |
| Evidence-link behavior                    | §10                                                         | `PccEvidenceLinkRef` + `PccSourceLineageRef` (existing); fixture coverage                                                                                | —                                                                                                                                                 | —                                                                                               |
| HBI / source-truth restrictions           | §11                                                         | `PCC_HBI_REFUSAL_REASONS` + `PccHbiRefusalReason` (added in 07B); fixture aligned to `'insufficient-evidence'`                                           | Per-canonical-reason render coverage; HBI-not-source-truth disclaimer assertion; qualified-positive source-truth claim language scan              | `UnifiedSearchRefusal.refusalReason` narrowed to `PccHbiRefusalReason` with `expectTypeOf` lock |
| Qualitative retention posture             | §12 + §15 disclaimer                                        | —                                                                                                                                                        | —                                                                                                                                                 | —                                                                                               |
| Summary-safe vs raw exposure              | §14                                                         | Universal posture sweep                                                                                                                                  | Restricted-envelope leak guards (no answer rows, no secret strings)                                                                               | —                                                                                               |
| Reuse blockers                            | §13                                                         | `crossProjectAllowed` invariant; pursuit/executive `crossProjectAllowed: false`                                                                          | —                                                                                                                                                 | —                                                                                               |
| Tenant-readiness gates                    | §15                                                         | —                                                                                                                                                        | —                                                                                                                                                 | OPERATOR-PENDING (Section 5 of this closeout)                                                   |

Validation commands run as part of this closeout:

```bash
pnpm --filter @hbc/models build
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check \
  packages/models/src/pcc/UnifiedLifecycle.ts \
  packages/models/src/pcc/UnifiedLifecycle.test.ts \
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Prompt_07_Security_Retention_Permission_Closeout.md
md5 pnpm-lock.yaml
```

Validation results recorded in the Prompt 07D completion summary.

---

## 4. Refusal taxonomy closeout

- The canonical Ask-HBI refusal taxonomy is `PCC_HBI_REFUSAL_REASONS`, exported from `@hbc/models/pcc`. Its members, in canonical order, are:
  1. `insufficient-evidence`
  2. `permission-restricted`
  3. `out-of-scope`
  4. `cross-project-not-authorized`
  5. `responsibility-conclusion-not-supported`
- `UnifiedSearchRefusal.refusalReason` is now narrowed to `PccHbiRefusalReason` at the contract level (this closeout commit). The runtime 5-tuple lock and the compile-time `expectTypeOf<UnifiedSearchRefusal['refusalReason']>().toEqualTypeOf<PccHbiRefusalReason>()` assertion both live in `packages/models/src/pcc/UnifiedLifecycle.test.ts`.
- The synthetic SPFx refusal fixture (`AskHbiGroundingPreviewPanel.test.tsx`) was aligned to `'insufficient-evidence'` in 07C before the 07D narrowing landed; no SPFx fixture realignment was required at 07D.
- Grounded answers must carry at least one citation. Refusals must remain citation-free and explicit; the SPFx defensive sanitizer drops uncited grounded answers at render time.
- Unsupported warranty / responsibility conclusions remain refusals or insufficient-evidence — never inferences. PCC does not name a vendor / sub / manufacturer as responsible from inference alone.

---

## 5. OPERATOR-PENDING / tenant evidence posture

Wave 99 Prompt 07 does **not** provide tenant-hosted, production, or live-integration evidence for any of the following. Each item remains OPERATOR-PENDING / future tenant-readiness evidence and must be cleared before live runtime adoption of the corresponding surface:

- Tenant permission resolution against AAD identity / group membership.
- Live identity / group enforcement at the M365 SharePoint / Graph permission boundary.
- Production audit logging (read access, lens switches, persona escalations, redaction events at read time, cross-project search, Ask-HBI refusals).
- Legal / compliance retention period enforcement and records-disposition execution.
- Live HBI / vector / search integrations (preview surfaces remain fixture-grounded).
- Live Microsoft Graph / Procore / Sage retrieval.

No production-readiness claim is made for any of these items at this wave's closeout. They are explicitly named as the gates to clear before runtime activation in any tenant.

---

## 6. Deferred items for Prompt 08+

The following items are explicitly carried forward from Wave 99 Prompt 07's scope and remain unresolved at this closeout:

- Production auth / middleware integration.
- Tenant permission validation (AAD identity + group membership resolution).
- Audit logging implementation and retention pipeline.
- Legal / compliance retention period finalization.
- Litigation-hold procedures and records-disposition schedules.
- Live HBI / vector / Graph / Procore / Sage integration gates.
- Persona-aware query policy at the data-plane.
- User-facing permission explanations (why was this withheld / masked).
- Telemetry / governance reporting surfaces.
- Hosted SharePoint package (`.sppkg`) validation, app-catalog publication, and tenant smoke tests if and when applicable.

These items are out of scope for this closeout and must be addressed in a later prompt or wave that explicitly authorizes the corresponding surface (auth / runtime / tenant / compliance).

---

## 7. Lockfile / package / manifest posture

- **Dependency changes:** none.
- **Package changes:** none.
- **Lockfile changes:** none. `pnpm-lock.yaml` MD5 unchanged across Prompts 07A–07D.
- **SharePoint manifest changes:** none.
- **Runtime source behavior changes:** none. The Prompt 07D model finalizer is a TypeScript contract narrowing (`UnifiedSearchRefusal.refusalReason: string → PccHbiRefusalReason`); it does not change runtime behavior, since the underlying string values are unchanged and were already in the canonical 5-tuple from 07B onward.
- **Test additions only at 07B/07C/07D:** all test additions are deterministic, fixture-driven, no-runtime, and add no new dependencies, build steps, or hosted artifacts.

Wave 99 Prompt 07 closes here. Subsequent prompts and waves take this closeout as the authoritative starting state for security, redaction, permission, evidence, and qualitative retention posture across PCC knowledge reuse, lifecycle memory, unified search, HBI grounding, warranty traceability, and cross-project reference behavior.
