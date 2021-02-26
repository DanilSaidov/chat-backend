import mongoose from "mongoose";
const { Schema } = mongoose;
const DialogSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    partner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    last_message: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);
const Dialog = mongoose.model("Dialog", DialogSchema);
export default Dialog;
