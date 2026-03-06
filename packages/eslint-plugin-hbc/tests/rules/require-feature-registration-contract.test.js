'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/require-feature-registration-contract');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

describe('require-feature-registration-contract', () => {
  it('flags direct protected feature wiring calls', () => {
    tester.run('require-feature-registration-contract', rule, {
      valid: [
        { code: "permissionStore.hasPermission('project:view');" },
        { code: "const visible = usePermissionEvaluation('project-hub', 'view');" },
      ],
      invalid: [
        {
          code: "permissionStore.hasFeatureAccess('project-hub', 'view');",
          errors: [{ messageId: 'requireContract' }],
        },
        {
          code: "permissionStore.getFeatureAccess('project-hub', 'view');",
          errors: [{ messageId: 'requireContract' }],
        },
        {
          code: "permissionStore.registerFeature(registration);",
          errors: [{ messageId: 'requireContract' }],
        },
      ],
    });
  });
});
