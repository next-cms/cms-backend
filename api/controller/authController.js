const User = require("../model/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../helpers/securityUtils");

// Create User (Signup)
exports.saveUser = (req, res) => {
  const newUser = new User(req.body);

  newUser.save((err, result) => {
    if (err)
      return res.status(400).json({
        status: "error",
        message: err
      });
    return res.json({
      status: "success",
      message: "User added successfully!!!",
      data: result
    });
  });
};

// login (Authentication User)
exports.login = (req, res) => {
  User.findOne({ email: req.body.email }, (err, userInfo) => {
    if (err)
      return res.status(400).json({
        status: "error",
        message: err,
        data: null
      });

    if (
      userInfo != null &&
      bcrypt.compareSync(req.body.password, userInfo.password)
    ) {
      const token = generateToken(userInfo);
      return res.json({
        status: "success",
        message: "user found!!!",
        data: {
          user: userInfo,
          token: token
        }
      });
    } else {
      return res.json({
        status: "error",
        message: "Invalid email/password!!!",
        data: null
      });
    }
  });
};
