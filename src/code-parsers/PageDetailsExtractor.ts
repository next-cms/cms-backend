import {Node} from "acorn";
import * as walk from "acorn-walk";
import { extend } from "acorn-jsx-walk";
import {ATTR_TITLE, JSX_PAGE_HEADER} from "../constants/PageConstants";
import {PageDetails} from "../api-models/PageDetails";

extend(walk.base);

export async function extractPageDetails(ast: Node) {
    const pageDetails: PageDetails = new PageDetails();
    await walk.ancestor(ast, {
        // AssignmentExpression(node, _) {
        //     if (node.left.name === PAGE_TITLE) {
        //         pageDetails.title = node.right.value;
        //     }
        // },
        // VariableDeclarator(node, _) {
        //     if (node.id.name === PAGE_TITLE && node.init) {
        //         pageDetails.title = node.init.value;
        //     }
        // },
        JSXAttribute(node, ancestors) {
            if (node.name.name === ATTR_TITLE && ancestors[ancestors.length - 2].name.name === JSX_PAGE_HEADER) {
                pageDetails.title = {
                    value: node.value.value,
                    start: node.value.start,
                    end: node.value.end,
                }
            }
        }
    });
    return pageDetails;
}
