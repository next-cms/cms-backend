import {AvailableComponent, PropsType} from "./AvailableComponent";
import {Node} from "acorn";
import {getPropsValues} from "../parsers/core/InfoExtractor";

export class Value {
    name?: string;
    value: string | number | Component | object | boolean;
    start?: number;
    end?: number;
}

export class Component {
    name: string;
    start: number;
    end: number;
    //@deprecated
    attributes?: Value[] = [];
    props: PropsType = {};
    children: Component[] = [];
    constructor(name?: string, start?: number, end?: number, attributes: Value[] = [], children: Component[] = []){
        this.name = name;
        this.start = start;
        this.end = end;
        this.attributes = attributes;
        this.children = children;
    }

    public static async createFromNodeAndVendorComponent(node: any, vendorComponent: AvailableComponent) {
        switch(node.openingElement.name.type){
            case "JSXIdentifier":
                return {
                    name: node.openingElement.name.name,
                    start: node.start,
                    end: node.end,
                    props: await getPropsValues(node, vendorComponent),
                    children: []  // TODO Find children
                };
            case "JSXMemberExpression":
                return {
                    name: `${node.openingElement.name.object.name}.${node.openingElement.name.property.name}`,
                    start: node.start,
                    end: node.end,
                    props: await getPropsValues(node, vendorComponent),
                    children: []    // TODO Find children
                };
        }
    }
}

// export class PageHeader {
//     title: Value;
//     subtitle: Value;
//     extra: Component
// }

export class PageDetails {
    title: string;
    slug: string;
    children: Component[] = [];
    hooks: [] = [];
    effects: [] = [];
}
