import mongoose, {Model, Schema} from "mongoose";
import bcrypt from "bcrypt";
import {isEmail} from "validator";

export const UserSchema: any = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: [isEmail, "No valid email address provided."],
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 42,
    },
    role: {
        type: String,
    },
});

UserSchema.statics.getAllUsers = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

UserSchema.statics.findByEmail = async function(email) {
    return await this.findOne({
        email: email,
    });
};

UserSchema.pre("save", async function() {
    this.password = await this.generatePasswordHash();
});

UserSchema.methods.generatePasswordHash = async function() {
    const saltRounds = 10;
    return await bcrypt.hash(this.password, saltRounds);
};

UserSchema.methods.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const User: Model<any, any>|any = mongoose.model("User", UserSchema);

export default User;

