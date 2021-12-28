const express = require("express");
const {
  getAllRooms,
  createNewRoom,
  joinRoom,
  getRoom
} = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getAllRooms).post(protect, createNewRoom);

router.route("/:id").put(protect, joinRoom).get(protect, getRoom);

module.exports = router;
