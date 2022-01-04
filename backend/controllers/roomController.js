const asyncHandler = require("express-async-handler");
const Room = require("../models/roomModel");
const User = require("../models/userModel");

// status
// = 0 : READY
// = 1 : ONGOING
// = 2 : DONE
const getAllRooms = asyncHandler(async (req, res) => {
  console.log("GET /api/v1/room/");

  try {
    const rooms = await Room.find({
      $or: [
        { state: 0 },
        { state: 1 },
      ],
    })
      .populate("users", "-password")
      .populate("host", "-password");

    res.status(200).json(rooms);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createNewRoom = asyncHandler(async (req, res) => {
  console.log("POST /api/v1/room/");

  var tmp = JSON.stringify([]);
  var users = JSON.parse(tmp);

  users.push(req.user);

  var board = [];
  var score = [2, 2];

  for (var i = 0; i < 64; i++) {
    if (i == 27 || i == 36) {
      board.push(1);
    } else if (i == 28 || i == 35) {
      board.push(2);
    } else {
      board.push(0);
    }
  }

  try {
    const newRoom = await Room.create({
      users: users,
      host: req.user,
      board: board,
      score: score,
      state: 0
    });

    const room = await Room.findOne({ _id: newRoom._id })
      .populate("users", "-password")
      .populate("host", "-password");

    // console.log(room);
    res.status(200).json(room);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const joinRoom = asyncHandler(async (req, res) => {
  console.log("PUT /api/v1/room/:id");
  const roomID = req.params.id;

  const room = await Room.findOne({ _id: roomID });

  var users = room.users;
  users.push(req.user);

  const updatedRoom = await Room.findByIdAndUpdate(
    roomID,
    {
      users: users,
      state: 1
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("host", "-password");

  if (updatedRoom) {
    // console.log(updatedRoom);
    res.status(201).json(updatedRoom);
  }
});

const updateBoard = asyncHandler(async (req, res) => {
  console.log("PATCH /api/v1/room/:id");
  const roomID = req.params.id;

  console.log(req.body)

  const updatedRoom = await Room.findByIdAndUpdate(
    roomID,
    {
      board: req.body.board,
      turn: req.body.turn
    },
  ).populate("users", "-password")
  .populate("host", "-password");

  if (updatedRoom) {
    console.log(updatedRoom)
    res.status(201).json(updatedRoom);
  }
})

const getRoom = asyncHandler(async (req, res) => {
  const roomID = req.params.id;
  console.log(roomID);
  const room = await Room.findOne({ _id: roomID })
    .populate("users", "-password")
    .populate("host", "-password");

  if (room) {
    res.status(201).send(room);
  } else {
    res.status(400);
    throw new Error("Room not exists");
  }
});

module.exports = {
  getAllRooms,
  createNewRoom,
  joinRoom,
  getRoom,
  updateBoard
};
