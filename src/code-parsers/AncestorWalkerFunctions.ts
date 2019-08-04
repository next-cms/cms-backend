import * as walk from "acorn-walk";
import {extend} from "acorn-jsx-walk";
import {ATTR_extra} from "../constants/PageConstants";
import recursiveWalkerFunctions from "./RecursiveWalkerFunctions";
import {Component} from "../api-models/PageDetails";

extend(walk.base);

const ancestorWalkerFunctions = {
    Literal(node, state, ancestors) {
        for (let i=ancestors.length-1; i>=0; i--) {
            if (ancestors[i].type === "JSXAttribute") {
                state.details.attributes.push({
                    name: ancestors[i].name.name,
                    value: node.value,
                    start: node.start,
                    end: node.end,
                });
            }
        }
    },
    JSXElement(node, state, ancestors) {
        const component: Component = new Component('', node.start, node.end, [], []);
        const newState = {
            ...state,
            prevState: state,
            details: component
        };
        walk.recursive(node.openingElement, newState, recursiveWalkerFunctions);
        node.children.forEach((child) => walk.recursive(child, newState, recursiveWalkerFunctions));
    }
};

export default ancestorWalkerFunctions;
