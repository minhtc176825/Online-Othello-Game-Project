const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    state: {
        type: "String",
        default: "WAITING"
    },
    board: [{
        type: "Number",
        default: 0
    }],
    score: [{
        type: "Number",
        default: 0
    }],
    turn: {
        type: "Number",
        default: 1
    }
}, {
    timestamps: true
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;