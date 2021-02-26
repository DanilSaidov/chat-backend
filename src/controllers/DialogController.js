import { DialogModel, MessageModel } from "../models/index.js";

class DialogController {
  constructor(io) {
    this.io = io;
  }
  index = (req, res) => {
    const authorId = req.user._id;

    DialogModel.find({ $or: [{ author: authorId }, { partner: authorId }] })
      .populate(["author", "partner", "last_message"])
      .then((data) => {
        const newO = [...data].reduce((acc, obj) => [...acc, obj._id], []);
        this.io.emit("SERVER:CONNECT_ROOMS", newO);
        return res.json(data);
      })
      .catch((err) => res.status(404).json({ message: "Ошибка", err }));
  };

  show = (req, res) => {
    DialogModel.findById(req.params.id)
      .then((data) => {
        return res.json(data);
      })
      .catch((err) =>
        res.status(404).json({
          error: { ...err, message: "Диалог не найден" },
        })
      );
  };
  create = (req, res) => {
    const postData = {
      author: req.user._id,
      partner: req.body.partner,
      text: req.body.text,
    };
    const newDialog = new DialogModel(postData);
    newDialog
      .save()
      .then((dataDialog) => {
        const message = new MessageModel({
          author: req.user._id,
          text: req.body.text,
          dialogId: dataDialog._id,
        });
        message
          .save()
          .then((data) => {
            newDialog.last_message = data._id;
            newDialog.save().then((data) => {
              data.populate(
                ["author", "partner", "last_message"],
                (err, doc) => {
                  if (err) {
                    return res
                      .status(403)
                      .json({ err, status: "Ошибка создания диалога" });
                  }
                  this.io.emit("SERVER:CHECK_DIALOG", doc);
                  res.json(doc);
                }
              );
            });
          })
          .catch((err) => {
            res.status(403).json({ err, status: "error" });
          });
      })
      .catch((err) => res.send(err));
  };
  delete(req, res) {
    DialogModel.findByIdAndRemove(req.params.id)
      .then((data) => res.json({ ...data, delete: "Диалог удален" }))
      .catch((err) =>
        res.status(404).json({
          error: { ...err, message: "Пользователь не найден" },
        })
      );
  }
}

export default DialogController;
