import * as astring from 'astring';
import extend from 'xtend';
// Make sure the astring module is imported and that `Object.assign` is defined

// Create a custom generator that inherits from Astring's base generator
const generator = Object.assign({}, astring.baseGenerator,{
    // <div></div>
    'JSXElement': function JSXElement(node, state) {
        // const output = state.output;
        state.write('<');
        this[node.openingElement.type](node.openingElement, state);
        if (node.closingElement) {
            state.write('>');
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                this[child.type](child, state);
            }
            state.write('</');
            this[node.closingElement.type](node.closingElement, state);
            state.write('>');
        } else {
            state.write(' />');
        }
    },
    // <div>
    'JSXOpeningElement': function JSXOpeningElement(node, state) {
        // const output = state.output;
        this[node.name.type](node.name, state);
        for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            this[attr.type](attr, state);
        }
    },
    // </div>
    'JSXClosingElement': function JSXClosingElement(node, state) {
        // const output = state.output;
        this[node.name.type](node.name, state);
    },
    // div
    'JSXIdentifier': function JSXIdentifier(node, state) {
        // const output = state.output;
        state.write(node.name);
    },
    // Member.Expression
    'JSXMemberExpression': function JSXMemberExpression(node, state) {
        // const output = state.output;
        this[node.object.type](node.object, state);
        state.write('.');
        this[node.property.type](node.property, state);
    },
    // attr="something"
    'JSXAttribute': function JSXAttribute(node, state) {
        // const output = state.output;
        state.write(' ');
        this[node.name.type](node.name, state);
        state.write('=');
        this[node.value.type](node.value, state);
    },
    // namespaced:attr="something"
    'JSXNamespacedName': function JSXNamespacedName(node, state) {
        // const output = state.output;
        this[node.namespace.type](node.namespace, state);
        state.write(':');
        this[node.name.type](node.name, state);
    },
    // {expression}
    'JSXExpressionContainer': function JSXExpressionContainer(node, state) {
        // const output = state.output;
        state.write('{');
        this[node.expression.type](node.expression, state);
        state.write('}');
    },
    'JSXText': function JSXText(node, state) {
        state.write(node.value);
    }
});

export function generateJsx (ast, options = null) {
    this.generator = generator;
    return astring.generate(ast, extend({
        generator: generator
    }, options));
}
