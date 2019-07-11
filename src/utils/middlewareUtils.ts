import {Router} from "express";

type Wrapper = ((router: Router) => void);

export default function applyMiddleware (
    middleware: Wrapper[],
    router: Router
) {
    for (const f of middleware) {
        f(router);
    }
};
