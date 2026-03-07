import { ProjectStatus } from './ProjectEnums.js';
/**
 * Project-specific constants.
 *
 * @module project/constants
 */
/** Human-readable labels for project statuses. */
export const PROJECT_STATUS_LABELS = {
    [ProjectStatus.Active]: 'Active',
    [ProjectStatus.OnHold]: 'On Hold',
    [ProjectStatus.Completed]: 'Completed',
    [ProjectStatus.Cancelled]: 'Cancelled',
};
/** Statuses that represent in-progress work. */
export const ACTIVE_PROJECT_STATUSES = [
    ProjectStatus.Active,
    ProjectStatus.OnHold,
];
//# sourceMappingURL=constants.js.map