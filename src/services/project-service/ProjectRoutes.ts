import ProjectController from "./ProjectController";
import { Route } from "../../utils/RouteUtils";

const Routes: Route[] = [
    {
        path: "/project/deploy",
        method: "post",
        handler: ProjectController.deployProject
    },
    {
        path: "/next-project",
        method: "get",
        handler: ProjectController.loadProject
    },
    {
        path: "/next-project/static/*",
        method: "get",
        handler: ProjectController.handleStaticFileRequest
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
    },
    {
        path: "/service-worker.js",
        method: "get",
        handler: ProjectController.handleServiceWorkerRequest
    }
];

export default Routes;
