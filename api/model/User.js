const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail } = require("validator");

const saltRounds = 10;

// Setup Schema
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    unique: true,
    type: String,
    trim: true,
    required: true,
    validate: [isEmail, "Must be a valid email!"]
  },
  password: {
    type: String,
    trim: true,
    required: true
  }
});

UserSchema.pre("save", function(next) {
  this.password = bcrypt.hashSync(this.password, saltRounds);
  next();
});

// Export Setting Model/Schema
module.exports = mongoose.model("user", UserSchema);
