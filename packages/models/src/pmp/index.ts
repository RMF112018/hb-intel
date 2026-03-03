export interface IProjectManagementPlan {
  id: number;
  projectId: string;
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPMPSignature {
  id: number;
  pmpId: number;
  signerName: string;
  role: string;
  signedAt: string;
  status: string;
}
