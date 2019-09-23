import mongoose, { Model, Schema } from "mongoose";

export const ComponentSchema: any = new Schema({
    id: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    vendor: {
        type: String,
        required: true
    },
    props: {
        type: Schema.Types.Map,
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

ComponentSchema.statics.getAllComponent = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

const Component: Model<any, any> | any = mongoose.model("Component", ComponentSchema);
// Export Footer Model/Schema
export default Component;
