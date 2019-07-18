import mongoose, { Model, Schema } from "mongoose";

const ImportSignatureSchema: any = new Schema({
    signature: String,
    from: String
});

export const ComponentSchema: any = new Schema({
    title: {
        type: String,
        required: false
    },
    import: {                                   // or Maybe {
        type: ImportSignatureSchema,            //   type: Map,
        required: false                         //   of: String
    },                                          // }
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

ComponentSchema.statics.getAllComponent = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

const Component: Model<any, any> | any = mongoose.model("Component", ComponentSchema);
// Export Footer Model/Schema
export default Component;
