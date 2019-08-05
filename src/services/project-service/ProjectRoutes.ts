import ProjectController from "./ProjectController";
import { Route } from "../../utils/RouteUtils";

const Routes: Route[] = [
    {
        path: "/next-project",
        method: "get",
        handler: ProjectController.loadProject
    },
    {
        path: "/next-project/:page",
        method: "get",
        handler: ProjectController.loadProjectPage
    },
    {
        path: "/_next/webpack-hmr",
        method: "get",
        handler: ProjectController.handleHMR
    },
    {
        path: "/_next/*",
        method: "get",
        handler: ProjectController.handleNextJSRequest
    }
];

export default Routes;
