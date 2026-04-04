/**
 * White-Glove Device Deployment — package template model, device platform
 * taxonomy, and code-default package catalog.
 *
 * These types define the six locked employee device package families,
 * their device slots, platform-specific attributes, and the governance
 * boundary between code-defined and admin-maintained template properties.
 *
 * @module admin-control-plane
 */

// ─── Package Families ──────────────────────────────────────────────────────────

/**
 * The six locked employee device package families.
 *
 * Each family defines a distinct set of devices assigned to an employee
 * role. Families are not collapsible into a generic device workflow.
 */
export enum WhiteGlovePackageFamily {
  /** VDC Personnel — iPhone, iPad, Alienware desktop */
  VdcPersonnel = 'vdc-personnel',

  /** Estimating Personnel — iPhone, Alienware laptop */
  EstimatingPersonnel = 'estimating-personnel',

  /** Office Personnel — HP or Dell laptop */
  OfficePersonnel = 'office-personnel',

  /** Operations Personnel — Management — HP or Dell laptop, iPhone */
  OperationsManagement = 'operations-management',

  /** Operations Personnel — Management (alternate) — MacBook Pro, iPhone */
  OperationsManagementAlt = 'operations-management-alt',

  /** Operations Personnel — Field Staff — iPhone, iPad, HP or Dell laptop */
  OperationsFieldStaff = 'operations-field-staff',
}

// ─── Device Platforms ──────────────────────────────────────────────────────────

/**
 * Device platform types with distinct enrollment paths.
 *
 * Windows desktop and laptop are separated because they may have
 * different Autopilot profiles and hardware provisioning steps.
 */
export enum WhiteGloveDevicePlatform {
  /** Windows desktop (e.g., Alienware desktop) — Autopilot + Intune */
  WindowsDesktop = 'windows-desktop',

  /** Windows laptop (e.g., HP/Dell/Alienware laptop) — Autopilot + Intune */
  WindowsLaptop = 'windows-laptop',

  /** macOS laptop (e.g., MacBook Pro) — Apple ADE + Intune MDM */
  MacOsLaptop = 'macos-laptop',

  /** iPhone — Apple ADE + Intune MDM */
  IPhone = 'iphone',

  /** iPad — Apple ADE + Intune MDM */
  IPad = 'ipad',
}

// ─── Device Manufacturers ──────────────────────────────────────────────────────

/**
 * Hardware manufacturers relevant to device slot constraints.
 */
export enum WhiteGloveDeviceManufacturer {
  HP = 'hp',
  Dell = 'dell',
  Alienware = 'alienware',
  Apple = 'apple',
}

// ─── Enrollment Authority ──────────────────────────────────────────────────────

/**
 * The external system that owns enrollment for a device platform.
 *
 * This determines which adapter family handles the enrollment phase.
 */
export enum WhiteGloveEnrollmentAuthority {
  /** Microsoft Autopilot + Intune (Windows devices) */
  MicrosoftAutopilot = 'microsoft-autopilot',

  /** Apple Automated Device Enrollment (iPhone, iPad, macOS) */
  AppleADE = 'apple-ade',
}

// ─── Template Attribute Governance ─────────────────────────────────────────────

/**
 * Classification for how a template attribute is governed.
 *
 * Code-defined attributes are set by the code baseline and cannot be
 * changed by IT. Governed overrides are admin-maintained via the UI.
 * Derived values are computed at run time.
 */
export enum WhiteGloveTemplateAttributeGovernance {
  /** Set by code baseline — not operator-editable */
  CodeDefined = 'code-defined',

  /** Admin-maintained via governed configuration UI */
  GovernedOverride = 'governed-override',

  /** Computed when the run launches or the template is resolved */
  DerivedAtRuntime = 'derived-at-runtime',
}

// ─── Device Slot ───────────────────────────────────────────────────────────────

/**
 * One device slot within a package template.
 *
 * A slot defines the platform, enrollment authority, allowed manufacturers,
 * and operational flags for a single device in the package.
 */
export interface IWhiteGloveDeviceSlot {
  /** Device platform for this slot */
  readonly platform: WhiteGloveDevicePlatform;

  /** Which external system owns enrollment for this device */
  readonly enrollmentAuthority: WhiteGloveEnrollmentAuthority;

  /** Allowed hardware manufacturers for this slot */
  readonly allowedManufacturers: readonly WhiteGloveDeviceManufacturer[];

  /** Human-readable slot label (e.g., "Alienware desktop", "HP or Dell laptop") */
  readonly label: string;

  /** Whether this device requires Windows Autopilot pre-provisioning (Windows only) */
  readonly requiresAutopilotPreProvisioning: boolean;

  /** Whether this device requires Apple ADE assignment (Apple only) */
  readonly requiresAdeAssignment: boolean;

  /** Whether NinjaOne post-enrollment standardization is required */
  readonly requiresNinjaOneStandardization: boolean;

  /** Ordering within the package (1-based) */
  readonly ordinal: number;
}

// ─── Package Template ──────────────────────────────────────────────────────────

