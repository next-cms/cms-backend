import {collectDefaultComponents} from "../parsers/component-parsers/AvailableComponentsCollector";
import {AvailableComponent} from "../api-models/AvailableComponent";
import Component from "../models/Component";
import {debuglog} from "util";

const log = debuglog("pi-cms.utils.SyncUtils");

export async function syncDefaultComponentsPool() {
    log('Syncing the available component pool...');
    const components: AvailableComponent[] = await collectDefaultComponents();
    console.log("Components: ", JSON.stringify(components));
    const vendors = {};
    components.map( async component => {
        try {
            let componentModel = await Component.findById(component.id);
            console.log("Id of the component is :", component.name);
            if (!componentModel) {
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
            console.log("Error :",e)
            return e.message;
        }
    })
}

export async function reimportDefaultComponentsPool() {
    log('Importing the available component pool...');
    const components: AvailableComponent[] = await collectDefaultComponents();
    for (const component of components) {
        try {
            let componentModel = new Component(component);
            await componentModel.save().then(res => {
                log(`Importing new component: ${component.name}`);
                return res;
            }).catch(err => {
                log(JSON.stringify(err));
                return err;
            });
        } catch (e) {
            return e.message;
        }
    }
    return components;
}
