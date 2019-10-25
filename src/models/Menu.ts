import mongoose, { Schema, Model } from "mongoose";

const MenuItems: any = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    pathAs: {
        type: String,
        required: true
    },
    href: {
        type: String,
        required: true
    }
});


const MenuSchema: any = new Schema({
    name: {
        type: String,
        required: true
    },
    items: {
        type: [MenuItems],
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

MenuSchema.statics.getAllProjectMenus = async function (projectId, limit, skip) {
    return await this.find({projectId}).sort({ modifiedAt: -1 }).skip(skip).limit(limit);
};

MenuSchema.statics.findByName = async function (id) {
    return await this.findById(id);
};

const Menu: Model<any, any> | any = mongoose.model("Menu", MenuSchema);

// Export Menu Model/Schema
export default Menu;