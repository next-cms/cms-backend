import * as express from "express";
import * as bodyParser from "body-parser";

const { verifyToken } = require("../helpers/securityUtils");

class App {

    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    private config(): void{
        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));

        /* =============================
                Middleware
        ================================ */
        // Logging
        this.app.use((req, res, next) => {
            console.log(`Logged  ${req.baseUrl}  ${req.method} -- ${new Date()}`);
            next();
        });

        // Authentication && Authrization
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
