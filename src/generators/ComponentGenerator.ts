import path from "path";
import {PROJECT_FRONTEND, PROJECT_ROOT} from "../constants/DirectoryStructureConstants";
import fs from "fs";
import {Component} from "../api-models/PageDetails";
import {AvailableComponentDetails} from "../api-models/AvailableComponentDetails";
import {debuglog} from "util";
const debug = debuglog("pi-cms.generators.ComponentGenerator");
import {generate} from 'astring';
import * as acorn from "acorn";
import jsx from "acorn-jsx";
import {
    getDefaultExportIdentifier,
    getDefaultExportedComponent,
    getJSXElement,
    isFragment
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
            "type": "JSXOpeningFragment",
            "attributes": [],
            "selfClosing": false
        },
        closingFragment: {
            "type": "JSXClosingFragment",
        },
        children: [node]
    }
}

export async function addNewComponentInSourceCode(sourceCode: string, component: AvailableComponentDetails, parent: Component): Promise<string> {
    const ast: any = JSXParser.parse(sourceCode, {
        sourceType: 'module'
    });
    const defaultExportedComponent = await getDefaultExportedComponent(ast);
    const jsxElement = await getJSXElement(defaultExportedComponent);

    if (!parent) {
        if (await isFragment(jsxElement)) {
            // TODO insert new element inside fragment
        } else {
            let newJsxElement = wrapWithFragment(jsxElement);
            console.dir(newJsxElement);
            const code = generateJsx(newJsxElement);
            console.dir(code);
            // TODO insert new element inside the new fragment
        }
    } else {
        // TODO insert new element inside parent element
    }
    return sourceCode;
}

export async function addNewComponent(projectId: string, page: string, component: AvailableComponentDetails, parent: Component): Promise<boolean> {
    const filePath = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND, 'pages', `${page}.js`);
    const sourceCode = await readSourceCodeFile(filePath);
    const newSourceCode = await addNewComponentInSourceCode(sourceCode, component, parent);
    return await fsp.writeFile(filePath, newSourceCode, 'utf8').then(() => {
        return true;
    });
}
