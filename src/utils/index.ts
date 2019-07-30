import applyMiddleware from "./MiddlewareUtils";
import applyRoutes from "./RouteUtils";
import imageUpload from "./FileUploadUtils";
import {createToken, generateToken, resolveUserWithToken, verifyToken} from "./SecurityUtils";

export default {
    applyMiddleware,
    applyRoutes,
    imageUpload,
    createToken,
    resolveUserWithToken,
    generateToken,
    verifyToken
}
