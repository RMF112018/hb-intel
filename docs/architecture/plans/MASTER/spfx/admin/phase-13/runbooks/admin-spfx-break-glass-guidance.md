# Admin SPFx IT Control Center — Break-Glass Guidance

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-06 — Phase 13 Incident Triage, Recovery, and Break-Glass Runbooks
**Scope:** Tightly governed emergency access procedures
**Owner:** T2 (Platform Engineering) with T4 (Architecture) post-action review

---

## 1. Purpose and limitations

Break-glass procedures are **emergency-only** actions that bypass normal operational controls to restore service or prevent data loss when standard recovery procedures (see Service Recovery Runbook) have failed.

### What break-glass IS

- A last-resort action when normal recovery is insufficient
- A tightly governed procedure with mandatory approval, evidence, and post-action review
- An auditable action with full documentation before, during, and after

### What break-glass IS NOT

- A shortcut for routine operations
- A substitute for proper deployment, configuration, or recovery procedures
- A standing authorization — each use requires individual approval
- An excuse to bypass security controls permanently

**Prohibition:** Break-glass procedures must NEVER be normalized into regular operations. If a break-glass action is needed more than once for the same scenario, the underlying issue must be resolved through proper engineering work, and the break-glass path must be retired for that scenario.

---

## 2. Allowed scenarios

Break-glass actions are permitted ONLY in the following scenarios. Any scenario not listed here requires T4 (Architecture) approval before proceeding.

### BG-1 — Emergency force-state override on stuck provisioning run

**When:** A provisioning run is stuck in a non-terminal state, standard retry has failed, and the stuck state is blocking new provisioning or causing cascading failures.

**Normal path that failed:** T1 retry via UI → T2 investigation → retry ceiling reached → run remains stuck.

**Break-glass action:**
1. T2 uses expert-tier force-state override on `/runs` (requires `ADMIN_PROVISIONING_FORCE_STATE` permission + expert complexity tier)
2. Set the run to the appropriate terminal state (`failed` with classification `admin-class`)
3. Do NOT set to `completed` unless all saga steps genuinely completed

**Approval:** T2 senior or T4 verbal approval before action. Record approver name.

**Risk:** Incorrect state may cause orphaned resources (partially created sites, groups). Must verify state after override.

### BG-2 — Emergency Table Storage entity correction

**When:** A table entity has incorrect data that is causing runtime errors or incorrect behavior, and the issue cannot be resolved by restarting services or re-processing.

**Normal path that failed:** Service recovery (R4) → restart → data still incorrect → no code-level fix available immediately.

**Break-glass action:**
1. T2 identifies the specific entity (table, partition key, row key, field)
2. T2 documents the current value and the intended correction
3. T2 modifies the entity via Azure Storage Explorer or Azure Portal
4. Modification is limited to the specific field(s) needed — no bulk operations

**Approval:** T4 approval required (written — not verbal). Record approver, entity details, old value, new value.

**Risk:** Incorrect modification may cause further data inconsistency. Table Storage has no undo. Must verify application behavior after modification.

### BG-3 — Emergency credential rotation

**When:** A credential (app registration secret, GitHub Environment secret) has been compromised or has expired causing total service outage, and normal rotation procedures are too slow for the severity.

**Normal path that failed:** Standard secret rotation (P13-03 Section 4.3) requires coordinated update across Key Vault / GitHub / Azure Portal. In an emergency, the outage impact justifies faster action.

**Break-glass action:**
1. Generate a new secret in the appropriate identity provider (Entra ID, GitHub)
2. Update the consuming service immediately (Function App Configuration, GitHub Environment secrets)
3. Verify service recovery
4. Complete the full rotation procedure afterward (update all references, revoke old secret)

**Approval:** T2 and T3 jointly. If credential compromise is suspected, notify security team.

**Risk:** Partial rotation may leave stale references. Must complete full rotation within 24 hours.

### BG-4 — Emergency SPFx re-deployment bypassing staging verification

**When:** A critical production issue requires immediate SPFx deployment and the standard staging verification (Deployment Runbook Section 3.1) cannot be completed in time.

**Normal path that failed:** Standard deployment requires staging verification before production promotion. In a Sev 1 emergency, staging may be unavailable or the time to verify staging exceeds acceptable downtime.

**Break-glass action:**
1. Deploy the known-good .sppkg directly to production App Catalog (bypassing staging)
2. OR: Approve the GitHub Environment production deployment without waiting for full staging verification

**Approval:** T2 senior approval. Record justification for bypassing staging.