/**
 * Complete package template definition.
 *
 * Template governance:
 * - `packageFamily`, `deviceSlots[].platform`, `deviceSlots[].enrollmentAuthority` — code-defined
 * - `deviceSlots[].allowedManufacturers`, `deviceSlots[].label`, `deviceSlots[].requiresNinjaOneStandardization` — governed override
 * - `version`, `source`, `effectiveAt` — derived at runtime
 */
export interface IWhiteGlovePackageTemplate {
  /** Which package family this template defines */
  readonly packageFamily: WhiteGlovePackageFamily;

  /** Human-readable package name */
  readonly label: string;

  /** Brief description of the package (devices included) */
  readonly description: string;

  /** Ordered device slots in this package */
  readonly deviceSlots: readonly IWhiteGloveDeviceSlot[];

  /** Template version (monotonically increasing) */
  readonly version: number;

  /** Governance source of this template snapshot */
  readonly source: 'code-default' | 'live-override' | 'merged';

  /** ISO 8601 timestamp when this template version became effective */
  readonly effectiveAt: string;

  /** UPN of the admin who created a live override (null for code defaults) */
  readonly createdBy: string | null;
}

// ─── Package Template Version ──────────────────────────────────────────────────

/**
 * Version history record for a package template.
 *
 * Used for audit trail and rollback of governed template changes.
 */
export interface IWhiteGlovePackageTemplateVersion {
  /** Which package family this version belongs to */
  readonly packageFamily: WhiteGlovePackageFamily;

  /** Version number */
  readonly version: number;

  /** Governance source at this version */
  readonly source: 'code-default' | 'live-override' | 'merged';

  /** ISO 8601 timestamp when this version became effective */
  readonly effectiveAt: string;

  /** ISO 8601 timestamp when this version was superseded (null if current) */
  readonly supersededAt: string | null;

  /** UPN of admin who made the change (null for code defaults) */
  readonly changedBy: string | null;

  /** Rationale for the change (null for code defaults) */
  readonly changeRationale: string | null;

  /** Device slots at this version */
  readonly deviceSlots: readonly IWhiteGloveDeviceSlot[];
}

// ─── Code-Default Package Catalog ──────────────────────────────────────────────

/**
 * The six code-default employee device package templates.
 *
 * This is the single source of truth for the code-defined baseline.
 * Live overrides are layered on top by the configuration governance system.
 */
export const WHITE_GLOVE_PACKAGE_CATALOG: Readonly<
  Record<WhiteGlovePackageFamily, IWhiteGlovePackageTemplate>
