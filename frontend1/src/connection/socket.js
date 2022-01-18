const io = require("socket.io-client");

const ENDPOINT = "http://localhost:8000";

var socket = io(ENDPOINT);

module.exports = { socket }