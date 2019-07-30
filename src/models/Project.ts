import mongoose, { Model, Schema } from "mongoose";

export const ProjectSchema: any = new Schema({
    title: {
        type: String,
        required: true
    },
    ownerId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    websiteUrl: {
        type: String,
        required: true
    },
    brand: {
        icon: {
            type: String
        },
        siteTitle: {
            type: String
        }
    },
    siteMeta: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

ProjectSchema.statics.getAllProjects = async function (limit, skip) {
    return await this.find().sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

ProjectSchema.statics.getAllProjectsByOwnerId = async function (ownerId, limit, skip) {
    return await this.find({ ownerId }).sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

const Project: Model<any, any> | any = mongoose.model("Project", ProjectSchema);
// Export Project Model/Schema
export default Project;
