export interface IComplianceEntry {
  id: number;
  projectId: string;
  vendorName: string;
  requirementType: string;
  status: string;
  expirationDate: string;
}

export interface IComplianceSummary {
  projectId: string;
  totalEntries: number;
  compliant: number;
  nonCompliant: number;
  expiringSoon: number;
}
