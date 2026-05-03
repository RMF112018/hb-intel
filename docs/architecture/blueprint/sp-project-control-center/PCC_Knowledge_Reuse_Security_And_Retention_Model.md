# PCC Knowledge Reuse Security And Retention Model

## About This Document

- **Classification:** Canonical Normative — Architecture Policy.
- **Scope:** Documentation-only doctrine. Does not implement runtime contracts, enforce permissions, or define legal/statutory requirements.
- **Sequence:** Wave 99 Prompt 07A. Consumed by Prompt 07B (model/fixture security enforcement), Prompt 07C (SPFx security rendering and guard hardening), and Prompt 07D (closeout).
- **Authority:** Resolves and synthesizes the security, redaction, permission, and retention posture distributed across:
  - `PCC_Company_Knowledge_Reuse_Model.md`
  - `PCC_Unified_Search_And_HBI_Grounding_Model.md`
  - `PCC_Project_Memory_Layer.md`
  - `PCC_Warranty_Traceability_Model.md`
  - `PCC_Role_And_Stage_Lens_Model.md`
  - `System_of_Record_Matrix.md`
  - `HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- **Posture qualifier:** This document defines **qualitative** security, redaction, permission, and retention posture for PCC architecture. It does **not** establish legal retention periods, statutory destruction rules, litigation-hold procedures, records-disposition schedules, regulator-defined audit-log durations, or jurisdiction-specific privacy requirements. Final retention durations, legal holds, and disposition rules require separate legal/compliance review and are tenant-readiness gates listed in Section 15.

---

## 1. Security Classes

PCC defines four security classes that apply across lifecycle, memory, search, traceability, warranty, and knowledge-reuse records. Each lifecycle, memory, decision, assumption, source-lineage, evidence-link, knowledge-reference, warranty-trace, and Ask-HBI response record carries a security class.

| Class              | Default visibility                                                                                  | When it applies                                                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project-internal` | All project participants with that project's access.                                                | Standard lifecycle activity, readiness, constraints, commitments, schedule, scope summaries, public submittals, approved products, general warranty trace context, and grounded answers backed by project-internal evidence. |
| `need-to-know`     | Specified roles or stage participants with documented business need.                                | Sub/vendor pricing in active negotiation, internal cost positions, RFP strategy, internal escalation drafts, persona-restricted lessons learned, sensitive personnel-adjacent context, and HR-adjacent commentary.           |
| `restricted`       | Named roles only (executive, accounting leadership, legal/admin), and explicitly granted reviewers. | Bid strategy, win/loss rationale, deal terms, owner-confidential context, dispute/claim/litigation context, financial book-of-record extracts not yet released, privileged personnel issues.                                 |
| `privileged`       | Legal counsel + named admin only; never auto-summarized.                                            | Attorney-client communications, litigation-hold material, privileged investigations, regulator-sensitive disclosures.                                                                                                        |

Rules:

- Every PCC-native record must carry a security class. PCC-derived records inherit the most restrictive class of any constituent source.
- A record's class can be raised by policy or by the originating user; lowering a class requires explicit owner action and audit.
- Source-owned records (Procore/Sage/M365) inherit the source's permission boundary; PCC does not relax a source-owned record's class through summarization.
- Cross-stage handoff does not change a record's class.

## 2. Redaction Posture

Three redaction levels apply to record fields, summaries, evidence references, and grounded answers:

