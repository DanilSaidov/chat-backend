import mongoose from "mongoose";
import isEmail from "validator/lib/isEmail.js";
import passwordHash from "password-hash";
import { differenceInMinutes, parseJSON } from "date-fns";
const { Schema } = mongoose;
const opts = { toJSON: { virtuals: true }, timestamps: true };
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: "Email is required",
      validate: [isEmail, "Invalid email."],
      unique: true,
    },
    avatar: String,
    fullname: {
      type: String,
      required: "Name is required",
      unique: true,
    },
    password: {
      type: String,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    confirmed_hash: String,
    last_seen: Date,
  },
  opts
);
UserSchema.virtual("isOnline").get(function () {
  return differenceInMinutes(parseJSON(new Date()), this.last_seen) < 5;
});
UserSchema.pre("save", async function (next) {
  const user = this;
  const hashedPassword = passwordHash.generate(user.password, {
    algorithm: "md5",
  });
  const confirmed_hash = passwordHash.generate(+new Date() + "");

  if (passwordHash.isHashed(hashedPassword)) {
    user.password = hashedPassword;
    user.confirmed_hash = confirmed_hash;
    return next();
  }
  return next({ msg: "Неудалось хешировать пароль" });
});
const User = mongoose.model("User", UserSchema);
export default User;
