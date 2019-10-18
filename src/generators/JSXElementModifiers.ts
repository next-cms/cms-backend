import path from "path";
import {PROJECT_ROOT} from "../constants/DirectoryStructureConstants";
import fs from "fs";
import {Component, PageDetails, Value} from "../api-models/PageDetails";
import ComponentModel from "../models/Component";
import {AvailableComponent, AvailableComponentInfo, PropsType} from "../api-models/AvailableComponent";
import * as util from "util";
import {debuglog} from "util";
import {Node} from "acorn";
import {
    getDefaultExportedComponent,
    getImportDeclarations,
    getJSXElement,
    getJSXElementFromInfo,
    hasImportDeclaration,
    isFragment
} from "../core/InfoExtractor";
import {cloneDeep} from "apollo-utilities";
import AcornParser from "../core/AcornParser";
import AstringGenerator from "../core/AstringGenerator";
import AcornWalker from "../core/AcornWalker";
import {CallExpression, ExportDefaultDeclaration, Identifier} from "estree";
import {commitCode} from "../project-manager";

const debug = debuglog("pi-cms.generators.ComponentGenerator");

const fsp = fs.promises;

async function readSourceCodeFile(filePath: string): Promise<string> {
    return await fsp.readFile(filePath, 'utf8')
        .then((srcCode) => {
            return srcCode;
        });
}

function wrapWithFragment(node: Node): any {
    return {
        type: "JSXFragment",
        openingFragment: {
            type: "JSXOpeningFragment",
            attributes: [],
            selfClosing: false
        },
        closingFragment: {
            type: "JSXClosingFragment",
        },
        children: [node]
    }
}

async function updateJSXElement(jsxElement: Node | any, component: Component): Promise<any> {
    const updatedJSXElement = cloneDeep(jsxElement);
    await AcornWalker.walk.recursive(updatedJSXElement, {}, {
        JSXAttribute(node, state, c) {
            if (node.value && node.value.type === "JSXExpressionContainer") {
                if (node.value.expression.type === "ObjectExpression") {
                    node.value.expression.value = component.props[node.name.name].value.value;
                    delete node.value.expression.raw;
                } else if (node.value.expression.type === "JSXElement") {
                    // TODO may be better approach and better representation
                    node.value.expression = component.props[node.name.name].value.value;
                    delete node.value.raw;
                } else {
                    node.value.expression.value = component.props[node.name.name].value.value;
                    delete node.value.expression.raw;
                }
            } else {
                if (node.value) {
                    node.value.value = component.props[node.name.name].value.value;
                    delete node.value.raw;
                } else {
                    node.value = {
                        type: "Literal",
                        value: component.props[node.name.name].value.value
                    };
                }
            }
            delete component.props[node.name.name];
        }
    });
    for (const key of Object.keys(component.props)) {
        if (component.props[key].value) {
            updatedJSXElement.openingElement.attributes.push({
                "type": "JSXAttribute",
                "name": {
                    "type": "JSXIdentifier",
                    "name": key
                },
                "value": {
                    type: "Literal",
                    value: component.props[key].value.value
                }
            });
        }
    }
    return updatedJSXElement;
}

async function getAvailableComponentFromImportSignature(id: string): Promise<AvailableComponent> {
    return await ComponentModel.findById(id);
}

function addNewChildElement(sourceNode: any, component: AvailableComponent): void {
    sourceNode.openingElement.selfClosing = false;
    sourceNode.closingElement = {
        type: "JSXClosingElement",
        name: sourceNode.openingElement.name
    };
    sourceNode.children.push({
        type: "JSXElement",
        openingElement: {
            type: "JSXOpeningElement",
            attributes: [],
            name: {
                type: "JSXIdentifier",
                name: component.name
            },
            selfClosing: true
        },
        children: []
    });
}

function getJSXAttributesFromProps(props: PropsType) {
    const attributes = [];

    function getPropValue(prop: { type: any, isRequired: boolean, value?: Value }) {
        switch (prop.type) {
            case "string":
            case "number":
            case "boolean":
                return prop.value && prop.value.value ? {
                    "type": "Literal",
                    "value": prop.value.value
                } : undefined;
            default:
                return prop.value ? {
                    "type": "JSXExpressionContainer",
                    "expression": {
                        "type": "Literal",
                        "raw": prop.value.value
                    }
                } : undefined;
        }
    }

    Object.keys(props).forEach((key) => {
        const attrValue = getPropValue(props[key]);
        if (!attrValue) return;
        const attr = {
            "type": "JSXAttribute",
            "name": {
                "type": "JSXIdentifier",
                "name": key
            },
            "value": attrValue
        };
        attributes.push(attr);
    });
    return attributes;
}

