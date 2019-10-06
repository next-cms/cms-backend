import fs from 'fs';
import {PROJECT_ROOT} from "../constants/DirectoryStructureConstants";
import AcornParser from "../core/AcornParser";
import AstringGenerator from "../core/AstringGenerator";

fs.readFile(`${PROJECT_ROOT}/5d36a94f10d48f2cfe05d4be/pages/index.js`, 'utf8',
    (err, srcCode) => {
    if (err) {
        console.log("File read failed:", err);
        return
    }
    srcCode = srcCode.substr(0, 401) + "import fs from 'fs';" + srcCode.substr(402);
    console.log(AstringGenerator.generate(AcornParser.parse(srcCode)));
});
