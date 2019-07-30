import mongoose, { Model, Schema } from "mongoose";

export const FooterSchema: any = new Schema({
    title: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    }
});

FooterSchema.statics.getAllFooter = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

const Footer: Model<any, any> | any = mongoose.model("Footer", FooterSchema);
// Export Footer Model/Schema
export default Footer;
