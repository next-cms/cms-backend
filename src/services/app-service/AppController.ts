import {Request, Response} from "express";
import {
    loadAllSupportedComponentsPool,
    loadSupportedComponentsPool,
    importDefaultComponentsPool, loadAllDataTemplateModels
} from "../../utils/SyncUtils";

class AppController {
    static async loadComponents(req: Request, res: Response) {
        try {
            const result = await importDefaultComponentsPool();
            return res.json({
                status: "success",
                message: "Components loaded successfully!",
                data: result
            });
        } catch (e) {
            console.error(e);
            return res.status(400).json({
                status: "error",
                message: e
            });
        }
    }
    static async reloadComponents(req: Request, res: Response) {
        try {
            const result = await importDefaultComponentsPool(true);
            return res.json({
                status: "success",
                message: "Components reloaded successfully!",
                data: result
            });
        } catch (e) {
            console.error(e);
            return res.status(400).json({
                status: "error",
                message: e
            });
        }
    }
    static async loadSupportedComponents(req: Request, res: Response) {
        try {
            const vendor = req.params.vendor;
            let result;
            if (vendor) {
                result = await loadSupportedComponentsPool(vendor);
            } else {
                result = await loadAllSupportedComponentsPool();
            }
            return res.json({
                status: "success",
                message: "Supported components loaded successfully!",
                data: result
            });
        } catch (e) {
            console.error(e);
            return res.status(400).json({
                status: "error",
                message: e
            });
        }
    }
    static async reloadSupportedComponents(req: Request, res: Response) {
        try {
            const vendor = req.params.vendor;
            let result;
            if (vendor) {
                result = await loadSupportedComponentsPool(vendor, true);
            } else {
                result = await loadAllSupportedComponentsPool(true);
            }
            return res.json({
                status: "success",
                message: "Supported components reloaded successfully!",
                data: result
            });
        } catch (e) {
            console.error(e);
            return res.status(400).json({
                status: "error",
                message: e
            });
        }
    }
    static async loadDataTemplates(req: Request, res: Response) {
        try {
            const result = await loadAllDataTemplateModels(false);
            return res.json({
                status: "success",
                message: "Data Templates loaded successfully!",
                data: result
            });
        } catch (e) {
            console.error(e);
            return res.status(400).json({
                status: "error",
                message: e
            });
        }
    }
    static async reloadDataTemplates(req: Request, res: Response) {
        try {
            const result = await loadAllDataTemplateModels(true);
            return res.json({
                status: "success",
                message: "Data Templates reloaded successfully!",
                data: result
            });
        } catch (e) {
            console.error(e);
            return res.status(400).json({
                status: "error",
                message: e
            });
        }
    }
}

export default AppController;
