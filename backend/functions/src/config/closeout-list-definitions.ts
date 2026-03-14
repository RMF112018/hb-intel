import type { IListDefinition } from '../services/sharepoint-service.js';

/**
 * W0-G2-T03: Closeout-family list definitions for provisioning saga Step 4.
 * Separate module from core HB_INTEL_LIST_DEFINITIONS to preserve G1 regression guard.
 * T07 will combine core + family arrays for provisioning dispatch.
 *
 * O&M Manual Log consolidation: T03 plan §1 lists "O&M Manual Log" as a separate
 * classification row, but §2 provides no separate schema. Turnover Package Log (§2.4)
 * covers O&M manuals via its Category choice field. This is intentional consolidation.
 */
export const CLOSEOUT_LIST_DEFINITIONS: IListDefinition[] = [
  {
    title: 'Closeout Checklist',
    description: 'Master closeout checklist tracking project completion milestones and turnover readiness.',
    template: 100,
    listFamily: 'closeout',
    provisioningOrder: 10,
    fields: [
      { internalName: 'pid', displayName: 'Project ID', type: 'Text', required: true, indexed: true, defaultValue: '{{projectNumber}}' },
      { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['Not Started', 'In Progress', 'Punch Phase', 'Turnover Phase', 'Complete'] },
      { internalName: 'TargetSubstantialCompletion', displayName: 'Target Substantial Completion', type: 'DateTime' },
      { internalName: 'ActualSubstantialCompletion', displayName: 'Actual Substantial Completion', type: 'DateTime' },
      { internalName: 'TargetFinalCompletion', displayName: 'Target Final Completion', type: 'DateTime' },
      { internalName: 'ActualFinalCompletion', displayName: 'Actual Final Completion', type: 'DateTime' },
      { internalName: 'Stage1Complete', displayName: 'Stage 1 Complete', type: 'Boolean' },
      { internalName: 'Stage2Complete', displayName: 'Stage 2 Complete', type: 'Boolean' },
      { internalName: 'Stage3Complete', displayName: 'Stage 3 Complete', type: 'Boolean' },
      { internalName: 'Stage4Complete', displayName: 'Stage 4 Complete', type: 'Boolean' },
      { internalName: 'CertificateOfOccupancy', displayName: 'Certificate of Occupancy', type: 'Boolean' },
      { internalName: 'CODate', displayName: 'CO Date', type: 'DateTime' },
      { internalName: 'PunchListItemsTotal', displayName: 'Punch List Items Total', type: 'Number' },
      { internalName: 'PunchListItemsClosed', displayName: 'Punch List Items Closed', type: 'Number' },
      { internalName: 'ProjectManager', displayName: 'Project Manager', type: 'User' },
      { internalName: 'Notes', displayName: 'Notes', type: 'MultiLineText' },
    ],
  },
  {
    title: 'Closeout Checklist Items',
    description: 'Individual checklist items linked to a parent closeout checklist record.',
    template: 100,
    listFamily: 'closeout',
    provisioningOrder: 20,
    parentListTitle: 'Closeout Checklist',
    fields: [
      { internalName: 'pid', displayName: 'Project ID', type: 'Text', required: true, indexed: true, defaultValue: '{{projectNumber}}' },
      { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
      { internalName: 'ParentRecord', displayName: 'Parent Record', type: 'Lookup', required: true, lookupListTitle: 'Closeout Checklist', lookupFieldName: 'ID' },
      { internalName: 'Category', displayName: 'Category', type: 'Choice', required: true, choices: ['Tasks', 'Document Tracking', 'Inspections', 'Turnover', 'Post Turnover', 'Closeout Documents'] },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['N/A', 'Open', 'In Progress', 'Complete'] },
      { internalName: 'AssignedTo', displayName: 'Assigned To', type: 'User' },
      { internalName: 'DueDate', displayName: 'Due Date', type: 'DateTime' },
      { internalName: 'CompletedDate', displayName: 'Completed Date', type: 'DateTime' },
      { internalName: 'ResponsibleParty', displayName: 'Responsible Party', type: 'Choice', choices: ['HBC', 'Owner', 'Architect', 'Sub', 'AHJ'] },
      { internalName: 'Notes', displayName: 'Notes', type: 'MultiLineText' },
    ],
  },
  {
    title: 'Punch List Batches',
    description: 'Punch list walk batches grouping punch items by inspection event.',
    template: 100,
    listFamily: 'closeout',
    provisioningOrder: 10,
    fields: [
      { internalName: 'pid', displayName: 'Project ID', type: 'Text', required: true, indexed: true, defaultValue: '{{projectNumber}}' },
      { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
      { internalName: 'WalkDate', displayName: 'Walk Date', type: 'DateTime' },
      { internalName: 'WalkType', displayName: 'Walk Type', type: 'Choice', choices: ['Owner', 'Architect', 'HBC Internal', 'AHJ'] },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['Open', 'In Progress', 'Complete'] },
      { internalName: 'ItemsTotal', displayName: 'Items Total', type: 'Number' },
      { internalName: 'ItemsClosed', displayName: 'Items Closed', type: 'Number' },
      { internalName: 'ConductedBy', displayName: 'Conducted By', type: 'User' },
      { internalName: 'Notes', displayName: 'Notes', type: 'MultiLineText' },
    ],
  },
  {
    title: 'Turnover Package Log',
    description: 'Tracks turnover deliverables including O&M manuals, as-builts, warranties, and certifications.',
    template: 100,
    listFamily: 'closeout',
    provisioningOrder: 10,
    fields: [
      { internalName: 'pid', displayName: 'Project ID', type: 'Text', required: true, indexed: true, defaultValue: '{{projectNumber}}' },
      { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
      { internalName: 'Category', displayName: 'Category', type: 'Choice', required: true, choices: ['O&M Manual', 'As-Built Drawing', 'Warranty', 'Certification', 'Survey', 'Commissioning Report', 'Other'] },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['Pending', 'Requested', 'Received', 'Reviewed', 'Submitted to Owner', 'Accepted'] },
      { internalName: 'SubcontractorName', displayName: 'Subcontractor Name', type: 'Text' },
      { internalName: 'DateRequested', displayName: 'Date Requested', type: 'DateTime' },
      { internalName: 'DateReceived', displayName: 'Date Received', type: 'DateTime' },
      { internalName: 'DateSubmittedToOwner', displayName: 'Date Submitted to Owner', type: 'DateTime' },
      { internalName: 'StorageLocation', displayName: 'Storage Location', type: 'URL' },
      { internalName: 'Notes', displayName: 'Notes', type: 'MultiLineText' },
    ],
  },
  {
    title: 'Subcontractor Evaluations',
    description: 'Post-project subcontractor performance evaluations and ratings.',
    template: 100,
    listFamily: 'closeout',
    provisioningOrder: 10,
    fields: [
      { internalName: 'pid', displayName: 'Project ID', type: 'Text', required: true, indexed: true, defaultValue: '{{projectNumber}}' },
      { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
      { internalName: 'SubcontractorName', displayName: 'Subcontractor Name', type: 'Text', required: true },
      { internalName: 'Trade', displayName: 'Trade', type: 'Text' },
      { internalName: 'OverallRating', displayName: 'Overall Rating', type: 'Choice', choices: ['Excellent', 'Good', 'Satisfactory', 'Poor', 'Unacceptable'] },
      { internalName: 'SafetyRating', displayName: 'Safety Rating', type: 'Choice', choices: ['Excellent', 'Good', 'Satisfactory', 'Poor', 'Unacceptable'] },
      { internalName: 'QualityRating', displayName: 'Quality Rating', type: 'Choice', choices: ['Excellent', 'Good', 'Satisfactory', 'Poor', 'Unacceptable'] },
      { internalName: 'ScheduleRating', displayName: 'Schedule Rating', type: 'Choice', choices: ['Excellent', 'Good', 'Satisfactory', 'Poor', 'Unacceptable'] },
      { internalName: 'CommunicationRating', displayName: 'Communication Rating', type: 'Choice', choices: ['Excellent', 'Good', 'Satisfactory', 'Poor', 'Unacceptable'] },
      { internalName: 'RecommendForFutureWork', displayName: 'Recommend for Future Work', type: 'Boolean' },
      { internalName: 'EvaluatedBy', displayName: 'Evaluated By', type: 'User' },
      { internalName: 'EvaluationDate', displayName: 'Evaluation Date', type: 'DateTime' },
      { internalName: 'Notes', displayName: 'Notes', type: 'MultiLineText' },
    ],
  },
];