| Level      | Meaning                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`     | Field renders as authored.                                                                                                                                       |
| `masked`   | Field is replaced with a structural placeholder (e.g., "$X.XX", "[redacted]", or category label) preserving shape but not content. The placeholder is auditable. |
| `withheld` | Field is omitted entirely. Caller is informed the field exists but is not visible at the caller's authorization.                                                 |

Behavior by surface:

| Surface                   | `project-internal`                                                                                  | `need-to-know`                                                                                           | `restricted`                                                           | `privileged`                              |
| ------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------- |
| Record summaries          | `none`                                                                                              | `none` (within audience) / `masked` (outside audience)                                                   | `masked` (outside audience) / `withheld` (general)                     | `withheld` (general)                      |
| Raw record access         | `none` (within project)                                                                             | Permission-gated; `withheld` outside audience                                                            | `withheld` outside named roles                                         | `withheld` outside legal/admin            |
| Evidence links            | `none` (project-internal targets)                                                                   | `masked` href / preserved category                                                                       | `withheld` href; description may be `masked`                           | `withheld`                                |
| Source URLs               | `none` if source class permits                                                                      | `masked`                                                                                                 | `withheld`                                                             | `withheld`                                |
| Executive-only notes      | `withheld` for non-executive personas; `masked` summary in executive lenses outside audience scope. | (see Section 5)                                                                                          | (see Section 5)                                                        | (see Section 5)                           |
| Pursuit/estimating fields | `none` (estimating audience)                                                                        | `masked` outside estimating; `withheld` for adverse parties (e.g., subcontractors visible in same view). | `withheld` outside estimating leadership.                              | n/a (escalates to privileged when legal). |
| Warranty / privacy fields | `none` (warranty audience)                                                                          | Personal-identifying / dwelling-occupant info `masked` by default.                                       | `withheld` outside warranty + admin.                                   | `withheld`.                               |
| HBI / Ask-HBI responses   | Cited summary at caller's class; quoted excerpts inherit source class redaction.                    | Same; uncited or insufficient → refusal.                                                                 | Same; refuses to summarize restricted material outside named audience. | HBI refuses; no summarization permitted.  |

Redaction is applied at read time, not at storage time. PCC does not destroy data at the redaction boundary.

## 3. Role / Persona Permission Rules

Permissions are enforced through **lenses** that filter shared project truth. Lenses do **not** create separate workspaces, separate stores, or alternate ownership. Lens output is governed by:

- caller persona,
- caller's project access boundary,
- caller's stage context,
- the record's security class,
- cross-project authorization status (default: none).

Persona groupings (mapped to `PCC_Role_And_Stage_Lens_Model.md`):

| Lens persona group                                                                                                                     | Default visibility profile                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `estimating` (Estimating Coordinator, Lead Estimator, Estimator, Marketing/Pursuits)                                                   | Pursuit + estimating + comparable-project references; restricted live financial; restricted privileged exec; warranty/closeout history is summary-safe.                                |
| `preconstruction` (Director of Preconstruction, IDS)                                                                                   | Readiness, mobilization, document/submittal lineage; HR redacted; live financial summary-only.                                                                                         |
| `operations` (Project Manager, Project Executive at PM scope)                                                                          | Active execution, constraints, buyout, commitments, change context; executive-only notes withheld; HR redacted.                                                                        |
| `field` (Superintendent, QAQC, Safety)                                                                                                 | Field execution, inspections, observations, scope/product approvals; commercial/financial detail withheld unless approved; pursuit detail withheld.                                    |
| `accounting` (Project Accountant)                                                                                                      | Commitment, buyout, closeout accounting posture; pursuit/exec strategy withheld; HR redacted.                                                                                          |
| `closeout` (Operations + IDS roles in closeout stage)                                                                                  | Turnover, evidence, warranty handoff; live pursuit detail withheld.                                                                                                                    |
| `warranty` (Warranty role)                                                                                                             | Warranty trace, obligation, vendor/product, closeout evidence; pursuit-confidential withheld; owner/resident PII masked by default.                                                    |
| `executive` (Project Executive lifecycle oversight, Executive Oversight portfolio)                                                     | Lifecycle outcomes, executive notes (within audience), risk posture, portfolio learning; HR-only withheld; project-level sensitive details across portfolio require explicit approval. |
| `admin` (IT / PCC Admin)                                                                                                               | Governance, configuration, audit, access review; business content withheld unless required for diagnostics with a logged justification.                                                |
| `future-pursuit-reference` (lens applied when an authorized estimating or marketing persona consults closed projects for new pursuits) | Summary-safe outcomes only; raw cost positions and privileged context never returned; cross-project lineage preserved with redaction (Section 11).                                     |

Operating rules:

- A record visible to one lens persona is not automatically visible to another. Persona escalation requires explicit grant and is auditable.
- Lens default is the persona's primary lens; switching is explicit, auditable, and reversible.
- Lens output never bypasses class-based redaction.

## 4. Pursuit / Estimating Sensitivity Rules

Pursuit and estimating context is `need-to-know` by default and may escalate to `restricted`.

| Field family                   | Within active pursuit                                                                                                  | Across HB internal (non-pursuit lenses) | Cross-project (future pursuit)                                                  | External display |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------- | ---------------- |
| Pursuit notes                  | `none` (estimating + leadership audience)                                                                              | `withheld`                              | `withheld` raw; summary-safe outcome only when explicitly approved.             | `withheld`.      |
| Go / no-go rationale           | `restricted` audience: estimating leadership + executive.                                                              | `withheld`.                             | `withheld` raw; high-level outcome reusable only with executive approval.       | `withheld`.      |
| Estimate assumptions           | `none` (estimating + linked operations during handoff).                                                                | `masked` outside estimating + ops.      | Summary-safe (assumption category + outcome trend) only; raw values `withheld`. | `withheld`.      |
| Bid strategy                   | `restricted`.                                                                                                          | `withheld`.                             | `withheld`.                                                                     | `withheld`.      |
| Subcontractor / vendor pricing | `need-to-know` within estimating + accounting; sub-specific pricing `withheld` from other subs.                        | `masked`.                               | `withheld` raw; aggregated category trends only with approval.                  | `withheld`.      |
| Client / deal terms            | `restricted`.                                                                                                          | `withheld`.                             | `withheld`.                                                                     | `withheld`.      |
| Future pursuit reuse           | Permitted only via the `future-pursuit-reference` lens (Section 3); routed through summary-safe outcomes (Section 13). | n/a                                     | n/a                                                                             | n/a              |

Summary-safe vs raw:

- Summary-safe = ranges, trend categories, outcome class, qualitative learning, redacted vendor/product references.
- Raw = exact prices, exact margins, named clients in confidential pursuit, named subs in adverse pricing context.

Raw record access requires the requesting user to be inside the named audience for the record's class. PCC does not synthesize raw values from summaries.

## 5. Executive-Only Notes

Executive-only notes are `restricted` by default and may escalate to `privileged`.

- **Classification:** `restricted` (executive lens audience). Notes flagged as personnel-sensitive, dispute-related, or privileged escalate to `privileged`.
- **Default access posture:** `withheld` for all non-executive personas. Executive-lens summaries do not surface raw note content outside the named audience.
- **Summary availability:** Executive-only notes do not appear in cross-persona summaries. Executive-derived risk signals (e.g., "review required") may surface as a flag only, with the underlying note `withheld`.
- **Redaction behavior:** When listed in a multi-class context (e.g., a lifecycle event log), the note is replaced with a structural placeholder indicating "executive-only".
- **Audit requirements:** Read access is logged. Persona escalation, lens override, and explicit grants are recorded as auditable events.
- **Cross-project reuse blockers:** Executive-only notes are never reused across projects. They are excluded from `future-pursuit-reference` outputs and from cross-project search outputs without exception.

## 6. Warranty / Privacy Rules

Warranty trace records may carry owner-, resident-, vendor-, subcontractor-, and product-identifying context. PCC's posture:

- **Privacy concerns:** Owner, occupant, resident, and private-party identifying information defaults to `masked` in non-warranty lenses. Warranty lens audience may see the information unmasked when the record is in their project boundary; executive and admin personas see masked by default and require explicit grant.
- **Responsibility-recommendation requirements:** PCC does not surface a warranty responsibility recommendation unless the underlying `WarrantyTraceRecord` carries lineage-backed evidence at or above the evidence threshold defined in Section 10. Otherwise PCC presents an "insufficient evidence" or "no-blame" posture.
- **Insufficient-evidence / no-blame posture:** When evidence is incomplete, ambiguous, or contradicted, PCC and HBI must render an explicit insufficient-evidence indicator. PCC must not infer responsibility, name a vendor/sub/manufacturer as responsible, or issue a closing conclusion.
- **Evidence threshold:** Responsibility surfaces require at minimum: (a) an obligation-trace lineage to a named scope, (b) an execution-evidence link to the responsible party (commitment + execution record), and (c) supporting closeout or field-execution evidence. Without all three, PCC remains in insufficient-evidence posture.
- **Vendor / subcontractor / manufacturer display:** Display is permitted only when responsibility lineage meets the evidence threshold. Otherwise the party is shown as a `masked` reference (e.g., "subcontractor scope: <category>") or `withheld` entirely depending on the consuming persona.
- **Owner / resident / private-party handling:** Identifiers are `masked` by default in any persona other than warranty + admin, and are `withheld` from cross-project references and from HBI responses unless the consuming persona is in audience for the unmasked field.

## 7. Closed-Project Access Rules

PCC distinguishes between:

| Project state                               | Access posture                                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Active                                      | Full lens behavior per Section 3, subject to security class.                                             |
| Closed (operations complete; warranty open) | Read-focused; warranty lens retains operational visibility; other personas operate in summary-safe mode. |
| Archive / future-reference                  | Read-only; outputs filtered through `future-pursuit-reference` lens (Section 3); raw records gated.      |

Rules:

- Closed-project reference mode is read-only. PCC does not mutate closed-project records via reuse activity.
- Summary-safe access is the default for non-warranty lenses on closed projects. Raw record access requires named role + documented business need + audit log.
- Cross-project reuse from a closed project requires the destination project's persona to be authorized for `future-pursuit-reference`, the source record to be reuse-eligible (Section 12), and no reuse blocker (Section 12) to be present.
- Closing a project does not declassify any record. A `restricted` record stays `restricted` after closeout.

## 8. Cross-Project Search Restrictions

Cross-project search (across HB-internal projects) is permitted only as a governed mode and never as the default search behavior.

- **Who:** estimating leadership, marketing/pursuits, executive oversight, and admin diagnostics personas with explicit grant. Standard project personas may not perform cross-project search by default.
- **What can be returned:** project metadata, scope summaries, outcome categories, lessons learned references, comparable-project references, anonymized warranty pattern signals. Raw cost positions, raw client/deal terms, named subs in adverse pricing, executive-only notes, privileged content, and PII are never returned.
- **How redaction works:** results inherit the source record's class and apply Section 2 redaction posture. The `future-pursuit-reference` lens forces summary-safe rendering (ranges, categories, outcome class).
- **Never returned:** privileged content, executive-only notes, raw bid strategy, raw deal terms, raw owner/resident PII, and any record whose project authorization is not granted to the caller.
- **Future-pursuit reference display:** Comparable references show scope profile, outcome class, lesson reference, and a stable reference id. They do not show raw cost values, raw client identifiers, or raw private-party PII.
- **Why this is not a source-of-record change:** cross-project search returns governed references and reuse summaries; it does not move ownership, reassign records, or create writeback into a different project. PCC remains the operating layer above unchanged sources of record.

## 9. Source-Owned vs PCC-Native vs PCC-Derived Records

PCC categorizes every retrievable record into one of three families. Permission, redaction, and retention follow ownership.

| Family         | Definition                                                                                                     | Examples                                                                                                                                                                                                | Authority                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `source-owned` | Record whose system of record is external to PCC.                                                              | Procore-native commitments, RFIs, submittals, daily logs; Sage-native accounting records; M365/SharePoint/Graph files and source documents.                                                             | Source system. PCC reads; PCC does not write back unless explicitly authorized doctrine permits it. |
| `pcc-native`   | Record whose system of record is PCC.                                                                          | PCC project memory records, decisions, assumptions, lifecycle events, knowledge-reuse references, warranty trace records, Ask-HBI response logs (when stored), evidence-link records, lens preferences. | PCC.                                                                                                |
| `pcc-derived`  | Record produced by PCC summarization, transformation, or grounding over source-owned and/or pcc-native inputs. | Summary cards, Ask-HBI grounded answers, comparable-project summaries, warranty-trace summaries, lens-filtered views.                                                                                   | PCC. Never declared as a source of truth.                                                           |

Alignment with the `System_of_Record_Matrix.md`:

- Procore owns Procore-native records.
- Sage owns the accounting book-of-record.
- Microsoft 365 / SharePoint / Microsoft Graph own files and source documents.
- PCC owns PCC-native workflow, memory, knowledge-reuse, traceability, and grounding records.
- HBI does not own source truth and does not become a system of record under any lens.

Rules:

- A `pcc-derived` record never overrides the originating source. If source data changes or is revoked, derived outputs must reflect that on next read.
- A `pcc-derived` record carries the most restrictive class of any constituent input.
- Cross-family redaction follows the most restrictive constituent.

## 10. Evidence-Link Behavior

Every PCC-derived conclusion, memory record, traceability claim, or HBI grounded answer must carry source lineage. Source lineage is required, not optional, for:

- decisions, assumptions, lifecycle decisions of record;
- warranty trace conclusions and obligation traces;
- comparable-project, lessons-learned, and knowledge-reuse references;
- Ask-HBI grounded answers.

Required source-lineage fields (conceptual; runtime contracts in models package):

- source system identifier;
- source object identifier;
- source object type;
- source URL or reference handle;
- as-of read timestamp;
- inherited security class;
- evidence-snippet identifier (when applicable);
- redaction state at link time.

Visibility:

- Evidence-link visibility follows Section 2 redaction posture by class.
- Source-URL visibility follows the source-system class and is `masked` or `withheld` for personas outside the source's audience.
- Evidence excerpts are `masked` or `withheld` when class disallows reproduction; the lineage record itself is preserved and auditable.

Citations in Ask-HBI answers:

- Every factual sentence must cite at least one evidence-link reference.
- Citations carry inherited class. Citations to `restricted` or `privileged` content are not rendered to personas outside audience; the answer must instead refuse, qualify, or omit the claim.
- An Ask-HBI answer with at least one uncitable factual claim must not be presented as grounded — it must refuse or qualify (Section 11).

Audit-trail expectations:

- Read access to source URLs is logged.
- Lineage record creation, redaction at read time, and grant/escalation events are logged.

## 11. HBI / Search Grounding Restrictions

Ask-HBI and unified search inherit all of the above and add the following grounding constraints:

- **No uncited grounded answers.** If any factual claim cannot cite a lineage record, HBI must refuse or qualify rather than answer.
- **Refusal / insufficient-evidence behavior.** When retrieval finds no eligible evidence, when evidence falls below threshold, or when permission filtering removes too much context, HBI must return an insufficient-evidence response with structured indicators. PCC must not synthesize a confident answer over insufficient evidence.
- **No source-truth claim.** HBI never declares itself the source of truth, never declares a `pcc-derived` summary authoritative, and never claims a `source-owned` record's content beyond what the lineage permits.
- **No live LLM / vector / search behavior in preview.** Preview surfaces (Wave 99 Prompts 06A–06D) do not perform live model inference, live vector recall, or live unified search. Preview behavior is fixture-grounded.
- **Project-scoped posture.** Default search posture is project-scoped. Cross-project queries require Section 8 authorization.
- **Cross-project search restrictions.** All Section 8 restrictions apply to HBI cross-project context.
- **Warranty / responsibility refusals.** HBI must refuse responsibility conclusions for warranty claims that do not meet the evidence threshold (Section 6). HBI must not name a vendor/sub/manufacturer as responsible from inference alone.
- **Refusal taxonomy.** HBI refusal modes include: `insufficient-evidence`, `permission-restricted`, `out-of-scope`, `cross-project-not-authorized`, `responsibility-conclusion-not-supported`. Each refusal is auditable and renderable.

## 12. Retention Posture by Record Family

PCC retention posture is **qualitative** and uses the categories below. Concrete legal, statutory, contractual, and tenant-policy retention durations are out of scope (see About This Document).

| Category                         | Meaning                                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `source-system retained`         | Retention is governed by the upstream source. PCC does not extend, shorten, or dictate the source's retention. |
| `project lifecycle retained`     | Retained for the duration of the active project lifecycle.                                                     |
| `closed-project archive`         | Retained in a read-only reference posture after project close.                                                 |
| `restricted executive retention` | Retained under restricted access; subject to executive/legal review for declassification or purge.             |
| `warranty-period retention`      | Retained at least through the relevant warranty obligation window referenced by the record.                    |
| `audit-log retained`             | Retained as a tamper-evident audit log entry; never edited; declassification only via admin/legal review.      |
| `purge / block candidate`        | Marked for purge or block at policy review; not surfaced in lenses pending decision.                           |

Posture by record family:

| Record family                                           | Retention category                                                                                                                                                          |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifecycle events                                        | `project lifecycle retained`; transitions to `closed-project archive` at close.                                                                                             |
| Memory records (`ProjectMemoryRecord`)                  | `project lifecycle retained` → `closed-project archive`.                                                                                                                    |
| Decisions (`ProjectDecisionRecord`)                     | `project lifecycle retained` → `closed-project archive`; decisions tied to obligations may carry `warranty-period retention`.                                               |
| Assumptions (`ProjectAssumptionRecord`)                 | `project lifecycle retained` → `closed-project archive`; pursuit-confidential assumptions carry `restricted executive retention` overlay until declassified.                |
| Executive notes                                         | `restricted executive retention`.                                                                                                                                           |
| Pursuit notes                                           | `restricted executive retention` while pursuit is active; `closed-project archive` with `restricted` overlay after pursuit outcome.                                         |
| Traceability edges (obligation/vendor-product/closeout) | `project lifecycle retained` → `warranty-period retention` for warranty-relevant edges.                                                                                     |
| Warranty trace records                                  | `warranty-period retention`; transitions to `closed-project archive` after warranty close.                                                                                  |
| Cross-project reference records                         | Mirror the source record's category; reference pointer itself is `closed-project archive`.                                                                                  |
| Ask-HBI query / response records (when stored)          | `audit-log retained`; query content inherits class of inputs.                                                                                                               |
| Evidence / citations                                    | `project lifecycle retained` → `warranty-period retention` when warranty-relevant; lineage retained as `audit-log retained` even when underlying citation moves to archive. |
| Source-system references                                | `source-system retained` (PCC does not control).                                                                                                                            |

Override rule: when a record carries `privileged` or active-litigation class, retention defaults escalate; declassification or disposition requires legal/compliance review (Section 15).

## 13. Reuse Blockers

A record is **not** eligible for cross-project reuse, future-pursuit reference, or external summarization when any of the following applies:

- class is `privileged`;
- class is `restricted` and no summary-safe approval is recorded;
- redaction state for the consuming persona is `withheld`;
- record is an executive-only note;
- the project is under active litigation, claim, or dispute affecting the record's domain;
- the record carries privacy-sensitive warranty details that have not been masked to the consuming persona;
- the record contains owner/client confidential data not yet released for reference;
- the record contains subcontractor pricing in scope/category not approved for cross-project sharing;
- source lineage is missing;
- evidence threshold is not met (see Section 10);
- traceability confidence is below the documented reuse threshold (qualitative; defined per record family by 07B);
- source-system access is denied for the consuming persona.

A reuse blocker must be surfaced as the reason for refusal or omission; PCC must not return a reused record while silently dropping a blocker.

## 14. Summaries vs Raw Record Exposure

- **When summaries are safe:** when the summary fields are produced from inputs whose class permits summarization to the consuming persona, when no reuse blocker (Section 12) applies, and when source lineage is preserved.
- **When raw records can be opened:** when the consuming persona is in audience for the record's class, the persona has lens-appropriate access, and the action is logged.
- **When raw records are blocked:** when class is outside audience, when redaction is `withheld`, when a reuse blocker applies, or when the record is in a closed project being accessed via `future-pursuit-reference`.
- **Allowed summary fields (illustrative):** scope category, outcome class, qualitative trend, lesson reference, evidence-link metadata (without restricted excerpts), aggregated category counts, and stable reference identifiers.
- **Masked / withheld raw fields (illustrative):** exact bid values, exact margins, named clients in confidential pursuit, named subs in adverse pricing scopes, raw owner/resident PII, executive-only note bodies, privileged investigation text, full source-system URLs to restricted artifacts.

PCC must not promote a summary to a raw-record stand-in. A summary that exposes restricted detail through composition is a class violation.

## 15. Auditability and Tenant-Readiness Gates

Before live runtime activation in tenant environments, the following gates must be cleared. These are the remaining gaps beyond Wave 99 doctrine work:

- **Tenant permission validation.** Confirm that lens permissions, persona memberships, and project-boundary grants resolve correctly against tenant identity and group membership.
- **Audit logging.** Confirm that read access, lens switches, persona escalations, redaction events at read time, cross-project search, and Ask-HBI refusals are recorded with tamper-evident entries.
- **Access review.** Confirm that named-role audiences (executive, accounting, legal/admin, warranty) are reviewed per HB internal access-review cadence.
- **Security review.** Confirm that class assignments on PCC-native and PCC-derived records meet the doctrine in Sections 1–11 and that no class downgrade path bypasses owner action.
- **Retention review.** Convert the qualitative retention categories (Section 12) into concrete retention durations and disposition rules with legal/compliance.
- **Legal / compliance review.** Validate litigation-hold procedures, records-disposition schedules, and statutory/regulatory retention obligations. (This document does not establish those.)
- **Microsoft 365 permission-boundary validation.** Confirm SharePoint, Graph, and OneDrive permission boundaries are honored by PCC reads and that PCC never exposes content outside the user's M365-resolved permission scope.
- **HBI grounding attestation.** Confirm that production HBI behavior cannot return uncited grounded answers, cannot bypass class-based redaction, cannot perform unauthorized cross-project retrieval, and surfaces refusal reasons truthfully per the Section 11 taxonomy.

Until each gate is cleared for the relevant runtime, PCC must remain in fixture-grounded preview posture for the affected surfaces.

---

## Appendix — Cross-References

This document is the canonical source for PCC security, redaction, persona-permission, and qualitative retention posture. It complements (and does not supersede) the doctrine in:

- `PCC_Company_Knowledge_Reuse_Model.md` — knowledge-reuse use cases and conceptual record families.
- `PCC_Unified_Search_And_HBI_Grounding_Model.md` — search and HBI grounding architecture.
- `PCC_Project_Memory_Layer.md` — project memory records, lineage, and grounding posture.
- `PCC_Warranty_Traceability_Model.md` — obligation, vendor/product, and warranty trace records.
- `PCC_Role_And_Stage_Lens_Model.md` — lens persona definitions and stage lenses.
- `System_of_Record_Matrix.md` — system-of-record ownership matrix.
- `HB_Project_Control_Center_Target_Architecture_Blueprint.md` — target architecture (referenced at section level).

Wave 99 closeout (Prompt 07D) is responsible for any cross-reference and index updates in surrounding docs. This document does not edit those docs.

## Unified Lifecycle Developer Contracts Cross-Reference

Implementation and future changes for unified lifecycle behavior MUST align with the developer contracts in `docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/`, including bounded-context ownership, route taxonomy and forbidden routes, record state machines, field-level dictionary, permission/redaction resolution, HBI citation/refusal contract, source-system integration contracts, audit-event model, degraded-state matrix, module onboarding template, and validation/test gates.

This reference is documentation governance only. It does not assert production/live tenant readiness and does not authorize runtime/source-system mutations.
