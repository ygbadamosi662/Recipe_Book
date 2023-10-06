const { Schema } = require('mongoose');
const { User_str } = require('../../global_constants');
const { Status } = require('../../enum_ish');

const notificationSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: User_str,
    required: true,
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: "",
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.sent,
  },
}, { timestamps: true });


module.exports = notificationSchema;
