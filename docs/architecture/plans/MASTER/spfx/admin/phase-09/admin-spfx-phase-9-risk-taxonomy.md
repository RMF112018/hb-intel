# Phase 9 Risk Taxonomy

## Purpose

Define the risk classification tiers for hybrid identity actions and the operator UX consequences of each tier. This taxonomy governs how Prompts 08–09 build confirmation, preview, and safety UX.

---

## Risk tiers

### Routine

**Definition:** Non-destructive read or low-impact write operations with easily reversible outcomes.

**Examples:** U-01 (search users), U-02 (read profile), U-05 (update user properties), U-09 (enable account), G-01–G-03 (search/read groups), G-05 (update group properties), G-06 (add members to cloud group), G-09 (add members to AD-synced group), S-01–S-03 (sync checks).

**Operator UX consequences:**
- Standard form submission — no extra confirmation dialog.
- Preview panel showing what will change (for writes).
- Result displayed inline.
- Audit record written silently.

---

### Elevated

**Definition:** Non-destructive but impactful operations that change account state, grant access, or affect multiple objects.

**Examples:** U-03 (create AD user), U-04 (create cloud user), U-07 (disable AD user), U-08 (disable cloud user), G-04 (create cloud group), G-07 (remove members from cloud group), G-10 (remove members from AD group), G-11 (create AD group), A-01 (grant rollout-critical membership), A-02 (normalize new-employee access).

**Operator UX consequences:**
- Preview panel showing the planned action with before/after or target state.
- Explicit confirmation dialog ("You are about to disable this account. Proceed?").
- For create actions: show all planned attributes and target location.
- For access actions: show all group assignments and authority routing.
- Result displayed with evidence summary.
- Full audit record with evidence payload.

---

### Destructive

**Definition:** Operations that permanently remove objects or cannot be reversed without significant effort.

**Examples:** U-11 (delete AD user), U-12 (delete cloud user), G-08 (delete cloud group), G-12 (delete AD group).

**Operator UX consequences:**
- Double confirmation dialog (confirm intent → confirm impact).
- Pre-action state snapshot displayed (user profile, group membership).
- Impact panel showing downstream effects (group memberships lost, access removed).
- Complexity-gated — only visible to operators with expert complexity tier.
- Permission-gated — requires elevated admin permission.
- Full audit record with evidence payload including pre-state snapshot.
- Post-action verification offered.

---

### Privileged-admin / role-assignable edge cases

**Definition:** Operations that affect directory roles, security policies, or objects with elevated governance requirements (role-assignable groups, PIM-managed roles).

**Examples:** D-01 (manage role-assignable groups), D-02 (assign directory roles).

**Phase 9 disposition:** **Deferred.** These require PIM-level governance and approval workflows that Phase 9 does not build. They are cataloged for completeness but must not be implemented without dedicated architecture review.

**If later implemented:**
- Approval workflow required before execution.
- Time-limited activation where applicable.
- Full audit with governance evidence.

---

### Sync-sensitive

**Definition:** Actions that succeed immediately in the authoritative system but have delayed visibility in the cloud-side system due to Azure AD Connect sync cycles.

**Examples:** S-04 (verify sync propagation), and any post-AD-DS-mutation state where the operator checks cloud-side results.

**Operator UX consequences:**
- Sync-pending indicator after AD DS mutations.
- Estimated sync window displayed (typically 30 min for delta sync).
- Manual "Check sync status" button.
- Warning if operator attempts to act on stale cloud-side data.
- Audit records link mutation and subsequent sync verification.

---

### Preview-only / defer-until-safer

**Definition:** Actions that are technically feasible but deferred from Phase 9 because they require additional architecture review, policy decisions, or safety infrastructure.

**Examples:** U-13 (reset password AD), U-14 (unlock account AD), U-15 (reset password cloud), D-01–D-02 (role management).

**Operator UX consequences:**
- If the action appears in UI at all, it is read-only / informational.
- No execution button.
- Informational text: "This action will be available in a future phase."
- No backend endpoint for execution.

---

## Risk tier summary matrix

| Tier | Confirmation | Preview | Double-confirm | Complexity gate | Evidence | Pre-state snapshot | Sync indicator |
|------|-------------|---------|----------------|----------------|---------|-------------------|---------------|
| Routine | No | Optional (writes) | No | No | Read audit | No | No |
| Elevated | Yes | Required | No | No | Full audit + evidence | No | If AD DS |
| Destructive | Yes | Required | **Yes** | **Yes** (expert) | Full audit + evidence | **Yes** | If AD DS |
| Privileged-admin | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | N/A |
| Sync-sensitive | N/A | N/A | N/A | No | Linked audit | No | **Yes** |
| Preview-only/defer | N/A | Informational | N/A | N/A | None | No | No |

---

## Permission escalation by risk tier

| Tier | Minimum admin permission | Additional gate |
|------|------------------------|-----------------|
| Routine | `admin:identity:read` | None |
| Elevated | `admin:identity:write` | Confirmation dialog |
| Destructive | `admin:identity:delete` | Double confirmation + expert complexity tier |
| Privileged-admin | Deferred | PIM / approval workflow (not Phase 9) |

These permission strings are illustrative. Prompt-08 will define the final permission model for the admin app.

---

## Cross-references

| Document | Purpose |
|----------|---------|
| `admin-spfx-phase-9-identity-action-catalog.md` | Action catalog with risk tier per action |
| `admin-spfx-phase-9-permission-access-role-and-consent-matrix.md` | Permission requirements per action |
| `admin-spfx-phase-9-hybrid-identity-architecture-baseline.md` | Architecture baseline |
