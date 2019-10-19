import mongoose, { Model, Schema } from "mongoose";

const DataObjectSchema: any = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    isDraft: {
        type: Boolean,
        required: false
    },
    templateTypeId: {
        type: String,
        required: false
    },
    fields: {
        type: Schema.Types.Mixed,
        required: false
    },
    contents: {
        type: Schema.Types.Mixed,
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

DataObjectSchema.statics.getAll = async function (projectId, limit, skip) {
    return await this.find({projectId}).sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};
DataObjectSchema.statics.getAllByType = async function (projectId, type, limit, skip) {
    return await this.find({projectId, type}).sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};
DataObjectSchema.statics.getBySlug = async function (projectId, slug) {
    return await this.findOne({projectId, slug});
};

const DataObject: Model<any, any> | any = mongoose.model("DataObject", DataObjectSchema);
// Export Project Model/Schema
export default DataObject;
