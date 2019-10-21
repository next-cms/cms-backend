import mongoose, { Schema, Model } from "mongoose";

const LayoutTemplateSchema: any = new Schema({
    name: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    header: {
        type: Boolean,
        required: true
    },
    footer: {
        type: Boolean,
        required: true
    },
    sider: {
        type: Boolean,
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

LayoutTemplateSchema.statics.getAllLayoutTemplate = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

LayoutTemplateSchema.statics.findByFileName = async function (fileName) {
    return await this.findOne({fileName: fileName});
};

const LayoutTemplate: Model<any, any> | any = mongoose.model("LayoutTemplate", LayoutTemplateSchema);

// Export LayoutTemplate Model/Schema
export default LayoutTemplate;