**Risk:** Untested in staging may introduce new issues. Must complete staging verification retroactively within 4 hours.

---

## 3. Scenarios explicitly NOT allowed as break-glass

| Scenario | Why not | Correct path |
|----------|---------|-------------|
| Bypassing permission gates for convenience | Permission gates are a security control, not an operational inconvenience | Request proper permissions through normal channels |
| Modifying Graph/Entra permissions without IT involvement | Tenant-level identity changes have broad security implications | Escalate to T3 (IT) through normal support model |
| Deleting Table Storage tables or bulk-deleting entities | Irreversible data loss with no recovery path | Never permitted — investigate data issues through engineering |
| Disabling auth middleware or CORS controls | Removes security boundaries from production | Never permitted — fix the underlying auth issue |
| Direct code edits to production Function App (Kudu, in-portal editing) | Bypasses CI/CD, version control, and testing | Never permitted — all code changes go through git + CI + deployment |
| Creating new Azure resources without documentation | Undocumented infrastructure creates operational blind spots | Follow IT-Department-Setup-Guide for any new resource |
| Granting `Sites.FullControl.All` instead of `Sites.Selected` | Violates least-privilege model | Never permitted — use per-site grants |

---

## 4. Approval and evidence expectations

### Before break-glass action

| Requirement | Detail |
|------------|--------|
| Verbal or written approval from designated approver | BG-1: T2 senior or T4. BG-2: T4 (written). BG-3: T2 + T3. BG-4: T2 senior. |
| Document current state | What is broken, what has been tried, why normal recovery is insufficient |
| Document intended action | Specific action to be taken, expected outcome |
| Confirm reversibility | Can this action be undone? If not, is the risk accepted? |

### During break-glass action

| Requirement | Detail |
|------------|--------|
| Single operator executes | One person performs the action; no parallel break-glass operations |
| Real-time documentation | Record each step as it is performed (timestamps, commands, results) |
| Minimal scope | Do only what is necessary to restore service. Do not "fix other things while you're in there." |

### After break-glass action

| Requirement | Detail |
|------------|--------|
| Verify service recovery | Run minimum validation from Service Recovery Runbook Section 3.1 |
| Complete evidence record | Fill out the full break-glass audit record (see below) |
| Notify stakeholders | Per P13-04 support model — post-incident notification |
| Schedule post-action review | Within 3 business days (see Section 5) |

### Break-glass audit record

| Field | Required |
|-------|----------|
| Break-glass scenario ID (BG-1 through BG-4) | Yes |
| Date and time of action | Yes |
| Who performed the action | Yes |
| Who approved the action | Yes |
| What normal recovery was attempted first | Yes |
| Why normal recovery was insufficient | Yes |
| Exact action taken (step by step) | Yes |
| Pre-action system state | Yes |
| Post-action system state | Yes |
| Validation results | Yes |
| Any side effects or unexpected outcomes | Yes |
| Follow-up actions required | Yes |
| Post-action review scheduled date | Yes |

---

## 5. Post-action review requirement

Every break-glass action requires a post-action review within 3 business days.

### Review goals

1. **Confirm the action was justified** — Was the break-glass truly necessary, or could normal recovery have been used?
2. **Identify root cause** — Why did the system reach a state where break-glass was needed?
3. **Determine preventive action** — What can be changed to prevent this scenario from requiring break-glass again?
4. **Update runbooks if needed** — Should this scenario be added to the Service Recovery Runbook as a standard recovery path?
5. **Retire the break-glass path if resolved** — If the underlying issue is fixed, document that this break-glass scenario is no longer expected.

### Review participants

- T2 engineer who performed the action
- Approver who authorized the action
- T4 (Architecture) if the review reveals a design issue
- T3 (IT) if the review involves infrastructure changes

### Review output

A brief written summary (1 page or less) covering:
- What happened
- What was done
- Whether it was justified
- What will be done to prevent recurrence
- Whether any runbook updates are needed

---

## Cross-references

| Document | Location |
|----------|----------|
| Incident Triage Runbook | `phase-13/runbooks/admin-spfx-incident-triage-runbook.md` |
| Service Recovery Runbook | `phase-13/runbooks/admin-spfx-service-recovery-runbook.md` |
| Rollback and Recovery Runbook | `phase-13/runbooks/admin-spfx-rollback-and-recovery-runbook.md` |
| Support Model and Escalation Matrix | `phase-13/admin-spfx-phase-13-support-model-and-escalation-matrix.md` |
| Environment Baseline | `phase-13/admin-spfx-phase-13-environment-identity-and-dependency-baseline.md` |
