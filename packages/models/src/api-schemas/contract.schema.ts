import { z } from 'zod';
import type { IContractInfo, ICommitmentApproval } from '../contracts/index.js';

export const ContractInfoSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  contractNumber: z.string(),
  vendorName: z.string(),
  amount: z.number(),
  status: z.string(),
  executedDate: z.string(),
});

export const CommitmentApprovalSchema = z.object({
  id: z.number(),
  contractId: z.number(),
  approverName: z.string(),
  approvedAt: z.string(),
  status: z.string(),
  notes: z.string(),
});

type ContractInfo = z.infer<typeof ContractInfoSchema>;
type _ContractCheck = IContractInfo extends ContractInfo ? (ContractInfo extends IContractInfo ? true : never) : never;

type Approval = z.infer<typeof CommitmentApprovalSchema>;
type _ApprovalCheck = ICommitmentApproval extends Approval ? (Approval extends ICommitmentApproval ? true : never) : never;
