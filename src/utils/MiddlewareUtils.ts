import {Router} from "express";

type Wrapper = ((router: Router) => void);

export default function applyMiddleware (
    middleware: Wrapper[],
    router: Router
) {
    console.log("\nApplying middle-wares: ");
    for (const f of middleware) {
        console.log(f.name);
        f(router);
    }
};
