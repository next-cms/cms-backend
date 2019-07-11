import AuthController from "../controller/authController";
import {Route} from "../../utils/routeUtils";

const Routes: Route[] = [
    {
        path: "/auth",
        method: "get",
        handler: AuthController.ping
    },
    {
        path: "/auth/signup",
        method: "post",
        handler: AuthController.saveUser
    },
    {
        path: "/auth/login",
        method: "post",
        handler: AuthController.login
    }
];

export default Routes;
