const validator = require('validator');
const util = require('../../utils');
const { Schema } = require('mongoose');

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
  }
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
