import jwt from "jsonwebtoken";

const secret = "secret";
const tokenExpires = "1h";

export function generateToken(user) {
    return jwt.sign({id: user._id}, secret, {expiresIn: tokenExpires});
}

export function verifyToken(req, res, next) {
    const authorization = req.headers["authorization"];
    let token = null;
    if (authorization) token = authorization.replace("bearer ", "");

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(401).json({status: "error", message: err});
        return next();
    });
}
