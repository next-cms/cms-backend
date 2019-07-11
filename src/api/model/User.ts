import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { isEmail } from "validator";

// Setup Schema
const UserSchema:mongoose = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        unique: true,
        type: String,
        trim: true,
        required: true,
        validate: [isEmail, "Must be a valid email!"]
    },
    password: {
        type: String,
        trim: true,
        required: true
    }
});
UserSchema.pre("save", function(next) {
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});
const User:mongoose = mongoose.model("user", UserSchema);

export default User;
