export enum LeadStage {
  Identified = 'Identified',
  Qualifying = 'Qualifying',
  BidDecision = 'BidDecision',
  Bidding = 'Bidding',
  Awarded = 'Awarded',
  Lost = 'Lost',
  Declined = 'Declined',
}

export interface ILead {
  id: number;
  title: string;
  stage: LeadStage;
  clientName: string;
  estimatedValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface ILeadFormData {
  title: string;
  stage: LeadStage;
  clientName: string;
  estimatedValue: number;
}
