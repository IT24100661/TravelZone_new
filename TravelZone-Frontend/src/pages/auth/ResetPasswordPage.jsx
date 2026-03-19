import { useState } from "react";
import { resetPassword } from "../../api/authApi";

const ResetPasswordPage = () => {
  const [form, setForm] = useState({ token: "", newPassword: "" });
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await resetPassword(form);
      setMessage(res.data.message || "Password updated");
    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Reset token"
          value={form.token}
          onChange={(e) => setForm({ ...form, token: e.target.value })}
        />
        <input
          type="password"
          placeholder="New password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <button type="submit">Reset</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default ResetPasswordPage;
