/**
 * @hb-intel/eslint-plugin-hbc — ESLint plugin for HBC Design System enforcement
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Implements 11 rules enforcing binding decisions D-01 through D-10:
 *
 * | Rule                          | Decision | Severity (apps) |
 * |-------------------------------|----------|-----------------|
 * | no-direct-fluent-import       | D-10     | error           |
 * | enforce-hbc-tokens            | D-05     | error           |
 * | no-inline-styles              | D-10     | warn            |
 * | require-workspace-page-shell  | D-01     | error           |
 * | no-manual-nav-active          | D-04     | error           |
 * | no-inline-feedback            | D-08     | warn            |
 * | no-raw-form-elements          | D-07     | error           |
 * | require-layout-variant        | D-02     | error           |
 * | no-page-breakpoints           | D-09     | warn            |
 * | no-direct-spinner             | D-06     | warn            |
 * | no-direct-buttons-in-content  | D-03     | warn            |
 * | require-feature-registration-contract | PH5.9 | error         |
 *
 * @see docs/architecture/adr/ADR-0045-component-consumption-enforcement.md
 * @see docs/architecture/plans/PH4B.11-UI-Design-Plan.md §14
 */
'use strict';

module.exports = {
  rules: {
    'no-direct-fluent-import': require('./rules/no-direct-fluent-import'),
    'enforce-hbc-tokens': require('./rules/enforce-hbc-tokens'),
    'no-inline-styles': require('./rules/no-inline-styles'),
    'require-workspace-page-shell': require('./rules/require-workspace-page-shell'),
    'no-manual-nav-active': require('./rules/no-manual-nav-active'),
    'no-inline-feedback': require('./rules/no-inline-feedback'),
    'no-raw-form-elements': require('./rules/no-raw-form-elements'),
    'require-layout-variant': require('./rules/require-layout-variant'),
    'no-page-breakpoints': require('./rules/no-page-breakpoints'),
    'no-direct-spinner': require('./rules/no-direct-spinner'),
    'no-direct-buttons-in-content': require('./rules/no-direct-buttons-in-content'),
    'require-feature-registration-contract': require('./rules/require-feature-registration-contract'),
  },
};
