const { Schema } = require('mongoose');
const { User_str } = require('../../global_constants');
const { Permit } = require('../../enum_ish');
const recipeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  ingredients: {
    type: [String],
    required: true,
  }
  ,
  inspiration: String
  ,
  guide: {
    type: [String],
    default: []
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: User_str,
    required: true,
  },
  permit: {
    type: String,
    enum: Object.values(Permit),
    default: Permit.public,
  },
  type: String,
}, { timestamps: true });

recipeSchema.pre('validate', function (next) {
  if (this.name && this.name.length < 2) {
    return next(new Error('fname is too short'));
  }

  if (this.name && this.name.length > 20) {
    return next(new Error('fname is too long'));
  }

  next();
});


module.exports = recipeSchema;
