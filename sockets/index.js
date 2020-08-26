io = require("socket.io")();

io.on("connection", socket => {
  socket.on("entered", data => {
    io.emit("entry msg", data);
  });

  socket.on("chat", data => {
    io.emit("send msg", data);
  });

  socket.on("NUDGE NOTIFICATION", data => {
    io.emit("nudge", data);
  });

  socket.on("HAND END NOTIFICATION", data => {
    io.emit("hand_end", data);
  });

  socket.on("typing", data => {
    socket.broadcast.emit("typing msg", data);
  });
});

module.exports = io;
