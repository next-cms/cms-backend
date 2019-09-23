import * as acorn from "acorn";
import {Node} from "acorn";
import jsx from "acorn-jsx";
import {generate} from 'astring';
import fs from 'fs';
import path from 'path';
import {
    AVAILABLE_COMPONENTS_ROOT,
    DEFAULT_AVAILABLE_COMPONENTS_ROOT
} from "../../constants/DirectoryStructureConstants";
import {AvailableComponent, AvailableComponentInfo} from "../../api-models/AvailableComponent";
import {
    collectAvailableComponentsInfoFromImportDeclaration,
    getImportDeclarations,
    getVendorPackageName
} from "../core/InfoExtractor";

const JSXParser = acorn.Parser.extend(jsx());
const fsp = fs.promises;

// function extractAvailableComponentDetails(node: Node) {
//     return new AvailableComponentInfo();
// }
//
// async function getComponentDetails(vendor, component): Promise<AvailableComponentInfo> {
//     const filePath = path.join(AVAILABLE_COMPONENTS_ROOT, vendor, `${component}.js`);
//
//     return await fsp.readFile(filePath, 'utf8')
//         .then((srcCode)=>{
//             const ast: Node =  JSXParser.parse(srcCode, {
//                 sourceType: 'module'
//             });
//             const component = extractAvailableComponentDetails(ast);
//             console.log(component);
//             return component;
//         })
//         .catch((err)=>{
//             console.log("File read failed:", err);
//             return new AvailableComponentInfo();
//         });
// }

async function collectComponents(componentsRootPath): Promise<AvailableComponent[]> {
    if (!fs.existsSync(componentsRootPath)) return [];
    return await fsp.readdir(componentsRootPath).then(async (vendors)=>{
        const availableComponents: AvailableComponent[] = [];
        //listing all files using forEach
        for(const vendor of vendors) {
            const vendorRootDir = path.join(componentsRootPath, vendor);
            const vendorPackageName = await getVendorPackageName(vendorRootDir);
            const componentsIndexFile = path.join(componentsRootPath, vendor, 'src/lib/index.js');
            await fsp.readFile(componentsIndexFile, 'utf8').then(async (index)=>{
                const ast: any = JSXParser.parse(index, {
                    sourceType: 'module'
                });
                const imports: Node[] = await getImportDeclarations(ast);
                // console.log();
                for(const importNode of imports) {
                    const components = await collectAvailableComponentsInfoFromImportDeclaration(importNode,
                        path.join(componentsRootPath, vendor, 'src/lib'), vendorPackageName);
                    availableComponents.push(...components)
                }
            });
        }
        console.log("returning from collectComponents");
        return availableComponents;
    }).catch((err)=>{
        console.log('Unable to scan directory: ' + err);
        return [];
    });
}

export async function collectDefaultComponents() {
    const defaultComponentsDir = path.join(DEFAULT_AVAILABLE_COMPONENTS_ROOT);
    return await collectComponents(defaultComponentsDir);
}

export async function collectCustomComponents(projectId) {
    const customComponentsDir = path.join(AVAILABLE_COMPONENTS_ROOT, projectId);
    return await collectComponents(customComponentsDir);
}

export async function getAvailableComponents(projectId) {
    return [
        ...await collectDefaultComponents(),
        ...await collectCustomComponents(projectId)
    ];
}
