export interface IRiskCostItem {
  id: number;
  projectId: string;
  description: string;
  category: string;
  estimatedImpact: number;
  probability: number;
  status: string;
}

export interface IRiskCostManagement {
  projectId: string;
  totalExposure: number;
  mitigatedAmount: number;
  contingencyBudget: number;
  items: IRiskCostItem[];
}
