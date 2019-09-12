import * as acorn from "acorn";
import jsx from "acorn-jsx";
import {generateJsx} from '../generators/JSXGenerator';
import fs from 'fs';
import {PROJECT_ROOT} from "../constants/DirectoryStructureConstants";
import {PROJECT_FRONTEND} from "../constants/DirectoryStructureConstants";

const JSXParser = acorn.Parser.extend(jsx());

fs.readFile(`${PROJECT_ROOT}/5d36a94f10d48f2cfe05d4be/${PROJECT_FRONTEND}/pages/index.js`, 'utf8',
    (err, srcCode) => {
    if (err) {
        console.log("File read failed:", err);
        return
    }
    srcCode = srcCode.substr(0, 401) + "import fs from 'fs';" + srcCode.substr(402);
    console.log(generateJsx(JSXParser.parse(srcCode, {
        sourceType: 'module'
    })));
});
