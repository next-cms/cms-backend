const mongoose = require("mongoose");

// Setup Schema
const pageSchema = mongoose.Schema({
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

// Export Page Model/Schema
const Page = (module.exports = mongoose.model("page", pageSchema));

module.exports.getAllPages = (callback, limit) => {
  Page.find(callback).limit(limit);
};
