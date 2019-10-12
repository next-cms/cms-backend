import FileController from "./FileController";
import { Route } from "../../utils/RouteUtils";
import {verifyTokenMiddleware} from "../../utils/SecurityUtils";

const Routes: Route[] = [
    {
        path: "/files/upload/image",
        method: "post",
        handler: [verifyTokenMiddleware, FileController.uploadImage]
    },
    {
        path: "/files/upload/images",
        method: "post",
        handler: [verifyTokenMiddleware, FileController.uploadImages]
    }
];

export default Routes;
