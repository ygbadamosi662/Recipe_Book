const { Schema } = require('mongoose');
const { User_str } = require('../../global_constants');
const { Permit, Type } = require('../../enum_ish');
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
    type: String,
    required: true,
  },
  description: String,
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
  fave_count: { 
    type: Number,
    default: 0,
  },
  type: { 
    type: String,
    default: Type.food,
  },
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
