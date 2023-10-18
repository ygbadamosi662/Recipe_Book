const validator = require('validator');
const { Schema } = require('mongoose');
const { Role } = require('../../enum_ish');
const { Recipe_str, User_str } = require('../../global_constants');

const userSchema = new Schema({
  name: { 
    type: {
      fname: { type: String, required: true, min: 3, max: 20 },
      lname: { type: String, required: true, min: 3, max: 20 },
      aka: { type: String, min: 3, max: 20},
    },
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
        validator: (value) => {
          return validator.isEmail(value);
        },
        message: 'Invalid email address',
    },
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
       validator: (value) => {
        return validator.matches(value, /^[8792][01]\d{8}$/)
       },
       message: 'Invalid phone number',
    },
  },
  recipes: {
    type: [Schema.Types.ObjectId],
    ref: Recipe_str,
    default: [],
  },
  faves: {
    type: [Schema.Types.ObjectId],
    ref: Recipe_str,
    default: [],
  },
  dob: {
    type: Date,
  },
  password: {
    type: String,
    required: true,
  },
  following: {
    type: [Schema.Types.ObjectId],
    ref: User_str,
    default: [],
  },
  followers: {
    type: [Schema.Types.ObjectId],
    ref: User_str,
    default: [],
  },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.user,
  },
  resetPasswordToken: String,
  resetPasswordTokenExpires: Date,
}, { timestamps: true });

module.exports = userSchema;
