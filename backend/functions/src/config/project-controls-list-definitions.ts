import type { IListDefinition } from '../services/sharepoint-service.js';

/**
 * W0-G2-T05: Project-controls-family list definitions for provisioning saga Step 4.
 * Separate module from core HB_INTEL_LIST_DEFINITIONS to preserve G1 regression guard.
 * T07 will combine core + family arrays for provisioning dispatch.
 *
 * All 3 lists are flat (no parent/child relationships).
 * Cross-family references use pid-based queries and plain Text fields — NOT Lookup columns.
 */
export const PROJECT_CONTROLS_LIST_DEFINITIONS: IListDefinition[] = [
  {
    title: 'Permit Log',
    description: 'Tracks all permits required, applied for, and issued for the project.',
    template: 100,
    listFamily: 'project-controls',
    provisioningOrder: 10,
    fields: [
      { internalName: 'pid', displayName: 'Project ID', type: 'Text', required: true, indexed: true, defaultValue: '{{projectNumber}}' },
      { internalName: 'Title', displayName: 'Permit Name / Description', type: 'Text', required: true },
      { internalName: 'PermitType', displayName: 'Permit Type', type: 'Choice', required: true, choices: ['Master Building', 'Roofing', 'Plumbing', 'HVAC', 'Electrical', 'Fire Suppression', 'Fire Alarm', 'Elevator', 'Demolition', 'Site / Civil', 'Environmental', 'Sub Permit', 'Other'] },
      { internalName: 'IssuingAuthority', displayName: 'Issuing Authority', type: 'Text' },
      { internalName: 'PermitNumber', displayName: 'Permit Number', type: 'Text' },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['Not Applied', 'Applied', 'Under Review', 'Issued', 'Active', 'Expired', 'Revisions Required', 'Final'] },
      { internalName: 'ApplicationDate', displayName: 'Application Date', type: 'DateTime' },
      { internalName: 'IssuedDate', displayName: 'Issued Date', type: 'DateTime' },
      { internalName: 'ExpirationDate', displayName: 'Expiration Date', type: 'DateTime' },
      { internalName: 'FinalInspectionDate', displayName: 'Final Inspection Date', type: 'DateTime' },
      { internalName: 'HolderType', displayName: 'Permit Holder', type: 'Choice', choices: ['HBC', 'Subcontractor', 'Owner'] },
      { internalName: 'SubcontractorName', displayName: 'Subcontractor Name', type: 'Text' },
      { internalName: 'CostAmount', displayName: 'Permit Cost', type: 'Number' },
      { internalName: 'DocumentLink', displayName: 'Permit Document', type: 'URL' },
      { internalName: 'Notes', displayName: 'Notes', type: 'MultiLineText' },
    ],
  },
  {
    title: 'Required Inspections',
    description: 'Tracks all required inspections by trade and inspection type, with pass/fail results.',
    template: 100,
    listFamily: 'project-controls',
    provisioningOrder: 10,
    fields: [
      { internalName: 'pid', displayName: 'Project ID', type: 'Text', required: true, indexed: true, defaultValue: '{{projectNumber}}' },
      { internalName: 'Title', displayName: 'Inspection Description', type: 'Text', required: true },
      { internalName: 'Trade', displayName: 'Trade', type: 'Choice', required: true, choices: ['Building', 'Structural', 'Plumbing', 'HVAC', 'Electrical', 'Fire Suppression', 'Fire Alarm', 'Roofing', 'Civil', 'Elevator', 'Special Inspection', 'Other'] },
      { internalName: 'InspectionCategory', displayName: 'Inspection Category', type: 'Choice', required: true, choices: ['Required (AHJ)', 'Private Provider', 'Third-Party Special', 'Owner Required'] },
      { internalName: 'PermitNumber', displayName: 'Related Permit #', type: 'Text' },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['Pending', 'Scheduled', 'Passed', 'Failed', 'Rescheduled', 'N/A'] },
      { internalName: 'ScheduledDate', displayName: 'Scheduled Date', type: 'DateTime' },
      { internalName: 'InspectionDate', displayName: 'Inspection Date', type: 'DateTime' },
      { internalName: 'InspectorName', displayName: 'Inspector Name', type: 'Text' },
      { internalName: 'InspectorAgency', displayName: 'Inspector Agency', type: 'Text' },
      { internalName: 'Result', displayName: 'Result', type: 'Choice', choices: ['Pass', 'Partial Pass', 'Fail', 'Deferred'] },
      { internalName: 'FailureReason', displayName: 'Failure Reason', type: 'MultiLineText' },
      { internalName: 'CorrectiveActionDue', displayName: 'Corrective Action Due Date', type: 'DateTime' },
      { internalName: 'ReinspectionDate', displayName: 'Re-inspection Date', type: 'DateTime' },
      { internalName: 'InspectionReportLink', displayName: 'Inspection Report', type: 'URL' },
      { internalName: 'Notes', displayName: 'Notes', type: 'MultiLineText' },
    ],
  },
  {
    title: 'Constraints Log',
    description: 'Tracks items constraining work from proceeding — information not received, approvals pending, materials delayed, access blocked.',
    template: 100,
    listFamily: 'project-controls',
    provisioningOrder: 10,
    fields: [
      { internalName: 'pid', displayName: 'Project ID', type: 'Text', required: true, indexed: true, defaultValue: '{{projectNumber}}' },
      { internalName: 'Title', displayName: 'Constraint Description', type: 'Text', required: true },
      { internalName: 'ConstraintType', displayName: 'Constraint Type', type: 'Choice', required: true, choices: ['Information Required', 'Approval Pending', 'Material Lead Time', 'Access / Sequencing', 'Subcontractor', 'Owner Decision', 'Permit', 'Weather', 'Other'] },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['Open', 'In Progress', 'Resolved', 'Deferred'] },
      { internalName: 'WorkActivityBlocked', displayName: 'Work Activity Blocked', type: 'Text' },
      { internalName: 'Owner', displayName: 'Constraint Owner', type: 'User' },
      { internalName: 'DateIdentified', displayName: 'Date Identified', type: 'DateTime', required: true },
      { internalName: 'TargetResolutionDate', displayName: 'Target Resolution Date', type: 'DateTime' },
      { internalName: 'ActualResolutionDate', displayName: 'Actual Resolution Date', type: 'DateTime' },
      { internalName: 'ImpactIfUnresolved', displayName: 'Impact if Unresolved', type: 'Choice', choices: ['No Impact', 'Minor Delay', 'Moderate Delay', 'Critical Path Impact'] },
      { internalName: 'RelatedPermit', displayName: 'Related Permit #', type: 'Text' },
      { internalName: 'Notes', displayName: 'Notes', type: 'MultiLineText' },
    ],
  },
];
