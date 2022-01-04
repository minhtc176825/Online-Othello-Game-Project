const express = require("express");
const {
  getAllRooms,
  createNewRoom,
  joinRoom,
  getRoom,
  updateBoard,
} = require("../controllers/roomController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getAllRooms);
router.post("/", protect, createNewRoom);
router.put("/:id", protect, joinRoom);
router.get("/:id", protect, getRoom);
router.patch("/:id", protect, updateBoard);
// router.route("/").post(protect, createNewRoom);
// router.route("/").get(protect, getAllRooms);

// router.route("/:id").put(protect, joinRoom);
// router.route("/:id").get(protect, getRoom);

module.exports = router;
