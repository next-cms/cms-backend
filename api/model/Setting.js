const mongoose = require("mongoose");
const { isEmail } = require("validator");

// Setup Schema
const settingSchema = mongoose.Schema({
  siteName: {
    type: String,
    required: true
  },
  description: String,
  address: String,
  contact: String,
  logo: String,
  favico: String,
  email: {
    type: String,
    required: true,
    validate: [isEmail, "Must be a valid email!"]
  }
});

// Export Setting Model/Schema
const Setting = (module.exports = mongoose.model("setting", settingSchema));

module.exports.getAllSettings = (callback, limit) => {
  Setting.find(callback).limit(limit);
};
