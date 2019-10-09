import * as acorn from "acorn";
import jsx from "acorn-jsx";
import {Node} from "acorn";
const _AcornParser = acorn.Parser.extend(jsx());
export default {
    parse: function (code): Node {
        return _AcornParser.parse(code, {
            sourceType: 'module'
        });
    }
};
