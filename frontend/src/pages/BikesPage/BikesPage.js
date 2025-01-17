import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "./BikesPage.css";
import PropTypes from "prop-types";

const getFrameSizeLabel = (size) => {
  const sizeMap = {
    xs: "XS",
    s: "S",
    m: "M",
    l: "L",
    xl: "XL",
    xxl: "XXL",
  };
  return sizeMap[size?.toLowerCase()] || size;
};

const BikesPage = () => {
  const { token, isAuthenticated } = useAuth();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedBikes, setSavedBikes] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams(); // Сначала объявляем searchParams
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  ); // Затем используем его
  const [displayFilters, setDisplayFilters] = useState({
    condition: "",
    priceMin: "",
    priceMax: "",
    bike_type: "",
    frame_size: "",
    wheel_size: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    condition: "",
    priceMin: "",
    priceMax: "",
    bike_type: "",
    frame_size: "",
    wheel_size: "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        await fetchBikes();
      } catch (error) {
        if (isMounted) {
          setError(error.message);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [appliedFilters, searchQuery]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (isAuthenticated && isMounted) {
          await fetchSavedBikes();
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (appliedFilters.condition)
      params.append("condition", appliedFilters.condition);
    if (appliedFilters.priceMin)
      params.append("min_price", appliedFilters.priceMin);
    if (appliedFilters.priceMax)
      params.append("max_price", appliedFilters.priceMax);
    if (appliedFilters.bike_type)
      params.append("bike_type", appliedFilters.bike_type);
    if (appliedFilters.frame_size)
      params.append("frame_size", appliedFilters.frame_size);
    if (appliedFilters.wheel_size)
      params.append("wheel_size", appliedFilters.wheel_size);
    if (searchQuery) params.append("search", searchQuery);

    const timer = setTimeout(() => {
      setSearchParams(params);
    }, 300);

    return () => clearTimeout(timer);
  }, [appliedFilters, searchQuery]);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (appliedFilters.condition)
        params.append("condition", appliedFilters.condition);
      if (appliedFilters.priceMin)
        params.append("min_price", appliedFilters.priceMin);
      if (appliedFilters.priceMax)
        params.append("max_price", appliedFilters.priceMax);
      if (appliedFilters.bike_type)
        params.append("bike_type", appliedFilters.bike_type);
      if (searchQuery) params.append("search", searchQuery);
      if (appliedFilters.frame_size)
        params.append("frame_size", appliedFilters.frame_size);
      if (appliedFilters.wheel_size)
        params.append("wheel_size", appliedFilters.wheel_size);

      console.log("Fetching bikes with params:", params.toString());

      const response = await fetch(
        `http://127.0.0.1:8000/api/bikes/?${params}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch bikes");
      }

      const data = await response.json();
      console.log("Received bikes:", data);
      setBikes(data);
    } catch (err) {
      console.error("Error fetching bikes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedBikes = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/saved-bikes/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch saved bikes");
      }
      const data = await response.json();
      setSavedBikes(data.map((bike) => bike.id));
    } catch (error) {
      console.error("Error fetching saved bikes:", error);
      setError("Failed to load saved bikes");
    }
  };

  const handleSave = async (e, bikeId) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return;
    }
    try {
      if (savedBikes.includes(bikeId)) {
        await fetch(`http://127.0.0.1:8000/api/saved-bikes/${bikeId}/remove/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSavedBikes((prev) => prev.filter((id) => id !== bikeId));
      } else {
        await fetch(`http://127.0.0.1:8000/api/saved-bikes/add/${bikeId}/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSavedBikes((prev) => [...prev, bikeId]);
      }
    } catch (error) {
      console.error("Error saving bike:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDisplayFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(displayFilters);
  };

  console.log("Display Filters:", displayFilters);
  console.log("Applied Filters:", appliedFilters);

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="bikes-page">
      {searchQuery && (
        <h2 className="search-results">Search results for: "{searchQuery}"</h2>
      )}
      <div className="filters-sidebar">
        <h2>Filters</h2>

        <div className="filter-group">
          <label>Condition</label>
          <select
            name="condition"
            value={displayFilters.condition}
            onChange={handleFilterChange}
          >
            <option value="">All Conditions</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="like_new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Price Range</label>
          <input
            type="number"
            name="priceMin"
            placeholder="Min Price"
            value={displayFilters.priceMin}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="priceMax"
            placeholder="Max Price"
            value={displayFilters.priceMax}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select
            name="bike_type"
            value={displayFilters.bike_type}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="mountain">Mountain Bike</option>
            <option value="road">Road Bike</option>
            <option value="city">City Bike</option>
            <option value="hybrid">Hybrid Bike</option>
            <option value="electric">Electric Bike</option>
            <option value="bmx">BMX</option>
            <option value="cruiser">Cruiser</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Frame Size</label>
          <select
            name="frame_size"
            value={displayFilters.frame_size}
            onChange={handleFilterChange}
          >
            <option value="">All Sizes</option>
            <option value="xs">XS</option>
            <option value="s">S</option>
            <option value="m">M</option>
            <option value="l">L</option>
            <option value="xl">XL</option>
            <option value="xxl">XXL</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Wheel Size</label>
          <select
            name="wheel_size"
            value={displayFilters.wheel_size}
            onChange={handleFilterChange}
          >
            <option value="">All Sizes</option>
            <option value="26">26"</option>
            <option value="27.5">27.5"</option>
            <option value="29">29"</option>
            <option value="700c">700c</option>
          </select>
        </div>

        <button className="apply-filters-button" onClick={applyFilters}>
          Apply Filters
        </button>
      </div>

      <div className="bikes-grid">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          bikes.map((bike) => (
            <div key={bike.id} className="bike-card-wrapper">
              <Link to={`/bikes/${bike.id}`} className="bike-card">
                <div className="bike-image">
                  {bike.image ? (
                    <img
                      src={
                        bike.image.startsWith("http")
                          ? bike.image
                          : `http://127.0.0.1:8000${bike.image}`
                      }
                      alt={bike.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-bike.png";
                        console.error("Error loading image");
                      }}
                    />
                  ) : (
                    <div className="no-image">No image available</div>
                  )}
                </div>
                <div className="bike-info">
                  <h3>{bike.name}</h3>
                  <p className="bike-price">${bike.price}</p>

                  <div className="bike-specs">
                    {bike.brand && (
                      <p className="bike-spec">
                        <span className="spec-label">Brand</span>
                        <span className="spec-value">
                          {bike.brand.charAt(0).toUpperCase() +
                            bike.brand.slice(1)}
                        </span>
                      </p>
                    )}
                    {bike.model && (
                      <p className="bike-spec">
                        <span className="spec-label">Model</span>
                        <span className="spec-value">
                          {bike.model.charAt(0).toUpperCase() +
                            bike.model.slice(1)}
                        </span>
                      </p>
                    )}
                    {bike.year && (
                      <p className="bike-spec">
                        <span className="spec-label">Year</span>
                        <span className="spec-value">{bike.year}</span>
                      </p>
                    )}
                    {bike.frame_size && (
                      <p className="bike-spec">
                        <span className="spec-label">Frame Size</span>
                        <span className="spec-value">
                          {getFrameSizeLabel(bike.frame_size)}
                        </span>
                      </p>
                    )}
                    {bike.wheel_size && (
                      <p className="bike-spec">
                        <span className="spec-label">Wheel Size</span>
                        <span className="spec-value">{bike.wheel_size}"</span>
                      </p>
                    )}
                    {bike.bike_type && (
                      <p className="bike-spec">
                        <span className="spec-label">Type</span>
                        <span className="spec-value">
                          {bike.bike_type.charAt(0).toUpperCase() +
                            bike.bike_type.slice(1)}
                        </span>
                      </p>
                    )}
                    {bike.color && (
                      <p className="bike-spec">
                        <span className="spec-label">Color</span>
                        <span className="spec-value">
                          {bike.color.charAt(0).toUpperCase() +
                            bike.color.slice(1)}
                        </span>
                      </p>
                    )}
                    {bike.condition && (
                      <p className="bike-spec">
                        <span className="spec-label">Condition</span>
                        <span className="spec-value">
                          {bike.condition.charAt(0).toUpperCase() +
                            bike.condition.slice(1)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>
              {isAuthenticated && (
                <button
                  className="save-button"
                  onClick={(e) => handleSave(e, bike.id)}
                >
                  {savedBikes.includes(bike.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

BikesPage.propTypes = {
  // Добавить при необходимости
};

export default BikesPage;
