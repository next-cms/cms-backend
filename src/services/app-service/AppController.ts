import {Request, Response} from "express";
import {reimportDefaultComponentsPool} from "../../utils/SyncUtils";

class AppController {
    static async syncComponents(req: Request, res: Response) {
        try {
            await reimportDefaultComponentsPool();
            return
        } catch (e) {
            console.error(e);
        }
    }
}

export default AppController;
