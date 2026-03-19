import { useState } from "react";

const GuideProfileForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    experienceYears: "",
    languages: "",
    pricePerDay: "",
    location: "",
    profilePhoto: "",
    bio: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault();

    const payload = {
      experienceYears: Number(form.experienceYears),
      languages: form.languages
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      pricePerDay: Number(form.pricePerDay),
      location: form.location.trim(),
      profilePhoto: form.profilePhoto.trim(),
      bio: form.bio.trim(),
    };

    onSubmit(payload);
  };

  return (
    <form className="card form-card" onSubmit={submit}>
      <h2>Add Guide Profile</h2>

      <input
        name="experienceYears"
        type="number"
        placeholder="Experience years"
        value={form.experienceYears}
        onChange={handleChange}
        required
      />

      <input
        name="languages"
        placeholder="Languages comma separated"
        value={form.languages}
        onChange={handleChange}
        required
      />

      <input
        name="pricePerDay"
        type="number"
        step="0.01"
        placeholder="Price per day"
        value={form.pricePerDay}
        onChange={handleChange}
        required
      />

      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
        required
      />

      <input
        name="profilePhoto"
        placeholder="Profile photo URL"
        value={form.profilePhoto}
        onChange={handleChange}
        required
      />

      <textarea
        name="bio"
        placeholder="Bio"
        value={form.bio}
        onChange={handleChange}
        required
      />

      <button type="submit">Save Guide Profile</button>
    </form>
  );
};

export default GuideProfileForm;
