import {Node} from "acorn";
import {Component, PageDetails} from "../../api-models/PageDetails";
import {
    getDefaultExportIdentifier,
    getImportDeclarations,
    getImportsNameNodesOfGivenVendors
} from "../../core/InfoExtractor";
import Vendor from "../../models/Vendor";
import ComponentModel from "../../models/Component";
import {debuglog} from "util";
import {AvailableComponent} from "../../api-models/AvailableComponent";
import {ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier} from "estree";
import AcornWalker from "../../core/AcornWalker";
import {Page} from "../../api-models/Page";
import {startCase} from "lodash";

const log = debuglog("pi-cms.page-parsers.PageDetailsExtractor");

export async function extractPageInfo(ast: Node, projectId: string, page: string) {
    const name = await getDefaultExportIdentifier(ast);
    return new Page({
        title: startCase(name),
        name: name,
        slug: page,
        key: page,
        path: `/project/pages?projectId=${projectId}&pageName=${page}`,
        pathAs: `/project/pages?projectId=${projectId}&pageName=${page}`,
        pathParam: page
    });
}

export async function extractPageDetails(ast: Node, page: string) {
    const pageDetails: PageDetails = new PageDetails();
    pageDetails.name = await getDefaultExportIdentifier(ast);
    pageDetails.slug = page;
    pageDetails.key = page;

    await addDetailPageInfoAtCMSComponentLevel(ast, pageDetails);

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

    const vendorComponents: AvailableComponent[] = [];
    for (const nameNodes of vendorComponentsImportsNameNodesInPage) {
        const c = await ComponentModel.findByVendorAndName(nameNodes.vendor, nameNodes.node.local.name);
        if (c) vendorComponents.push(c);
    }

    console.log(vendorComponents);
    pageDetails.children = await findVendorChildComponents(ast, vendorComponents);
}

function getCorrespondingVendorComponent(jsxIdentifier: string, components: AvailableComponent[]) {
    const idx = components.findIndex((component: AvailableComponent) => component.name === jsxIdentifier);
    if (idx > -1) return components[idx];
    return null;
}

async function getChildVendorComponentInPage(node, vendorComponents) {
    let vendorComponent;
    switch (node.openingElement.name.type) {
        case "JSXIdentifier":
            vendorComponent = getCorrespondingVendorComponent(node.openingElement.name.name, vendorComponents);
            break;
        case "JSXMemberExpression":
            vendorComponent = getCorrespondingVendorComponent(node.openingElement.name.object.name, vendorComponents);
            break;
    }
    if (vendorComponent) {
        return await Component.createFromNodeAndVendorComponent(node, vendorComponent, vendorComponents);
    }
    return false;
}

export async function findVendorChildComponents(parent: Node|any, vendorComponents: AvailableComponent[]): Promise<Component[]> {
    if (parent.type==="JSXText") return [];

    if (parent.type==="JSXElement") {
        const vendorComponentsInPage: Component[] = [];
        const component = await getChildVendorComponentInPage(parent, vendorComponents);
        if (!component) {
            for (const child of parent.children) {
                vendorComponentsInPage.push(...await findVendorChildComponents(child, vendorComponents));
            }
        } else {
            vendorComponentsInPage.push(component);
        }
        return vendorComponentsInPage;
    } else {
        const vendorComponentsInPage: Component[] = [];
        AcornWalker.walk.recursive(parent, {}, {
            JSXElement(node, state, c) {
                return getChildVendorComponentInPage(node, vendorComponents).then((component) => {
                    if (component) {
                        vendorComponentsInPage.push(component);
                        return;
                    }
                    for(const child of node.children) {
                        c(child, state);
                    }
                });
            }
        });
        return vendorComponentsInPage;
    }
}

async function addDetailPageInfoAtGranularLevel(ast: Node, pageDetails: PageDetails) {
    await AcornWalker.walk.recursive(ast, {prevState: null, details: pageDetails}, {
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
