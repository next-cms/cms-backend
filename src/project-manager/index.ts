import {exec, spawn} from 'child_process';
import fs from 'fs';
import fse from 'fs-extra';
import {PROJECT_ROOT} from '../constants/DirectoryStructureConstants';
import path from "path";
import Project from "../api-models/Project";
import {addPackageJson} from "./PackageJSON";
import {addBabelConfig} from "./BabelConfig";
import {addDeploymentConfiguration} from "./DeploymentConfig";

const execCommand = (cmd: string, args: string[], cwd: string, callback: Function) => {
    try {
        let child = spawn(cmd, args, {cwd: cwd});

        child.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });

        child.stderr.on('data', function (data) {
            console.error('stderr: ' + data);
        });

        child.on('close', function (code) {
            console.log('child process exited with code ' + code);
            if (!code && callback) {
                callback()
            }
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const initializeNewProject = (project: Project): Promise<any> => {
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
            execCommand('curl',  ['https://codeload.github.com/zeit/next.js/tar.gz/canary', '|', 'tar', '-xz', '--strip=3', 'next.js-canary/examples/with-ant-design'], `${PROJECT_ROOT}/${projectDirName}`, () => {
                addPackageJson(project, () => {
                    addBabelConfig(project, () => {
                        execCommand('yarn', [], `${PROJECT_ROOT}/${projectDirName}`, () => {
                            // TODO start: remove when we have a project initializer
                            fse.copy(path.join(__dirname, '../templates', 'BlankPage.js.template'), `${PROJECT_ROOT}/${projectDirName}/pages/index.js`, err => {
                                if (err) return console.error(err);
                                console.log('success!');
                                // TODO ends: here
                                execCommand('git', ['init'], `${PROJECT_ROOT}/${projectDirName}`, () => {
                                    fse.copy(path.join(__dirname, '../templates', 'gitignore.template'), `${PROJECT_ROOT}/${projectDirName}/.gitignore`, err => {
                                        if (err) return console.error(err);
                                        console.log('success!');
                                        execCommand('git', ['add', '.'], `${PROJECT_ROOT}/${projectDirName}`, () => {
                                            execCommand('git', ['commit', '-m', '"project initialized"'], `${PROJECT_ROOT}/${projectDirName}`, () => {
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
            });
        } catch (e) {
            reject(e);
        }
    });
};

export const deployProjectInDockerWithNginx = (project: Project): Promise<any> => {
    return new Promise((resolve, reject) => {
        const projectDirName = project.id;
        try {
            addDeploymentConfiguration(project, (err) => {
                if (err) throw err;
                execCommand('docker-compose', ['up', '-d', '--build'], `${PROJECT_ROOT}/${projectDirName}`, () => {
                    console.log("Project deployed successfully!");
                    resolve(true);
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
            execCommand('git', ['add', '.'], `${PROJECT_ROOT}/${projectId}`, () => {
                execCommand('git', ['commit', '-m', '"${message}"'], `${PROJECT_ROOT}/${projectId}`, () => {
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
