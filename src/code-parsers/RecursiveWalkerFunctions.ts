import {ATTR_extra, ATTR_subTitle, ATTR_title} from "../constants/PageConstants";
import {Component} from "../api-models/PageDetails";
import * as walk from "acorn-walk";
import {extend} from "acorn-jsx-walk";
import ancestorWalkerFunctions from "./AncestorWalkerFunctions";

extend(walk.base);

const recursiveWalkerFunctions = {
    Literal(node, state, c) {
        state.details.value = node.value;
        state.details.start = node.start;
        state.details.end = node.end;
    },
    JSXElement(node, state, c) {
        const component: Component = new Component('', node.start, node.end, [], []);
        let newState;
        if (state.details.children) {
            state.details.children.push(component);
            newState = {...state, prevState: state, details: component};
        } else {
            state.details.value = component;
            newState = {...state, prevState: state, details: component};
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
    JSXAttribute(node, state, c) {
        switch (node.value.type) {
            case "JSXExpressionContainer":
                const attr = {
                    name: node.name.name,
                    start: node.start,
                    end: node.end
                };
                state.details.attributes.push(attr);
                const newState = {
                    ...state,
                    prevState: state,
                    details: attr
                };
                c(node.value.expression, newState);
                break;
            case "Literal":
                state.details.attributes.push({
                    name: node.name.name,
                    value: node.value.value,
                    start: node.value.start,
                    end: node.value.end,
                });
                break;
        }
    }
};

export default recursiveWalkerFunctions;
