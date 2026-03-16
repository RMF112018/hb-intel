/**
 * HbcPermissionMatrix — Expert-gated permission grid
 * D-SF03-T07 / D-08: internal default gate + complexityMinTier/maxTier override props
 *
 * Styled role-permission table with card container.
 */
import * as React from 'react';
import { makeStyles } from '@griffel/react';
import { useComplexityGate } from '@hbc/complexity';
import { HBC_SURFACE_LIGHT, HBC_PRIMARY_BLUE } from '../theme/tokens.js';
import { HBC_RADIUS_LG } from '../theme/radii.js';
import { elevationLevel1 } from '../theme/elevation.js';
import { HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
import type { HbcPermissionMatrixProps } from './types.js';

const useStyles = makeStyles({
  root: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: HBC_RADIUS_LG,
    boxShadow: elevationLevel1,
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerCell: {
    fontSize: '0.875rem',
    fontWeight: 600,
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    textAlign: 'left',
    color: HBC_SURFACE_LIGHT['text-primary'],
    borderBottom: `2px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  bodyRow: {
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    },
  },
  roleCell: {
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    color: HBC_SURFACE_LIGHT['text-primary'],
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  permCell: {
    textAlign: 'center',
    padding: `${HBC_SPACE_SM}px`,
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: HBC_PRIMARY_BLUE,
    cursor: 'pointer',
  },
});

export function HbcPermissionMatrix({
  roles,
  permissions,
  onPermissionChange,
  complexityMinTier = 'expert',
  complexityMaxTier,
}: HbcPermissionMatrixProps): React.ReactElement | null {
  const styles = useStyles();
  const isVisible = useComplexityGate({
    minTier: complexityMinTier,
    maxTier: complexityMaxTier,
  });

  if (!isVisible) return null;

  return (
    <div data-hbc-ui="HbcPermissionMatrix" className={styles.root}>
      <table className={styles.table} role="grid" aria-label="Permission matrix">
        <thead>
          <tr>
            <th className={styles.headerCell} role="columnheader">Role</th>
            {permissions.map((p) => (
              <th key={p.id} className={styles.headerCell} role="columnheader">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} className={styles.bodyRow}>
              <td className={styles.roleCell} role="rowheader">{role.name}</td>
              {permissions.map((perm) => (
                <td key={perm.id} className={styles.permCell}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
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
