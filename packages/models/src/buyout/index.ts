export interface IBuyoutEntry {
  id: number;
  projectId: string;
  costCode: string;
  description: string;
  budgetAmount: number;
  committedAmount: number;
  status: string;
}

export interface IBuyoutSummary {
  projectId: string;
  totalBudget: number;
  totalCommitted: number;
  totalRemaining: number;
  percentBoughtOut: number;
}
