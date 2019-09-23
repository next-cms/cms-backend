import AppController from "./AppController";
import { Route } from "../../utils/RouteUtils";

const Routes: Route[] = [
    {
        path: "/app/sync/components",
        method: "post",
        handler: AppController.syncComponents
    }
];

export default Routes;
