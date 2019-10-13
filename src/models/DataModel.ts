import mongoose, { Model, Schema } from "mongoose";

const DataModelSchema: any = new Schema({
    name: {
        type: String,
        required: true
    },
    projectId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    templateTypeId: {
        type: String,
        required: true
    },
    templateFields: {
        type: Schema.Types.Mixed,
        required: false
    },
    contents: {
        type: [Schema.Types.Mixed],
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

DataModelSchema.statics.getAll = async function (projectId, limit, skip) {
    return await this.find({projectId}).sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

const DataModel: Model<any, any> | any = mongoose.model("DataModel", DataModelSchema);
// Export Project Model/Schema
export default DataModel;
