import mongoose, { Model, Schema } from "mongoose";

const PageSchema: any = new Schema({
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

PageSchema.statics.getAllPage = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

const Page: Model<any, any> | any = mongoose.model("Page", PageSchema);
// Export Page Model/Schema
export default Page;
