/**
 * Admin Control Plane — domain, risk, and execution-mode enums.
 *
 * These are the canonical identifiers for the admin action vocabulary.
 * They are pure enums with no runtime logic or external dependencies.
 *
 * @module admin-control-plane
 */

// ─── Admin Domains ──────────────────────────────────────────────────────────────

/**
 * Canonical admin domain identifiers.
 *
 * Each domain represents a distinct area of IT control-center capability.
 * Domains map 1:1 to the Phase 1 domain taxonomy.
 */
export enum AdminDomain {
  /** Backend install, bootstrap, and environment setup */
  SetupInstall = 'setup-install',

  /** Environment readiness checks and dependency validation */
  ValidationReadiness = 'validation-readiness',

  /** Site provisioning and rollout execution */
  ProvisioningRollout = 'provisioning-rollout',

  /** HB Intel-managed SharePoint asset control */
  SharePointControl = 'sharepoint-control',

  /** Hybrid identity administration (AD DS/on-prem and Entra ID/Graph) */
  EntraControl = 'entra-control',

  /** Standards and configuration governance */
  StandardsConfig = 'standards-config',

  /** Health monitoring, alerts, and infrastructure probes */
  HealthObservability = 'health-observability',

  /** Repair, recovery, and remediation actions */
  RepairRecovery = 'repair-recovery',

  /** Managed app-binding and backend-setup configuration (Phase 6A) */
  AppBinding = 'app-binding',
}

// ─── Risk Levels ────────────────────────────────────────────────────────────────

/**
 * Admin action risk levels.
 *
 * Risk level determines execution-mode defaults and safety control requirements.
 * Higher risk requires more safety controls (previews, dry runs, evidence).
 */
export enum AdminRiskLevel {
  /** Read-only observation. No state change. No approval needed. */
  ReadOnly = 'read-only',

  /** Low-risk state change. Reversible or non-destructive. Minimal approval. */
  Low = 'low',

  /** Moderate-risk state change. May affect shared resources. Standard approval. */
  Moderate = 'moderate',

  /** High-risk state change. Affects tenant resources or identity. Enhanced controls required. */
  High = 'high',

  /** Destructive or irreversible action. Maximum safety controls. Preview/dry-run mandatory. */
  Critical = 'critical',
}

// ─── Execution Modes ────────────────────────────────────────────────────────────

/**
 * Admin action execution modes.
 *
 * The execution mode determines how the control plane processes an action:
 * whether it runs straight through, pauses at checkpoints, requires
 * enhanced safety controls, or produces observation-only output.
 */
export enum AdminExecutionMode {
  /**
   * Runs straight through from start to finish without operator intervention.
   * The system only pauses if a failure or error occurs.
   *
   * Example: provisioning saga under normal conditions.
   */
  Seamless = 'seamless',

  /**
   * Pauses at defined checkpoints for operator review before continuing.
   * The operator must explicitly approve each checkpoint to proceed.
   *
   * Example: Entra group membership changes with impact preview.
   */
  Checkpointed = 'checkpointed',

  /**
   * Irreversible or high-impact action requiring maximum safety controls.
   * Must offer preview/dry-run, impact summary, explicit confirmation,
   * and post-action validation.
   *
   * Example: site deletion, permission removal, config reset.
   */
  Destructive = 'destructive',

  /**
   * Read-only observation or analysis. Produces a report or assessment
   * without making any state changes.
   *
   * Example: drift detection, readiness check, health probe.
   */
  Advisory = 'advisory',
}
