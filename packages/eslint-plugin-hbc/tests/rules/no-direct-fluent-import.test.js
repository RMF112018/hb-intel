/**
 * Tests for no-direct-fluent-import rule (D-10)
 * PH4B.11 §4b.11.1
 */
'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/no-direct-fluent-import');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

describe('no-direct-fluent-import', () => {
  it('validates correct and incorrect imports', () => {
    tester.run('no-direct-fluent-import', rule, {
      valid: [
        { code: "import { HbcButton } from '@hb-intel/ui-kit';" },
        { code: "import { hbcLightTheme } from '@hb-intel/ui-kit/theme';" },
        { code: "import React from 'react';" },
      ],
      invalid: [
        {
          code: "import { Button } from '@fluentui/react-components';",
          errors: [{ messageId: 'noDirectFluent' }],
        },
        {
          code: "import { tokens } from '@fluentui/react-theme';",
          errors: [{ messageId: 'noDirectFluent' }],
        },
        {
          code: "import { FluentProvider } from '@fluentui/react-components';",
          errors: [{ messageId: 'noDirectFluent' }],
        },
      ],
    });
  });
});
