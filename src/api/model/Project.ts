import mongoose from "mongoose";

const Project:mongoose = mongoose.model("project", mongoose.Schema({
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
}));

Project.getAllPages = (callback, limit) => {
    Project.find(callback).limit(limit);
};


// Export Page Model/Schema
export default Project;
