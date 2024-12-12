const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Seat model
const Seat = require("./models/seat");

// Seed the seats (only run once)
const seedDatabase = async () => {
  const seats = Array.from({ length: 80 }, (_, i) => ({
    seatNumber: i + 1,
    isBooked: false,
  }));
  await Seat.deleteMany({});
  await Seat.insertMany(seats);
  console.log("Database seeded with 80 seats");
};

// Uncomment to seed the database (run only once)
// seedDatabase();

// Routes
app.get("/seats", async (req, res) => {
  try {
    const seats = await Seat.find().sort({ seatNumber: 1 });
    res.json(seats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/book-seats", async (req, res) => {
  const { numberOfSeats } = req.body;
  if (numberOfSeats < 1 || numberOfSeats > 7) {
    return res
      .status(400)
      .json({ message: "You can only book between 1 and 7 seats at a time" });
  }

  try {
    const availableSeats = await Seat.find({ isBooked: false }).sort({
      seatNumber: 1,
    });

    if (availableSeats.length < numberOfSeats) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    const bookedSeats = [];
    const rows = {};

    for (let seat of availableSeats) {
      const rowNumber = Math.floor((seat.seatNumber - 1) / 7);
      if (!rows[rowNumber]) rows[rowNumber] = [];
      rows[rowNumber].push(seat);
    }

    for (const [row, seats] of Object.entries(rows)) {
      if (seats.length >= numberOfSeats) {
        const seatsToBook = seats.slice(0, numberOfSeats);
        bookedSeats.push(...seatsToBook.map((seat) => seat.seatNumber));
        break;
      }
    }

    if (bookedSeats.length < numberOfSeats) {
      const remainingSeats = numberOfSeats - bookedSeats.length;
      const unbookedSeats = availableSeats.filter(
        (seat) => !bookedSeats.includes(seat.seatNumber)
      );
      const additionalSeats = unbookedSeats.slice(0, remainingSeats);
      bookedSeats.push(...additionalSeats.map((seat) => seat.seatNumber));
    }

    await Seat.updateMany(
      { seatNumber: { $in: bookedSeats } },
      { $set: { isBooked: true } }
    );

    res.json({ message: "Seats booked successfully", bookedSeats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/clear-bookings", async (req, res) => {
  try {
    console.log("hello");
    await Seat.updateMany({}, { $set: { isBooked: false } });
    res.json({ message: "All bookings have been cleared successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
