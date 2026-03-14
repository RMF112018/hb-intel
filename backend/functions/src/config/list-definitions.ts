import type { IListDefinition } from '../services/sharepoint-service.js';

/**
 * D-PH6-05: Single source of truth for Step 4 list provisioning schema.
 * PH6.4 Standard v1 baseline (product-owner-selected source for this phase).
 * W0-G1-T01: All 8 lists confirmed core by product owner 2026-03-14.
 */
export const HB_INTEL_LIST_DEFINITIONS: IListDefinition[] = [
  {
    title: 'RFI Log',
    description: 'Request for Information tracking list.',
    template: 100,
    fields: [
      { internalName: 'RFINumber', displayName: 'RFI Number', type: 'Text', required: true },
      { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['Open', 'In Review', 'Closed'] },
      { internalName: 'DateSubmitted', displayName: 'Date Submitted', type: 'DateTime', required: true },
      { internalName: 'DateNeeded', displayName: 'Date Needed', type: 'DateTime' },
      { internalName: 'AssignedTo', displayName: 'Assigned To', type: 'User' },
      { internalName: 'ResponseDate', displayName: 'Response Date', type: 'DateTime' },
    ],
  },
  {
    title: 'Submittal Log',
    description: 'Submittal package tracking list.',
    template: 100,
    fields: [
      { internalName: 'SubmittalNumber', displayName: 'Submittal Number', type: 'Text', required: true },
      { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
      { internalName: 'SpecificationSection', displayName: 'Specification Section', type: 'Text' },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['Draft', 'Submitted', 'Approved', 'Revise and Resubmit', 'Rejected'] },
      { internalName: 'DateSubmitted', displayName: 'Date Submitted', type: 'DateTime' },
      { internalName: 'DateReturned', displayName: 'Date Returned', type: 'DateTime' },
      { internalName: 'ResponsibleParty', displayName: 'Responsible Party', type: 'User' },
    ],
  },
  {
    title: 'Meeting Minutes',
    description: 'Weekly and coordination meeting notes.',
    template: 100,
    fields: [
      { internalName: 'MeetingDate', displayName: 'Meeting Date', type: 'DateTime', required: true },
      { internalName: 'MeetingType', displayName: 'Meeting Type', type: 'Choice', required: true, choices: ['Owner', 'Architect', 'Coordination', 'Safety', 'Internal'] },
      { internalName: 'Facilitator', displayName: 'Facilitator', type: 'User' },
      { internalName: 'Attendees', displayName: 'Attendees', type: 'Text' },
      { internalName: 'Summary', displayName: 'Summary', type: 'Text' },
      { internalName: 'ActionItems', displayName: 'Action Items', type: 'Text' },
    ],
  },
  {
    title: 'Daily Reports',
    description: 'Daily field report entries.',
    template: 100,
    fields: [
      { internalName: 'ReportDate', displayName: 'Report Date', type: 'DateTime', required: true },
      { internalName: 'Weather', displayName: 'Weather', type: 'Text' },
      { internalName: 'CrewCount', displayName: 'Crew Count', type: 'Number' },
      { internalName: 'WorkCompleted', displayName: 'Work Completed', type: 'Text', required: true },
      { internalName: 'SafetyIncidents', displayName: 'Safety Incidents', type: 'Text' },
      { internalName: 'Delays', displayName: 'Delays', type: 'Text' },
      { internalName: 'Superintendent', displayName: 'Superintendent', type: 'User' },
    ],
  },
  {
    title: 'Issues Log',
    description: 'Open issues and blocker tracking.',
    template: 100,
    fields: [
      { internalName: 'IssueNumber', displayName: 'Issue Number', type: 'Text', required: true },
      { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
      { internalName: 'Priority', displayName: 'Priority', type: 'Choice', required: true, choices: ['Low', 'Medium', 'High', 'Critical'] },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['Open', 'In Progress', 'Resolved', 'Closed'] },
      { internalName: 'Owner', displayName: 'Owner', type: 'User' },
      { internalName: 'TargetDate', displayName: 'Target Date', type: 'DateTime' },
      { internalName: 'ResolutionNotes', displayName: 'Resolution Notes', type: 'Text' },
    ],
  },
  {
    title: 'Punch List',
    description: 'Punch list item closeout tracking.',
    template: 100,
    fields: [
      { internalName: 'ItemNumber', displayName: 'Item Number', type: 'Text', required: true },
      { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
      { internalName: 'Location', displayName: 'Location', type: 'Text' },
      { internalName: 'AssignedTo', displayName: 'Assigned To', type: 'User' },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['Open', 'In Progress', 'Ready for Review', 'Closed'] },
      { internalName: 'DueDate', displayName: 'Due Date', type: 'DateTime' },
    ],
  },
  {
    title: 'Safety Log',
    description: 'Safety observations and incidents.',
    template: 100,
    fields: [
      { internalName: 'ObservationDate', displayName: 'Observation Date', type: 'DateTime', required: true },
      { internalName: 'Category', displayName: 'Category', type: 'Choice', required: true, choices: ['Observation', 'Near Miss', 'Incident'] },
      { internalName: 'Description', displayName: 'Description', type: 'Text', required: true },
      { internalName: 'Severity', displayName: 'Severity', type: 'Choice', choices: ['Low', 'Medium', 'High'] },
      { internalName: 'ReportedBy', displayName: 'Reported By', type: 'User' },
      { internalName: 'CorrectiveAction', displayName: 'Corrective Action', type: 'Text' },
      { internalName: 'Closed', displayName: 'Closed', type: 'Boolean' },
    ],
  },
  {
    title: 'Change Order Log',
    description: 'Potential and approved change order tracking.',
    template: 100,
    fields: [
      { internalName: 'CONumber', displayName: 'CO Number', type: 'Text', required: true },
      { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
      { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, choices: ['Potential', 'Submitted', 'Approved', 'Rejected'] },
      { internalName: 'CostImpact', displayName: 'Cost Impact', type: 'Number' },
      { internalName: 'ScheduleImpactDays', displayName: 'Schedule Impact (Days)', type: 'Number' },
      { internalName: 'SubmittedDate', displayName: 'Submitted Date', type: 'DateTime' },
      { internalName: 'ApprovedDate', displayName: 'Approved Date', type: 'DateTime' },
    ],
  },
];
