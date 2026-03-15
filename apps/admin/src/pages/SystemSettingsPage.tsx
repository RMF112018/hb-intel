import { useState } from 'react';
import type { ReactNode } from 'react';
import { AdminAccessControlPage, PermissionGate, ADMIN_APPROVAL_MANAGE } from '@hbc/auth';
import type { AccessControlAdminSection } from '@hbc/auth';
import { ApprovalAuthorityTable, ApprovalRuleEditor } from '@hbc/features-admin';
import type { IApprovalAuthorityRule } from '@hbc/features-admin';
import {
  HbcBanner,
  HbcButton,
  HbcModal,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';

interface SystemSettingsPageProps {
  initialSection?: AccessControlAdminSection;
}

/**
 * System Settings page — access control administration and approval authority
 * configuration for technical admins.
 *
 * @design G6-T02
 */
export function SystemSettingsPage({ initialSection = 'user-lookup' }: SystemSettingsPageProps): ReactNode {
  const [editingRule, setEditingRule] = useState<IApprovalAuthorityRule | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  return (
    <WorkspacePageShell layout="list" title="Administration">
      <AdminAccessControlPage
        title="Access Control Administration"
        initialSection={initialSection}
      />

      {/* G6-T02: Approval authority configuration — technical admin only */}
      <PermissionGate action={ADMIN_APPROVAL_MANAGE}>
        <HbcTypography intent="heading2">Approval Authority Configuration</HbcTypography>
        <HbcBanner variant="info">
          Approval authority rules are not persisted in Wave 0. Configuration changes will be lost on page reload (SF17-T05).
        </HbcBanner>
        <ApprovalAuthorityTable
          onEditRule={(rule) => {
            setEditingRule(rule);
            setShowEditor(true);
          }}
        />
        <HbcButton
          variant="secondary"
          onClick={() => {
            setEditingRule(null);
            setShowEditor(true);
          }}
        >
          Add Rule
        </HbcButton>
        <HbcModal
          open={showEditor}
          onClose={() => setShowEditor(false)}
          title={editingRule ? 'Edit Rule' : 'Add Rule'}
          size="md"
        >
          <ApprovalRuleEditor
            rule={editingRule ?? undefined}
            onSave={async () => {
              setShowEditor(false);
            }}
            onCancel={() => setShowEditor(false)}
          />
        </HbcModal>
      </PermissionGate>
    </WorkspacePageShell>
  );
}
