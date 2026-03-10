import type { ISeedConfig } from '../types';

export interface IAdminUserRow {
  displayName: string;
  email: string;
  jobTitle: string;
  department: string;
  role: string;
  manager: string;
}

export interface IHbIntelUser {
  displayName: string;
  email: string;
  jobTitle: string;
  department: string;
  hbIntelRole: string;
  managerId: string;
}

export const adminUserImportConfig: ISeedConfig<IAdminUserRow, IHbIntelUser> = {
  name: 'HB Intel User Accounts',
  recordType: 'hb-intel-user',
  acceptedFormats: ['csv'],
  autoMapHeaders: true,
  allowPartialImport: false,
  batchSize: 100,

  fieldMappings: [
    {
      sourceColumn: 'Display Name',
      destinationField: 'displayName',
      label: 'Display Name',
      required: true,
    },
    {
      sourceColumn: 'Email',
      destinationField: 'email',
      label: 'Email Address',
      required: true,
      validate: (val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ? null
          : 'Invalid email address format';
      },
    },
    {
      sourceColumn: 'Job Title',
      destinationField: 'jobTitle',
      label: 'Job Title',
      required: false,
    },
    {
      sourceColumn: 'Department',
      destinationField: 'department',
      label: 'Department',
      required: false,
    },
    {
      sourceColumn: 'HB Intel Role',
      destinationField: 'hbIntelRole',
      label: 'HB Intel Role',
      required: true,
      validate: (val) => {
        const validRoles = ['admin', 'estimating-coordinator', 'project-manager', 'bd-director', 'viewer'];
        return validRoles.includes(val.toLowerCase())
          ? null
          : `Invalid role. Must be one of: ${validRoles.join(', ')}`;
      },
      transform: (val) => val.toLowerCase(),
    },
    {
      sourceColumn: 'Manager Email',
      destinationField: 'managerId',
      label: 'Manager Email',
      required: false,
      validate: (val) => {
        if (!val) return null;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ? null
          : 'Invalid manager email format';
      },
    },
  ],
};
