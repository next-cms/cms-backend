import {collectDefaultComponents} from "../parsers/component-parsers/AvailableComponentsCollector";
import {AvailableComponent} from "../api-models/AvailableComponent";
import Component from "../models/Component";
import {debuglog} from "util";
import Vendor from "../models/Vendor";
import path from "path";
import fse from "fs-extra";
import {SUPPORTED_COMPONENTS_ROOT} from "../constants/DirectoryStructureConstants";

const log = debuglog("pi-cms.utils.SyncUtils");

async function saveComponent(component: AvailableComponent) {
    const componentModel = new Component(component);
    log(`Importing/Updating component: ${component.name}`);
    await componentModel.save().then(res => {
        log(`Imported/Updated component: ${component.name}`);
        return res;
    }).catch(err => {
        log(JSON.stringify(err));
        throw err;
    });
}

export async function importDefaultComponentsPool(reload: boolean = false) {
    log('Syncing the available component pool...');
    const components: AvailableComponent[] = await collectDefaultComponents();
    console.log("Components: ", JSON.stringify(components));
    const vendors: {[x:string]: boolean} = {};
    for (const component of components) {
        try {
            let componentModel = await Component.findByVendorAndName(component.vendor, component.name);
            if (!componentModel) {
                vendors[component.vendor] = true;
                await saveComponent(component);
            } else {
                if (reload) {
                    log(`Re-importing already imported component: ${component.name}`);
                    Object.assign(componentModel, component);
                    componentModel.markModified('props');
                    await componentModel.save();
                } else {
                    log(`Skipping already imported component: ${component.name}`);
                }
            }
        } catch (e) {
            log(e.message, e);
            throw e;
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
        throw e;
    }
}

export async function loadSupportedComponentsPool(vendor: string, reload: boolean=false) {
    await saveVendor(vendor);
    return await fse.readdir(path.join(SUPPORTED_COMPONENTS_ROOT, vendor)).then(async (files)=>{
        log(`Loading components of ${files} from ${vendor}...`);
        for (const file of files) {
            await fse.readFile(path.join(SUPPORTED_COMPONENTS_ROOT, vendor, file)).then(async (jsonString)=>{
                const components: AvailableComponent[] = JSON.parse(jsonString);
                for (const component of components) {
                    try {
                        let componentModel = await Component.findByVendorAndName(component.vendor, component.name);
                        if (!componentModel) {
                            await saveComponent(component);
                        } else {
                            if (reload) {
                                log(`Re-importing already imported component: ${component.name}`);
                                console.log(componentModel);
                                Object.assign(componentModel, component);
                                console.log(componentModel);
                                componentModel.markModified('props.*');
                                await componentModel.save();
                            } else {
                                log(`Skipping already imported component: ${component.name}`);
                            }
                        }
                    } catch (e) {
                        log(e.message, e);
                        throw e;
                    }
                }
            });
        }
        log(`Loaded components of ${files} from ${vendor}`);
        return `Loaded components of ${files} from ${vendor}`;
    }).catch((err)=>{
        log('Unable to scan directory: ', err);
        throw err;
    });
}

export async function loadAllSupportedComponentsPool(reload: boolean=false) {
    return await fse.readdir(SUPPORTED_COMPONENTS_ROOT).then(async (vendors)=>{
        //listing all files using forEach
        for(const vendor of vendors) {
            await loadSupportedComponentsPool(vendor, reload);
        }
        log(`Loaded supported components from vendors ${JSON.stringify(vendors)}`);
        return `Loaded supported components from vendors ${JSON.stringify(vendors)}`;
    }).catch((err)=>{
        log('Unable to scan directory: ', err);
        throw err;
    });
}
