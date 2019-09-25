import {
    AssignmentExpression,
    CallExpression,
    ExportDefaultDeclaration,
    Identifier,
    ImportDeclaration,
    ImportDefaultSpecifier,
    ImportNamespaceSpecifier,
    ImportSpecifier,
    Program,
    VariableDeclarator
} from "estree";
import * as walk from "acorn-walk";
import {extend} from "acorn-jsx-walk";
import * as acorn from "acorn";
import {Node} from "acorn";
import {Component} from "../../api-models/PageDetails";
import {AvailableComponent} from "../../api-models/AvailableComponent";
import fs from "fs";
import * as Path from "path";
import jsx from "acorn-jsx";

const fsp = fs.promises;
const JSXParser = acorn.Parser.extend(jsx());
extend(walk.base);

export async function getDefaultExportIdentifier(ast: Program|Node): Promise<string> {
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

export async function hasImportDeclaration(imports: Node[], componentModel): Promise<boolean> {
    for (const imp of imports) {
        const nameNodes = await getImportsNameNodes(imp);
        for (const nameNode of nameNodes) {
            if (nameNode.node.type === "ImportDefaultSpecifier") {
                if (componentModel.importSignature === `import ${nameNode.node.local.name} from "${nameNode.source}";`){
                    return true;
                }
            } else if (nameNode.node.type === "ImportNamespaceSpecifier") {
                if (componentModel.importSignature === `import * as ${nameNode.node.local.name} from "${nameNode.source}";`){
                    return true;
                }
            } else if (nameNode.node.type === "ImportSpecifier") {
                if (componentModel.importSignature === `import {${nameNode.node.local.name}} from "${nameNode.source}";`){
                    return true;
                }
            }
        }
    }
    return false;
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

export async function getImportsNameNodes(ast: ImportDeclaration | Node | any): Promise<{node, source}[]> {
    const imports: any = [];
    await walk.recursive(ast, {source: ast.source}, {
        ImportDefaultSpecifier(node, state, c) {
            imports.push({
                node,
                source: state.source.value
            });
        },
        ImportSpecifier(node, state, c) {
            imports.push({
                node,
                source: state.source.value
            });
        },
        ImportNamespaceSpecifier(node, state, c) {
            imports.push({
                node,
                source: state.source.value
            });
        }
    });
    return imports;
}

async function collectPropTypes(ast: Program): Promise<Node> {
    const defaultExportedIdentifier: string = await getDefaultExportIdentifier(ast);

    let propTypes: Node = null;
    await walk.recursive(ast, {}, {
        AssignmentExpression(node, state, c) {
            if (node.left.type === "MemberExpression") {
                if (node.left.object.name === defaultExportedIdentifier && node.left.property.name === "propTypes") {
                    propTypes = node.right;
                }
            }
        }
    });

    return propTypes;
}

async function collectComponentInfo(nameNode: ImportDefaultSpecifier|ImportNamespaceSpecifier|ImportSpecifier,
                                    source, rootPath, vendorPackageName): Promise<AvailableComponent> {
    const component = new AvailableComponent();
    component.vendor = vendorPackageName;

    // Library Components Import Signature must have to be like this
    component.importSignature = `import {${nameNode.local.name}} from "${vendorPackageName}";`;

    component.name = nameNode.local.name;
    const sourceFile = Path.join(rootPath, `${source}.js`);
    const propTypes: AssignmentExpression|any = await fsp.readFile(sourceFile, 'utf8').then((code)=>{
        const ast: any = JSXParser.parse(code, {
            sourceType: 'module'
        });
        return collectPropTypes(ast);
    });
    for (const node of propTypes.properties) {
        if (node.value.object.type === "MemberExpression") {
            component.props[node.key.name] = {
                type: node.value.object.property.name,
                isRequired: node.value.property.name === "isRequired"
            }
        } else {
            component.props[node.key.name] = {
                type: node.value.property.name,
                isRequired: false
            }
        }
    }
    return component;
}

export async function collectAvailableComponentsInfoFromImportDeclaration (
    ast: ImportDeclaration | Node | any, rootPath, vendorPackageName: string): Promise<AvailableComponent[]> {

    return await getImportsNameNodes(ast).then(async imports => {
        const availableComponents: AvailableComponent[] = [];
        for (const imp of imports) {
            const ac = await collectComponentInfo(imp.node, imp.source, rootPath, vendorPackageName);
            availableComponents.push(ac);
        }
        return availableComponents;
    });
}
