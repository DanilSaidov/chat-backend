import mongoose from "mongoose";
const { Schema } = mongoose;
const MessageSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    dialogId: {
      type: Schema.Types.ObjectId,
      ref: "Dialog",
      required: true,
    },
    unread: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const Message = mongoose.model("Message", MessageSchema);
export default Message;
