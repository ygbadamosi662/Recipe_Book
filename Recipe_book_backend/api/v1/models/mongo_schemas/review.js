const { Schema } = require('mongoose');
const { User_str, Recipe_str } = require('../../global_constants');

const reviewSchema = new Schema({
  comment: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: User_str,
    required: true,
  },
  recipe: {
    type: Schema.Types.ObjectId,
    ref: Recipe_str,
    required: true,
  },
  stars: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

reviewSchema.pre('validate', function (next) {
  if (this.stars > 5) {
    return next(new Error('stars cannot be > 5'));
  }
  next();
});


module.exports = reviewSchema;
