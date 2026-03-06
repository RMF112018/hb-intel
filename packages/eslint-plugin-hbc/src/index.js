/**
 * eslint-plugin-hbc — Local ESLint plugin for HBC Design System enforcement
 * Phase 4b.6 §9 — Theme & Token Enforcement (D-05, D-10)
 * Phase 4b.4 §7 — Command Bar & Page Actions (D-03)
 *
 * Rules:
 *   enforce-hbc-tokens  — Flags hardcoded hex, rgb/rgba, and raw pixel values (D-05)
 *   no-direct-fluent-import — Flags direct @fluentui/react-components imports (D-10)
 *   no-direct-buttons-in-content — Flags buttons as direct WorkspacePageShell children (D-03)
 *
 * @see PH4B.6-UI-Design-Plan.md §9 (tasks 4b.6.1, 4b.6.2)
 * @see PH4B-UI-Design-Plan.md §2 (binding decisions D-05, D-10)
 */
'use strict';

// ---------------------------------------------------------------------------
// Pattern definitions for enforce-hbc-tokens (4b.6.1)
// ---------------------------------------------------------------------------

/** Matches hex color literals: #RGB, #RRGGBB, #RRGGBBAA */
const HEX_PATTERN = /#[0-9A-Fa-f]{3,8}\b/;

