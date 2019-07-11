const mongoose = require("mongoose");

// Setup Schema
const bannerSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: {
    type: String,
    required: true
  },
  link: String,
  order: String,
  status: String
});

// Export Banner Model/Schema
const Banner = (module.exports = mongoose.model("banner", bannerSchema));

module.exports.getAllBanners = (callback, limit) => {
  Banner.find(callback).limit(limit);
};
