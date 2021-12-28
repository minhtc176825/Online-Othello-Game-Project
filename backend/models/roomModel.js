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
        }
    },
    {
        timestamps: true
    }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;