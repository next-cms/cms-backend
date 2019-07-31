import * as acorn from "acorn";
import jsx from "acorn-jsx";
import { generate } from 'astring';
import fs from 'fs';
import path from 'path';
import {PROJECT_ROOT} from "../constants/DirectoryStructureConstants";
import {PROJECT_FRONTEND} from "../constants/DirectoryStructureConstants";

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
                id: file,
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
