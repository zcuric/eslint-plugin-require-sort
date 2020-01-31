'use strict';

module.exports = {
  rules: {
    'require-sort': {
      meta: {
        type: 'suggestion',

        docs: {
          description: 'enforce sorted require declarations within modules',
          category: 'ECMAScript 6',
          recommended: false,
          url: 'https://github.com/zcuric/eslint-plugin-require-sort'
        },
        schema: [
          {
            type: 'object',
            properties: {
              ignoreCase: {
                type: 'boolean',
                default: false
              },
              propertySyntaxSortOrder: {
                type: 'array',
                items: {
                  enum: ['none', 'multiple', 'single']
                },
                uniqueItems: true,
                minItems: 3,
                maxItems: 3
              },
              ignoreDeclarationSort: {
                type: 'boolean',
                default: false
              },
              ignorePropertySort: {
                type: 'boolean',
                default: false
              }
            },
            additionalProperties: false
          }
        ],
        fixable: 'code'
      },
      create(context) {
        const configuration = context.options[0] || {};
        const {
          ignoreCase = false,
          ignoreDeclarationSort = false,
          ignorePropertySort = false,
          propertySyntaxSortOrder = ['none', 'multiple', 'single']
        } = configuration;
        const sourceCode = context.getSourceCode();
        const nodes = [];
        let previousNode = null;

        const handleDeclarationSort = node => {
          if (previousNode) {
            const currentIndex = getPropertySyntaxIndex(node);
            const previousIndex = getPropertySyntaxIndex(previousNode);
            /*
           * When the current declaration uses a different property syntax,
           * then check if the ordering is correct.
           * Otherwise, make a default string compare (like rule sort-vars to be consistent)
           * of the first used property name.
           */
            if (currentIndex === previousIndex) reportOnAlphabeticalSort(node, previousNode);
            if (currentIndex < previousIndex) reportOnExpectedSyntax(node, currentIndex, previousIndex);
          }

          previousNode = node;
        };

        const handlePropertySort = node => {
          if (isStaticRequire(node)) return;
          if (!node.declarations[0].id.properties) return;
          const properties = node.declarations[0].id.properties;
          const mergeText = (sourceText, property, index) => {
            let textAfterProperty = '';
            if (index !== properties.length - 1) {
              textAfterProperty = sourceCode.getText()
                .slice(properties[index].range[1], properties[index + 1].range[0]);
            }
            return sourceText + sourceCode.getText(property) + textAfterProperty;
          };
          const firstUnsortedIndex = properties.map(getSortableName)
            .findIndex((name, index, array) => array[index - 1] > name);

          const fix = ({ replaceTextRange }) => {
            // If there are comments in the property list, don't rearrange the properties.
            if (hasComments(properties)) return null;
            const range = [properties[0].range[0], properties[properties.length - 1].range[1]];
            const text = [...properties].sort(sortByName).reduce(mergeText, '');
            return replaceTextRange(range, text);
          };

          if (firstUnsortedIndex === -1) return;

          context.report({
            node: properties[firstUnsortedIndex],
            message: "Property '{{propertyName}}' of the require declaration should be sorted alphabetically.",
            data: { propertyName: properties[firstUnsortedIndex].value.name },
            fix
          });
        };

        const isTopLevel = ({ parent }) => parent.type === 'Program';
        const isStaticRequire = node => {
          if (node.type !== 'CallExpression') return false;
          return node.callee?.type === 'Identifier' &&
            node.callee?.name === 'require' &&
            node.arguments?.length === 1;
        };
        const isRequire = node =>
          node.declarations[0]?.init?.callee?.name === 'require';
        const isAssignmentPattern = node => node?.type === 'AssignmentPattern';
        const hasObjectPattern = node =>
          node.declarations[0]?.id?.type === 'ObjectPattern';
        const hasMultipleProperties =
          node => node.declarations[0]?.id?.properties.length > 1;

        const hasComments = properties => properties.some(property => {
          const commentsBefore = sourceCode.getCommentsBefore(property);
          const commentsAfter = sourceCode.getCommentsAfter(property);
          return commentsBefore.length || commentsAfter.length;
        });

        const getSortableName = ({ value }) => {
          const name = isAssignmentPattern(value) ? value.left.name : value.name;
          return ignoreCase ? name.toLowerCase() : name;
        };

        const sortByName = (propertyA, propertyB) => {
          const aName = getSortableName(propertyA);
          const bName = getSortableName(propertyB);
          return aName > bName ? 1 : -1;
        };

        const getPropertySyntax = node => {
          if (isStaticRequire(node)) return 'none';
          if (!hasObjectPattern(node) || !hasMultipleProperties(node)) return 'single';
          return 'multiple';
        };

        const getPropertySyntaxIndex = node =>
          propertySyntaxSortOrder.indexOf(getPropertySyntax(node));

        const getDeclarationName = node => {
          if (isStaticRequire(node)) return null;
          if (!hasObjectPattern(node)) return node.declarations[0].id.name;
          if (hasObjectPattern(node)) {
            const value = node.declarations[0].id.properties[0].value;
            return isAssignmentPattern(value) ? value.left.name : value.name;
          }
        };

        const reportOnAlphabeticalSort = (node, previousNode) => {
          let firstName = getDeclarationName(node);
          let previousName = getDeclarationName(previousNode);
          if (ignoreCase) {
            previousName = previousName && previousName.toLowerCase();
            firstName = firstName && firstName.toLowerCase();
          }
          if (previousName && firstName && firstName < previousName) {
            context.report({
              node,
              message: 'Requires should be sorted alphabetically.'
            });
          }
        };

        const reportOnExpectedSyntax = (node, currentIndex, previousIndex) => {
          context.report({
            node,
            message: "Expected '{{syntaxA}}' syntax before '{{syntaxB}}' syntax.",
            data: {
              syntaxA: propertySyntaxSortOrder[currentIndex],
              syntaxB: propertySyntaxSortOrder[previousIndex]
            }
          });
        };

        return {
          ExpressionStatement(node) {
            if (!isTopLevel(node)) return;
            if (!isStaticRequire(node.expression)) return;
            nodes.push(node.expression);
          },
          VariableDeclaration(node) {
            if (!isTopLevel(node)) return;
            if (!isRequire(node)) return;
            nodes.push(node);
          },
          'Program:exit'() {
            if (!ignoreDeclarationSort) nodes.forEach(handleDeclarationSort);
            if (!ignorePropertySort) nodes.forEach(handlePropertySort);
          }
        };
      }
    }
  }
};
