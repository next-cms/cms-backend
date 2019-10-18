import Project from "../api-models/Project";
import path from "path";
import fse from "fs-extra";
import {PROJECT_ROOT, TEMPLATE_MODELS_ROOT} from "../constants/DirectoryStructureConstants";
import {snakeCase} from "lodash";
import {debuglog} from "util";
const log = debuglog("pi-cms.project-scm.BabelConfig");

export const addBabelConfig = (project: Project, callback: Function) => {
    return fse.readFile(path.join(TEMPLATE_MODELS_ROOT, "babelrc.template")).then((jsonString)=>{
        // const babelJson = JSON.parse(jsonString);
        // const babelJsonString = JSON.stringify(babelJson);

        return fse.writeFile(`${PROJECT_ROOT}/${project.id}/.babelrc`, jsonString, 'utf8').then(()=>{
            log(".babelrc written!");
            callback && callback();
        });
    });
};
