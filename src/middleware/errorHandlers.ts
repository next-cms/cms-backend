import { Request, Response, NextFunction, Router } from "express";
import * as ErrorHandler from "../utils/ErrorHandler";
import {HTTPClientError} from "../utils/httpErrors";

function handle404Error (router: Router) {
    router.use((req: Request, res: Response, next: NextFunction) => {
        if (req.path === '/graphql') next();
        else ErrorHandler.notFoundError();
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
