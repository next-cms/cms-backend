import * as acorn from "acorn";
import jsx from "acorn-jsx";
import { generate } from 'astring';
import fs from 'fs';
import {PROJECT_ROOT} from "../constants/DirectoryStructureConstants";
import {PROJECT_FRONTEND} from "../constants/DirectoryStructureConstants";

const JSXParser = acorn.Parser.extend(jsx());

fs.readFile(`${PROJECT_ROOT}/5d333af5f3c8c126c2168031/${PROJECT_FRONTEND}/pages/index.js`, 'utf8',
    (err, srcCode) => {
    if (err) {
        console.log("File read failed:", err);
        return
    }
    console.dir(JSXParser.parse(srcCode, {
        sourceType: 'module'
    }));
});
