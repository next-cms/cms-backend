import jwt from "jsonwebtoken";
import {Request} from "express";
import { AuthenticationError } from 'apollo-server-express';
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_TOKEN_SECRET;
const tokenExpires = process.env.JWT_TOKEN_EXPIRES_DEFAULT;

export async function generateToken(user) {
    return await createToken(user, secret, tokenExpires);
}

export async function createToken (user, secret, expiresIn) {
    const { id, email, name, role } = user;
    return await jwt.sign({ id, email, name, role }, secret, {
        expiresIn,
    });
}

export function verifyToken(req, res, next) {
    const authorization = req.headers["authorization"];
    let token = null;
    if (authorization) token = authorization.replace("Bearer ", "");

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(401).json({status: "error", message: err});
        return next();
    });
}

export async function resolveUserWithToken(req: Request) {
    const authorization = req.headers["authorization"];
    if (authorization) {
        const token = authorization.replace("Bearer ", "");
        if (token) {
            try {
                const secret = process.env.JWT_TOKEN_SECRET;
                return await jwt.verify(token, secret);
            } catch (e) {
                console.log("Token Provided: ", token);
                console.log(e);
                throw new AuthenticationError(
                    'Your session expired. Sign in again.',
                );
            }
        }
    }
}
