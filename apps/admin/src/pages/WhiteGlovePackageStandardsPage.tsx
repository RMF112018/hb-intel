/**
 * P9.1-11: White-Glove Package Standards and Governance page.
 *
 * Displays package template browse/detail, code-baseline vs live-override
 * visibility, governed attribute classification, NinjaOne standards bundle
 * mapping, version history, and change attribution.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import {
  WorkspacePageShell,
  HbcCard,
  HbcTypography,
  HbcStatusBadge,
  HbcBanner,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
} from '@hbc/ui-kit';
import { WhiteGloveTemplateAttributeGovernance } from '@hbc/models';
import { useWhiteGloveTemplateGovernance } from '../hooks/useWhiteGloveTemplateGovernance.js';

const useStyles = makeStyles({
  templateGrid: {
    display: 'flex',
    gap: `${HBC_SPACE_MD}px`,
    flexWrap: 'wrap',
    marginTop: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_LG}px`,
  },
  templateCardWrapper: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: `${HBC_SPACE_LG * 12}px`,
    cursor: 'pointer',
  },
  selectedWrapper: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: `${HBC_SPACE_LG * 12}px`,
    cursor: 'pointer',
    outline: `${HBC_SPACE_SM / 2}px solid currentcolor`,
  },
  templateCard: {
    padding: `${HBC_SPACE_MD}px`,
  },
  detailSection: {
    marginTop: `${HBC_SPACE_LG}px`,
  },
  slotCard: {
    padding: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  slotHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  attributeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${HBC_SPACE_SM / 2}px 0`,
  },
  bundleList: {
    marginTop: `${HBC_SPACE_SM}px`,
    marginLeft: `${HBC_SPACE_MD}px`,
  },
  governanceSection: {
    marginTop: `${HBC_SPACE_LG}px`,
  },
  versionSection: {
    marginTop: `${HBC_SPACE_LG}px`,
  },
});

function governanceBadgeVariant(governance: WhiteGloveTemplateAttributeGovernance): 'neutral' | 'warning' | 'inProgress' {
  if (governance === WhiteGloveTemplateAttributeGovernance.CodeDefined) return 'neutral';
  if (governance === WhiteGloveTemplateAttributeGovernance.GovernedOverride) return 'warning';
  return 'inProgress';
}

function governanceLabel(governance: WhiteGloveTemplateAttributeGovernance): string {
  if (governance === WhiteGloveTemplateAttributeGovernance.CodeDefined) return 'Code-defined';
  if (governance === WhiteGloveTemplateAttributeGovernance.GovernedOverride) return 'Governed override';
  return 'Derived';
}

export function WhiteGlovePackageStandardsPage(): ReactNode {
  const session = useCurrentSession();
  const styles = useStyles();
  const {
    templates,
    families,
    selectedFamily,
    selectedTemplate,
    selectFamily,
    attributeGovernance,
    getBundlesForSlot,
  } = useWhiteGloveTemplateGovernance();

  if (!session) {
    return <WorkspacePageShell layout="list" title="Loading..." isLoading>{null}</WorkspacePageShell>;
  }

  return (
    <WorkspacePageShell layout="list" title="White-Glove Package Standards">
      <HbcTypography intent="heading2">Package Templates</HbcTypography>
      <HbcTypography intent="body">
        Browse and manage the six governed employee device package templates.
        Code-defined attributes are locked; governed overrides are admin-editable through the configuration system.
      </HbcTypography>

      <div className={styles.templateGrid}>
        {families.map((family, i) => {
          const template = templates[i];
          const isSelected = selectedFamily === family;
          return (
            <div
              key={family}
              className={isSelected ? styles.selectedWrapper : styles.templateCardWrapper}
              onClick={() => selectFamily(family)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') selectFamily(family); }}
            >
              <HbcCard className={styles.templateCard}>
                <HbcTypography intent="heading3">{template.label}</HbcTypography>
                <HbcTypography intent="bodySmall">{template.description}</HbcTypography>
                <HbcTypography intent="label">{template.deviceSlots.length} device{template.deviceSlots.length > 1 ? 's' : ''} | v{template.version}</HbcTypography>
                <HbcStatusBadge
                  variant={template.source === 'code-default' ? 'neutral' : template.source === 'live-override' ? 'warning' : 'inProgress'}
                  label={template.source}
                />
              </HbcCard>
            </div>
          );
        })}
      </div>

      {selectedTemplate && (
        <>
          <div className={styles.detailSection}>
            <HbcTypography intent="heading2">{selectedTemplate.label} — Detail</HbcTypography>

            <HbcBanner variant="info">
              Source: {selectedTemplate.source} | Version: {selectedTemplate.version} | Effective: {new Date(selectedTemplate.effectiveAt).toLocaleDateString()}
              {selectedTemplate.createdBy ? ` | Created by: ${selectedTemplate.createdBy}` : ' | Code baseline'}
            </HbcBanner>

            <HbcTypography intent="heading3">Device Slots</HbcTypography>
            {selectedTemplate.deviceSlots.map((slot) => {
              const bundles = getBundlesForSlot(slot);
              return (
                <HbcCard key={slot.ordinal} className={styles.slotCard}>
                  <div className={styles.slotHeader}>
                    <HbcTypography intent="heading3">{slot.label}</HbcTypography>
                    <HbcStatusBadge variant="neutral" label={slot.platform} />
                  </div>

                  <div className={styles.attributeRow}>
                    <HbcTypography intent="bodySmall">Enrollment authority</HbcTypography>
                    <HbcTypography intent="body">{slot.enrollmentAuthority}</HbcTypography>
                  </div>
                  <div className={styles.attributeRow}>
                    <HbcTypography intent="bodySmall">Manufacturers</HbcTypography>
                    <div>
                      {slot.allowedManufacturers.map((m) => (
                        <HbcStatusBadge key={m} variant="neutral" label={m} />
                      ))}
                    </div>
                  </div>
                  <div className={styles.attributeRow}>
                    <HbcTypography intent="bodySmall">Autopilot pre-provisioning</HbcTypography>
                    <HbcStatusBadge variant={slot.requiresAutopilotPreProvisioning ? 'completed' : 'neutral'} label={slot.requiresAutopilotPreProvisioning ? 'Required' : 'N/A'} />
                  </div>
                  <div className={styles.attributeRow}>
                    <HbcTypography intent="bodySmall">ADE assignment</HbcTypography>
                    <HbcStatusBadge variant={slot.requiresAdeAssignment ? 'completed' : 'neutral'} label={slot.requiresAdeAssignment ? 'Required' : 'N/A'} />
                  </div>
                  <div className={styles.attributeRow}>
                    <HbcTypography intent="bodySmall">NinjaOne standardization</HbcTypography>
                    <HbcStatusBadge variant={slot.requiresNinjaOneStandardization ? 'completed' : 'neutral'} label={slot.requiresNinjaOneStandardization ? 'Required' : 'N/A'} />
                  </div>

                  {bundles.length > 0 && (
                    <div className={styles.bundleList}>
                      <HbcTypography intent="label">Standards Bundles</HbcTypography>
                      {bundles.map((b) => (
                        <div key={b.bundleId} className={styles.attributeRow}>
                          <HbcTypography intent="bodySmall">{b.bundleName}</HbcTypography>
                          <HbcStatusBadge variant={b.required ? 'completed' : 'neutral'} label={b.bundleType} />
                        </div>
                      ))}
                    </div>
                  )}
                </HbcCard>
              );
            })}
          </div>

          <div className={styles.governanceSection}>
            <HbcTypography intent="heading2">Attribute Governance</HbcTypography>
            <HbcTypography intent="body">
              Each template attribute has a governance classification that determines whether it can be edited by IT operators.
            </HbcTypography>
            {attributeGovernance.map((attr) => (
              <div key={attr.field} className={styles.attributeRow}>
                <HbcTypography intent="body">{attr.label}</HbcTypography>
                <HbcStatusBadge variant={governanceBadgeVariant(attr.governance)} label={governanceLabel(attr.governance)} />
              </div>
            ))}
          </div>

          <div className={styles.versionSection}>
            <HbcTypography intent="heading2">Version History</HbcTypography>
            <HbcBanner variant="info">
              Current version: v{selectedTemplate.version} ({selectedTemplate.source}).
              Version history tracking will be available when governed overrides are persisted through the backend configuration system.
            </HbcBanner>
          </div>
        </>
      )}
    </WorkspacePageShell>
  );
}
