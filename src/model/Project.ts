import mongoose, {Schema} from "mongoose";

const ProjectSchema: any = new Schema({
    parentId: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    banner: String,
    status: {
        type: String,
        required: true
    },
    create_date: {
        type: Date,
        default: Date.now
    }
});

ProjectSchema.statics.getAllProjects = async function (limit) {
    return await this.find().limit(limit);
};

const Project = mongoose.model("Project", ProjectSchema);
// Export Project Model/Schema
export default Project;
