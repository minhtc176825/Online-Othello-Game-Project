const Room = require("../models/roomModel");

exports.fetchRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find()
      .populate("users", "-password")
      .populate("host", "-password");

    res.status(200).json({
      status: "SUCCESS",
      results: rooms.length,
      data: {
        rooms,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "FAIL",
    });
  }
};

exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("users", "-password")
      .populate("host", "-password");

    res.status(200).json({
      status: "SUCCESS",
      data: {
        room,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "FAIL",
    });
  }
};

exports.createNewRoom = async (req, res, next) => {
  console.log("POST /api/v1/rooms");

  const user = req.session.user;
  let board = [];
  for (var i = 0; i < 64; i++) {
    if (i == 27 || i == 36) {
      board.push(1);
    } else if (i == 28 || i == 35) {
      board.push(2);
    } else {
      board.push(0);
    }
  }

  let score = [2, 2];

  try {
    const newRoom = await Room.create({
      users: [user],
      host: user,
      board: board,
      score: score,
    });

    const room = await Room.findOne({ _id: newRoom._id })
      .populate("users", "-password")
      .populate("host", "-password");

    res.status(200).json({
      status: "SUCCESS",
      data: {
        room,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "FAIL",
    });
  }
};

exports.joinRoom = async (req, res, next) => {
  console.log("PATCH /api/v1/rooms/join/:id");

  const user = req.session.user;

  try {
    const room = await Room.findById(req.params.id);
    console.log(room);
    const users = room.users;
    users.push(user);
    console.log(users);
    const newRoom = await Room.findByIdAndUpdate(
      req.params.id,
      {
        users: users,
        state: "READY",
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("users", "-password")
      .populate("host", "-password");

    res.status(200).json({
      status: "SUCCESS",
      data: {
        newRoom,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "FAIL",
    });
  }
};

exports.updateRoom = async (req, res, next) => {};

exports.deleteRoom = async (req, res, next) => {};
