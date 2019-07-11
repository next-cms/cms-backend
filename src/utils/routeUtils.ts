import {NextFunction, Router} from "express";
import {Request, Response} from "express";

export type Handler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void> | void;

export type Route = {
    path: string;
    method: string;
    handler: Handler | Handler[];
};

export default function applyRoutes(routes: Route[], router: Router) {
    for (const route of routes) {
        const { method, path, handler } = route;
        (router as any)[method](path, handler);
    }
};
