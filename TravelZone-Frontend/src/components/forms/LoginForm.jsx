import { useState } from "react";

const LoginForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
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
      <h2>Login</h2>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
    </form>
  );
};

export default LoginForm;
