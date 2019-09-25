import {collectDefaultComponents} from "../parsers/component-parsers/AvailableComponentsCollector";
import {AvailableComponent} from "../api-models/AvailableComponent";
import Component from "../models/Component";
import {debuglog} from "util";
import Vendor from "../models/Vendor";

const log = debuglog("pi-cms.utils.SyncUtils");

export async function syncDefaultComponentsPool() {
    log('Syncing the available component pool...');
    const components: AvailableComponent[] = await collectDefaultComponents();
    console.log("Components: ", JSON.stringify(components));
    const vendors: {[x:string]: boolean} = {};
    for (const component of components) {
        try {
            let componentModel = await Component.findByImportSignature(component.importSignature);
            if (!componentModel) {
                vendors[component.vendor] = true;
                componentModel = new Component(component);
                log(`Importing new component: ${component.name}`);
                await componentModel.save().then(res => {
                    log(`Imported new component: ${component.name}`);
                    return res;
                }).catch(err => {
                    log(JSON.stringify(err));
                    return err;
                })
            } else {
                log(`Skipping already imported component: ${component.name}`);
            }
        } catch (e) {
            log(e.message, e);
            return e.message;
        }
    }
    for (const vendor in vendors) {
        await saveVendor(vendor);
    }
    return components;
}

export async function reimportDefaultComponentsPool() {
    log('Syncing the available component pool...');
    const components: AvailableComponent[] = await collectDefaultComponents();
    console.log("Components: ", JSON.stringify(components));
    const vendors: {[x:string]: boolean} = {};
    for (const component of components) {
        try {
            let componentModel = await Component.findByImportSignature(component.importSignature);
            if (!componentModel) {
                vendors[component.vendor] = true;
                componentModel = new Component(component);
                log(`Importing new component: ${component.name}`);
                await componentModel.save().then(res => {
                    log(`Imported new component: ${component.name}`);
                    return res;
                }).catch(err => {
                    log(JSON.stringify(err));
                    return err;
                })
            } else {
                log(`Re-importing already imported component: ${component.name}`);
                componentModel = {...componentModel, ...component};
                await componentModel.save();
            }
        } catch (e) {
            log(e.message, e);
            return e.message;
        }
    }
    for (const vendor in vendors) {
        await saveVendor(vendor);
    }
    return components;
}

async function saveVendor(vendor: string) {
    try {
        let vendorModel = await Vendor.findByName(vendor);
        if (!vendorModel) {
            vendorModel = new Vendor({name: vendor});
            log(`Adding new vendor ${vendor} in db`);
            await vendorModel.save().then(res => {
                log(`Added new vendor ${vendor}`);
                return res;
            }).catch(err => {
                log(JSON.stringify(err));
                return err;
            })
        } else {
            log(`Vendor ${vendor} is already in db`);
        }
    } catch (e) {
        log(e.message, e);
        return e.message;
    }
}
