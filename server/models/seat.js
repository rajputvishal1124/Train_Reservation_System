const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  isBooked: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model("Seat", seatSchema);
