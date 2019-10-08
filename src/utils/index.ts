import applyMiddleware from "./MiddlewareUtils";
import applyRoutes from "./RouteUtils";
import imageUpload from "./FileUploadUtils";
import {importDefaultComponentsPool} from "./SyncUtils";
import {createToken, generateToken, resolveUserWithToken, verifyToken} from "./SecurityUtils";

export default {
    applyMiddleware,
    applyRoutes,
    imageUpload,
    createToken,
    resolveUserWithToken,
    importDefaultComponentsPool,
    generateToken,
    verifyToken
}
