import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/forms/LoginForm";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      setLoading(true);
      const res = await loginUser(data);
      login(res.data);
      setMessage(res.data.message || "Login successful");
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <LoginForm onSubmit={handleLogin} loading={loading} />
      {message && <p className="status-msg">{message}</p>}
    </div>
  );
};

export default LoginPage;
