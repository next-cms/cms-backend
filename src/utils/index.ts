import applyMiddleware from "./middlewareUtils";
import applyRoutes from "./routeUtils";
import imageUpload from "./fileUploadUtils";
import {generateToken, verifyToken} from "./securityUtils";

export default {
    applyMiddleware,
    applyRoutes,
    imageUpload,
    generateToken,
    verifyToken
}
