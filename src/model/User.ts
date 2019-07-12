import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { isEmail } from "validator";

// Setup Schema
const UserSchema: any = new mongoose.Schema({
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

UserSchema.pre("save", function (next) {
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

export default mongoose.model("user", UserSchema);

