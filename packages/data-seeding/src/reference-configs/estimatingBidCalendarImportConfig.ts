import type { ISeedConfig } from '../types';

export interface IEstimatingBidCalendarRow {
  projectName: string;
  ownerName: string;
  bidDueDate: string;
  bidBond: string;
  estimatedValue: string;
  projectType: string;
  goNoGoStatus: string;
  estimatingCoordinator: string;
}

export interface IEstimatingPursuitSeed {
  projectName: string;
  ownerName: string;
  bidDueDate: string;
  requiresBidBond: boolean;
  estimatedValue: number | null;
  projectType: string;
  goNoGoStatus: string;
  estimatingCoordinatorId: string;
  workflowStage: 'active';
}

export const estimatingBidCalendarImportConfig: ISeedConfig<
  IEstimatingBidCalendarRow,
  IEstimatingPursuitSeed
> = {
  name: 'Estimating Active Bid Calendar',
  recordType: 'estimating-pursuit',
  acceptedFormats: ['xlsx', 'csv'],
  autoMapHeaders: true,
  allowPartialImport: true,
  batchSize: 50,

  fieldMappings: [
    {
      sourceColumn: 'Project Name',
      destinationField: 'projectName',
      label: 'Project Name',
      required: true,
    },
    {
      sourceColumn: 'Owner',
      destinationField: 'ownerName',
      label: 'Owner / Client Name',
      required: true,
    },
    {
      sourceColumn: 'Bid Due Date',
      destinationField: 'bidDueDate',
      label: 'Bid Due Date',
      required: true,
      validate: (val) => {
        const d = new Date(val);
        return isNaN(d.getTime()) ? 'Invalid date — use YYYY-MM-DD or MM/DD/YYYY' : null;
      },
      transform: (val) => {
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      },
    },
    {
      sourceColumn: 'Bid Bond',
      destinationField: 'requiresBidBond',
      label: 'Requires Bid Bond',
      required: false,
      transform: (val) => {
        return ['yes', 'y', 'true', '1'].includes(val.toLowerCase());
      },
    },
    {
      sourceColumn: 'Estimated Value',
      destinationField: 'estimatedValue',
      label: 'Estimated Construction Value ($)',
      required: false,
      transform: (val) => {
        const num = parseFloat(val.replace(/[$,]/g, ''));
        return isNaN(num) ? null : num;
      },
    },
    {
      sourceColumn: 'Project Type',
      destinationField: 'projectType',
      label: 'Project Type',
      required: false,
    },
    {
      sourceColumn: 'Go/No-Go',
      destinationField: 'goNoGoStatus',
      label: 'Go/No-Go Status',
      required: false,
    },
    {
      sourceColumn: 'Estimating Coordinator',
      destinationField: 'estimatingCoordinatorId',
      label: 'Estimating Coordinator (email or name)',
      required: false,
    },
  ],
};
