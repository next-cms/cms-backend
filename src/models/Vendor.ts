import mongoose, { Model, Schema } from "mongoose";

export type VendorModel = {
    name: string;
};

export const VendorSchema: any = new Schema({
    name: {
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

VendorSchema.statics.getAllVendors = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

VendorSchema.statics.findByName = async function (name) {
    return await this.findOne({
        name: name,
    });
};

const Vendor: Model<any, any> | any = mongoose.model("Vendor", VendorSchema);
// Export Footer Model/Schema
export default Vendor;
