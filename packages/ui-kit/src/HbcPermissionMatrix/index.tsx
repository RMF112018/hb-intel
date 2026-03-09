/**
 * HbcPermissionMatrix — Expert-gated permission grid stub
 * D-SF03-T07 / D-08: internal default gate + complexityMinTier/maxTier override props
 *
 * Stub component — full implementation deferred to module phases.
 */
import * as React from 'react';
import { useComplexityGate } from '@hbc/complexity';
import type { HbcPermissionMatrixProps } from './types.js';

export function HbcPermissionMatrix({
  roles,
  permissions,
  onPermissionChange,
  complexityMinTier = 'expert',
  complexityMaxTier,
}: HbcPermissionMatrixProps): React.ReactElement | null {
  const isVisible = useComplexityGate({
    minTier: complexityMinTier,
    maxTier: complexityMaxTier,
  });

  if (!isVisible) return null;

  return (
    <div data-hbc-ui="HbcPermissionMatrix">
      {/* T07 stub — full permission matrix implementation in module phases */}
      <table>
        <thead>
          <tr>
            <th>Role</th>
            {permissions.map((p) => (
              <th key={p.id}>{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              {permissions.map((perm) => (
                <td key={perm.id}>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      onPermissionChange(role.id, perm.id, e.target.checked)
                    }
                    aria-label={`${role.name} — ${perm.name}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type { HbcPermissionMatrixProps, IRole, IPermission } from './types.js';
