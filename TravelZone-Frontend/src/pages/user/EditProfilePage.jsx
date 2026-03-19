import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProfile, updateProfile } from "../../api/userApi";

const EditProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    profilePicture: "",
    bio: "",
  });

  useEffect(() => {
    getProfile(userId).then((res) => {
      setForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        profilePicture: res.data.profilePicture || "",
        bio: res.data.bio || "",
      });
    });
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(userId, form);
      navigate(`/profile/${userId}`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="page-center">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Edit Profile</h2>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
        <input
          value={form.profilePicture}
          onChange={(e) => setForm({ ...form, profilePicture: e.target.value })}
          placeholder="Profile picture URL"
        />
        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio" />
        <button type="submit">Save Changes</button>
        {message && <p className="status-msg">{message}</p>}
      </form>
    </div>
  );
};

export default EditProfilePage;
