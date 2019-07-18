import mongoose, { Model, Schema } from "mongoose";
import {ComponentSchema} from "./Component";

export const PageSchema: any = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    header: {
        type: Schema.Types.ObjectId,
        required: true
    },
    footer: {
        type: Schema.Types.ObjectId,
        required: true
    },
    contents: {
        type: [ComponentSchema],
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

PageSchema.statics.getAllPage = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

const Page: Model<any, any> | any = mongoose.model("Page", PageSchema);
// Export Page Model/Schema
export default Page;
