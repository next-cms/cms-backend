import {Request, Response} from "express";
import {
    loadAllThirdPartyComponentsPool,
    loadThirdPartyComponentsPool,
    importDefaultComponentsPool
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
    static async loadThirdPartyComponents(req: Request, res: Response) {
        try {
            const vendor = req.params.vendor;
            let result;
            if (vendor) {
                result = await loadThirdPartyComponentsPool(vendor);
            } else {
                result = await loadAllThirdPartyComponentsPool();
            }
            return res.json({
                status: "success",
                message: "Third-Party components loaded successfully!",
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
    static async reloadThirdPartyComponents(req: Request, res: Response) {
        try {
            const vendor = req.params.vendor;
            let result;
            if (vendor) {
                result = await loadThirdPartyComponentsPool(vendor, true);
            } else {
                result = await loadAllThirdPartyComponentsPool(true);
            }
            return res.json({
                status: "success",
                message: "Third-Party components loaded successfully!",
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
