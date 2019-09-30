import {Page} from "../api-models/Page";
import path from "path";
import {PROJECT_FRONTEND, PROJECT_ROOT} from "../constants/DirectoryStructureConstants";
import fs from "fs";
import {debuglog} from "util";
const fsp = fs.promises;

const debug = debuglog("pi-cms.generators.PageGenerator");

async function getFileName(dirPath) {
    return await fsp.readdir(dirPath).then((files) => {
        const filtered = files.filter((file) => file.startsWith('blank')).sort((a: string, b: string) => {
            const d1 = a.match(/(\d+)/);
            const na = d1 ? +d1[0] : -1;

            const d2 = b.match(/(\d+)/);
            const nb = d2 ? +d2[0] : -1;
            return (na < nb) ? 1 : -1;
        });
        debug(JSON.stringify(filtered));
        if (filtered.length) {
            const matches = filtered[0].match(/(\d+)/);
            return matches ? (+matches[0]) + 1 : 0;
        }
        return 0;
    });
}

export async function addNewPage(projectId): Promise<Page> {
    const templateFilePath = path.join(__dirname, '../templates', 'BlankPage.js.template');
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
