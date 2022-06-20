/*
 Copy of https://github.com/laleksiunas/inline-svg-unique-id/blob/5cc97303eb5034fc1be7ec621deb56d271374eb7/packages/babel-plugin-react-inline-svg-unique-id/src/plugin.js
 I copied it because it depends on react part https://github.com/laleksiunas/inline-svg-unique-id/tree/5cc97303eb5034fc1be7ec621deb56d271374eb7/packages/react-inline-svg-unique-id,
 however it's React part depends on react 17+.
 How we need stable logotypes in react,
 however we can't update all our projects to react 17+ now.
 After react updating we should to remove this and use package directly.
 */
const template = require('@babel/template').default;
const jsxSyntaxPlugin = require('@babel/plugin-syntax-jsx').default;

const idGeneratorLibraryName = '../react-unique-logos-ids.js';
const idGeneratorHookName = 'useUniqueId';

const idAttributeName = 'id';

const idRegex = '#([a-zA-Z][\\w:.-]*)'; // Matches ID: #example
const idExactMatchRegex = new RegExp(`^${idRegex}$`);

const iriRegex = `url\\(${idRegex}\\)`; // Matches SVG IRI: url(#example)
const iriExactMatchRegex = new RegExp(`^${iriRegex}$`);
const iriGlobalMatchRegex = new RegExp(iriRegex, 'g');

const svgIdentifiers = {
  svg: ['svg', 'Svg'],
  defs: ['defs', 'Defs'],
  style: ['style'],
};

const isSvgComponentIdentifier = (openingElementNameIdentifier, expectedSvgIdentifiers) =>
  expectedSvgIdentifiers.some((i) => openingElementNameIdentifier.isJSXIdentifier({ name: i }));

const isSvgComponentPath = (path, expectedSvgIdentifiers) =>
  isSvgComponentIdentifier(path.get('openingElement.name'), expectedSvgIdentifiers);

const isSvgPath = (path) => isSvgComponentPath(path, svgIdentifiers.svg);

const isDefsPath = (path) => isSvgComponentPath(path, svgIdentifiers.defs);

const isStylePath = (path) => isSvgComponentPath(path, svgIdentifiers.style);

const isIdAttribute = (attribute) => attribute.get('name').isJSXIdentifier({ name: idAttributeName });

const isStringLiteralAttribute = (attribute) => attribute.get('value').isStringLiteral();

const createIriUrl = (id) => `url(#${id})`;

const isXlinkHrefAttribute = (attribute) => {
  const nameNode = attribute.get('name');

  return (
    nameNode.isJSXIdentifier({ name: 'xlinkHref' }) ||
    (nameNode.isJSXNamespacedName() && nameNode.node.namespace.name === 'xlink' && nameNode.node.name.name === 'href')
  );
};

const createIdValuesContainer = (createIdIdentifier) => {
  const idIdentifierByIdValueMap = new Map();

  return {
    createIdIdentifier: (idValue) => {
      if (idIdentifierByIdValueMap.has(idValue)) {
        return idIdentifierByIdValueMap.get(idValue);
      }

      const newIdentifier = createIdIdentifier();

      idIdentifierByIdValueMap.set(idValue, newIdentifier);

      return newIdentifier;
    },
    getIdIdentifier: (idValue) => idIdentifierByIdValueMap.get(idValue),
    hasIdentifiers: () => idIdentifierByIdValueMap.size !== 0,
    getIdentifiers: () => Array.from(idIdentifierByIdValueMap.values()),
  };
};

const buildIdExpression = template.expression('`#${%%idIdentifier%%}`');

const buildIriUrlExpression = template.expression(`\`${createIriUrl('${%%idIdentifier%%}')}\``);

const buildIdGeneratorHookImportStatement = template(
  `import { ${idGeneratorHookName} } from '${idGeneratorLibraryName}';`,
);

const buildIdIdentifierGeneratorStatement = template(`const %%idIdentifier%% = ${idGeneratorHookName}();`);

