import User from "../model/User";
import bcrypt from "bcrypt";
import utils from "../../utils";
import {Request, Response} from "express";

class AuthController {
    public static async saveUser (req: Request, res: Response) {
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

    public static async login (req: Request, res: Response) {
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
                const token = utils.generateToken(userInfo);

                let resUserInfo = {
                    name: userInfo.name,
                    email: userInfo.email
                };

                return res.json({
                    status: "success",
                    message: "user found!!!",
                    data: {
                        user: resUserInfo,
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

    static async ping(req: Request, res: Response) {
        res.send("From auth route.");
    }
}

export default AuthController;
