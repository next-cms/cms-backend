import {exec} from 'child_process';
import fs from 'fs';
import fse from 'fs-extra';
import {PROJECT_ROOT} from '../constants/DirectoryStructureConstants';
import path from "path";
import Project from "../api-models/Project";
import {addPackageJson} from "./PackageJSON";

const execCommand = (command: string, cwd: string, callback: Function) => {
    console.log(cwd);
    // @ts-ignore
    exec(command, {cwd: cwd}, (err, stdout, stderr) => {
        if (err) {
            console.log(`stderr: ${stderr}`);
            console.error('err:', err);
            throw err;
        }
        console.log(`stdout: ${stdout}`);
        if (callback) {
            callback()
        }
    });
};

export const initializeNewProject = (project: Project) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(PROJECT_ROOT)) {
            console.log(`${PROJECT_ROOT} folder not exist!`);
            fs.mkdirSync(PROJECT_ROOT);
        } else {
            console.log(`${PROJECT_ROOT} folder exist!`);
        }

        const projectDirName = project.id;
        fs.mkdirSync(PROJECT_ROOT + "/" + projectDirName);
        try {
            execCommand('curl https://codeload.github.com/zeit/next.js/tar.gz/canary | tar -xz --strip=3 next.js-canary/examples/with-ant-design', `${PROJECT_ROOT}/${projectDirName}`, () => {
                addPackageJson(project, () => {
                    execCommand('npm install --save', `${PROJECT_ROOT}/${projectDirName}`, () => {
                        // TODO start: remove when we have a project initializer
                        fse.copy(path.join(__dirname, '../templates', 'BlankPage.js.template'), `${PROJECT_ROOT}/${projectDirName}/pages/index.js`, err => {
                            if (err) return console.error(err);
                            console.log('success!');
                            // TODO ends: here
                            execCommand('git init', `${PROJECT_ROOT}/${projectDirName}`, () => {
                                fse.copy(path.join(__dirname, '../templates', 'gitignore.template'), `${PROJECT_ROOT}/${projectDirName}/.gitignore`, err => {
                                    if (err) return console.error(err);
                                    console.log('success!');
                                    execCommand('git add .', `${PROJECT_ROOT}/${projectDirName}`, () => {
                                        execCommand('git commit -m "project initialized"', `${PROJECT_ROOT}/${projectDirName}`, () => {
                                            console.log("project initialization successful");
                                            resolve(true);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } catch (e) {
            reject(e);
        }
    });
};

export const commitCode = (projectId: string, message): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            execCommand('git add .', `${PROJECT_ROOT}/${projectId}`, () => {
                execCommand(`git commit -m "${message}"`, `${PROJECT_ROOT}/${projectId}`, () => {
                    console.log(`project source code committed with message '${message}'`);
                    resolve();
                });
            })
        } catch (e) {
            reject(e);
        }
    });
};

// Async
const executeShellCommandAsync = async (cmd, options) => {
    return await exec(cmd, options);
};


// Prominse
const executeShellCommand = (cmd, options: null) => {
    return new Promise((resolve, reject) => {
        exec(cmd, options, (err, stdout, stderr) => {
            if (err) {
                console.warn(err);
            }
            resolve(stdout ? stdout : stderr)
        })
    })
};
