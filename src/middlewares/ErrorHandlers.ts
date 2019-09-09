import { Request, Response, NextFunction, Router } from "express";
import * as ErrorHandler from "../utils/ErrorHandler";
import {HTTPClientError} from "../utils/HttpErrors";

function handle404Error (router: Router) {
    router.use((req: Request, res: Response, next: NextFunction) => {
        if (req.path === '/graphql' || req.path.startsWith('/next-project')) next();
        else ErrorHandler.notFoundError(req);
    });
}

function handleClientError (router: Router) {
    router.use((err: HTTPClientError, req: Request, res: Response, next: NextFunction) => {
        ErrorHandler.clientError(err, res, next);
    });
}

function handleServerError (router: Router) {
    router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        ErrorHandler.serverError(err, res, next);
    });
}

export default [handle404Error, handleClientError, handleServerError];
