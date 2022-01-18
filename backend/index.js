const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");

const { Game, Randy, Greedy, MiniMax } = require("./game/Game.js");

let RedisStore = require("connect-redis")(session);

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_PORT,
  MONGO_IP,
  REDIS_PORT,
  REDIS_URL,
  SESSION_SECRET,
} = require("./config/config");

let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

// router
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL)
    .then(() => console.log("successfully connected to DB"))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.use(express.json());

app.enable("trust proxy");
app.use(cors({}));
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,

    cookie: {
      secure: false,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      maxAge: 90000000,
    },
  })
);

app.get("/api/v1", (req, res) => {
  res.send("<h2>Hi there!!</h2>");
  console.log("yeah it ran");
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/rooms", roomRoutes);

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  socket.removeAllListeners();
  console.log(`User ${socket.id} connected`);

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });

  socket.on("CREATE", (roomId) => {
    socket.join(roomId);
    console.log(`Room ${roomId} is now hosted by ${socket.id}`);
  });

  socket.on("JOIN", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    socket.to(roomId).emit("READY");
  });

  socket.on("START", (data) => {
    console.log("START");
    var game = new Game();
    var board = new Array(8);

    var count = 0;
    for (var i = 0; i < 8; i++) {
      var tmp = new Array(8);
      for (var j = 0; j < 8; j++) {
        tmp[j] = data.board[count];
        count++;
      }

      board[i] = tmp;
    }

    game.set_board(board);
    game.get_board().set_available_moves(data.turn);

    count = 0;


    data.currentTurn = game.get_turn();

    io.in(data.roomId).emit("START", {
      board: data.board,
      currentTurn: data.currentTurn
    });
  });

  socket.on("MOVE", (data) => {
    console.log("MOVE");
    var game = new Game();
    var board = new Array(8);

    var count = 0;
    for (var i = 0; i < 8; i++) {
      var tmp = new Array(8);
      for (var j = 0; j < 8; j++) {
        tmp[j] = data.board[count];
        count++;
      }
      board[i] = tmp;
    }

    game.set_board(board);

    game.get_board().set_available_moves(data.currentTurn);

    game.set_turn(data.currentTurn);

    game.make_move(data.row, data.col);

    count = 0;

    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        data.board[count] = game.get_board().board[i][j];
        count++;
      }
    }

    game.next_turn();
    data.currentTurn = game.get_turn();

    const otherBoard = [...data.board];

    let score1 = 0;
    let score2 = 0;
    for (var i = 0; i < 64; i++) {
      if (otherBoard[i] == 1) score1++;
      if (otherBoard[i] == 2) score2++;
      if (otherBoard[i] === -1) otherBoard[i] = 0;
    }

    data.board = otherBoard;

    console.log(data.board);

    io.in(data.roomId).emit("MOVE", {
      board: data.board,
      currentTurn: data.currentTurn,
      score: [score1, score2],
    });
  });

  socket.on("GET MOVES", (data) => {
    console.log("GET MOVES");
    var game = new Game();
    var board = new Array(8);

    var count = 0;
    for (var i = 0; i < 8; i++) {
      var tmp = new Array(8);
      for (var j = 0; j < 8; j++) {
        tmp[j] = data.board[count];
        count++;
      }

      board[i] = tmp;
    }

    game.set_board(board);
    game.get_board().set_available_moves(data.currentTurn);

    count = 0;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        data.board[count] = game.get_board().board[i][j];
        count++;
      }
    }

    // data.currentTurn = game.get_turn();
    // console.log(game.get_board().board);
    socket.emit("GET MOVES", {
      board: data.board,
      currentTurn: data.currentTurn,
    });
  });

  socket.on("END", (roomId) => {
    io.in(roomId).socketsLeave(roomId);
  });

  socket.on("PLAY AGAIN", (roomId) => {});

  socket.on("SINGLE", () => {
    var game = new Game();

    game.init_board();

    game.get_board().set_available_moves(1);
    var board = [];

    var count = 0;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        board[count] = game.get_board().board[i][j];
        count++;
      }
    }

    socket.emit("SINGLE", { board: board });
  });

  socket.on("SINGLE MOVE", (data) => {
    console.log("SINGLE MOVE");
    var game = new Game();
    var board = new Array(8);

    var count = 0;
    for (var i = 0; i < 8; i++) {
      var tmp = new Array(8);
      for (var j = 0; j < 8; j++) {
        tmp[j] = data.board[count];
        count++;
      }
      board[i] = tmp;
    }

    game.set_board(board);

    game.get_board().set_available_moves(data.currentTurn);

    game.set_turn(data.currentTurn);

    game.make_move(data.row, data.col);

    count = 0;

   

    game.next_turn();

    while (game.get_turn() !== data.currentTurn) {
      // 1
      switch (data.level) {
        case 1:
          var bot = new Randy(3 - data.currentTurn);
          break;
        case 2:
          var bot = new Greedy(3 - data.currentTurn);
          break;
        case 3:
          var bot = new MiniMax(3 - data.currentTurn, 3);
          break;
        default:
          break;
      }

      var [x, y] = bot.make_move(game.get_board());

      game.make_move(x, y);
      game.next_turn();
      console.log(game.get_board().board);
    }

    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        data.board[count] = game.get_board().board[i][j];
        count++;
      }
    }

    // data.currentTurn = game.get_turn();

    const otherBoard = [...data.board];

    let score1 = 0;
    let score2 = 0;
    for (var i = 0; i < 64; i++) {
      if (otherBoard[i] == 1) score1++;
      if (otherBoard[i] == 2) score2++;
    }

    data.board = otherBoard;
    console.log("FINISH")

    socket.emit("SINGLEMOVE", {
      board: data.board,
      currentTurn: data.currentTurn,
      score: [score1, score2],
    });
  });

  socket.on("QUIT ROOM", (data) => {
    socket.leave(data.roomId);
    const user1 = data.users[0];
    const user2 = data.users[1];
    const winner = data.isHost ? user2 : user1;
    socket.to(data.roomId).emit("USER LEFT", {users: winner});
  });
});