function addAsChildElement(sourceNode: any, component: Component): void {
    const childNode = {
        type: "JSXElement",
        openingElement: {
            type: "JSXOpeningElement",
            attributes: getJSXAttributesFromProps(component.props),
            name: {
                type: "JSXIdentifier",
                name: component.name
            },
            selfClosing: !component.children || !component.children.length
        },
        closingElement: component.children && component.children.length ? {
            type: "JSXClosingElement",
            name: {
                type: "JSXIdentifier",
                name: component.name
            }
        } : undefined,
        children: []
    };
    component.children.forEach((child) => {
        addAsChildElement(childNode, child);
    });
    sourceNode.openingElement.selfClosing = false;
    sourceNode.closingElement = {
        type: "JSXClosingElement",
        name: sourceNode.openingElement.name
    };
    sourceNode.children.push(childNode);
}

function addImportDeclaration(sourceCode: string, component: AvailableComponent) {
    return `${component.importSignature}\n${sourceCode}`;
}

async function saveElementInSourceCode(sourceCode: string, component: Component): Promise<string> {
    const ast: any = AcornParser.parse(sourceCode);
    const defaultExportedComponent = await getDefaultExportedComponent(ast);
    const defaultExportedJSXElement = await getJSXElement(defaultExportedComponent);
    const jsxElement = await getJSXElementFromInfo(defaultExportedJSXElement, component);

    // console.log("current jsxElement: ", util.inspect(jsxElement, false, null, true /* enable colors */));
    // console.log("component: ", util.inspect(component, false, null, true /* enable colors */));
    const updatedJSXElement = await updateJSXElement(jsxElement, component);
    console.log("updatedJSXElement: ", util.inspect(updatedJSXElement, false, null, true /* enable colors */));

    return sourceCode.substr(0, jsxElement.start) + AstringGenerator.generate(updatedJSXElement) + sourceCode.substr(jsxElement.end);
    // console.log(sourceCode.substr(0, jsxElement.start) + generateJsx(updatedJSXElement) + sourceCode.substr(jsxElement.end));
    // return sourceCode;
}

async function deleteElementFromSourceCode(sourceCode: string, component: Component): Promise<string> {
    const ast: any = AcornParser.parse(sourceCode);
    const defaultExportedComponent = await getDefaultExportedComponent(ast);
    const defaultExportedJSXElement = await getJSXElement(defaultExportedComponent);
    const jsxElement = await getJSXElementFromInfo(defaultExportedJSXElement, component);

    return sourceCode.substr(0, jsxElement.start) + sourceCode.substr(jsxElement.end);
}

async function updateComponentPlacementInSourceCode(sourceCode: string, components: Component[]): Promise<string> {
    const ast: any = AcornParser.parse(sourceCode);
    const defaultExportedComponent = await getDefaultExportedComponent(ast);
    const defaultExportedJSXElement: any = await getJSXElement(defaultExportedComponent);

    defaultExportedJSXElement.children = [];
    components.forEach((component) => {
        addAsChildElement(defaultExportedJSXElement, component);
    });

    return sourceCode.substr(0, defaultExportedJSXElement.start) + AstringGenerator.generate(defaultExportedJSXElement) + sourceCode.substr(defaultExportedJSXElement.end);
}

async function updatePageComponentNameInSourceCode(sourceCode: string, pageDetails: PageDetails): Promise<string> {
    const ast: any = AcornParser.parse(sourceCode);
    const defaultExportedComponent: any = await getDefaultExportedComponent(ast);

    defaultExportedComponent.id.name = pageDetails.name;

    await AcornWalker.walk.recursive(ast, {}, {
        ExportDefaultDeclaration(node: ExportDefaultDeclaration, state, c) {
            c(node.declaration, "ExportDefaultDeclaration");
        },
        Identifier(node: Identifier, state, c) {
            node.name = pageDetails.name;
        },
        CallExpression(node: CallExpression, state, c) {
            c(node.arguments[0], "CallExpression");
        }
    });

    return AstringGenerator.generate(ast);
}