/** Matches rgb(...) and rgba(...) color function calls in string literals */
const RGB_PATTERN = /^rgba?\(\s*\d+/;

/** Matches raw pixel values like "12px", "1.5px" — only digits + "px" */
const PIXEL_PATTERN = /^\d+(\.\d+)?px$/;

/**
 * CSS property names where pixel values indicate a token violation.
 * These are the properties that should use HBC spacing, typography, or
 * elevation tokens instead of hardcoded pixel values.
 *
 * @see packages/ui-kit/src/theme/grid.ts (spacing tokens)
 * @see packages/ui-kit/src/theme/typography.ts (font size tokens)
 * @see packages/ui-kit/src/theme/elevation.ts (shadow tokens)
 */
const STYLE_PROPERTY_PATTERN = /^(margin|padding|font-?[Ss]ize|width|height|min[WH]|max[WH]|gap|top|left|right|bottom|border(?:Radius|Width)?|line[Hh]eight|letter[Ss]pacing|column[Gg]ap|row[Gg]ap|flex[Bb]asis|inset)/;

/**
 * Determines whether an AST node is inside a style-related context.
 * Checks if the node is the value of a Property whose key matches a
 * CSS property name pattern. This prevents false positives on non-style
 * contexts such as SVG viewBox attributes, image dimensions, or data values.
 *
 * @param {import('estree').Node} node - The Literal AST node
 * @returns {boolean} True if the node appears to be a CSS property value
 */
function isInStyleContext(node) {
  const parent = node.parent;
  if (!parent) return false;

  // Property value in an object literal: { padding: "12px" }
  if (parent.type === 'Property' && parent.value === node) {
    const keyName =
      parent.key.type === 'Identifier'
        ? parent.key.name
        : parent.key.type === 'Literal'
          ? String(parent.key.value)
          : '';
    return STYLE_PROPERTY_PATTERN.test(keyName);
  }

  return false;
}

// ---------------------------------------------------------------------------
// Rule: enforce-hbc-tokens (D-05) — 4b.6.1
// ---------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
const enforceHbcTokens = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce usage of HBC design tokens instead of hardcoded color, spacing, and typography values (D-05)',
      recommended: true,
    },
    schema: [],
    messages: {
      noHardcodedHex:
        'Hardcoded hex color value detected (D-05). Use HBC design tokens from @hbc/ui-kit/theme instead.',
      noHardcodedRgb:
        'Hardcoded rgb/rgba color value detected (D-05). Use HBC design tokens from @hbc/ui-kit/theme instead.',
      noHardcodedPixel:
        'Hardcoded pixel value detected (D-05). Use HBC spacing/typography tokens from @hbc/ui-kit/theme instead.',
    },
  },
  create(context) {
    return {
      /**
       * Visits every Literal node in the AST to detect hardcoded design values.
       *
       * Detection patterns:
       *   1. Hex colors: Any string matching /#[0-9A-Fa-f]{3,8}/
       *      Examples: "#FF0000", "#1B3A6B", "color: #FFF"
       *   2. RGB/RGBA: Any string starting with "rgb(" or "rgba(" followed by digits
       *      Examples: "rgb(255, 0, 0)", "rgba(0, 0, 0, 0.5)"
       *   3. Raw pixels: Strings matching /^\d+(\.\d+)?px$/ ONLY in style property contexts
       *      Examples: "12px" (in padding), "14px" (in fontSize)
       *      Non-matches: "12px" (in data attributes, SVG viewBox, etc.)
       */
      Literal(node) {
        if (typeof node.value !== 'string') return;
        const val = node.value;

        // 1. Hex color detection — flags "#RRGGBB", "#RGB", "#RRGGBBAA"
        if (HEX_PATTERN.test(val)) {
          context.report({ node, messageId: 'noHardcodedHex' });
          return;
        }

        // 2. RGB/RGBA detection — flags "rgb(R, G, B)" and "rgba(R, G, B, A)"
        if (RGB_PATTERN.test(val)) {
          context.report({ node, messageId: 'noHardcodedRgb' });
          return;
        }

        // 3. Raw pixel detection — only in style contexts to avoid false positives
        if (PIXEL_PATTERN.test(val) && isInStyleContext(node)) {
          context.report({ node, messageId: 'noHardcodedPixel' });
        }
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Rule: no-direct-fluent-import (D-10) — 4b.6.2
// ---------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
const noDirectFluentImport = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct imports from @fluentui/react-components — use @hbc/ui-kit instead (D-10)',
      recommended: true,
    },
    schema: [],
    messages: {
      noDirectFluent:
        "Direct import from '@fluentui/react-components' is prohibited (D-10). Import from '@hbc/ui-kit' instead.",
    },
  },
  create(context) {
    return {
      /**
       * Visits ImportDeclaration nodes to detect prohibited direct Fluent UI imports.
       * All Fluent UI components and utilities should be consumed through
       * the @hbc/ui-kit re-export layer to ensure design system consistency.
       *
       * ❌ import { Button } from '@fluentui/react-components';
       * ✅ import { HbcButton } from '@hbc/ui-kit';
       */
      ImportDeclaration(node) {
        if (node.source.value === '@fluentui/react-components') {
          context.report({ node, messageId: 'noDirectFluent' });
        }
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Rule: no-direct-buttons-in-content (D-03) — 4b.4.4
// ---------------------------------------------------------------------------

/**
 * Set of component names considered "button" components for D-03 enforcement.
 * These must be placed in WorkspacePageShell's `actions` prop, not as direct children.
 */
const BUTTON_COMPONENTS = new Set(['HbcButton', 'Button']);

/** @type {import('eslint').Rule.RuleModule} */
const noDirectButtonsInContent = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow HbcButton/Button as direct children of WorkspacePageShell content (D-03)',
      recommended: true,
    },
    schema: [],
    messages: {
      noDirectButton:
        'Do not place {{component}} directly inside WorkspacePageShell content. Pass actions via the `actions` prop instead (D-03).',
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        const opening = node.openingElement;
        if (!opening.name || opening.name.name !== 'WorkspacePageShell') return;

        for (const child of node.children) {
          if (child.type !== 'JSXElement') continue;
          const childName = child.openingElement.name?.name;
          if (childName && BUTTON_COMPONENTS.has(childName)) {
            context.report({
              node: child,
              messageId: 'noDirectButton',
              data: { component: childName },
            });
          }
        }
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Plugin export
// ---------------------------------------------------------------------------

module.exports = {
  rules: {
    'enforce-hbc-tokens': enforceHbcTokens,
    'no-direct-fluent-import': noDirectFluentImport,
    'no-direct-buttons-in-content': noDirectButtonsInContent,
  },
};
