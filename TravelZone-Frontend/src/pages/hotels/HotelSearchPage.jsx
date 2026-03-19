import { useEffect, useState } from "react";
import { searchHotels } from "../../api/hotelApi";
import HotelCard from "../../components/cards/HotelCard";

const HotelSearchPage = () => {
  const [hotels, setHotels] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    price: "",
    facilities: "",
    page: 0,
    size: 10,
  });

  const loadHotels = async () => {
    try {
      const params = { ...filters };
      if (!params.location) delete params.location;
      if (!params.price) delete params.price;
      if (!params.facilities) delete params.facilities;

      const res = await searchHotels(params);
      const data = res.data.content || res.data || [];
      setHotels(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadHotels();
  };

  return (
    <div className="container section">
      <form className="filter-bar" onSubmit={handleSearch}>
        <input placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <input placeholder="Max price" value={filters.price} onChange={(e) => setFilters({ ...filters, price: e.target.value })} />
        <input placeholder="Facility e.g. WiFi" value={filters.facilities} onChange={(e) => setFilters({ ...filters, facilities: e.target.value })} />
        <button type="submit">Search</button>
      </form>

      <div className="grid">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id || hotel.hotelId} hotel={hotel} />
        ))}
      </div>
    </div>
  );
};

export default HotelSearchPage;
