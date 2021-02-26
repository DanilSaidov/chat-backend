import { Server } from "socket.io";
import verifyWebToken from "../utils/verifyWebToken.js";

export default (http) => {
  const io = new Server(http, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  });
  io.use(async (socket, next) => {
    try {
      const userInfo = await verifyWebToken(socket.handshake.auth.token);
      socket.userId = userInfo.data._doc._id;
      next();
    } catch (e) {
      socket.disconnect();
      console.log("error", "неверный пользователь");
      return next(new Error("ошибка пользователя"));
    }
  }).on("connection", (socket) => {
    socket.on("CLIENT:CONNECT_ROOMS", (data) => {
      data.forEach((room) => socket.join(`${room}`));
    });
    socket.on("CLIENT:NEW_DIALOG", (data) => {
      socket.join(`${data._id}`);
    });
  });

  return io;
};
