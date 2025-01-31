import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaTrash, FaEnvelope } from "react-icons/fa";
import { cities } from "../../constants/cities";
import "./SavedBikes.css";
import { useNavigate } from "react-router-dom";

const SavedBikes = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
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
        setBikes(data);
      } catch (error) {
        console.error("Error fetching saved bikes:", error);
        setError("Failed to load saved bikes");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedBikes();
  }, [token]);

  const removeBike = async (bikeId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/saved-bikes/${bikeId}/remove/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove bike from saved");
      }

      setBikes(bikes.filter((bike) => bike.id !== bikeId));
    } catch (error) {
      console.error("Error removing bike:", error);
      setError("Failed to remove bike");
    }
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

  const handleMessageSeller = (bike) => {
    const sellerId = bike.user?.id;
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!sellerId) {
      alert("Seller information not available");
      return;
    }

    if (currentUser?.id === sellerId) {
      alert("You can't message yourself");
      return;
    }

    navigate(`/chat/${sellerId}?bikeId=${bike.id}`);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="saved-bikes-container">
      <h2>Saved Bikes</h2>
      {bikes.length === 0 ? (
        <div className="no-bikes-message">No saved bikes yet.</div>
      ) : (
        <div className="saved-bikes-grid">
          {bikes.map((bike) => {
            const sellerId = bike.user?.id || bike.seller?.id;
            return (
              <div key={bike.id} className="saved-bike-card">
                <div className="saved-bike-image">
                  <img src={bike.image} alt={bike.name} />
                </div>
                <div className="saved-bike-info">
                  <div className="saved-bike-details">
                    <h3 className="saved-bike-name">{bike.name}</h3>
                    <p className="saved-bike-price">${bike.price}</p>

                    <div className="saved-bike-specs">
                      {bike.brand && (
                        <div className="spec-item">
                          <span className="spec-label">Brand</span>
                          <span className="spec-value">
                            {bike.brand.charAt(0).toUpperCase() +
                              bike.brand.slice(1)}
                          </span>
                        </div>
                      )}
                      {bike.model && (
                        <div className="spec-item">
                          <span className="spec-label">Model</span>
                          <span className="spec-value">
                            {bike.model.charAt(0).toUpperCase() +
                              bike.model.slice(1)}
                          </span>
                        </div>
                      )}
                      {bike.year && (
                        <div className="spec-item">
                          <span className="spec-label">Year</span>
                          <span className="spec-value">{bike.year}</span>
                        </div>
                      )}
                      {bike.frame_size && (
                        <div className="spec-item">
                          <span className="spec-label">Frame Size</span>
                          <span className="spec-value">
                            {getFrameSizeLabel(bike.frame_size)}
                          </span>
                        </div>
                      )}
                      {bike.wheel_size && (
                        <div className="spec-item">
                          <span className="spec-label">Wheel Size</span>
                          <span className="spec-value">{bike.wheel_size}"</span>
                        </div>
                      )}
                      {bike.bike_type && (
                        <div className="spec-item">
                          <span className="spec-label">Type</span>
                          <span className="spec-value">
                            {bike.bike_type.charAt(0).toUpperCase() +
                              bike.bike_type.slice(1)}
                          </span>
                        </div>
                      )}
                      {bike.color && (
                        <div className="spec-item">
                          <span className="spec-label">Color</span>
                          <span className="spec-value">
                            {bike.color.charAt(0).toUpperCase() +
                              bike.color.slice(1)}
                          </span>
                        </div>
                      )}
                      {bike.condition && (
                        <div className="spec-item">
                          <span className="spec-label">Condition</span>
                          <span className="spec-value">
                            {bike.condition.charAt(0).toUpperCase() +
                              bike.condition.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="saved-bike-location">
                      <span className="spec-label">Location</span>
                      <span className="spec-value">
                        <FaMapMarkerAlt />
                        {cities.find((c) => c.value === bike.city)?.label ||
                          bike.city}
                      </span>
                    </div>
                  </div>

                  <div className="saved-bike-actions">
                    <button
                      className="view-details-btn"
                      onClick={() =>
                        (window.location.href = `/bikes/${bike.id}`)
                      }
                    >
                      View Details
                    </button>
                    <button
                      className="message-seller-btn"
                      onClick={() => handleMessageSeller(bike)}
                      disabled={!bike.user?.id}
                    >
                      <FaEnvelope />
                    </button>
                    <button
                      className="remove-bike-btn"
                      onClick={() => removeBike(bike.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedBikes;
