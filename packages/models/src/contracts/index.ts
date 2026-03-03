export interface IContractInfo {
  id: number;
  projectId: string;
  contractNumber: string;
  vendorName: string;
  amount: number;
  status: string;
  executedDate: string;
}

export interface ICommitmentApproval {
  id: number;
  contractId: number;
  approverName: string;
  approvedAt: string;
  status: string;
  notes: string;
}
