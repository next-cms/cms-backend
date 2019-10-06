import path from "path";
import {PROJECT_FRONTEND, PROJECT_ROOT} from "../constants/DirectoryStructureConstants";
import fs from "fs";
import {Component, Value} from "../api-models/PageDetails";
import ComponentModel from "../models/Component";
import {AvailableComponent, AvailableComponentInfo, PropsType} from "../api-models/AvailableComponent";
import {debuglog} from "util";
import {generate} from 'astring';
import * as acorn from "acorn";
import {Node} from "acorn";
import jsx from "acorn-jsx";
import {
    getDefaultExportedComponent,
    getImportDeclarations,
    getJSXElement,
    getJSXElementFromInfo,
    hasImportDeclaration,
    isFragment
} from "../parsers/core/InfoExtractor";
import {generateJsx} from "./JSXGenerator";
import {cloneDeep} from "apollo-utilities";
import * as walk from "acorn-walk";
import {extend} from "acorn-jsx-walk";
import * as util from "util";

const debug = debuglog("pi-cms.generators.ComponentGenerator");

const JSXParser = acorn.Parser.extend(jsx());
const fsp = fs.promises;
extend(walk.base);

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

async function updateJSXElement(jsxElement: Node, component: Component): Promise<any> {
    const updatedJSXElement = cloneDeep(jsxElement);
    await walk.recursive(updatedJSXElement, {}, {
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
                    node.value.expression.value = component.props[node.name.name].value.value
                    delete node.value.expression.raw;
                }
            } else {
                if (node.value) {
                    node.value.value = component.props[node.name.name].value.value
                    delete node.value.raw;
                } else {
                    node.value = {
                        value: component.props[node.name.name].value.value
                    };
                }
            }
        }
    });
    return updatedJSXElement;
}

async function getAvailableComponentFromImportSignature(id: string): Promise<AvailableComponent> {
    return await ComponentModel.findById(id);
}

function addNewChildElement(sourceNode: any, component: AvailableComponent): void {
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
    const attr = [];

    function getPropValue(prop: { type: any, isRequired: boolean, value?: Value }) {
        switch (prop.type) {
            case "string":
            case "number":
            case "boolean":
                return {
                    "type": "Literal",
                    "value": prop.value ? prop.value.value : true
                };
            default:
                return {
                    "type": "JSXExpressionContainer",
                    "expression": {
                        "type": "Literal",
                        "raw": prop.value ? prop.value.value : "true"
                    }
                }
        }
    }

    Object.keys(props).forEach((key) => {
        attr.push({
            "type": "JSXAttribute",
            "name": {
                "type": "JSXIdentifier",
                "name": key
            },
            "value": getPropValue(props[key])
        });
    });
    return attr;
}

