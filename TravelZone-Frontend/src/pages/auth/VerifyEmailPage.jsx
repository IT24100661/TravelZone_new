import { useState } from "react";
import { verifyEmail } from "../../api/authApi";

const VerifyEmailPage = () => {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyEmail({ token });
      setMessage(res.data.message || "Email verified");
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Verify Email</h2>
      <form onSubmit={handleSubmit}>
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Verification token" />
        <button type="submit">Verify</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmailPage;
