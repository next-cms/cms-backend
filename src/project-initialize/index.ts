import { exec } from 'child_process';
import fs from 'fs';
import { PROJECT_ROOT, PROJECT_FRONTEND } from '../constants/DirectoryStructureConstants';


export const executeCommand = (projectDirName: string) => {

    if (!fs.existsSync(PROJECT_ROOT)) {
        console.log(`${PROJECT_ROOT} folder not exist!`);
        fs.mkdirSync(PROJECT_ROOT);
    } else {
        console.log(`${PROJECT_ROOT} folder exist!`);
    }

    fs.mkdirSync(PROJECT_ROOT + "/" + projectDirName);

    exec('curl https://codeload.github.com/zeit/next.js/tar.gz/canary | tar -xz --strip=2 next.js-canary/examples/with-ant-design', { cwd: `${PROJECT_ROOT}/${projectDirName}` }, (err, stdout, stderr) => {
        if (err) {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        exec(`mv ${PROJECT_ROOT}/${projectDirName}/with-ant-design ${PROJECT_ROOT}/${projectDirName}/${PROJECT_FRONTEND}`, (err, stdout, stderr) => {
            if (err) {
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                return;
            }

            exec('npm install --save', { cwd: `${PROJECT_ROOT}/${projectDirName}/${PROJECT_FRONTEND}` }, (err, stdout, stderr) => {
                if (err) {
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            })

            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        })
    })
};


// Async
const executeShellCommandAsync = async (cmd, options) => {
    return await exec(cmd, options);
}


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
}