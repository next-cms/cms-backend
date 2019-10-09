import * as walk from "acorn-walk";
import {extend} from "acorn-jsx-walk";
extend(walk.base);
export default {
    walk
};
