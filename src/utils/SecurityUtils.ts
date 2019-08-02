import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_TOKEN_SECRET;
const tokenExpires = process.env.JWT_TOKEN_EXPIRES_DEFAULT;

export function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

export async function generateToken(user) {
    return await createToken(user, secret, tokenExpires);
}

export async function createToken(user, secret, expiresIn) {
    const { id, email, name, role } = user;
    return await jwt.sign({ id, email, name, role }, secret, {
        expiresIn,
    });
}

export function verifyToken(req: Request, res: Response, next) {
    // console.log("verifyToken: ", req.path);
    const authorization = req.headers["authorization"];
    let token = null;
    if (authorization) token = authorization.replace("Bearer ", "");
    // console.log("verifyToken: given token: ", token);
    jwt.verify(token, secret, (err, decoded) => {
        // console.log("verifyToken: err: ", err, decoded);
        if (err) return res.status(401).json({ status: "error", message: err });
        return next(decoded);
    });
}

export async function resolveUserWithToken(req: Request) {
    // console.log("resolveUserWithToken: ", req.path);
    const authorization = req.headers["authorization"];
    if (authorization) {
        const token = authorization.replace("Bearer ", "");
        if (token) {
            try {
                const secret = process.env.JWT_TOKEN_SECRET;
                return await jwt.verify(token, secret);
            } catch (e) {
                // console.log("Token Provided: ", token);
                // console.log(e.toString());
                return null;
            }
        }
    }
}
