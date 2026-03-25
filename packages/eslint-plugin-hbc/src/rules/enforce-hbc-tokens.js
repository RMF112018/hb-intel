/**
 * Rule: enforce-hbc-tokens (D-05)
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Detects hardcoded hex/rgb color values and pixel literals in style-bearing contexts.
 * All color, spacing, and dimension values must use HBC design tokens from @hb-intel/ui-kit/theme.
 *
 * Binding decision D-05: all visual tokens must come from the design system.
 * Set to 'error' in apps/, 'warn' in packages/ui-kit/ (excluding theme/).
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

/** Matches hex color patterns: #RGB, #RRGGBB, #RRGGBBAA */
const HEX_PATTERN = /#[0-9A-Fa-f]{3,8}\b/;
/** Matches rgb/rgba color patterns */
const RGB_PATTERN = /\brgba?\([^)]*\)/i;
/** Matches hardcoded pixel values such as 12px or minmax(280px, 1fr) */
const PX_PATTERN = /\b\d+(?:\.\d+)?px\b/i;
/** Numeric style properties where bare numbers imply pixel units in React/Griffel style objects */
const PIXEL_NUMBER_PROPERTIES = new Set([
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'bottom',
  'columnGap',
  'flexBasis',
  'fontSize',
  'gap',
  'height',
  'inset',
  'insetBlock',
  'insetBlockEnd',
  'insetBlockStart',
  'insetInline',
  'insetInlineEnd',
  'insetInlineStart',
  'left',
  'letterSpacing',
  'margin',
  'marginBlock',
  'marginBlockEnd',
  'marginBlockStart',
  'marginBottom',
  'marginInline',
  'marginInlineEnd',
  'marginInlineStart',
  'marginLeft',
  'marginRight',
  'marginTop',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'outlineOffset',
  'padding',
  'paddingBlock',
  'paddingBlockEnd',
  'paddingBlockStart',
  'paddingBottom',
  'paddingInline',
  'paddingInlineEnd',
  'paddingInlineStart',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'right',
  'rowGap',
  'top',
  'translate',
  'width',
]);

function getPropertyName(node) {
  if (!node || node.type !== 'Property' || node.computed) {
    return null;
  }

  if (node.key.type === 'Identifier') {
    return node.key.name;
  }

  if (node.key.type === 'Literal' && typeof node.key.value === 'string') {
    return node.key.value;
  }

  return null;
}

function getStaticStringValue(node) {
  if (!node) {
    return null;
  }

  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((part) => part.value.cooked ?? '').join('');
  }

  return null;
}

function isCssPropertiesType(typeAnnotation) {
  if (!typeAnnotation || typeAnnotation.type !== 'TSTypeReference') {
    return false;
  }

  if (typeAnnotation.typeName.type === 'Identifier') {
    return typeAnnotation.typeName.name === 'CSSProperties';
  }

  return (
    typeAnnotation.typeName.type === 'TSQualifiedName' &&
    typeAnnotation.typeName.left.type === 'Identifier' &&
    typeAnnotation.typeName.left.name === 'React' &&
    typeAnnotation.typeName.right.type === 'Identifier' &&
    typeAnnotation.typeName.right.name === 'CSSProperties'
  );
}

function hasCssPropertiesTypeAnnotation(id) {
  return Boolean(id?.typeAnnotation && isCssPropertiesType(id.typeAnnotation.typeAnnotation));
}

function isMakeStylesCall(node) {
  return node?.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'makeStyles';
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce usage of HBC design tokens instead of hardcoded style literals in style-bearing contexts (D-05)',
      recommended: true,
    },
    schema: [],
    messages: {
      noHardcodedHex:
        'Hardcoded hex value detected. Use HBC design tokens from @hb-intel/ui-kit/theme instead (D-05).',
      noHardcodedRgb:
        'Hardcoded rgb/rgba value detected. Use HBC design tokens from @hb-intel/ui-kit/theme instead (D-05).',
      noHardcodedPixel:
        'Hardcoded pixel value detected in a style context. Use HBC spacing, sizing, or breakpoint tokens instead (D-05).',
    },
  },
  create(context) {
    function reportStaticLiteral(node) {
      const value = getStaticStringValue(node);

      if (!value) {
        return;
      }

      if (HEX_PATTERN.test(value)) {
        context.report({ node, messageId: 'noHardcodedHex' });
      }

      if (RGB_PATTERN.test(value)) {
        context.report({ node, messageId: 'noHardcodedRgb' });
      }

      if (PX_PATTERN.test(value)) {
        context.report({ node, messageId: 'noHardcodedPixel' });
      }
    }

    function inspectStyleValue(valueNode, propertyName) {
      if (!valueNode) {
        return;
      }

      if (valueNode.type === 'ObjectExpression') {
        inspectStyleObject(valueNode);
        return;
      }

      if (
        valueNode.type === 'Literal' &&
        typeof valueNode.value === 'number' &&
        valueNode.value !== 0 &&
        propertyName &&
        PIXEL_NUMBER_PROPERTIES.has(propertyName)
      ) {
        context.report({ node: valueNode, messageId: 'noHardcodedPixel' });
        return;
      }

      reportStaticLiteral(valueNode);
    }

    function inspectStyleObject(node) {
      for (const property of node.properties) {
        if (property.type !== 'Property') {
          continue;
        }

        inspectStyleValue(property.value, getPropertyName(property));
      }
    }

    function inspectMakeStylesRoot(node) {
      for (const property of node.properties) {
        if (property.type !== 'Property') {
          continue;
        }

        if (property.value.type === 'ObjectExpression') {
          inspectStyleObject(property.value);
        }
      }
    }

    return {
      CallExpression(node) {
        if (
          isMakeStylesCall(node) &&
          node.arguments[0] &&
          node.arguments[0].type === 'ObjectExpression'
        ) {
          inspectMakeStylesRoot(node.arguments[0]);
        }
      },
      JSXAttribute(node) {
        if (
          node.name &&
          node.name.name === 'style' &&
          node.value &&
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'ObjectExpression'
        ) {
          inspectStyleObject(node.value.expression);
        }
      },
      VariableDeclarator(node) {
        if (node.init?.type === 'ObjectExpression' && hasCssPropertiesTypeAnnotation(node.id)) {
          inspectStyleObject(node.init);
        }
      },
    };
  },
};
