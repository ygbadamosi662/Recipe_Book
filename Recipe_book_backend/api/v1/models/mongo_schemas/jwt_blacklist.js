const { Schema } = require('mongoose');
const { User_str } = require('../../global_constants');

const jwt_BlacklistSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: User_str,
    default: null,
  }
  
}, { timestamps: true });

module.exports = jwt_BlacklistSchema;
