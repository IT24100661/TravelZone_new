import { useState } from "react";
import GuideProfileForm from "../../components/forms/GuideProfileForm";
import { createGuideProfile } from "../../api/guideApi";

const AddGuideProfilePage = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (payload) => {
    try {
      await createGuideProfile(payload);
      setMessage("Guide profile created successfully");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to create guide profile"
      );
    }
  };

  return (
    <div className="page-center">
      <GuideProfileForm onSubmit={handleSubmit} />
      {message && <p className="status-msg">{message}</p>}
    </div>
  );
};

export default AddGuideProfilePage;
