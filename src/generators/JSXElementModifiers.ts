import path from "path";
import {PROJECT_FRONTEND, PROJECT_ROOT} from "../constants/DirectoryStructureConstants";
import fs from "fs";
import {Component} from "../api-models/PageDetails";
import ComponentModel from "../models/Component";
import {AvailableComponent, AvailableComponentInfo} from "../api-models/AvailableComponent";
import {debuglog} from "util";
const debug = debuglog("pi-cms.generators.ComponentGenerator");
import {generate} from 'astring';
import * as acorn from "acorn";
import jsx from "acorn-jsx";
import {
    getDefaultExportedComponent,
    getJSXElement,
    isFragment, getJSXElementFromInfo, getImportDeclarations, hasImportDeclaration
} from "../parsers/core/InfoExtractor";
import {Node} from "acorn";
import {generateJsx} from "./JSXGenerator";

const JSXParser = acorn.Parser.extend(jsx());
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
            selfClosing: false
        },
        closingElement: {
            type: "JSXClosingElement",
            name: {
                type: "JSXIdentifier",
                name: component.name
            }
        },
        children: []
    });
}

function addImportDeclaration(sourceCode: string, component: AvailableComponent) {
    return `${component.importSignature}\n${sourceCode}`;
}

async function addNewElementInSourceCode(sourceCode: string, component: AvailableComponentInfo, parent: Component): Promise<string> {
    const ast: any = JSXParser.parse(sourceCode, {
        sourceType: 'module'
    });
    const defaultExportedComponent = await getDefaultExportedComponent(ast);
    const imports = await getImportDeclarations(ast);
    const jsxElement = await getJSXElement(defaultExportedComponent);
    const componentModel = await getAvailableComponentFromImportSignature(component.id);
    let newSrcCode = sourceCode;

    if (!parent) {
        if (await isFragment(jsxElement)) {
            addNewChildElement(jsxElement, componentModel);
            newSrcCode = sourceCode.substr(0, jsxElement.start) + generateJsx(jsxElement) + sourceCode.substr(jsxElement.end);
        } else {
            const newJsxElement = wrapWithFragment(jsxElement);
            addNewChildElement(newJsxElement, componentModel);
            newSrcCode = sourceCode.substr(0, jsxElement.start) + generateJsx(newJsxElement) + sourceCode.substr(jsxElement.end);
        }
    } else {
        const parentElement = getJSXElementFromInfo(jsxElement, parent);
        addNewChildElement(parentElement, componentModel);
        newSrcCode = sourceCode.substr(0, jsxElement.start) + generateJsx(parentElement) + sourceCode.substr(jsxElement.end);
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
