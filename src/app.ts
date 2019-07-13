import express, { Request, Response } from "express";
import utils from "./utils";
import routes from "./services";
import { verifyToken } from "./utils/securityUtils";
import errorHandlers from "./middleware/errorHandlers";
import middleware from "./middleware";

class App {

    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    private config(): void {

        utils.applyMiddleware(middleware, this.app);
        utils.applyRoutes(routes, this.app);
        utils.applyMiddleware(errorHandlers, this.app);

        /* =============================
                Middleware
        ================================ */

        // Logging
        this.app.use((req: Request, res: Response, next) => {
            console.log(`Logged  ${req.baseUrl}  ${req.method} -- ${new Date()}`);
            next();
        });

        // Authentication && Authorization
        this.app.delete("/api/*", verifyToken);
        this.app.post("/api/*", verifyToken);
        this.app.put("/api/*", verifyToken);

        /* =============================
                Setup Static File
        ================================*/
        this.app.use("/uploads", express.static("uploads"));

    }

}

export default new App().app;
