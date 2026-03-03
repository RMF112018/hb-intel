export interface IActiveProject {
  id: string;
  name: string;
  number: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface IPortfolioSummary {
  totalProjects: number;
  activeProjects: number;
  totalContractValue: number;
  averagePercentComplete: number;
}
