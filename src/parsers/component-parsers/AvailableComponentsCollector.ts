import * as acorn from "acorn";
import jsx from "acorn-jsx";
import {generate} from 'astring';
import fs from 'fs';
import path from 'path';
import {AVAILABLE_COMPONENTS_ROOT} from "../../constants/DirectoryStructureConstants";
import {Node} from "acorn";
import {AvailableComponentInfo} from "../../api-models/AvailableComponent";

const JSXParser = acorn.Parser.extend(jsx());
const fsp = fs.promises;

function extractAvailableComponentDetails(node: Node) {
    return new AvailableComponentInfo();
}

async function getComponentDetails(vendor, component): Promise<AvailableComponentInfo> {
    const filePath = path.join(AVAILABLE_COMPONENTS_ROOT, vendor, `${component}.js`);

    return await fsp.readFile(filePath, 'utf8')
        .then((srcCode)=>{
            const ast: Node =  JSXParser.parse(srcCode, {
                sourceType: 'module'
            });
            const component = extractAvailableComponentDetails(ast);
            console.log(component);
            return component;
        })
        .catch((err)=>{
            console.log("File read failed:", err);
            return new AvailableComponentInfo();
        });
}

export async function getAvailableComponents() {
    const projectDir = AVAILABLE_COMPONENTS_ROOT;
    // console.log("projectDir", projectDir);
    return await fsp.readdir(projectDir).then((vendors)=>{
        const availableComponents: AvailableComponentInfo[] = [];
        //listing all files using forEach
        vendors.forEach(async (vendor) => {
            const vendorComponentsDir = path.join(projectDir, vendor, 'components');
            await fsp.readdir(vendorComponentsDir).then((components)=>{
                components.forEach(async (component) => {
                    const componentDetails: AvailableComponentInfo = await getComponentDetails(vendor, component);
                    availableComponents.push(componentDetails);
                });
            });
        });
        return availableComponents;
    }).catch((err)=>{
        console.log('Unable to scan directory: ' + err);
        return [];
    });
}
