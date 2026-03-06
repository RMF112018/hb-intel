/**
 * Rule: no-direct-fluent-import (D-10)
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Disallows direct imports from @fluentui/* packages in app workspaces.
 * All Fluent UI components must be consumed through @hb-intel/ui-kit.
 *
 * Binding decision D-10: pages must import exclusively from @hb-intel/ui-kit.
 * This rule is set to 'error' in apps/ and 'off' in packages/ui-kit/.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct imports from @fluentui/* packages — use @hb-intel/ui-kit instead (D-10)',
      recommended: true,
    },
    schema: [],
    messages: {
      noDirectFluent:
        'Direct import from "{{source}}" is not allowed. Import from @hb-intel/ui-kit instead (D-10).',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source === 'string' && source.startsWith('@fluentui/')) {
          context.report({
            node: node.source,
            messageId: 'noDirectFluent',
            data: { source },
          });
        }
      },
    };
  },
};
