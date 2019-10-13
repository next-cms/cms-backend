import fse from 'fs-extra';
import path from "path";
import {PROJECT_ROOT} from "../constants/DirectoryStructureConstants";
import {SUPPORTED_IMAGE_EXTENSIONS} from "../constants/FileConstants";
import {imageSize} from "image-size";
import {gcd} from "../utils/MathUtils";

async function* getFiles(dir) {
    const dirents = await fse.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = path.join(dir, dirent.name);
        console.log(path.extname(res));
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else if (SUPPORTED_IMAGE_EXTENSIONS.includes(path.extname(dirent.name))) {
            yield {
                name: dirent.name,
                path: res,
                dimension: imageSize(res)
            };
        }
    }
}

export const listAllMedia = async (projectId, limit, skip) => {
    const staticDir = path.join(PROJECT_ROOT, projectId, 'static', 'images');
    if (!fse.existsSync(staticDir)) {
        return [];
    }
    // console.log("projectDir", projectDir);
    const list = [];
    try {
        for await (const {name, path, dimension} of getFiles(staticDir)) {
            if (skip) {
                skip--;
                continue;
            }
            // const g = gcd(dimension.height, dimension.width);
            if (list.length < limit) list.push({
                name: name,
                src: `/next-project/static/images${path.substr(staticDir.length)}`,
                height: 1,
                width: dimension.width/dimension.height
            });
            else return {
                data: list,
                hasMore: true
            };
        }
        console.log(list);
        return {
            data: list,
            hasMore: false
        };
    } catch (e) {
        console.log('Unable to scan directory: ' + e);
        throw e;
    }
};
