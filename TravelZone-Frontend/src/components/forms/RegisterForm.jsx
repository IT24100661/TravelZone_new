import { useState } from "react";

const RegisterForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "TOURIST",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="card form-card" onSubmit={submit}>
      <h2>Create account</h2>
      <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="TOURIST">Tourist</option>
        <option value="GUIDE">Guide</option>
        <option value="HOTEL_OWNER">Hotel Owner</option>
      </select>
      <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
    </form>
  );
};

export default RegisterForm;
