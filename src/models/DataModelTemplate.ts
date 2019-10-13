import mongoose, { Model, Schema } from "mongoose";

const DataModelTemplateSchema: any = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    fields: {
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

DataModelTemplateSchema.statics.getAll = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};
DataModelTemplateSchema.statics.findByName = async function (name, limit, skip) {
    return await this.findOne({name}).sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

const DataModelTemplate: Model<any, any> | any = mongoose.model("DataModelTemplate", DataModelTemplateSchema);
// Export Project Model/Schema
export default DataModelTemplate;
