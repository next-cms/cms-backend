import {Node} from "acorn";
import * as walk from "acorn-walk";
import {extend} from "acorn-jsx-walk";
import xtend from 'xtend';
import {ATTR_title, JSX_PageHeader, CONST_PAGE_TITLE, ATTR_subTitle, ATTR_extra} from "../constants/PageConstants";
import {Component, PageDetails} from "../api-models/PageDetails";

extend(walk.base);

export async function extractPageDetails(ast: Node) {
    const pageDetails: PageDetails = new PageDetails();
    await walk.recursive(ast, {prevState: null, details: pageDetails}, {
        // AssignmentExpression(node, state, c) {
        //     if (node.left.name === CONST_PAGE_TITLE) {
        //         state.details.pageHeader.title = {
        //             value: node.right.value,
        //             start: node.value.start,
        //             end: node.value.end,
        //         }
        //     }
        // },
        // VariableDeclarator(node, state, c) {
        //     if (node.id.name === CONST_PAGE_TITLE && node.init) {
        //         state.details.pageHeader.title = {
        //             value: node.right.value,
        //             start: node.value.start,
        //             end: node.value.end,
        //         }
        //     }
        // },
        JSXElement(node, state, c) {
            const component: Component = new Component('', node.start, node.end, [], []);
            let newState;
            if (state.details.children) {
                state.details.children.push(component);
                newState = {...state, prevState: state, details: component};
            } else {
                state.details.start = node.start;
                state.details.end = node.end;
                state.details.attributes = [];
                state.details.children = [];
                newState = {...state, prevState: state};
            }
            c(node.openingElement, newState);
            node.children.forEach((child) => c(child, newState));
        },
        JSXOpeningElement(node, state, c) {
            // const att = {}
            state.details.name = node.name.name;
            // state.details.attributes.push();
            const newState = {
                ...state,
                prevState: state
            };
            node.attributes.forEach((attr) => c(attr, newState));
        },
        // JSXExpressionContainer(node, state, c) {
        //     const exp: Component = new Component('', node.start, node.end, [], []);
        //     const newState = {
        //         ...state,
        //         prevState: state,
        //         details: exp
        //     };
        //     c(node.expression, newState)
        // },
        JSXAttribute(node, state, c) {
            switch (node.name.name) {
                case ATTR_title: {
                    state.details.attributes.push({
                        name: ATTR_title,
                        value: node.value.value,
                        start: node.value.start,
                        end: node.value.end,
                    })
                }
                    break;
                case ATTR_subTitle: {
                    state.details.attributes.push({
                        name: ATTR_subTitle,
                        value: node.value.value,
                        start: node.value.start,
                        end: node.value.end,
                    })
                }
                    break;
                case ATTR_extra: {
                    const extra = {};
                    state.details.attributes.push({
                        name: ATTR_extra,
                        value: extra,
                        start: node.value.start,
                        end: node.value.end,
                    });
                    const newState = {
                        ...state,
                        prevState: state,
                        details: extra
                    };
                    c(node.value, newState)
                }
                break;
                default: {
                    console.log("node.name.name: ", node.name.name);
                }
            }
        }
    });
    console.dir(pageDetails);
    return pageDetails;
}
