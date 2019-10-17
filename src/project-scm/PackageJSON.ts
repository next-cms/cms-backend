import Project from "../api-models/Project";
import path from "path";
import fse from "fs-extra";
import {PROJECT_ROOT, TEMPLATE_MODELS_ROOT} from "../constants/DirectoryStructureConstants";
import {snakeCase} from "lodash";
import {debuglog} from "util";
const log = debuglog("pi-cms.project-scm.PackageJSON");

export const addPackageJson = (project: Project, callback: Function) => {
    return fse.readFile(path.join(TEMPLATE_MODELS_ROOT, "package.json.template")).then((jsonString)=>{
        const packageJson = JSON.parse(jsonString);
        packageJson.name = snakeCase(project.title);
        const [major, minor, patch] = [0, 1, 0];
        packageJson.version = `${major}.${minor}.${patch}`;

        return fse.writeFile(`${PROJECT_ROOT}/${project.id}`, packageJson, 'utf8').then(()=>{
            log("package.json written!");
            callback && callback();
        });
    });
};
