import type { ISeedConfig } from '../types';

export interface IBdLeadRow {
  companyName: string;
  contactName: string;
  contactEmail: string;
  projectType: string;
  estimatedValue: string;
  stage: string;
  owner: string;
  nextFollowUpDate: string;
}

export interface ILead {
  companyName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  projectType: string;
  estimatedValue: number | null;
  workflowStage: string;
  ownerId: string;
  nextFollowUpDate: string | null;
}

export const bdLeadsImportConfig: ISeedConfig<IBdLeadRow, ILead> = {
  name: 'BD Active Leads',
  recordType: 'bd-lead',
  acceptedFormats: ['xlsx', 'csv'],
  autoMapHeaders: true,
  allowPartialImport: true,
  batchSize: 50,

  fieldMappings: [
    {
      sourceColumn: 'Company Name',
      destinationField: 'companyName',
      label: 'Company Name',
      required: true,
    },
    {
      sourceColumn: 'Contact Name',
      destinationField: 'primaryContactName',
      label: 'Primary Contact Name',
      required: false,
    },
    {
      sourceColumn: 'Contact Email',
      destinationField: 'primaryContactEmail',
      label: 'Contact Email',
      required: false,
      validate: (val) => {
        if (!val) return null;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ? null
          : 'Invalid email format';
      },
    },
    {
      sourceColumn: 'Project Type',
      destinationField: 'projectType',
      label: 'Project Type',
      required: false,
    },
    {
      sourceColumn: 'Estimated Value',
      destinationField: 'estimatedValue',
      label: 'Estimated Value ($)',
      required: false,
      transform: (val) => {
        const num = parseFloat(val.replace(/[$,]/g, ''));
        return isNaN(num) ? null : num;
      },
      validate: (val) => {
        if (!val) return null;
        const num = parseFloat(val.replace(/[$,]/g, ''));
        return isNaN(num) ? 'Value must be a number (e.g., 1500000 or $1,500,000)' : null;
      },
    },
    {
      sourceColumn: 'Stage',
      destinationField: 'workflowStage',
      label: 'Stage',
      required: false,
    },
    {
      sourceColumn: 'Owner',
      destinationField: 'ownerId',
      label: 'Lead Owner (email or name)',
      required: false,
    },
    {
      sourceColumn: 'Next Follow-Up Date',
      destinationField: 'nextFollowUpDate',
      label: 'Next Follow-Up Date',
      required: false,
      validate: (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? 'Invalid date format (use YYYY-MM-DD or MM/DD/YYYY)' : null;
      },
      transform: (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      },
    },
  ],

  onImportComplete: async (result) => {
    console.log(
      `[BD Leads Import] Complete: ${result.successCount} imported, ${result.errorCount} errors`
    );
  },
};
