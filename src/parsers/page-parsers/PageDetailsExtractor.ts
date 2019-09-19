import {Node} from "acorn";
import * as walk from "acorn-walk";
import {extend} from "acorn-jsx-walk";
import {Component, PageDetails} from "../../api-models/PageDetails";

extend(walk.base);

export async function extractPageDetails(ast: Node) {
    const pageDetails: PageDetails = new PageDetails();
    await walk.recursive(ast, {prevState: null, details: pageDetails}, {
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
            if (node.name.type === "JSXIdentifier") {
                state.details.name = node.name.name;
            } else {
                state.details.name = `${node.name.object.name}.${node.name.property.name}`;
            }
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
    });
    console.dir(pageDetails);
    return pageDetails;
}
