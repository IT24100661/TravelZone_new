import { useState } from "react";

const HotelForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    facilities: "",
    images: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      facilities: form.facilities.split(",").map((item) => item.trim()).filter(Boolean),
      images: form.images.split(",").map((item) => item.trim()).filter(Boolean),
    });
  };

  return (
    <form className="card form-card" onSubmit={submit}>
      <h2>Add Hotel</h2>
      <input name="name" placeholder="Hotel name" value={form.name} onChange={handleChange} />
      <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <input name="facilities" placeholder="WiFi, Pool, AC" value={form.facilities} onChange={handleChange} />
      <input name="images" placeholder="Image URLs comma separated" value={form.images} onChange={handleChange} />
      <button type="submit">Save Hotel</button>
    </form>
  );
};

export default HotelForm;
