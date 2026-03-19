import { useState } from "react";
import HotelForm from "../../components/forms/HotelForm";
import { createHotel } from "../../api/hotelApi";

const AddHotelPage = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (payload) => {
    try {
      await createHotel(payload);
      setMessage("Hotel created successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create hotel");
    }
  };

  return (
    <div className="page-center">
      <HotelForm onSubmit={handleSubmit} />
      {message && <p className="status-msg">{message}</p>}
    </div>
  );
};

export default AddHotelPage;
