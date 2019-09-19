import {
    CallExpression,
    ExportDefaultDeclaration,
    Identifier,
    ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier,
    Program,
    VariableDeclarator
} from "estree";
import * as walk from "acorn-walk";
import {extend} from "acorn-jsx-walk";
import {Node} from "acorn";
import {Component} from "../../api-models/PageDetails";
import {AvailableComponent, AvailableComponentInfo} from "../../api-models/AvailableComponent";
import fs from "fs";
import * as Path from "path";
import * as acorn from "acorn";
const fsp = fs.promises;
import jsx from "acorn-jsx";
const JSXParser = acorn.Parser.extend(jsx());
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

export async function getVendorPackageName(vendorRootDir: string) {
    return await fsp.readFile(Path.join(vendorRootDir, 'package.json'), 'utf8').then(async (packageJson)=>{
        return JSON.parse(packageJson).name;
    });
}

export async function getImportDeclarations(ast: Program|Node): Promise<Node[]> {
    let imports: Node[] = [];
    await walk.recursive(ast, {}, {
        ImportDeclaration(node, state, c) {
            imports.push(node);
        }
    });
    return imports;
}

async function collectPropTypes(ast) {
    // TODO collect the propTypes node.
}

async function collectComponentInfo(nameNode: ImportDefaultSpecifier|ImportNamespaceSpecifier|ImportSpecifier,
                                    source, rootPath, vendorPackageName): Promise<AvailableComponent> {
    const component = new AvailableComponent();
    if (nameNode.type === "ImportDefaultSpecifier") {
        component.id = `import ${nameNode.local.name} from "${vendorPackageName}";`;
    } else if (nameNode.type === "ImportNamespaceSpecifier") {
        component.id = `import * as ${nameNode.local.name} from "${vendorPackageName}";`;
    } else if (nameNode.type === "ImportSpecifier") {
        component.id = `import {${nameNode.local.name}} from "${vendorPackageName}";`;
    } else {
        throw new Error("The node is not any type of Import Specifiers!");
    }
    component.name = nameNode.local.name;
    const sourceFile = Path.join(rootPath, source);
    await fsp.readFile(sourceFile, 'utf8').then((code)=>{
        const ast: any = JSXParser.parse(code, {
            sourceType: 'module'
        });
        const propTypes = collectPropTypes(ast);
        // TODO populate the component.props property from propTypes node.
    });
    return component;
}

export async function collectAvailableComponentsInfoFromImportDeclaration(
    ast: ImportDeclaration | Node | any, rootPath, vendorPackageName: string): Promise<AvailableComponent[]> {
    const aComponents: AvailableComponent[] = [];
    await walk.recursive(ast, {source: ast.source}, {
        async ImportDefaultSpecifier(node, state, c) {
            aComponents.push(await collectComponentInfo(node, state.source.value, rootPath, vendorPackageName));
        },
        async ImportSpecifier(node, state, c) {
            aComponents.push(await collectComponentInfo(node, state.source.value, rootPath, vendorPackageName));
        },
        async ImportNamespaceSpecifier(node, state, c) {
            aComponents.push(await collectComponentInfo(node, state.source.value, rootPath, vendorPackageName));
        }
    });
    return aComponents;
}
