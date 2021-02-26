import { verifyWebToken } from "../utils/index.js";
const chekAuth = (req, res, next) => {
  if (
    req.path === "/user/login" ||
    req.path === "/user/registration" ||
    req.path === "/user/confirm"
  ) {
    return next();
  }
  const token = req.headers.token;
  verifyWebToken(token)
    .then((user) => {
      req.user = user.data._doc;
      next();
    })
    .catch((err) => {
      res.status(403).json({ msg: "invalidToken", err });
    });
};
export default chekAuth;
