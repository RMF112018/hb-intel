import type { ISeedConfig } from '../types';
import type { IProcoreProjectRow } from '../parsers';

export interface IProjectRecordSeed {
  projectName: string;
  projectNumber: string;
  status: string;
  startDate: string;
  completionDate: string;
  contractValue: number | null;
  clientName: string;
  projectManagerId: string;
  superintendentId: string;
  procoreId: string;
}

export const projectHubImportConfig: ISeedConfig<IProcoreProjectRow, IProjectRecordSeed> = {
  name: 'Project Hub Active Projects',
  recordType: 'project-record',
  acceptedFormats: ['xlsx', 'procore-export'],
  autoMapHeaders: true,
  allowPartialImport: true,
  batchSize: 25,

  fieldMappings: [
    {
      sourceColumn: 'projectName',
      destinationField: 'projectName',
      label: 'Project Name',
      required: true,
    },
    {
      sourceColumn: 'projectNumber',
      destinationField: 'projectNumber',
      label: 'Project Number',
      required: false,
    },
    {
      sourceColumn: 'status',
      destinationField: 'status',
      label: 'Project Status',
      required: false,
    },
    {
      sourceColumn: 'startDate',
      destinationField: 'startDate',
      label: 'Start Date',
      required: false,
      validate: (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? 'Invalid date format' : null;
      },
      transform: (val) => {
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      },
    },
    {
      sourceColumn: 'completionDate',
      destinationField: 'completionDate',
      label: 'Completion Date',
      required: false,
      transform: (val) => {
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      },
    },
    {
      sourceColumn: 'contractValue',
      destinationField: 'contractValue',
      label: 'Contract Value ($)',
      required: false,
      transform: (val) => {
        const num = parseFloat(val.replace(/[$,]/g, ''));
        return isNaN(num) ? null : num;
      },
    },
    {
      sourceColumn: 'ownerName',
      destinationField: 'clientName',
      label: 'Client / Owner Name',
      required: false,
    },
    {
      sourceColumn: 'projectManagerName',
      destinationField: 'projectManagerId',
      label: 'Project Manager (name)',
      required: false,
    },
    {
      sourceColumn: 'superintendentName',
      destinationField: 'superintendentId',
      label: 'Superintendent (name)',
      required: false,
    },
    {
      sourceColumn: 'procoreId',
      destinationField: 'procoreId',
      label: 'Procore Project ID',
      required: false,
    },
  ],
};
