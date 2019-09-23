import mongoose, { Model, Schema } from "mongoose";

export const ComponentVendorSchema: any = new Schema({
    id: {
        type: String,
        required: false
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

ComponentVendorSchema.statics.getAllComponent = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

const ComponentVendor: Model<any, any> | any = mongoose.model("ComponentVendor", ComponentVendorSchema);
// Export Footer Model/Schema
export default ComponentVendor;
