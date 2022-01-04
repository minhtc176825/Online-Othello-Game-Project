const mongoose = require("mongoose");

const roomSchema = mongoose.Schema(
    {
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        state: {
            type: "Number",
            default: 0
        },
        // board: {
        //     type: "String",
        //     default: "0000000000000000000000000000000000000000000000000000000000000000"
        // },
        board: [{
            type: "Number",
            default: 0
        }],
        score: [{
            type: "Number",
            default: 2
        }],
        turn: {
            type: "Number",
            default: 1
        }
    },
    {
        timestamps: true
    }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;