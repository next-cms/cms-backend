import mongoose, { Model, Schema } from "mongoose";

const NavHeaderSchema: any = new Schema({
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

NavHeaderSchema.statics.getAllHeader = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

const NavHeader: Model<any, any> | any = mongoose.model("NavHeader", NavHeaderSchema);
// Export NavHeader Model/Schema
export default NavHeader;
