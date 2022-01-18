const express = require("express");

const roomController = require("../controllers/roomController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router
  .route("/")
  .get(protect, roomController.fetchRooms)
  .post(protect, roomController.createNewRoom);

router
  .route("/:id")
  .get(protect, roomController.getRoom)
  .patch(protect, roomController.updateRoom)
  .delete(protect, roomController.deleteRoom);

router.route("/join/:id").patch(protect, roomController.joinRoom);

module.exports = router;
