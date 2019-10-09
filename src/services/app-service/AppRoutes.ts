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
        path: "/app/load/ThirdParty",
        method: "post",
        handler: (req, res) => AppController.loadThirdPartyComponents(req, res).then(res=>res).catch(err=>err)
    }, {
        path: "/app/load/ThirdParty/:vendor",
        method: "post",
        handler: (req, res) => AppController.loadThirdPartyComponents(req, res).then(res=>res).catch(err=>err)
    }, {
        path: "/app/reload/ThirdParty",
        method: "post",
        handler: (req, res) => AppController.reloadThirdPartyComponents(req, res).then(res=>res).catch(err=>err)
    }, {
        path: "/app/reload/ThirdParty/:vendor",
        method: "post",
        handler: (req, res) => AppController.reloadThirdPartyComponents(req, res).then(res=>res).catch(err=>err)
    }
];

export default Routes;
