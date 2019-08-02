import User from "../../models/User";
import bcrypt from "bcrypt";
import utils from "../../utils";
import { Request, Response } from "express";

class AuthController {
    static async saveUser(req: Request, res: Response) {
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

    static async login(req: Request, res: Response) {
        User.findOne({ email: req.body.email }, async (err, userInfo: any) => {
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
                const token = await utils.generateToken(userInfo);

                let resUserInfo = {
                    name: userInfo.name,
                    email: userInfo.email,
                    role: userInfo.role
                };

                return res.json({
                    status: "success",
                    message: "user found!!!",
                    data: {
                        user: resUserInfo,
                        token: token,
                        expires: process.env.JWT_TOKEN_EXPIRES_DEFAULT
                    }
                });
            } else {
                return res.status(403).json({
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

    static async resolve(req: Request, res: Response) {
        try {
            utils.verifyToken(req, res, (data)=>{
                // console.log("resolved data ", data);
                res.send({
                    status: "success",
                    message: "user found!!!",
                    data: data
                });
            });
            // const user = await resolveUserWithToken(req);
            // console.log("resolved data ", user);
            // if (user) {
            //     res.send({
            //         status: "success",
            //         message: "user found!!!",
            //         data: user
            //     });
            // } else {
            //     res.status(403).json({
            //         status: "error",
            //         message: 'Not authenticated as user.'
            //     });
            // }
        } catch (e) {
            console.log("resolved data ", e);
            res.status(403).json({
                status: "error",
                message: e
            });
        }
    }
}

export default AuthController;
