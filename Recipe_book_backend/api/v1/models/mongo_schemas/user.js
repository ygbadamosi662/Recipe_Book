const validator = require('validator');
const util = require('../../utils');
const { Schema } = require('mongoose');
const { Role } = require('../../enum_ish');
const { recipeSchema } = require('../mongo_schemas/recipe');

const userSchema = new Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
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
    type: [recipeSchema],
    default: [],
  }
  ,
  dob: {
    type: Date,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: { type: String, enum: Object.values(Role)},
  },
}, { timestamps: true });

userSchema.pre('validate', function (next) {
  if (this.fname && this.fname.length < 2) {
    return next(new Error('fname is too short'));
  }

  if (this.lname && this.lname.length < 2) {
    return next(new Error('lname is too short'));
  }

  if (this.lname && this.lname.length > 20) {
    return next(new Error('lname is too long'));
  }

  if (this.fname && this.fname.length > 20) {
    return next(new Error('fname is too long'));
  }

  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    this.password = await util.encrypt_pwd(this.password);

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = userSchema;