function addAsChildElement(sourceNode: any, component: Component): void {
    const childNode =  {
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
    sourceNode.children.push(childNode);
}

function addImportDeclaration(sourceCode: string, component: AvailableComponent) {
    return `${component.importSignature}\n${sourceCode}`;
}

async function saveElementInSourceCode(sourceCode: string, component: Component): Promise<string> {
    const ast: any = JSXParser.parse(sourceCode, {
        sourceType: 'module'
    });
    const defaultExportedComponent = await getDefaultExportedComponent(ast);
    const defaultExportedJSXElement = await getJSXElement(defaultExportedComponent);
    const jsxElement = await getJSXElementFromInfo(defaultExportedJSXElement, component);

    // console.log("current jsxElement: ", util.inspect(jsxElement, false, null, true /* enable colors */));
    // console.log("component: ", util.inspect(component, false, null, true /* enable colors */));
    const updatedJSXElement = await updateJSXElement(jsxElement, component);
    // console.log("updatedJSXElement: ", util.inspect(updatedJSXElement, false, null, true /* enable colors */));

    return sourceCode.substr(0, jsxElement.start) + generateJsx(updatedJSXElement) + sourceCode.substr(jsxElement.end);
    // console.log(sourceCode.substr(0, jsxElement.start) + generateJsx(updatedJSXElement) + sourceCode.substr(jsxElement.end));
    // return sourceCode;
}

async function deleteElementFromSourceCode(sourceCode: string, component: Component): Promise<string> {
    const ast: any = JSXParser.parse(sourceCode, {
        sourceType: 'module'
    });
    const defaultExportedComponent = await getDefaultExportedComponent(ast);
    const defaultExportedJSXElement = await getJSXElement(defaultExportedComponent);
    const jsxElement = await getJSXElementFromInfo(defaultExportedJSXElement, component);

    console.log("current jsxElement: ", util.inspect(jsxElement, false, null, true /* enable colors */));

    return sourceCode.substr(0, jsxElement.start) + sourceCode.substr(jsxElement.end);
    // console.log(sourceCode.substr(0, jsxElement.start) + generateJsx(updatedJSXElement) + sourceCode.substr(jsxElement.end));
    // return sourceCode;
}

async function updateComponentPlacementInSourceCode(sourceCode: string, components: Component[]): Promise<string> {
    const ast: any = JSXParser.parse(sourceCode, {
        sourceType: 'module'
    });
    const defaultExportedComponent = await getDefaultExportedComponent(ast);
    const defaultExportedJSXElement: any = await getJSXElement(defaultExportedComponent);

    defaultExportedJSXElement.children = [];
    components.forEach((component) => {
        addAsChildElement(defaultExportedJSXElement, component);
    });

    return sourceCode.substr(0, defaultExportedJSXElement.start) + generateJsx(defaultExportedJSXElement) + sourceCode.substr(defaultExportedJSXElement.end);
    // console.log(sourceCode.substr(0, defaultExportedJSXElement.start) + generateJsx(defaultExportedJSXElement) + sourceCode.substr(defaultExportedJSXElement.end));
    // return sourceCode;
}

async function addNewElementInSourceCode(sourceCode: string, component: AvailableComponentInfo, parent: Component): Promise<string> {
    const ast: any = JSXParser.parse(sourceCode, {
        sourceType: 'module'
    });
    const defaultExportedComponent = await getDefaultExportedComponent(ast);
    const imports = await getImportDeclarations(ast);
    const defaultExportedJSXElement = await getJSXElement(defaultExportedComponent);
    const componentModel = await getAvailableComponentFromImportSignature(component.id);
    let newSrcCode = sourceCode;

    if (!parent) {
        if (await isFragment(defaultExportedJSXElement)) {
            addNewChildElement(defaultExportedJSXElement, componentModel);
            newSrcCode = sourceCode.substr(0, defaultExportedJSXElement.start) + generateJsx(defaultExportedJSXElement) + sourceCode.substr(defaultExportedJSXElement.end);
        } else {
            const newJsxElement = wrapWithFragment(defaultExportedJSXElement);
            addNewChildElement(newJsxElement, componentModel);
            newSrcCode = sourceCode.substr(0, defaultExportedJSXElement.start) + generateJsx(newJsxElement) + sourceCode.substr(defaultExportedJSXElement.end);
        }
    } else {
        const parentElement = await getJSXElementFromInfo(defaultExportedJSXElement, parent);
        console.log("parentElement", parentElement);
        addNewChildElement(parentElement, componentModel);
        newSrcCode = sourceCode.substr(0, parentElement.start) + generateJsx(parentElement) + sourceCode.substr(parentElement.end);
    }
    if (!await hasImportDeclaration(imports, componentModel)) {
        newSrcCode = addImportDeclaration(newSrcCode, componentModel);
    }
    return newSrcCode;
}

export async function addNewElement(projectId: string, page: string, component: AvailableComponentInfo, parent: Component): Promise<boolean> {
    const filePath = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND, 'pages', `${page}.js`);
    const sourceCode = await readSourceCodeFile(filePath);
    const newSourceCode = await addNewElementInSourceCode(sourceCode, component, parent);
    return await fsp.writeFile(filePath, generateJsx(JSXParser.parse(newSourceCode, {sourceType: 'module'})), 'utf8').then(() => {
        return true;
    });
}

export async function saveElement(projectId: string, page: string, component: Component): Promise<boolean> {
    const filePath = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND, 'pages', `${page}.js`);
    const sourceCode = await readSourceCodeFile(filePath);
    const newSourceCode = await saveElementInSourceCode(sourceCode, component);
    return await fsp.writeFile(filePath, generateJsx(JSXParser.parse(newSourceCode, {sourceType: 'module'})), 'utf8').then(() => {
        return true;
    });
}

export async function deleteElement(projectId: string, page: string, component: Component): Promise<boolean> {
    const filePath = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND, 'pages', `${page}.js`);
    const sourceCode = await readSourceCodeFile(filePath);
    const newSourceCode = await deleteElementFromSourceCode(sourceCode, component);
    return await fsp.writeFile(filePath, generateJsx(JSXParser.parse(newSourceCode, {sourceType: 'module'})), 'utf8').then(() => {
        return true;
    });
}

export async function updateComponentPlacement(components: Component[], projectId: string, page: string): Promise<boolean> {
    const filePath = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND, 'pages', `${page}.js`);
    const sourceCode = await readSourceCodeFile(filePath);
    const newSourceCode = await updateComponentPlacementInSourceCode(sourceCode, components);
    return await fsp.writeFile(filePath, generateJsx(JSXParser.parse(newSourceCode, {sourceType: 'module'})), 'utf8').then(() => {
        return true;
    });
}
