import { UserModel } from "../models/index.js";
const updateLastSeen = (req, res, next) => {
  if (
    req.path === "/user/login" ||
    req.path === "/user/registration" ||
    req.path === "/user/confirm"
  ) {
    return next();
  }
  UserModel.findByIdAndUpdate(
    req.user._id,
    {
      last_seen: new Date(),
    },
    { new: true }
  )
    .then(() => {
      next();
    })
    .catch(() => {
      next();
    });
};
export default updateLastSeen;
