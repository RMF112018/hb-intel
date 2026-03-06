/**
 * Rule: no-page-breakpoints (D-09)
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Warns when page components use manual breakpoint logic:
 * - @media strings in template literals or string literals
 * - window.innerWidth / window.innerHeight access
 * - window.matchMedia() calls
 *
 * Responsive behavior should be handled by the layout system and ui-kit
 * components, not by manual media queries in page code.
 *
 * Binding decision D-09: responsive layout is system-managed.
 * Set to 'warn' in apps/.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow manual breakpoint logic in pages — use layout system instead (D-09)',
      recommended: false,
    },
    schema: [],
    messages: {
      noMediaQuery:
        'Manual @media query detected. Use the layout system and ui-kit responsive props instead (D-09).',
      noWindowSize:
        'Direct window.{{prop}} access detected. Use useIsMobile/useIsTablet hooks from @hb-intel/ui-kit instead (D-09).',
      noMatchMedia:
        'window.matchMedia() detected. Use useIsMobile/useIsTablet hooks from @hb-intel/ui-kit instead (D-09).',
    },
  },
  create(context) {
    return {
      /** Detect @media in string literals */
      Literal(node) {
        if (typeof node.value === 'string' && node.value.includes('@media')) {
          context.report({ node, messageId: 'noMediaQuery' });
        }
      },
      /** Detect @media in template literals */
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          if (quasi.value.raw.includes('@media')) {
            context.report({ node, messageId: 'noMediaQuery' });
            break;
          }
        }
      },
      /** Detect window.innerWidth, window.innerHeight */
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'window' &&
          node.property.type === 'Identifier' &&
          (node.property.name === 'innerWidth' || node.property.name === 'innerHeight')
        ) {
          context.report({
            node,
            messageId: 'noWindowSize',
            data: { prop: node.property.name },
          });
        }
      },
      /** Detect window.matchMedia() or matchMedia() calls */
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'matchMedia'
        ) {
          context.report({ node, messageId: 'noMatchMedia' });
        }
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'window' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'matchMedia'
        ) {
          context.report({ node, messageId: 'noMatchMedia' });
        }
      },
    };
  },
};
