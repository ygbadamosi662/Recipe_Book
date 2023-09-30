const validator = require('validator');
const { Schema } = require('mongoose');
const { Role } = require('../../enum_ish');
const { Recipe_str } = require('../../global_constants');

const userSchema = new Schema({
  name: { 
    type: {
      fname: { type: String, required: true },
      lname: { type: String, required: true },
      aka: String,
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
  role: {
    type: { type: String, enum: Object.values(Role)},
  },
}, { timestamps: true });

userSchema.pre('validate', function (next) {
  if (this.name.fname && this.name.fname.length < 2) {
    return next(new Error('fname is too short'));
  }

  if (this.name.lname && this.name.lname.length < 2) {
    return next(new Error('lname is too short'));
  }

  if (this.name.lname && this.name.lname.length > 20) {
    return next(new Error('lname is too long'));
  }

  if (this.name.fname && this.name.fname.length > 20) {
    return next(new Error('fname is too long'));
  }

  if (this.name.aka) {
    if (this.name.aka && this.name.aka.length < 2) {
      return next(new Error('lname is too short'));
    }
  
    if (this.name.aka && this.name.aka.length > 20) {
      return next(new Error('lname is too long'));
    }
  }

  next();
});


module.exports = userSchema;
