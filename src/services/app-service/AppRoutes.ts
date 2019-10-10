import AppController from "./AppController";
import { Route } from "../../utils/RouteUtils";

const Routes: Route[] = [
    {
        path: "/app/load/DefaultComponents",
        method: "post",
        handler: (req, res) => AppController.loadComponents(req, res).then(res=>res).catch(err=>err)
    }, {
        path: "/app/reload/DefaultComponents",
        method: "post",
        handler: (req, res) => AppController.reloadComponents(req, res).then(res=>res).catch(err=>err)
    }, {
        path: "/app/load/SupportedComponents",
        method: "post",
        handler: (req, res) => AppController.loadSupportedComponents(req, res).then(res=>res).catch(err=>err)
    }, {
        path: "/app/load/SupportedComponents/:vendor",
        method: "post",
        handler: (req, res) => AppController.loadSupportedComponents(req, res).then(res=>res).catch(err=>err)
    }, {
        path: "/app/reload/SupportedComponents",
        method: "post",
        handler: (req, res) => AppController.reloadSupportedComponents(req, res).then(res=>res).catch(err=>err)
    }, {
        path: "/app/reload/SupportedComponents/:vendor",
        method: "post",
        handler: (req, res) => AppController.reloadSupportedComponents(req, res).then(res=>res).catch(err=>err)
    }
];

export default Routes;