async function addNewElementInSourceCode(sourceCode: string, component: AvailableComponentInfo, parent: Component): Promise<string> {
    const ast: any = AcornParser.parse(sourceCode);
    const defaultExportedComponent = await getDefaultExportedComponent(ast);
    const imports = await getImportDeclarations(ast);
    const defaultExportedJSXElement = await getJSXElement(defaultExportedComponent);
    const componentModel = await getAvailableComponentFromImportSignature(component.id);
    let newSrcCode = sourceCode;

    if (!parent) {
        if (await isFragment(defaultExportedJSXElement)) {
            addNewChildElement(defaultExportedJSXElement, componentModel);
            newSrcCode = sourceCode.substr(0, defaultExportedJSXElement.start) + AstringGenerator.generate(defaultExportedJSXElement) + sourceCode.substr(defaultExportedJSXElement.end);
        } else {
            const newJsxElement = wrapWithFragment(defaultExportedJSXElement);
            addNewChildElement(newJsxElement, componentModel);
            newSrcCode = sourceCode.substr(0, defaultExportedJSXElement.start) + AstringGenerator.generate(newJsxElement) + sourceCode.substr(defaultExportedJSXElement.end);
        }
    } else {
        const parentElement = await getJSXElementFromInfo(defaultExportedJSXElement, parent);
        console.log("parentElement", parentElement);
        addNewChildElement(parentElement, componentModel);
        newSrcCode = sourceCode.substr(0, parentElement.start) + AstringGenerator.generate(parentElement) + sourceCode.substr(parentElement.end);
    }
    if (!await hasImportDeclaration(imports, componentModel)) {
        newSrcCode = addImportDeclaration(newSrcCode, componentModel);
    }
    return newSrcCode;
}

export async function addNewElement(projectId: string, page: string, component: AvailableComponentInfo, parent: Component): Promise<boolean> {
    const filePath = path.join(PROJECT_ROOT, projectId, 'pages', `${page}.js`);
    const sourceCode = await readSourceCodeFile(filePath);
    const newSourceCode = await addNewElementInSourceCode(sourceCode, component, parent);
    return await fsp.writeFile(filePath, AstringGenerator.generate(AcornParser.parse(newSourceCode)), 'utf8').then(() => {
        return commitCode(projectId, `Add new element ${component.name} in page ${page}.js`).then(() => true).catch(() => false);
    });
}

export async function saveElement(projectId: string, page: string, component: Component): Promise<boolean> {
    const filePath = path.join(PROJECT_ROOT, projectId, 'pages', `${page}.js`);
    const sourceCode = await readSourceCodeFile(filePath);
    const newSourceCode = await saveElementInSourceCode(sourceCode, component);
    return await fsp.writeFile(filePath, AstringGenerator.generate(AcornParser.parse(newSourceCode)), 'utf8').then(() => {
        return commitCode(projectId, `Updated element ${component.name} in page ${page}.js`).then(() => true).catch(() => false);
    });
}

export async function deleteElement(projectId: string, page: string, component: Component): Promise<boolean> {
    const filePath = path.join(PROJECT_ROOT, projectId, 'pages', `${page}.js`);
    const sourceCode = await readSourceCodeFile(filePath);
    const newSourceCode = await deleteElementFromSourceCode(sourceCode, component);
    return await fsp.writeFile(filePath, AstringGenerator.generate(AcornParser.parse(newSourceCode)), 'utf8').then(() => {
        return commitCode(projectId, `Removed element ${component.name} from page ${page}.js`).then(() => true).catch(() => false);
    });
}

export async function updateComponentPlacement(components: Component[], projectId: string, page: string): Promise<boolean> {
    const filePath = path.join(PROJECT_ROOT, projectId, 'pages', `${page}.js`);
    const sourceCode = await readSourceCodeFile(filePath);
    const newSourceCode = await updateComponentPlacementInSourceCode(sourceCode, components);
    return await fsp.writeFile(filePath, AstringGenerator.generate(AcornParser.parse(newSourceCode)), 'utf8').then(() => {
        return commitCode(projectId, `Reorder elements in page ${page}.js`).then(() => true).catch(() => false);
    });
}

export async function updatePageComponentName(projectId: string, fileName: string, pageDetails: PageDetails): Promise<boolean> {
    const filePath = path.join(PROJECT_ROOT, projectId, 'pages', fileName);
    const sourceCode = await readSourceCodeFile(filePath);
    const newSourceCode = await updatePageComponentNameInSourceCode(sourceCode, pageDetails);
    return await fsp.writeFile(filePath, AstringGenerator.generate(AcornParser.parse(newSourceCode)), 'utf8').then(() => {
        return commitCode(projectId, `Update page name and route of page ${fileName}`).then(() => true).catch(() => false);
    });
}
