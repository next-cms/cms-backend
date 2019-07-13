import { Request, Response, NextFunction } from "express";
import { HTTP400Error } from "../utils/httpErrors";

export function checkSearchParams(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.query.q) {
        throw new HTTP400Error("Missing q parameter");
    } else {
        next();
    }
}

export function checkRequestBody (
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.body) {
        throw new HTTP400Error("Missing request body");
    } else {
        next();
    }
}

export function checkReqBodyEmail (
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.body) {
        throw new HTTP400Error("Missing email in request body");
    } else {
        next();
    }
}
