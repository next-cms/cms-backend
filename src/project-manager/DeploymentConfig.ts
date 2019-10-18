import Project from "../api-models/Project";
import path from "path";
import fse from "fs-extra";
import {PROJECT_ROOT, TEMPLATES_ROOT} from "../constants/DirectoryStructureConstants";
import {snakeCase} from "lodash";
import {debuglog} from "util";
const log = debuglog("pi-cms.project-scm.DeploymentConfig");

export const addDeploymentConfiguration = (project: Project, callback: Function) => {
    const projectDirName = project.id;

    fse.copy(`${TEMPLATES_ROOT}/docker-compose.yml`, `${PROJECT_ROOT}/${projectDirName}/docker-compose.yml`)
        .then(() => {
            fse.copy(`${TEMPLATES_ROOT}/Dockerfile-app`, `${PROJECT_ROOT}/${projectDirName}/Dockerfile-app`)
                .then(() => {
                    fse.copy(`${TEMPLATES_ROOT}/Dockerfile-nginx`, `${PROJECT_ROOT}/${projectDirName}/Dockerfile-nginx`)
                        .then(() => {
                            fse.copy(`${TEMPLATES_ROOT}/nginx`, `${PROJECT_ROOT}/${projectDirName}/nginx`)
                                .then(() => {
                                    log("Successfully copied required deployment files!");
                                    callback && callback(null);
                                })
                                .catch(err => {
                                    console.error(err);
                                    callback && callback(err);
                                })
                        })
                        .catch(err => {
                            console.error(err);
                            callback && callback(err);
                        })
                })
                .catch(err => {
                    console.error(err);
                    callback && callback(err);
                })
        })
        .catch(err => {
            console.error(err);
            callback && callback(err);
        })
};
