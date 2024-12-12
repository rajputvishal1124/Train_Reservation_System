import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [seats, setSeats] = useState([]);
  const [numSeats, setNumSeats] = useState(1);

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    const response = await axios.get("https://train-reservation-system.onrender.com/seats");
    setSeats(response.data);
  };

  const bookSeats = async () => {
    try {
      const response = await axios.post("https://train-reservation-system.onrender.com/book-seats", {
        numberOfSeats: numSeats,
      });
      alert(`Seats booked: ${response.data.bookedSeats.join(", ")}`);
      fetchSeats();
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const clearBookings = async () => {
    try {
      const response = await axios.post("https://train-reservation-system.onrender.com/clear-bookings");
      console.log(response);
      alert(response.data.message);
      fetchSeats();
    } catch (error) {
      alert("Failed to clear bookings");
    }
  };

  return (
    <div className="App">
      <h1>Train Seat Booking</h1>
      <div className="controls">
        <input
          type="number"
          value={numSeats}
          onChange={(e) => setNumSeats(e.target.value)}
          min="1"
          max="7"
        />
        <button onClick={bookSeats}>Book Seats</button>
        <button onClick={clearBookings} className="clear-button">
          Clear All Bookings
        </button>
      </div>

      <div className="seats-container">
        {seats.map((seat) => (
          <div
            key={seat.seatNumber}
            className={`seat ${seat.isBooked ? "booked" : ""}`}
          >
            {seat.seatNumber}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