const plugin = ({ types: t }) => {
  const splitStylesStringByIriToLiterals = (stylesString, idValuesWithIdentifiers) =>
    idValuesWithIdentifiers
      .reduce(
        (splitStylesLiterals, [idValue, idIdentifier]) =>
          splitStylesLiterals.flatMap((stylesOrIdIdentifier) => {
            if (typeof stylesOrIdIdentifier !== 'string') {
              return stylesOrIdIdentifier;
            }

            const iriUrlExpression = buildIriUrlExpression({ idIdentifier });

            return stylesOrIdIdentifier
              .split(createIriUrl(idValue))
              .flatMap((s, i, splits) => (i === splits.length - 1 ? [s] : [s, iriUrlExpression]));
          }),
        [stylesString],
      )
      .map((stylesOrIdIdentifier) =>
        typeof stylesOrIdIdentifier === 'string' ? t.stringLiteral(stylesOrIdIdentifier) : stylesOrIdIdentifier,
      );

  const jsxAttributeValue = (value) => t.jsxExpressionContainer(value);

  const updateAttributeIdReference = ({ attribute, idValueRegex, valueBuilder, idValuesContainer }) => {
    if (!isStringLiteralAttribute(attribute)) {
      return;
    }

    const idValueMatches = attribute.node.value.value.match(idValueRegex);

    if (!idValueMatches) {
      return;
    }

    const idIdentifier = idValuesContainer.getIdIdentifier(idValueMatches[1]);

    if (idIdentifier) {
      attribute.get('value').replaceWith(jsxAttributeValue(valueBuilder({ idIdentifier })));
    }
  };

  const svgDefsElementsIdIdentifiersCreatorVisitor = {
    JSXOpeningElement(path, state) {
      const idAttribute = path.get('attributes').find(isIdAttribute);

      if (!idAttribute || !isStringLiteralAttribute(idAttribute)) {
        return;
      }

      const newIdIdentifier = state.idValuesContainer.createIdIdentifier(idAttribute.node.value.value);

      idAttribute.get('value').replaceWith(jsxAttributeValue(newIdIdentifier));
    },
  };

  const svgDefsElementsAttributesMapperVisitor = {
    JSXOpeningElement(path, state) {
      path.get('attributes').forEach((attribute) => {
        if (!isIdAttribute(attribute)) {
          updateAttributeIdReference({
            attribute,
            valueBuilder: buildIdExpression,
            idValueRegex: idExactMatchRegex,
            idValuesContainer: state.idValuesContainer,
          });
        }
      });
    },
  };

  const svgDefsVisitor = {
    JSXElement(path, state) {
      if (isDefsPath(path)) {
        path.traverse(svgDefsElementsIdIdentifiersCreatorVisitor, state);
        path.traverse(svgDefsElementsAttributesMapperVisitor, state);
      }
    },
  };

  const styleTagsUpdateVisitor = {
    StringLiteral(path, state) {
      const stylesString = path.node.value;
      const iriMatches = new Set(Array.from(stylesString.matchAll(iriGlobalMatchRegex)).map((x) => x[1]));
      const idValuesWithIdentifiers = Array.from(iriMatches)
        .map((idValue) => [idValue, state.idValuesContainer.getIdIdentifier(idValue)])
        .filter(([, idIdentifier]) => idIdentifier);

      if (idValuesWithIdentifiers.length === 0) {
        return;
      }

      const stylesStringLiterals = splitStylesStringByIriToLiterals(stylesString, idValuesWithIdentifiers);
      const concatenatedStyles = stylesStringLiterals.reduce((node, styleLiteral) =>
        node ? t.binaryExpression('+', node, styleLiteral) : styleLiteral,
      );

      path.replaceWith(concatenatedStyles);
    },
  };

  const svgElementsVisitor = {
    JSXElement(path, state) {
      if (isStylePath(path)) {
        path.traverse(styleTagsUpdateVisitor, state);
      }
    },
    JSXOpeningElement(path, state) {
      path.get('attributes').forEach((attribute) => {
        updateAttributeIdReference({
          attribute,
          valueBuilder: buildIriUrlExpression,
          idValueRegex: iriExactMatchRegex,
          idValuesContainer: state.idValuesContainer,
        });

        if (isXlinkHrefAttribute(attribute)) {
          updateAttributeIdReference({
            attribute,
            valueBuilder: buildIdExpression,
            idValueRegex: idExactMatchRegex,
            idValuesContainer: state.idValuesContainer,
          });
        }
      });
    },
  };

  const renderedJsxVisitor = {
    JSXElement(path, state) {
      if (isSvgPath(path)) {
        path.traverse(svgDefsVisitor, state);
        path.traverse(svgElementsVisitor, state);
      }
    },
  };

  const componentVisitor = {
    Function(path) {
      const idValuesContainer = createIdValuesContainer(() => path.scope.generateUidIdentifier(idAttributeName));

      path.traverse(renderedJsxVisitor, { idValuesContainer });

      if (!idValuesContainer.hasIdentifiers()) {
        return;
      }

      // If component is an arrow function with implicit return, add return statement
      if (path.isArrowFunctionExpression()) {
        path.arrowFunctionToExpression();
      }

      const body = path.get('body');
      const rootPath = path.findParent((p) => p.isProgram());

      rootPath.unshiftContainer('body', buildIdGeneratorHookImportStatement());

      idValuesContainer.getIdentifiers().forEach((idIdentifier) => {
        body.unshiftContainer('body', buildIdIdentifierGeneratorStatement({ idIdentifier }));
      });
    },
  };

  return {
    inherits: jsxSyntaxPlugin,
    visitor: componentVisitor,
  };
};

module.exports = plugin;
