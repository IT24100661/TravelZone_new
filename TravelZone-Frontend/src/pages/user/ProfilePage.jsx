import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProfile } from "../../api/userApi";
import LoadingSpinner from "../../components/LoadingSpinner";

const ProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile(userId)
      .then((res) => setProfile(res.data))
      .catch(console.error);
  }, [userId]);

  if (!profile) return <LoadingSpinner />;

  return (
    <div className="container section">
      <div className="card profile-card">
        <h2>{profile.name}</h2>
        <p>Email: {profile.email}</p>
        <p>Phone: {profile.phone || "-"}</p>
        <p>Role: {profile.role}</p>
        <p>Bio: {profile.bio || "-"}</p>
        <Link className="link-btn" to={`/profile/${userId}/edit`}>Edit Profile</Link>
      </div>
    </div>
  );
};

export default ProfilePage;