> = {
  [WhiteGlovePackageFamily.VdcPersonnel]: {
    packageFamily: WhiteGlovePackageFamily.VdcPersonnel,
    label: 'VDC Personnel',
    description: 'iPhone, iPad, Alienware desktop',
    deviceSlots: [
      {
        platform: WhiteGloveDevicePlatform.IPhone,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.AppleADE,
        allowedManufacturers: [WhiteGloveDeviceManufacturer.Apple],
        label: 'iPhone',
        requiresAutopilotPreProvisioning: false,
        requiresAdeAssignment: true,
        requiresNinjaOneStandardization: true,
        ordinal: 1,
      },
      {
        platform: WhiteGloveDevicePlatform.IPad,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.AppleADE,
        allowedManufacturers: [WhiteGloveDeviceManufacturer.Apple],
        label: 'iPad',
        requiresAutopilotPreProvisioning: false,
        requiresAdeAssignment: true,
        requiresNinjaOneStandardization: true,
        ordinal: 2,
      },
      {
        platform: WhiteGloveDevicePlatform.WindowsDesktop,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.MicrosoftAutopilot,
        allowedManufacturers: [WhiteGloveDeviceManufacturer.Alienware],
        label: 'Alienware desktop',
        requiresAutopilotPreProvisioning: true,
        requiresAdeAssignment: false,
        requiresNinjaOneStandardization: true,
        ordinal: 3,
      },
    ],
    version: 1,
    source: 'code-default',
    effectiveAt: '2026-04-03T00:00:00.000Z',
    createdBy: null,
  },

  [WhiteGlovePackageFamily.EstimatingPersonnel]: {
    packageFamily: WhiteGlovePackageFamily.EstimatingPersonnel,
    label: 'Estimating Personnel',
    description: 'iPhone, Alienware laptop',
    deviceSlots: [
      {
        platform: WhiteGloveDevicePlatform.IPhone,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.AppleADE,
        allowedManufacturers: [WhiteGloveDeviceManufacturer.Apple],
        label: 'iPhone',
        requiresAutopilotPreProvisioning: false,
        requiresAdeAssignment: true,
        requiresNinjaOneStandardization: true,
        ordinal: 1,
      },
      {
        platform: WhiteGloveDevicePlatform.WindowsLaptop,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.MicrosoftAutopilot,
        allowedManufacturers: [WhiteGloveDeviceManufacturer.Alienware],
        label: 'Alienware laptop',
        requiresAutopilotPreProvisioning: true,
        requiresAdeAssignment: false,
        requiresNinjaOneStandardization: true,
        ordinal: 2,
      },
    ],
    version: 1,
    source: 'code-default',
    effectiveAt: '2026-04-03T00:00:00.000Z',
    createdBy: null,
  },

  [WhiteGlovePackageFamily.OfficePersonnel]: {
    packageFamily: WhiteGlovePackageFamily.OfficePersonnel,
    label: 'Office Personnel',
    description: 'HP or Dell laptop',
    deviceSlots: [
      {
        platform: WhiteGloveDevicePlatform.WindowsLaptop,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.MicrosoftAutopilot,
        allowedManufacturers: [
          WhiteGloveDeviceManufacturer.HP,
          WhiteGloveDeviceManufacturer.Dell,
        ],
        label: 'HP or Dell laptop',
        requiresAutopilotPreProvisioning: true,
        requiresAdeAssignment: false,
        requiresNinjaOneStandardization: true,
        ordinal: 1,
      },
    ],
    version: 1,
    source: 'code-default',
    effectiveAt: '2026-04-03T00:00:00.000Z',
    createdBy: null,
  },

  [WhiteGlovePackageFamily.OperationsManagement]: {
    packageFamily: WhiteGlovePackageFamily.OperationsManagement,
    label: 'Operations Personnel — Management',
    description: 'HP or Dell laptop, iPhone',
    deviceSlots: [
      {
        platform: WhiteGloveDevicePlatform.WindowsLaptop,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.MicrosoftAutopilot,
        allowedManufacturers: [
          WhiteGloveDeviceManufacturer.HP,
          WhiteGloveDeviceManufacturer.Dell,
        ],
        label: 'HP or Dell laptop',
        requiresAutopilotPreProvisioning: true,
        requiresAdeAssignment: false,
        requiresNinjaOneStandardization: true,
        ordinal: 1,
      },
      {
        platform: WhiteGloveDevicePlatform.IPhone,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.AppleADE,
        allowedManufacturers: [WhiteGloveDeviceManufacturer.Apple],
        label: 'iPhone',
        requiresAutopilotPreProvisioning: false,
        requiresAdeAssignment: true,
        requiresNinjaOneStandardization: true,
        ordinal: 2,
      },
    ],
    version: 1,
    source: 'code-default',
    effectiveAt: '2026-04-03T00:00:00.000Z',
    createdBy: null,
  },

  [WhiteGlovePackageFamily.OperationsManagementAlt]: {
    packageFamily: WhiteGlovePackageFamily.OperationsManagementAlt,
    label: 'Operations Personnel — Management (alternate)',
    description: 'MacBook Pro, iPhone',
    deviceSlots: [
      {
        platform: WhiteGloveDevicePlatform.MacOsLaptop,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.AppleADE,
        allowedManufacturers: [WhiteGloveDeviceManufacturer.Apple],
        label: 'MacBook Pro',
        requiresAutopilotPreProvisioning: false,
        requiresAdeAssignment: true,
        requiresNinjaOneStandardization: true,
        ordinal: 1,
      },
      {
        platform: WhiteGloveDevicePlatform.IPhone,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.AppleADE,
        allowedManufacturers: [WhiteGloveDeviceManufacturer.Apple],
        label: 'iPhone',
        requiresAutopilotPreProvisioning: false,
        requiresAdeAssignment: true,
        requiresNinjaOneStandardization: true,
        ordinal: 2,
      },
    ],
    version: 1,
    source: 'code-default',
    effectiveAt: '2026-04-03T00:00:00.000Z',
    createdBy: null,
  },

  [WhiteGlovePackageFamily.OperationsFieldStaff]: {
    packageFamily: WhiteGlovePackageFamily.OperationsFieldStaff,
    label: 'Operations Personnel — Field Staff',
    description: 'iPhone, iPad, HP or Dell laptop',
    deviceSlots: [
      {
        platform: WhiteGloveDevicePlatform.IPhone,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.AppleADE,
        allowedManufacturers: [WhiteGloveDeviceManufacturer.Apple],
        label: 'iPhone',
        requiresAutopilotPreProvisioning: false,
        requiresAdeAssignment: true,
        requiresNinjaOneStandardization: true,
        ordinal: 1,
      },
      {
        platform: WhiteGloveDevicePlatform.IPad,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.AppleADE,
        allowedManufacturers: [WhiteGloveDeviceManufacturer.Apple],
        label: 'iPad',
        requiresAutopilotPreProvisioning: false,
        requiresAdeAssignment: true,
        requiresNinjaOneStandardization: true,
        ordinal: 2,
      },
      {
        platform: WhiteGloveDevicePlatform.WindowsLaptop,
        enrollmentAuthority: WhiteGloveEnrollmentAuthority.MicrosoftAutopilot,
        allowedManufacturers: [
          WhiteGloveDeviceManufacturer.HP,
          WhiteGloveDeviceManufacturer.Dell,
        ],
        label: 'HP or Dell laptop',
        requiresAutopilotPreProvisioning: true,
        requiresAdeAssignment: false,
        requiresNinjaOneStandardization: true,
        ordinal: 3,
      },
    ],
    version: 1,
    source: 'code-default',
    effectiveAt: '2026-04-03T00:00:00.000Z',
    createdBy: null,
  },
} as const;
