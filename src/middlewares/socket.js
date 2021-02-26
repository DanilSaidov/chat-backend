const socketId = (io, req, _, next) => {
  if (req.path !== "/user/me") {
    return next();
  }
  //   io.use((socket, socketNext) => {
  //     socket.userId = req.user._id;
  //     console.log("use " + req.user.fullname, count);
  //     socketNext();

  //   });
  next();
};
export default socketId;
