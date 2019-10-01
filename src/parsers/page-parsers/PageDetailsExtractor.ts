import {Node} from "acorn";
import * as walk from "acorn-walk";
import {extend} from "acorn-jsx-walk";
import {Component, PageDetails} from "../../api-models/PageDetails";
import {
    getDefaultExportIdentifier,
    getImportDeclarations,
    getImportSignatureOfVendorComponentFromImportSpecifierNode,
    getImportsNameNodesOfGivenVendors
} from "../core/InfoExtractor";
import Vendor from "../../models/Vendor";
import ComponentModel from "../../models/Component";
import {debuglog} from "util";
import {AvailableComponent} from "../../api-models/AvailableComponent";
import {ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier} from "estree";

const log = debuglog("pi-cms.page-parsers.PageDetailsExtractor");
extend(walk.base);

export async function extractPageDetails(ast: Node, page: string) {
    const pageDetails: PageDetails = new PageDetails();
    pageDetails.title = await getDefaultExportIdentifier(ast);
    pageDetails.slug = page;

    // await addDetailPageInfoAtGranularLevel(ast, pageDetails);
    await addDetailPageInfoAtCMSComponentLevel(ast, pageDetails);

    console.log(pageDetails);
    return pageDetails;
}

async function addDetailPageInfoAtCMSComponentLevel(ast: Node, pageDetails: PageDetails) {
    const vendors = await Vendor.getAllVendors(9999999, 0);
    const imports = await getImportDeclarations(ast);

    const vendorComponentsImportsNameNodesInPage:
        { node: ImportSpecifier | ImportNamespaceSpecifier | ImportDefaultSpecifier, vendor: string }[] = [];
    for (const importsNode of imports) {
        vendorComponentsImportsNameNodesInPage.push(...await getImportsNameNodesOfGivenVendors(importsNode, vendors));
    }
    console.log("vendorComponentsImportsNameNodesInPage: ", vendorComponentsImportsNameNodesInPage);

    const vendorComponents: AvailableComponent[] = [];
    for (const nameNodes of vendorComponentsImportsNameNodesInPage) {
        vendorComponents.push(await ComponentModel.findByImportSignature(
            getImportSignatureOfVendorComponentFromImportSpecifierNode(nameNodes.node, nameNodes.vendor)))
    }
    console.log("vendorComponents: ", vendorComponents);

    const vendorComponentsInPage: Component[] = await findVendorComponentsInPage(ast, vendorComponents);
    console.log("vendorComponentsInPage: ", vendorComponentsInPage);
    pageDetails.children = vendorComponentsInPage;
}

function getCorrespondingVendorComponent(jsxIdentifier: string, components: AvailableComponent[]) {
    console.log("getCorrespondingVendorComponent", jsxIdentifier, components);
    const idx = components.findIndex((component: AvailableComponent) => component.name === jsxIdentifier);
    console.log("idx", idx);
    if (idx > -1) return components[idx];
    return null;
}

async function findVendorComponentsInPage(ast: Node, vendorComponents: AvailableComponent[]): Promise<Component[]> {
    const vendorComponentsInPage: Component[] = [];

    await walk.recursive(ast, {}, {
        JSXElement(node, state, c) {
            switch (node.openingElement.name.type) {
                case "JSXIdentifier": {
                    const vendorComponent = getCorrespondingVendorComponent(node.openingElement.name.name, vendorComponents);
                    console.log("vendorComponent", vendorComponent);
                    if (vendorComponent) {
                        Component.createFromNodeAndVendorComponent(node, vendorComponent).then((component) => {
                            vendorComponentsInPage.push(component);
                            console.log("vendorComponentsInPage", vendorComponentsInPage);
                        });
                    }
                    break;
                }
                case "JSXMemberExpression": {
                    const vendorComponent = getCorrespondingVendorComponent(node.openingElement.name.object.name, vendorComponents);
                    if (vendorComponent) {
                        Component.createFromNodeAndVendorComponent(node, vendorComponent).then((component) => {
                            vendorComponentsInPage.push(component);
                        });
                    }
                    break;
                }
            }
            for(const child of node.children) {
                c(child, state);
            }
        }
    });

    return vendorComponentsInPage;
}

async function addDetailPageInfoAtGranularLevel(ast: Node, pageDetails: PageDetails) {
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
            if (!node.value) {
                state.details.attributes.push({
                    name: node.name.name,
                    value: true,
                    start: node.name.end,
                    end: node.name.end,
                });
                return;
            }
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
}
