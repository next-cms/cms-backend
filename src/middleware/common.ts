import { Router } from "express";
import cors from "cors";
import parser from "body-parser";
import compression from "compression";

export function handleCors (router: Router) {
    router.use(cors({credentials: true, origin: true}));
}

export function handleBodyRequestParsing (router: Router) {
    router.use(parser.urlencoded({ extended: true }));
    router.use(parser.json());
}

export function handleCompression (router: Router) {
    router.use(compression());
}
