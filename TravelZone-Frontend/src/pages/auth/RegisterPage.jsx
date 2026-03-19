import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/forms/RegisterForm";
import { registerUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const RegisterPage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (data) => {
    try {
      setLoading(true);
      const res = await registerUser(data);
      login(res.data);
      setMessage(res.data.message || "Registration successful");
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <RegisterForm onSubmit={handleRegister} loading={loading} />
      {message && <p className="status-msg">{message}</p>}
    </div>
  );
};

export default RegisterPage;
