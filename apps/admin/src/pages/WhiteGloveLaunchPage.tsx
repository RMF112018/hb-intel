/**
 * P9.1-09: White-Glove Package Launch page.
 *
 * Multi-step workflow: employee lookup → package selection →
 * per-device intake → preflight summary → launch confirmation.
 * All six package families preserved. Platform-specific device intake.
 */

import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import {
  WorkspacePageShell,
  HbcCard,
  HbcTypography,
  HbcButton,
  HbcStatusBadge,
  HbcBanner,
  HbcTextField,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
} from '@hbc/ui-kit';
import {
  WhiteGlovePackageFamily,
  WHITE_GLOVE_PACKAGE_CATALOG,
} from '@hbc/models';
import { useWhiteGloveLaunch } from '../hooks/useWhiteGloveLaunch.js';
import type { ILaunchDeviceInput, IEmployeeIdentity } from '../hooks/useWhiteGloveLaunch.js';

type LaunchStep = 'employee' | 'package' | 'devices' | 'preflight' | 'confirm';

const useStyles = makeStyles({
  stepHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  inputRow: {
    display: 'flex',
    gap: `${HBC_SPACE_MD}px`,
    alignItems: 'flex-end',
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  fieldWrapper: {
    flexGrow: 1,
  },
  packageGrid: {
    display: 'flex',
    gap: `${HBC_SPACE_MD}px`,
    flexWrap: 'wrap',
    marginTop: `${HBC_SPACE_MD}px`,
  },
  packageCardWrapper: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: `${HBC_SPACE_LG * 15}px`,
    cursor: 'pointer',
  },
  packageCard: {
    padding: `${HBC_SPACE_MD}px`,
  },
  selectedCardWrapper: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: `${HBC_SPACE_LG * 15}px`,
    cursor: 'pointer',
    outline: `${HBC_SPACE_SM / 2}px solid currentcolor`,
  },
  deviceSlot: {
    padding: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  actions: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_LG}px`,
  },
  reviewSection: {
    marginBottom: `${HBC_SPACE_MD}px`,
  },
});

const PACKAGE_FAMILIES = Object.values(WhiteGlovePackageFamily);

// ─── Step Components ────────────────────────────────────────────────────────

function EmployeeStep({ onLookup, employee, loading, error }: {
  onLookup: (upn: string) => void;
  employee: IEmployeeIdentity | null;
  loading: boolean;
  error: string | null;
}): ReactNode {
  const styles = useStyles();
  const [upn, setUpn] = useState('');

  return (
    <>
      <HbcTypography intent="heading2">Step 1: Employee Lookup</HbcTypography>
      <HbcTypography intent="body">Enter the employee UPN to look up their identity for device assignment.</HbcTypography>
      <div className={styles.inputRow}>
        <div className={styles.fieldWrapper}>
          <HbcTextField
            label="Employee UPN"
            value={upn}
            onChange={(value) => setUpn(value)}
          />
        </div>
        <HbcButton variant="primary" onClick={() => onLookup(upn)} disabled={loading || !upn.includes('@')}>
          {loading ? 'Looking up...' : 'Look Up'}
        </HbcButton>
      </div>
      {error && <HbcBanner variant="error">{error}</HbcBanner>}
      {employee && (
        <HbcCard>
          <HbcTypography intent="heading3">{employee.displayName}</HbcTypography>
          <HbcTypography intent="body">{employee.userPrincipalName}</HbcTypography>
          <HbcStatusBadge variant={employee.accountEnabled ? 'completed' : 'error'} label={employee.accountEnabled ? 'Active' : 'Disabled'} />
        </HbcCard>
      )}
    </>
  );
}

function PackageSelectionStep({ selectedFamily, onSelect }: {
  selectedFamily: WhiteGlovePackageFamily | null;
  onSelect: (family: WhiteGlovePackageFamily) => void;
}): ReactNode {
  const styles = useStyles();

  return (
    <>
      <HbcTypography intent="heading2">Step 2: Package Selection</HbcTypography>
      <HbcTypography intent="body">Select the employee device package. Each package defines a distinct set of devices.</HbcTypography>
      <div className={styles.packageGrid}>
        {PACKAGE_FAMILIES.map((family) => {
          const template = WHITE_GLOVE_PACKAGE_CATALOG[family];
          const isSelected = selectedFamily === family;
          return (
            <div key={family} className={isSelected ? styles.selectedCardWrapper : styles.packageCardWrapper} onClick={() => onSelect(family)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onSelect(family); }}>
              <HbcCard className={styles.packageCard}>
                <HbcTypography intent="heading3">{template.label}</HbcTypography>
                <HbcTypography intent="bodySmall">{template.description}</HbcTypography>
                <HbcTypography intent="label">{template.deviceSlots.length} device{template.deviceSlots.length > 1 ? 's' : ''}</HbcTypography>
              </HbcCard>
            </div>
          );
        })}
      </div>
    </>
  );
}

function DeviceIntakeStep({ family, deviceInputs, onUpdateDevice }: {
  family: WhiteGlovePackageFamily;
  deviceInputs: Map<number, Partial<ILaunchDeviceInput>>;
  onUpdateDevice: (ordinal: number, field: string, value: string) => void;
}): ReactNode {
  const styles = useStyles();
  const template = WHITE_GLOVE_PACKAGE_CATALOG[family];

  return (
    <>
      <HbcTypography intent="heading2">Step 3: Device Details</HbcTypography>
      <HbcTypography intent="body">Enter details for each device in the {template.label} package.</HbcTypography>
      {template.deviceSlots.map((slot) => {
        const current = deviceInputs.get(slot.ordinal) ?? {};
        return (
          <HbcCard key={slot.ordinal} className={styles.deviceSlot}>
            <HbcTypography intent="heading3">{slot.label}</HbcTypography>
            <HbcTypography intent="bodySmall">Platform: {slot.platform} | Enrollment: {slot.enrollmentAuthority}</HbcTypography>
            <div className={styles.inputRow}>
              <div className={styles.fieldWrapper}>
                <HbcTextField
                  label="Serial Number"
                  value={current.serialNumber ?? ''}
                  onChange={(value) => onUpdateDevice(slot.ordinal, 'serialNumber', value)}
                />
              </div>
              <div className={styles.fieldWrapper}>
                <HbcTextField
                  label="Asset Tag (optional)"
                  value={current.assetTag ?? ''}
                  onChange={(value) => onUpdateDevice(slot.ordinal, 'assetTag', value)}
                />
              </div>
              {(slot.platform === 'windows-desktop' || slot.platform === 'windows-laptop' || slot.platform === 'macos-laptop') && (
                <div className={styles.fieldWrapper}>
                  <HbcTextField
                    label="Hostname (optional)"
                    value={current.hostname ?? ''}
                    onChange={(value) => onUpdateDevice(slot.ordinal, 'hostname', value)}
                  />
                </div>
              )}
            </div>
          </HbcCard>
        );
      })}
    </>
  );
}

function PreflightStep({ family, deviceInputs }: {
  family: WhiteGlovePackageFamily;
  deviceInputs: Map<number, Partial<ILaunchDeviceInput>>;
}): ReactNode {
  const template = WHITE_GLOVE_PACKAGE_CATALOG[family];
  const missingSerials = template.deviceSlots.filter((slot) => {
    const input = deviceInputs.get(slot.ordinal);
    return !input?.serialNumber;
  });

  const hasWindowsDevices = template.deviceSlots.some(
    (s) => s.platform === 'windows-desktop' || s.platform === 'windows-laptop',
  );

  return (
    <>
      <HbcTypography intent="heading2">Step 4: Preflight Summary</HbcTypography>
      {missingSerials.length > 0 && (
        <HbcBanner variant="error">
          Missing serial numbers for: {missingSerials.map((s) => s.label).join(', ')}
        </HbcBanner>
      )}
      {missingSerials.length === 0 && (
        <HbcBanner variant="info">All required fields are complete. Review checkpoint expectations below.</HbcBanner>
      )}
      <HbcTypography intent="heading3">Checkpoint Expectations</HbcTypography>
      <HbcTypography intent="body">The following pauses may occur during execution:</HbcTypography>
      <ul>
        <li><HbcTypography intent="body">Connector readiness validation before launch</HbcTypography></li>
        {hasWindowsDevices && (
          <li><HbcTypography intent="body">Technician pre-provisioning for Windows devices (Autopilot OOBE)</HbcTypography></li>
        )}
        <li><HbcTypography intent="body">NinjaOne downstream standardization completion</HbcTypography></li>
        <li><HbcTypography intent="body">Recovery checkpoint if any device encounters a failure</HbcTypography></li>
      </ul>
    </>
  );
}

function ConfirmStep({ family, employee, deviceInputs, onLaunch, launching, launchError }: {
  family: WhiteGlovePackageFamily;
  employee: IEmployeeIdentity;
  deviceInputs: Map<number, Partial<ILaunchDeviceInput>>;
  onLaunch: () => void;
  launching: boolean;
  launchError: string | null;
}): ReactNode {
  const styles = useStyles();
  const template = WHITE_GLOVE_PACKAGE_CATALOG[family];

  return (
    <>
      <HbcTypography intent="heading2">Step 5: Confirm Launch</HbcTypography>
      <div className={styles.reviewSection}>
        <HbcTypography intent="heading3">Employee</HbcTypography>
        <HbcTypography intent="body">{employee.displayName} ({employee.userPrincipalName})</HbcTypography>
      </div>
      <div className={styles.reviewSection}>
        <HbcTypography intent="heading3">Package</HbcTypography>
        <HbcTypography intent="body">{template.label} — {template.description}</HbcTypography>
      </div>
      <div className={styles.reviewSection}>
        <HbcTypography intent="heading3">Devices ({template.deviceSlots.length})</HbcTypography>
        {template.deviceSlots.map((slot) => {
          const input = deviceInputs.get(slot.ordinal);
          return (
            <HbcTypography key={slot.ordinal} intent="body">
              {slot.label}: {input?.serialNumber ?? '(missing)'}{input?.assetTag ? ` | Tag: ${input.assetTag}` : ''}{input?.hostname ? ` | Host: ${input.hostname}` : ''}
            </HbcTypography>
          );
        })}
      </div>
      {launchError && <HbcBanner variant="error">{launchError}</HbcBanner>}
      <HbcBanner variant="warning">
        Launching will create a package run with {template.deviceSlots.length} device run{template.deviceSlots.length > 1 ? 's' : ''}. This action will invoke backend connectors.
      </HbcBanner>
      <div className={styles.actions}>
        <HbcButton variant="primary" onClick={onLaunch} disabled={launching}>
          {launching ? 'Launching...' : 'Launch Package Run'}
        </HbcButton>
      </div>
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export function WhiteGloveLaunchPage(): ReactNode {
  const session = useCurrentSession();
  const styles = useStyles();
  const {
    employee, employeeLoading, employeeError, lookupEmployee,
    launchPackageRun, launching, launchError,
  } = useWhiteGloveLaunch();

  const [step, setStep] = useState<LaunchStep>('employee');
  const [selectedFamily, setSelectedFamily] = useState<WhiteGlovePackageFamily | null>(null);
  const [deviceInputs, setDeviceInputs] = useState<Map<number, Partial<ILaunchDeviceInput>>>(new Map());
  const [launched, setLaunched] = useState(false);

  const handleUpdateDevice = useCallback((ordinal: number, field: string, value: string) => {
    setDeviceInputs((prev) => {
      const next = new Map(prev);
      const current = next.get(ordinal) ?? {};
      next.set(ordinal, { ...current, [field]: value });
      return next;
    });
  }, []);

  const handleLaunch = useCallback(async () => {
    if (!employee || !selectedFamily) return;
    const template = WHITE_GLOVE_PACKAGE_CATALOG[selectedFamily];
    const devices: ILaunchDeviceInput[] = template.deviceSlots.map((slot) => {
      const input = deviceInputs.get(slot.ordinal) ?? {};
      return {
        slotOrdinal: slot.ordinal,
        platform: slot.platform,
        manufacturer: slot.allowedManufacturers[0] ?? 'unknown',
        enrollmentAuthority: slot.enrollmentAuthority,
        serialNumber: input.serialNumber ?? '',
        assetTag: input.assetTag,
        hostname: input.hostname,
      };
    });

    await launchPackageRun({
      packageFamily: selectedFamily,
      templateVersion: template.version,
      employeeDisplayName: employee.displayName,
      employeeUpn: employee.userPrincipalName,
      employeeObjectId: employee.id,
      devices,
    });
    setLaunched(true);
  }, [employee, selectedFamily, deviceInputs, launchPackageRun]);

  if (!session) {
    return <WorkspacePageShell layout="list" title="Loading..." isLoading>{null}</WorkspacePageShell>;
  }

  if (launched) {
    return (
      <WorkspacePageShell layout="list" title="White-Glove Package Launch">
        <HbcBanner variant="info">Package run launched successfully. Navigate to Run History to monitor progress.</HbcBanner>
        <div className={styles.actions}>
          <HbcButton variant="primary" onClick={() => { setLaunched(false); setStep('employee'); setSelectedFamily(null); setDeviceInputs(new Map()); }}>
            Launch Another
          </HbcButton>
        </div>
      </WorkspacePageShell>
    );
  }

  const canAdvance = (): boolean => {
    if (step === 'employee') return !!employee && employee.accountEnabled;
    if (step === 'package') return !!selectedFamily;
    if (step === 'devices' && selectedFamily) {
      const template = WHITE_GLOVE_PACKAGE_CATALOG[selectedFamily];
      return template.deviceSlots.every((slot) => {
        const input = deviceInputs.get(slot.ordinal);
        return !!input?.serialNumber;
      });
    }
    if (step === 'preflight') return canAdvance(); // Same validation as devices
    return true;
  };

  const STEPS: LaunchStep[] = ['employee', 'package', 'devices', 'preflight', 'confirm'];
  const stepIndex = STEPS.indexOf(step);

  return (
    <WorkspacePageShell layout="list" title="White-Glove Package Launch">
      <div className={styles.stepHeader}>
        <HbcTypography intent="label">Step {stepIndex + 1} of {STEPS.length}</HbcTypography>
      </div>

      {step === 'employee' && (
        <EmployeeStep onLookup={(upn) => { lookupEmployee(upn).catch(() => {}); }} employee={employee} loading={employeeLoading} error={employeeError} />
      )}
      {step === 'package' && (
        <PackageSelectionStep selectedFamily={selectedFamily} onSelect={setSelectedFamily} />
      )}
      {step === 'devices' && selectedFamily && (
        <DeviceIntakeStep family={selectedFamily} deviceInputs={deviceInputs} onUpdateDevice={handleUpdateDevice} />
      )}
      {step === 'preflight' && selectedFamily && (
        <PreflightStep family={selectedFamily} deviceInputs={deviceInputs} />
      )}
      {step === 'confirm' && selectedFamily && employee && (
        <ConfirmStep family={selectedFamily} employee={employee} deviceInputs={deviceInputs} onLaunch={() => { handleLaunch().catch(() => {}); }} launching={launching} launchError={launchError} />
      )}

      <div className={styles.actions}>
        {stepIndex > 0 && (
          <HbcButton variant="secondary" onClick={() => setStep(STEPS[stepIndex - 1])}>
            Back
          </HbcButton>
        )}
        {stepIndex < STEPS.length - 1 && (
          <HbcButton variant="primary" onClick={() => setStep(STEPS[stepIndex + 1])} disabled={!canAdvance()}>
            Next
          </HbcButton>
        )}
      </div>
    </WorkspacePageShell>
  );
}
