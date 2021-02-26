import bodyParser from "body-parser";

import { UserCntrl, DialogCntrl, MessageCntrl } from "../controllers/index.js";
import { updateLastSeen, chekAuth, socketId } from "../middlewares/index.js";
import { loginValidation } from "../utils/validations/index.js";

export default (app, io) => {
  const UserController = new UserCntrl(io);
  const DialogController = new DialogCntrl(io);
  const MessageController = new MessageCntrl(io);

  app.use(bodyParser.json());
  app.use(chekAuth);
  app.use(updateLastSeen);
  app.use(socketId.bind(null, io));

  app.get("/user/confirm", UserController.confirm);
  app.get("/user/me", UserController.getMe);
  app.post("/user/registration", loginValidation, UserController.create);
  app.post("/user/login", UserController.login);
  app.get("/user/find", UserController.find);
  app.get("/user/:id", UserController.show);
  app.delete("/user/:id", UserController.delete);

  app.get("/dialogs", DialogController.index);
  app.post("/dialogs/create", DialogController.create);

  app.get("/messages", MessageController.show);
  app.post("/messages", MessageController.create);
  app.post("/messages/delete", MessageController.delete);
};
