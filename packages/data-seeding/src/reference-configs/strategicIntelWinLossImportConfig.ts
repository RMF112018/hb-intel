import type { ISeedConfig } from '../types';

export interface IWinLossHistoryRow {
  projectName: string;
  bidYear: string;
  outcome: string;
  clientName: string;
  contractValue: string;
  projectType: string;
  competitors: string;
  bidMargin: string;
  winningBidder: string;
}

export interface IWinLossRecord {
  projectName: string;
  bidYear: number;
  outcome: 'win' | 'loss' | 'no-bid';
  clientName: string;
  contractValue: number | null;
  projectType: string;
  competitors: string[];
  bidMarginPercent: number | null;
  winningBidder: string | null;
}

export const strategicIntelWinLossImportConfig: ISeedConfig<IWinLossHistoryRow, IWinLossRecord> = {
  name: 'Win/Loss Historical Data',
  recordType: 'win-loss-record',
  acceptedFormats: ['xlsx', 'csv'],
  autoMapHeaders: true,
  allowPartialImport: true,
  batchSize: 100,

  fieldMappings: [
    {
      sourceColumn: 'Project Name',
      destinationField: 'projectName',
      label: 'Project Name',
      required: true,
    },
    {
      sourceColumn: 'Bid Year',
      destinationField: 'bidYear',
      label: 'Bid Year',
      required: true,
      validate: (val) => {
        const year = parseInt(val);
        return isNaN(year) || year < 1950 || year > 2100
          ? 'Invalid year (must be 1950–2100)'
          : null;
      },
      transform: (val) => parseInt(val),
    },
    {
      sourceColumn: 'Outcome',
      destinationField: 'outcome',
      label: 'Outcome (win/loss/no-bid)',
      required: true,
      validate: (val) => {
        return ['win', 'loss', 'no-bid', 'no bid'].includes(val.toLowerCase())
          ? null
          : 'Outcome must be win, loss, or no-bid';
      },
      transform: (val) => {
        const normalized = val.toLowerCase().replace(/\s+/g, '-');
        return normalized as 'win' | 'loss' | 'no-bid';
      },
    },
    {
      sourceColumn: 'Client',
      destinationField: 'clientName',
      label: 'Client / Owner',
      required: false,
    },
    {
      sourceColumn: 'Contract Value',
      destinationField: 'contractValue',
      label: 'Contract Value ($)',
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
      sourceColumn: 'Competitors',
      destinationField: 'competitors',
      label: 'Competitors (comma-separated)',
      required: false,
      transform: (val) =>
        val ? val.split(',').map((c) => c.trim()).filter(Boolean) : [],
    },
    {
      sourceColumn: 'Bid Margin',
      destinationField: 'bidMarginPercent',
      label: 'Bid Margin (%)',
      required: false,
      transform: (val) => {
        const num = parseFloat(val.replace(/%/g, '').trim());
        return isNaN(num) ? null : num;
      },
    },
    {
      sourceColumn: 'Winning Bidder',
      destinationField: 'winningBidder',
      label: 'Winning Bidder (if loss)',
      required: false,
      transform: (val) => val || null,
    },
  ],
};
