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

function printHandlers(handlers) {
    let str = '';
    if (typeof handlers === 'function') {
        str = handlers.name;
    } else {
        handlers.forEach((handler)=>{
            if (str.length > 0) str += ", ";
            str += handler.name;
        });
    }
    return str;
}

export default function applyRoutes(routes: Route[], router: Router) {
    console.log("\nApplying routes:");
    for (const route of routes) {
        const { method, path, handler } = route;
        console.log(`Path: ${path}  Handler: ${printHandlers(handler)}`);
        (router as any)[method](path, handler);
    }
};
