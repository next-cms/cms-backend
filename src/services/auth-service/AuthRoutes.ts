import AuthController from "./AuthController";
import { Route } from "../../utils/routeUtils";
import { checkReqBodyEmail, checkRequestBody } from "../../middleware/checks";
import {nocache, verifyToken} from "../../utils/securityUtils";

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
