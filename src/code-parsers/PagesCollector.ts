import * as acorn from "acorn";
import jsx from "acorn-jsx";
import {generate} from 'astring';
import fs from 'fs';
import path from 'path';
import {PROJECT_FRONTEND, PROJECT_ROOT} from "../constants/DirectoryStructureConstants";
import {extractPageDetails} from "./PageDetailsExtractor";
import {Node} from "acorn";

const JSXParser = acorn.Parser.extend(jsx());
const fsp = fs.promises;

export async function getProjectPages(projectId) {
    const projectDir = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND, 'pages');
    console.log("projectDir", projectDir);
    return await fsp.readdir(projectDir).then((files)=>{
        //listing all files using forEach
        return files.filter(file=>!file.startsWith('_')).map(function (file) {
            const slug = file.replace('.js', '');
            return {
                slug: slug,
                title: slug,
                key: file,
                path: `/project?component=pages&page=${slug}&id=${projectId}`,
                pathAs: `/project/pages/${slug}?id=${projectId}`,
                pathParam: slug,
            }
        });
    }).catch((err)=>{
        console.log('Unable to scan directory: ' + err);
        return [];
    });
}

export async function getProjectPageDetails(projectId, page) {
    const filePath = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND, 'pages', `${page}.js`);
    console.log("filePath", filePath);
    return await fsp.readFile(filePath, 'utf8')
        .then((srcCode)=>{
            const ast: Node =  JSXParser.parse(srcCode, {
                sourceType: 'module'
            });
            const pageDetails = extractPageDetails(ast);
            return {
                parsed: JSON.stringify(ast),
                details: pageDetails
            }
        })
        .catch((err)=>{
            console.log("File read failed:", err);
            return {};
        });
}
