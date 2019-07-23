import mongoose, { Model, Schema } from "mongoose";

const ImportSignatureSchema: any = new Schema({
    signature: String,
    from: String
});

export const LayoutSchema: any = new Schema({
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
    props: [{
        type: Schema.Types.Mixed,
        required: false
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    }
});

LayoutSchema.statics.getAllLayout = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

const Layout: Model<any, any> | any = mongoose.model("Layout", LayoutSchema);
// Export Footer Model/Schema
export default Layout;
