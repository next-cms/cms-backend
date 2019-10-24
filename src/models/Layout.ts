import mongoose, { Schema, Model } from "mongoose";

const LayoutSchema: any = new Schema({
    name: {
        type: String,
        required: true
    },
    header: {
        type: String
    },
    footer: {
        type: String
    },
    letfSider: {
        type: String
    },
    rightSider: {
        type: String
    },
    layoutTemplateId: {
        type: String,
        required: true
    },
    projectId: {
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

LayoutSchema.statics.getAllProjectLayouts = async function (projectId, limit, skip) {
    return await this.find({projectId}).sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

LayoutSchema.statics.findByName = async function (name) {
    return await this.findOne({name});
};

const Layout: Model<any, any> | any = mongoose.model("Layout", LayoutSchema);

// Export Layout Model/Schema
export default Layout;