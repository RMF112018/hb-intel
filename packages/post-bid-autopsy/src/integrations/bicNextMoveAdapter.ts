import type { IAutopsyRecordSnapshot, IAutopsySectionBicRecord, IBicOwner } from '../types/index.js';

export interface IAutopsyBicActionProjection {
  readonly itemKey: string;
  readonly autopsyId: string;
  readonly sectionKey: string;
  readonly title: string;
  readonly currentOwner: IBicOwner | null;
  readonly escalationOwner: IBicOwner | null;
  readonly expectedAction: string;
  readonly dueDate: string;
  readonly blockedReason: string | null;
  readonly status: IAutopsyRecordSnapshot['autopsy']['status'];
}

export const projectAutopsySectionToBicAction = (
  record: IAutopsyRecordSnapshot,
  section: IAutopsySectionBicRecord
): IAutopsyBicActionProjection => ({
  itemKey: `post-bid-autopsy::${record.autopsy.autopsyId}::${section.sectionKey}`,
  autopsyId: record.autopsy.autopsyId,
  sectionKey: section.sectionKey,
  title: section.title,
  currentOwner: section.currentOwner,
  escalationOwner: section.escalationOwner,
  expectedAction: section.expectedAction,
  dueDate: section.dueDate,
  blockedReason: section.blockedReason,
  status: record.autopsy.status,
});

export const projectAutopsyToBicActions = (
  record: IAutopsyRecordSnapshot
): readonly IAutopsyBicActionProjection[] =>
  Object.freeze(record.sectionBicRecords.map((section) => projectAutopsySectionToBicAction(record, section)));
