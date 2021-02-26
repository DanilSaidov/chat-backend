import { MessageModel, DialogModel } from "../models/index.js";

class MessageController {
  constructor(io) {
    this.io = io;
  }
  index(req, res) {
    DialogModel.findById(req.query.id)
      .then((data) => {
        if (data) {
          MessageModel.findById(req.query.id)
            .then((data) => {
              res.json(data);
            })
            .catch((err) => res.status(404).json(err));
        }
      })
      .catch((err) =>
        res.status(404).json({ status: "error", msg: "Dialog not found" })
      );
  }
  show(req, res) {
    DialogModel.findById(req.query.dialogId)
      .then((data) => {
        if (data) {
          MessageModel.find({ dialogId: req.query.dialogId }, null, {
            sort: { createdAt: 1 },
          })
            .populate(["author"])
            .then((data) => {
              res.json(data);
            })
            .catch((err) =>
              res
                .status(404)
                .json({ status: "error", msg: "Message not found" })
            );
        } else {
          res.status(404).json({ status: "error", msg: "Dialog not found" });
        }
      })
      .catch((err) =>
        res.status(404).json({ status: "error", msg: "Dialog error" })
      );
  }

  create = (req, res) => {
    const postData = {
      author: req.body.author,
      text: req.body.text,
      dialogId: req.body.dialogId,
    };
    const message = new MessageModel(postData);
    message
      .save()
      .then(
        (data) =>
          new Promise((resolve, reject) =>
            data.populate("author", (err, doc) => {
              if (err) {
                return reject(err);
              }
              return resolve(doc);
            })
          )
      )
      .then((data) => {
        DialogModel.findByIdAndUpdate(
          data.dialogId,
          {
            $set: { last_message: data._id },
          },
          { new: true }
        )
          .then(() => {
            res.json(data);
            this.io.to(`${data.dialogId._id}`).emit("SERVER:NEW_MESSAGE", data);
          })
          .catch((err) =>
            res.status(500).json({
              status: "error",
              msg: "Ошибка создания посоеднего сообщения",
            })
          );
      })
      .catch((err) => res.json(err));
  };
  delete(req, res) {
    console.log(req.body);
    MessageModel.deleteMany({
      _id: { $in: req.body.messagesId },
    })
      .then((data) => {
        MessageModel.findOne({ dialogId: req.body.dialogId })
          .sort("-created_at")
          .then((msgData) => {
            console.log(msgData);
            if (msgData) {
              DialogModel.findByIdAndUpdate(
                req.body.dialogId,
                {
                  $set: { last_message: msgData._id },
                },
                { new: true }
              ).then((dialogData) => res.json(dialogData));
            } else {
              DialogModel.findByIdAndRemove(req.body.dialogId).then((data) =>
                console.log("удален", data)
              );
            }
          });
      })
      .catch((err) => res.json(err));
  }
}

export default MessageController;
