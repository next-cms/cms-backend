import applyMiddleware from "./MiddlewareUtils";
import applyRoutes from "./RouteUtils";
import {importDefaultComponentsPool} from "./SyncUtils";
import {createToken, generateToken, resolveUserWithToken, verifyToken} from "./SecurityUtils";

export default {
    applyMiddleware,
    applyRoutes,
    createToken,
    resolveUserWithToken,
    importDefaultComponentsPool,
    generateToken,
    verifyToken
}
