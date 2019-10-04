import {AvailableComponent, PropsType} from "./AvailableComponent";
import {getPropsValues} from "../parsers/core/InfoExtractor";
import {findVendorChildComponents} from "../parsers/page-parsers/PageDetailsExtractor";

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

    constructor(name?: string, start?: number, end?: number, attributes: Value[] = [], children: Component[] = []) {
        this.name = name;
        this.start = start;
        this.end = end;
        this.attributes = attributes;
        this.children = children;
    }

    public static createFromNodeAndVendorComponent(node: any, vendorComponent: AvailableComponent, vendorComponentsList: AvailableComponent[]): Promise<Component> {
        return getPropsValues(node.openingElement, vendorComponent).then((pTypes: PropsType)=>{
            let component: Component;
            switch (node.openingElement.name.type) {
                case "JSXIdentifier": {
                    component = {
                        name: node.openingElement.name.name,
                        start: node.start,
                        end: node.end,
                        props: pTypes,
                        children: []
                    };
                    break;
                }
                case "JSXMemberExpression": {
                    component = {
                        name: `${node.openingElement.name.object.name}.${node.openingElement.name.property.name}`,
                        start: node.start,
                        end: node.end,
                        props: pTypes,
                        children: []
                    };
                    break;
                }
                default: return null;
            }
            const promises = node.children.map((child) => {
                return findVendorChildComponents(child, vendorComponentsList);
            });
            Promise.all(promises).then((resolves: any[])=>{
                if (resolves && resolves.length) {
                    console.log(resolves);
                    for (const c of resolves) {
                        if (c && c.length) {
                            component.children.push(...c);
                        }
                    }
                }
            });
            return component;
        });
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
