/**
 * HbcPermissionMatrix types — D-SF03-T07 / D-08
 * Permission configuration grid, gated at Expert by default.
 */
import type { IComplexityAwareProps } from '@hbc/complexity';

export interface IRole {
  id: string;
  name: string;
}

export interface IPermission {
  id: string;
  name: string;
}

export interface HbcPermissionMatrixProps extends IComplexityAwareProps {
  /** Roles displayed as matrix rows */
  roles: IRole[];
  /** Permissions displayed as matrix columns */
  permissions: IPermission[];
  /** Callback when a permission grant is toggled */
  onPermissionChange: (roleId: string, permissionId: string, granted: boolean) => void;
}
