import {collectDefaultComponents} from "../parsers/component-parsers/AvailableComponentsCollector";
import {AvailableComponent} from "../api-models/AvailableComponent";
import Component from "../models/Component";
import {debuglog} from "util";
import Vendor from "../models/Vendor";
import path from "path";
import fse from "fs-extra";
import {SUPPORTED_COMPONENTS_ROOT, TEMPLATE_MODELS_ROOT, LAYOUT_TEMPLATE_ROOT} from "../constants/DirectoryStructureConstants";
import {DataTemplateType} from "../api-models/DataType";
import DataModelTemplate from "../models/DataModelTemplate";
import LayoutTemplate from "../models/LayoutTemplate";

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

async function saveTemplate(template: DataTemplateType) {
    const templateModel = new DataModelTemplate(template);
    log(`Importing/Updating template: ${template.name}`);
    await templateModel.save().then(res => {
        log(`Imported/Updated template: ${template.name}`);
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
                                Object.assign(componentModel, component);
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

export async function loadAllDataTemplateModels(reload: boolean=false) {
    return await fse.readdir(TEMPLATE_MODELS_ROOT).then(async (files)=>{
        log(`Loading template models of ${files}...`);
        for (const file of files) {
            await fse.readFile(path.join(TEMPLATE_MODELS_ROOT, file)).then(async (jsonString)=>{
                const templates: DataTemplateType[] = JSON.parse(jsonString);
                for (const template of templates) {
                    try {
                        let templateModel = await DataModelTemplate.findByName(template.name);
                        if (!templateModel) {
                            await saveTemplate(template);
                        } else {
                            if (reload) {
                                log(`Re-importing already imported template: ${template.name}`);
                                Object.assign(templateModel, template);
                                templateModel.markModified('fields.*');
                                await templateModel.save();
                            } else {
                                log(`Skipping already imported template: ${template.name}`);
                            }
                        }
                    } catch (e) {
                        log(e.message, e);
                        throw e;
                    }
                }
            });
        }
        log(`Loaded templates of ${files}`);
        return `Loaded templates of ${files}`;
    }).catch((err)=>{
        log('Unable to scan directory: ', err);
        throw err;
    });
}

export async function loadAllLayoutTemplate(reload: boolean=false) {
    return await fse.readdir(LAYOUT_TEMPLATE_ROOT).then(async (templates)=>{

        let children = new RegExp("{children}");
        let header = new RegExp("{header}");
        let footer = new RegExp("{footer}");
        let sider = new RegExp("{sider}");

        //listing all files using forEach
        for(const template of templates) {

            fse.readFile(path.join(LAYOUT_TEMPLATE_ROOT, template), "utf8").then(async (file) => {

                let splitFileName = template.split(".");
                
                let templateJson = {
                    name: splitFileName[0],
                    fileName: template,
                    children: children.test(file),
                    header: header.test(file),
                    footer: footer.test(file),
                    sider: sider.test(file)

                }
                
                const layoutTemplate = new LayoutTemplate(templateJson);

                const layout = await LayoutTemplate.findByFileName(templateJson.fileName);

                if(!layout) {
                    layoutTemplate.save();
                    log(`New layout save into databases ${JSON.stringify(templateJson)}`);
                } else {
                    if (reload) {
                        log(`Re-importing already imported layout template: ${templateJson.fileName}`);
                        Object.assign(layout, templateJson);
                        await layout.save();
                    } else {
                        log(`Skipping already imported layout template: ${templateJson.fileName}`);
                    }
                }

            })
        }

        log(`Loaded layout template from templates ${JSON.stringify(templates)}`);
        return `Loaded layout template from templates ${JSON.stringify(templates)}`;
    }).catch((err)=>{
        log('Unable to scan directory: ', err);
        throw err;
    });
}

