import { useMemo, useState } from "react";

const BookingForm = ({ onSubmit, guideId, pricePerDay }) => {
  const [form, setForm] = useState({
    bookingDate: "",
  });

  const totalPrice = useMemo(() => {
    if (!pricePerDay) return "";
    return pricePerDay;
  }, [pricePerDay]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault();

    onSubmit({
      guideId: Number(guideId),
      bookingDate: form.bookingDate,
      totalPrice: Number(totalPrice),
    });
  };

  return (
    <form className="card form-card" onSubmit={submit}>
      <h3>Book Guide</h3>

      <input
        name="bookingDate"
        type="date"
        value={form.bookingDate}
        onChange={handleChange}
        required
      />

      <input
        value={totalPrice}
        readOnly
        placeholder="Total price"
      />

      <button type="submit">Create Booking</button>
    </form>
  );
};

export default BookingForm;
