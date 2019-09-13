import {CallExpression, ExportDefaultDeclaration, Identifier, Program, VariableDeclarator} from "estree";
import * as walk from "acorn-walk";
import {extend} from "acorn-jsx-walk";
import {Node} from "acorn";
import {Component} from "../../api-models/PageDetails";

extend(walk.base);

export async function getDefaultExportIdentifier(ast: Program): Promise<string> {
    let identifier: string = "";
    await walk.recursive(ast, {}, {
        ExportDefaultDeclaration(node: ExportDefaultDeclaration, state, c) {
            c(node.declaration, "ExportDefaultDeclaration");
        },
        Identifier(node: Identifier, state, c) {
            identifier = node.name;
        },
        CallExpression(node: CallExpression, state, c) {
            c(node.arguments[0], "CallExpression");
        }
    });
    return identifier;
}

export async function getDefaultExportedComponent(ast: Program): Promise<Node> {
    const defaultExportedIdentifier = await getDefaultExportIdentifier(ast);
    let defaultExportedComponent: any = ast;
    await walk.recursive(ast, {}, {
        FunctionDeclaration(node, state, c) {
            if ((node.id as Identifier).name === defaultExportedIdentifier) {
                defaultExportedComponent = node;
            }
        },
        ClassDeclaration(node, state, c) {
            if ((node.id as Identifier).name === defaultExportedIdentifier) {
                defaultExportedComponent = node;
            }
        },
        VariableDeclarator(node: VariableDeclarator, state, c) {
            if ((node.id as Identifier).name === defaultExportedIdentifier) {
                defaultExportedComponent = node;
            }
        }
    });
    return defaultExportedComponent;
}

export async function isFragment(jsxElement: Node): Promise<boolean> {
    if (jsxElement.type === "JSXFragment") return true;

    let fragment = true;
    await walk.recursive(jsxElement, {}, {
        JSXOpeningElement(node, state, c) {
            c(node.name);
        },
        JSXMemberExpression(node, state, c) {
            fragment = node.object.name === "React" && node.property.name === "Fragment";
        },
        JSXIdentifier(node, state, c) {
            fragment = node.name === "Fragment";
        }
    });
    return fragment;
}

export async function getJSXElement(ast: Program|Node): Promise<Node> {
    let jsxElement: any = null;
    await walk.recursive(ast, {}, {
        JSXElement(node, state, c) {
            jsxElement = node;
        },
        JSXFragment(node, state, c) {
            jsxElement = node;
        }
    });
    return jsxElement;
}

export async function getJSXElementFromInfo(ast: Program|Node, componentInfo: Component): Promise<Node> {
    let jsxElement: any = null;
    await walk.recursive(ast, {}, {
        JSXElement(node, state, c) {
            if (componentInfo.start === node.start && componentInfo.end === node.end) {
                jsxElement = node;
            } else {
                node.children.forEach(n => c(n))
            }
        },
        JSXFragment(node, state, c) {
            if (componentInfo.start === node.start && componentInfo.end === node.end) {
                jsxElement = node;
            } else {
                node.children.forEach(n => c(n))
            }
        }
    });
    return jsxElement;
}
