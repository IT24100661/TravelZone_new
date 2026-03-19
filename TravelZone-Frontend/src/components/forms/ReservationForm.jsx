import { useState } from "react";

const ReservationForm = ({ onSubmit, hotelId }) => {
  const [form, setForm] = useState({
    hotelId: hotelId || "",
    roomId: "",
    checkIn: "",
    checkOut: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form
      className="card form-card"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <h3>Reserve Room</h3>
      <input name="roomId" placeholder="Room ID" value={form.roomId} onChange={handleChange} />
      <input name="checkIn" type="date" value={form.checkIn} onChange={handleChange} />
      <input name="checkOut" type="date" value={form.checkOut} onChange={handleChange} />
      <button type="submit">Reserve</button>
    </form>
  );
};

export default ReservationForm;
