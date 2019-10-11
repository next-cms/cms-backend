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
import {Node} from "acorn";
import {Component} from "../api-models/PageDetails";
import {AvailableComponent, PropsType} from "../api-models/AvailableComponent";
import fs from "fs";
import * as Path from "path";
import {VendorModel} from "models/Vendor";
import AcornParser from "./AcornParser";
import AstringGenerator from "./AstringGenerator";
import AcornWalker from "./AcornWalker";

const fsp = fs.promises;

/**
 * Gets the identifier of the default exported member from the Program
 * @param ast
 */
export async function getDefaultExportIdentifier(ast: Program|Node): Promise<string> {
    let identifier: string = "";
    await AcornWalker.walk.recursive(ast, {}, {
        ExportDefaultDeclaration(node: ExportDefaultDeclaration, state, c) {
            if (node.declaration.type === "CallExpression" || node.declaration.type === "Identifier") {
                c(node.declaration, "ExportDefaultDeclaration");
            }
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

/**
 * Gets the default exported React Component from the Program
 * @param ast
 */
export async function getDefaultExportedComponent(ast: Program): Promise<Node> {
    const defaultExportedIdentifier = await getDefaultExportIdentifier(ast);
    let defaultExportedComponent: any = ast;
    await AcornWalker.walk.recursive(ast, {}, {
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

/**
 * Checks if the given JSXElement is a React.Fragment
 * @param jsxElement
 */
export async function isFragment(jsxElement: Node): Promise<boolean> {
    if (jsxElement.type === "JSXFragment") return true;

    let fragment = true;
    await AcornWalker.walk.recursive(jsxElement, {}, {
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
    await AcornWalker.walk.recursive(ast, {}, {
        JSXElement(node, state, c) {
            jsxElement = node;
        },
        JSXFragment(node, state, c) {
            jsxElement = node;
        }
    });
    return jsxElement;
}

/**
 * Returns the JSXElementNode from the Program|Node which given as the componentInfo: Component
 * @param ast
 * @param componentInfo
 */
export async function getJSXElementFromInfo(ast: Program|Node, componentInfo: Component): Promise<Node> {
    let jsxElement: any = null;
    await AcornWalker.walk.recursive(ast, {}, {
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

/**
 * Reads the package.json file of the vendor root directory and parses the package name
 * @param vendorRootDir
 * @return package name
 */
export async function getVendorPackageName(vendorRootDir: string) {
    return await fsp.readFile(Path.join(vendorRootDir, 'package.json'), 'utf8').then(async (packageJson)=>{
        return JSON.parse(packageJson).name;
    });
}

/**
 * Checks if the given componentModel is imported in the given imports nodes.
 * @param imports
 * @param componentModel
 * @return true if exists in the imports array otherwise false
 */
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

/**
 * Extracts the import statements
 * @param ast
 * @return the array of acorn.ImportDeclaration nodes
 */
export async function getImportDeclarations(ast: Program|Node): Promise<Node[]> {
    let imports: Node[] = [];
    await AcornWalker.walk.recursive(ast, {}, {
        ImportDeclaration(node, state, c) {
            imports.push(node);
        }
    });
    return imports;
}

/**
 * Extracts the import name node and the source from import declaration nodes
 * @param ast: ImportDeclaration
 * @return the array of {acorn.ImportDefaultSpecifier, source} or {acorn.ImportSpecifier, source}
 * or {acorn.ImportNamespaceSpecifier, source}
 */
export async function getImportsNameNodes(ast: ImportDeclaration | Node | any): Promise<{node, source}[]> {
    const imports: any = [];
    await AcornWalker.walk.recursive(ast, {source: ast.source}, {
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

/**
 * Find whether the given source denotes any of the vendors list
 * @param vendors
 * @param source
 */
function isVendorsIncludesSource(vendors: VendorModel[], source: string) {
    return vendors.findIndex((vendor: VendorModel)=>vendor.name===source) > -1;
}

/**
 * Extracts the import name node from import declaration nodes of given vendors
 * @param ast: ImportDeclaration
 * @param vendors
 * @return the array of {acorn.ImportDefaultSpecifier, source} or {acorn.ImportSpecifier, source}
 * or {acorn.ImportNamespaceSpecifier, source}
 */
export async function getImportsNameNodesOfGivenVendors(ast: ImportDeclaration | Node | any, vendors: VendorModel[]):
    Promise<{node: ImportSpecifier|ImportNamespaceSpecifier|ImportDefaultSpecifier, vendor:string}[]> {
    const imports: {node:ImportSpecifier|ImportNamespaceSpecifier|ImportDefaultSpecifier, vendor:string}[] = [];
    await AcornWalker.walk.recursive(ast, {source: ast.source}, {
        ImportDefaultSpecifier(node, state, c) {
            if (!isVendorsIncludesSource(vendors, state.source.value)) return;
            imports.push({node, vendor: state.source.value});
        },
        ImportSpecifier(node, state, c) {
            if (!isVendorsIncludesSource(vendors, state.source.value)) return;
            imports.push({node, vendor: state.source.value});
        },
        ImportNamespaceSpecifier(node, state, c) {
            if (!isVendorsIncludesSource(vendors, state.source.value)) return;
            imports.push({node, vendor: state.source.value});
        }
    });
    return imports;
}

/**
 * Creates the import signature from the Import Specifier node and the vendor name
 * @param nameNode
 * @param vendorName
 */
export function getImportSignatureOfVendorComponentFromImportSpecifierNode(
    nameNode: ImportSpecifier|ImportNamespaceSpecifier|ImportDefaultSpecifier, vendorName: string): string {
    return `import {${nameNode.local.name}} from "${vendorName}";`;
}

/**
 * Collects the propTypes of a default exported component
 * @param ast
 * @return The Object that is the propTypes of the default exported member of the program
 */
async function collectPropTypes(ast: Program): Promise<Node> {
    const defaultExportedIdentifier: string = await getDefaultExportIdentifier(ast);

    let propTypes: Node = null;
    await AcornWalker.walk.recursive(ast, {}, {
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

/**
 * Prepare the AvailableComponent from the source of the component library
 * @param nameNode
 * @param source
 * @param rootPath
 * @param vendorPackageName
 * @returns AvailableComponent
 */
async function collectComponentInfo(nameNode: ImportDefaultSpecifier|ImportNamespaceSpecifier|ImportSpecifier,
                                    source, rootPath, vendorPackageName): Promise<AvailableComponent> {
    const component = new AvailableComponent();
    component.vendor = vendorPackageName;

    // Library Components Import Signature must have to be like this
    component.importSignature = `import {${nameNode.local.name}} from "${vendorPackageName}";`;

    component.name = nameNode.local.name;
    const sourceFile = Path.join(rootPath, `${source}.js`);
    const propTypes: AssignmentExpression|any = await fsp.readFile(sourceFile, 'utf8').then((code)=>{
        const ast: any = AcornParser.parse(code);
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

/**
 * Collects the imported components which are exported from the index.js file of the lib folder of the vendor components
 * library.
 * @param ast
 * @param rootPath
 * @param vendorPackageName
 * @return Array of AvailableComponent
 */
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

export async function getPropsValues(ast: Node, vendorComponent: AvailableComponent): Promise<any> {
    const props: PropsType = copyObject(vendorComponent.props);
    await AcornWalker.walk.recursive(ast, {}, {
        JSXAttribute(node, state, c) {
            if (node.value && node.value.type === "JSXExpressionContainer") {
                if (node.value.expression.type === "ObjectExpression") {
                    props[node.name.name].value = {
                        value: AstringGenerator.generate(node.value.expression.value, 'utf8'),
                        start: node.value.start,
                        end: node.value.end
                    }
                } else if (node.value.expression.type === "JSXElement") {
                    props[node.name.name].value = { // TODO may be better approach and better representation
                        value: AstringGenerator.generate(node.value.expression, 'utf8'),
                        start: node.value.start,
                        end: node.value.end
                    }
                } else {
                    props[node.name.name].value = {
                        value: node.value.expression.value,
                        start: node.value.start,
                        end: node.value.end
                    }
                }
            } else {
                props[node.name.name].value = node.value ? {
                    value: node.value.value,
                    start: node.value.start,
                    end: node.value.end
                } : {
                    value: true
                }
            }
        }
    });
    return props;
}

function copyObject(object) {
    return JSON.parse(JSON.stringify(object));
}
