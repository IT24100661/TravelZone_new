import { useEffect, useState } from "react";
import { searchGuides } from "../../api/guideApi";
import GuideCard from "../../components/cards/GuideCard";

const GuideSearchPage = () => {
  const [guides, setGuides] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    language: "",
    rating: "",
  });
  const [message, setMessage] = useState("");

  const loadGuides = async () => {
    try {
      const params = {};
      if (filters.location.trim()) params.location = filters.location.trim();
      if (filters.language.trim()) params.language = filters.language.trim();
      if (filters.rating.trim()) params.rating = filters.rating.trim();

      const res = await searchGuides(params);
      const data = res.data.content || [];
      setGuides(data);
      setMessage("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load guides");
    }
  };

  useEffect(() => {
    loadGuides();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadGuides();
  };

  return (
    <div className="container section">
      <form className="filter-bar" onSubmit={handleSearch}>
        <input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <input
          placeholder="Language"
          value={filters.language}
          onChange={(e) => setFilters({ ...filters, language: e.target.value })}
        />
        <input
          placeholder="Rating"
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
        />
        <button type="submit">Search</button>
      </form>

      {message && <p className="status-msg">{message}</p>}

      <div className="grid">
        {guides.map((guide) => (
          <GuideCard key={guide.guideId || guide.id} guide={guide} />
        ))}
      </div>
    </div>
  );
};

export default GuideSearchPage;
