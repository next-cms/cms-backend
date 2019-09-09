import * as acorn from "acorn";
import {Node} from "acorn";
import jsx from "acorn-jsx";
import {generate} from 'astring';
import fs from 'fs';
import path from 'path';
import {PROJECT_FRONTEND, PROJECT_ROOT} from "../../constants/DirectoryStructureConstants";
import {extractPageDetails} from "./PageDetailsExtractor";
import {PageDetails} from "../../api-models/PageDetails";
import {Page} from "../../api-models/Page";

const JSXParser = acorn.Parser.extend(jsx());
const fsp = fs.promises;

export async function getProjectPages(projectId): Promise<Page[]> {
    const projectDir = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND, 'pages');
    // console.log("projectDir", projectDir);
    return await fsp.readdir(projectDir).then((files) => {
        //listing all files using forEach
        return files.filter(file => !file.startsWith('_')).map(file => {
            const slug = file.replace('.js', '');
            return new Page({
                slug: slug,
                title: slug,
                key: slug,
                path: `/project/pages?id=${projectId}&pageName=${slug}`,
                pathAs: `/project/pages?id=${projectId}&pageName=${slug}`,
                pathParam: slug
            });
        });
    }).catch((err) => {
        console.log('Unable to scan directory: ' + err);
        return [];
    });
}

export async function getProjectPageDetails(projectId, page): Promise<PageDetails> {
    const filePath = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND, 'pages', `${page}.js`);
    // console.log("filePath", filePath);
    return await fsp.readFile(filePath, 'utf8')
        .then((srcCode) => {
            const ast: Node = JSXParser.parse(srcCode, {
                sourceType: 'module'
            });
            const pageDetails = extractPageDetails(ast);
            console.log(pageDetails);
            return pageDetails;
        })
        .catch((err) => {
            console.log("File read failed:", err);
            return new PageDetails();
        });
}

async function getFileName(dirPath) {
    return await fsp.readdir(dirPath).then((files) => {
        const filtered = files.filter((file) => file.startsWith('blank')).sort((a: string, b: string) => {
            const d1 = a.match(/(\d+)/);
            const na = d1 ? +d1[0] : -1;

            const d2 = b.match(/(\d+)/);
            const nb = d2 ? +d2[0] : -1;
            return (na < nb) ? 1 : -1;
        });
        console.log(filtered);
        if (filtered.length) {
            const matches = filtered[0].match(/(\d+)/);
            return matches ? (+matches[0]) + 1 : 0;
        }
        return 0;
    });
}

export async function addNewPage(projectId): Promise<Page> {
    const templateFilePath = path.join(__dirname, '../../page-templates', 'BlankPage.js');
    return await fsp.readFile(templateFilePath, 'utf8')
        .then(async (templateFile) => {
            const fileNameID = await getFileName(path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND, 'pages'));
            const slug = `blank${fileNameID}`;
            const fileName = `${slug}.js`;
            const filePath = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND, 'pages', fileName);
            return await fsp.writeFile(filePath, templateFile, 'utf8').then(() => {
                return new Page({
                    slug: slug,
                    title: slug,
                    key: slug,
                    path: `/project/pages?id=${projectId}&pageName=${slug}`,
                    pathAs: `/project/pages?id=${projectId}&pageName=${slug}`,
                    pathParam: slug
                });
            });
        });
}
