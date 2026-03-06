/**
 * Rule: no-raw-form-elements (D-07)
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Disallows raw HTML form elements (<input>, <select>, <textarea>) in JSX.
 * All form inputs must use HBC form components (HbcTextField, HbcSelect, etc.)
 * to ensure consistent styling, validation, and accessibility.
 *
 * Binding decision D-07: all form elements must use ui-kit wrappers.
 * Set to 'error' in apps/, 'off' in packages/ui-kit/.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

/** Raw HTML form elements that must be replaced with ui-kit components */
const RAW_FORM_ELEMENTS = new Set(['input', 'select', 'textarea']);

/** Mapping of raw elements to their ui-kit replacements */
const REPLACEMENTS = {
  input: 'HbcTextField',
  select: 'HbcSelect',
  textarea: 'HbcTextField (with multiline prop)',
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw <input>, <select>, <textarea> — use HbcTextField, HbcSelect instead (D-07)',
      recommended: true,
    },
    schema: [],
    messages: {
      noRawFormElement:
        'Raw <{{element}}> is not allowed. Use {{replacement}} from @hb-intel/ui-kit instead (D-07).',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = node.name && node.name.name;
        if (name && RAW_FORM_ELEMENTS.has(name)) {
          context.report({
            node,
            messageId: 'noRawFormElement',
            data: {
              element: name,
              replacement: REPLACEMENTS[name],
            },
          });
        }
      },
    };
  },
};
