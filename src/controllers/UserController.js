import passwordHash from "password-hash";
import { validationResult } from "express-validator";
import { UserModel } from "../models/index.js";
import { createWebToken } from "../utils/index.js";

class UserController {
  constructor(io) {
    io = this.io;
  }
  show(req, res) {
    UserModel.findById(req.params.id)
      .then((data) => res.json(data))
      .catch((err) =>
        res.status(404).json({
          err,
          status: "error",
          message: "Пользователь не найден",
        })
      );
  }
  getMe(req, res) {
    UserModel.findById(req.user._id)
      .then((data) => res.json(data))
      .catch((err) =>
        res.status(404).json({
          err,
          message: "Пользователь не найден",
        })
      );
  }
  create(req, res) {
    const errorValidation = validationResult(req);
    if (!errorValidation.isEmpty()) {
      res.status(422).json({
        errors: errorValidation.array(),
      });
    } else {
      const postData = {
        email: req.body.email,
        fullname: req.body.fullname,
        password: req.body.password,
      };
      const newUser = new UserModel(postData);
      newUser
        .save()
        .then((data) => {
          res.send(data);
        })
        .catch((err) => res.send(err));
    }
  }
  find(req, res) {
    UserModel.find({
      $or: [
        { fullname: new RegExp(req.query.user, "i") },
        { email: new RegExp(req.query.user, "i") },
      ],
    })
      .limit(10)
      .then((data) => res.json(data))
      .catch((err) =>
        res.status(404).json({ err, status: "error", msg: "User not found" })
      );
  }
  confirm(req, res) {
    console.log(req.query);
    const hash = req.query.hash;
    if (!hash) {
      return res.status(404).json("Аккаунт не подтвержден!");
    }
    UserModel.findOneAndUpdate(
      { confirmed_hash: hash },
      {
        $set: {
          confirmed: true,
        },
      },
      { new: true }
    )
      .then((data) => {
        res.json({
          msg: `${data.fullname}, Ваш аккаунт подтвержден`,
          status: "success",
        });
      })
      .catch((err) =>
        res.status(404).json({ status: "error", msg: "Аккаунт не найден!" })
      );
  }
  delete(req, res) {
    UserModel.findByIdAndRemove(req.params.id)
      .then((data) => res.json({ ...data, delete: "Пользователь удален" }))
      .catch((err) =>
        res.status(404).json({
          error: { ...err, message: "Пользователь не найден" },
        })
      );
  }
  login(req, res) {
    UserModel.findOne({ email: req.body.email })
      .then((data) => {
        if (passwordHash.verify(req.body.password, data.password)) {
          const token = createWebToken(data);
          res.json({
            status: "success",
            token,
          });
        } else {
          res.status(403).json({
            status: "failed",
            msg: "Логин или пароль не верный",
          });
        }
      })
      .catch((err) => {
        res.json({
          status: "failed",
          msg: "Пользователь не найден",
        });
      });
  }
}

export default UserController;
