const jwt = require("jsonwebtoken");
const { secret, tokenExpires } = require("./helperUtils");

module.exports = {
  generateToken: user => {
    return jwt.sign({ id: user._id }, secret, { expiresIn: tokenExpires });
  },

  verifyToken: (req, res, next) => {
    const authorization = req.headers["authorization"];
    let token = null;
    if (authorization) token = authorization.replace("bearer ", "");

    jwt.verify(token, secret, (err, decoded) => {
      if (err) return res.status(401).json({ status: "error", message: err });
      return next();
    });
  }
};
