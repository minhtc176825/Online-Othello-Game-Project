const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const { Game } = require("../server/Game.js");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
// app.use(cors());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/room", roomRoutes);

const PORT = process.env.PORT || 5000;

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`.yellow.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected to socket.io`);
  console.log(io.sockets.sockets);

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });

  socket.on("create", (room) => {
    socket.join(room._id);
    console.log(`Room ${room._id} is now hosted by ${room.host.username}`);
    socket.emit("created", { turn: 1 });
  });

  socket.on("join game", (room) => {
    socket.join(room._id);
    console.log(
      `User ${socket.id} joined room ${room._id} is now hosted by ${room.host.username}`
    );
    socket.emit("joined", { turn: 2 });
    socket.to(room._id).emit("ready");
  });

  socket.on("start", (room) => {
    var game = new Game();
    var board = new Array(8);

    var count = 0;
    for (var i = 0; i < 8; i++) {
      var tmp = new Array(8);
      for (var j = 0; j < 8; j++) {
        tmp[j] = room.data.board[count];
        count++;
      }
      board[i] = tmp;
    }

    game.set_board(board);
    game.get_board().set_available_moves(room.turn);
    console.log(game.get_board().board);
    // io.sockets.in(room.data._id).emit("new board", game.get_board().board);
    // socket.to(room.data._id).emit("newboard");
    count = 0;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        room.data.board[count] = game.get_board().board[i][j];
        count++;
      }
    }

    room.data.turn = game.get_turn();
    // console.log(room.data);
    socket.emit("new board", room.data);
  });

  socket.on("make move", async (room) => {
    console.log("client made move");
    // console.log("----");
    var game = new Game();
    var board = new Array(8);

    var count = 0;
    for (var i = 0; i < 8; i++) {
      var tmp = new Array(8);
      for (var j = 0; j < 8; j++) {
        tmp[j] = room.data.board[count];
        count++;
      }
      board[i] = tmp;
    }

    game.set_board(board);

    game.get_board().set_available_moves(room.turn);

    game.set_turn(room.turn);

    game.make_move(room.row, room.col);

    count = 0;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        room.data.board[count] = game.get_board().board[i][j];
        count++;
      }
    }

    game.next_turn();
    room.turn = game.get_turn();

    // console.log(`Next turn: ${room.turn}`)
    const otherBoard = [...room.data.board];

    for (var i = 0; i < 64; i++) {
      if (otherBoard[i] === -1) otherBoard[i] = 0;
    }

    // console.log(otherBoard);

    room.data.board = otherBoard;

    console.log("updated board");

    io.in(room.data._id).emit("updated board", room);
  });

  socket.on("get available moves", (room) => {
    console.log("check");
    console.log(room.board);

    var game = new Game();
    var board = new Array(8);

    var count = 0;
    for (var i = 0; i < 8; i++) {
      var tmp = new Array(8);
      for (var j = 0; j < 8; j++) {
        tmp[j] = room.board[count];
        count++;
      }
      board[i] = tmp;
    }

    game.set_board(board);

    game.get_board().set_available_moves(room.turn);

    // game.set_turn(room.turn);

    count = 0;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        room.board[count] = game.get_board().board[i][j];
        count++;
      }
    }

    console.log(game.get_board().board);
    console.log("----");

    socket.emit("get available moves", { board: room.board });
  });

  socket.on("quit", (room) => {
    console.log("USER DISCONNECTED");
    socket.leave(room._id);
  });
});
