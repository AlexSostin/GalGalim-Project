import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaHeart, FaRegHeart, FaMapMarkerAlt } from "react-icons/fa";
import { cities } from "../../constants/cities";
import "./BikeList.css";

const truncateDescription = (description) => {
  if (!description) return "";
  return description.length > 100
    ? description.substring(0, 100) + "..."
    : description;
};

const BikeList = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedBikes, setSavedBikes] = useState([]);
  const { isAuthenticated, token } = useAuth();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const fetchBikes = async () => {
      setLoading(true);
      try {
        let url = "http://127.0.0.1:8000/api/bikes/";
        if (searchQuery) {
          url += `?search=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch bikes");
        }
        const data = await response.json();
        setBikes(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching bikes:", error);
        setError("Failed to load bikes");
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, [searchQuery]); // Перезагружаем при изменении поискового запроса

  useEffect(() => {
    const fetchSavedBikes = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await fetch("http://127.0.0.1:8000/api/saved-bikes/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSavedBikes(data.map((bike) => bike.id));
        }
      } catch (error) {
        console.error("Error fetching saved bikes:", error);
      }
    };

    fetchSavedBikes();
  }, [isAuthenticated, token]);

  const handleSave = async (bikeId, e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please login to save bikes");
      return;
    }

    const isSaved = savedBikes.includes(bikeId);

    try {
      const url = isSaved
        ? `http://127.0.0.1:8000/api/saved-bikes/${bikeId}/remove/`
        : `http://127.0.0.1:8000/api/saved-bikes/add/${bikeId}/`;

      const response = await fetch(url, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        if (isSaved) {
          setSavedBikes(savedBikes.filter((id) => id !== bikeId));
        } else {
          setSavedBikes([...savedBikes, bikeId]);
        }

        const savedResponse = await fetch(
          "http://127.0.0.1:8000/api/saved-bikes/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (savedResponse.ok) {
          const data = await savedResponse.json();
          setSavedBikes(data.map((bike) => bike.id));
        }
      } else {
        throw new Error(`Failed to ${isSaved ? "remove" : "save"} bike`);
      }
    } catch (error) {
      console.error("Error saving bike:", error);
      alert(`Failed to ${isSaved ? "remove" : "save"} bike. Please try again.`);
    }
  };

  const getBikeTypeLabel = (type) => {
    const categoryMap = {
      mountain: "Mountain Bike",
      road: "Road Bike",
      city: "City Bike",
      bmx: "BMX",
      electric: "Electric Bike",
    };
    return categoryMap[type] || type;
  };

  const getConditionLabel = (condition) => {
    const conditionMap = {
      new: "New",
      like_new: "Like New",
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      needs_repair: "Needs Repair",
    };
    return conditionMap[condition] || condition;
  };

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

  const getWheelSizeLabel = (wheelSize) => {
    if (!wheelSize) return "";
    return `${wheelSize}"`;
  };

  return (
    <div className="bike-list-container">
      {searchQuery && (
        <h2 className="search-results">Search results for: "{searchQuery}"</h2>
      )}

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : error ? (
        <div className="error-message">Error: {error}</div>
      ) : bikes.length === 0 ? (
        <p className="no-bikes-message">
          {searchQuery
            ? `No bikes found for "${searchQuery}"`
            : "No bikes available"}
        </p>
      ) : (
        <div className="bike-grid">
          {bikes.map((bike) => (
            <div key={bike.id} className="bike-card-wrapper">
              <Link to={`/bikes/${bike.id}`} className="bike-card">
                <div className="bike-image-container">
                  {bike.image ? (
                    <img
                      src={
                        bike.image.startsWith("http")
                          ? bike.image
                          : `http://127.0.0.1:8000${bike.image}`
                      }
                      alt={bike.name}
                      className="bike-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-bike.png";
                      }}
                    />
                  ) : (
                    <div className="no-image">No image available</div>
                  )}
                </div>
                <div className="bike-info">
                  <h3 className="bike-name">{bike.name}</h3>
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
                        <span className="spec-value">
                          {getWheelSizeLabel(bike.wheel_size)}
                        </span>
                      </p>
                    )}
                    {bike.bike_type && (
                      <p className="bike-spec">
                        <span className="spec-label">Type</span>
                        <span className="spec-value">
                          {getBikeTypeLabel(bike.bike_type)}
                        </span>
                      </p>
                    )}
                    {bike.condition && (
                      <p className="bike-spec">
                        <span className="spec-label">Condition</span>
                        <span className="spec-value">
                          {getConditionLabel(bike.condition)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>
              {isAuthenticated && (
                <button
                  className="save-button"
                  onClick={(e) => handleSave(bike.id, e)}
                >
                  {savedBikes.includes(bike.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BikeList;
