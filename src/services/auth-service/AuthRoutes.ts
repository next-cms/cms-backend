import AuthController from "./AuthController";
import { Route } from "../../utils/RouteUtils";
import { checkReqBodyEmail, checkRequestBody } from "../../middlewares/Checks";
import {nocache, verifyToken} from "../../utils/SecurityUtils";

const Routes: Route[] = [
    {
        path: "/auth",
        method: "get",
        handler: AuthController.ping
    },
    {
        path: "/auth/signup",
        method: "post",
        handler: [
            checkRequestBody,
            AuthController.saveUser
        ]
    },
    {
        path: "/auth/login",
        method: "post",
        handler: [
            checkReqBodyEmail,
            AuthController.login
        ]
    },
    {
        path: "/auth/resolve",
        method: "get",
        handler: [
            nocache,
            // verifyToken,
            AuthController.resolve
        ]
    }
];

export default Routes;
