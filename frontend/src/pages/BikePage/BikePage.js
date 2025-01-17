import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHeart,
  FaRegHeart,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./BikePage.css";
import { cities } from "../../constants/cities";

const BikePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const { token, isAuthenticated, user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchBike = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/bikes/${id}/`);

        if (!response.ok) {
          throw new Error("Failed to fetch bike details");
        }

        const data = await response.json();
        setBike(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBike();
  }, [id]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      const confirmLogin = window.confirm(
        "Please login to save bikes. Would you like to login now?"
      );
      if (confirmLogin) {
        navigate("/login", { state: { from: `/bikes/${id}` } });
      }
      return;
    }

    try {
      const url = isSaved
        ? `http://127.0.0.1:8000/api/saved-bikes/${id}/remove/`
        : `http://127.0.0.1:8000/api/saved-bikes/add/${id}/`;

      const response = await fetch(url, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        alert(isSaved ? "Removed from favorites" : "Added to favorites");
      }
    } catch (error) {
      console.error("Error saving bike:", error);
      alert("Failed to save bike. Please try again.");
    }
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      const confirmLogin = window.confirm(
        "Please login to contact the seller. Would you like to login now?"
      );
      if (confirmLogin) {
        navigate("/login", { state: { from: `/bikes/${id}` } });
      }
      return;
    }

    if (!bike || !bike.user) {
      console.error("Bike data is incomplete:", bike);
      alert("Cannot contact seller: Missing bike data");
      return;
    }

    if (bike.user === user.id) {
      alert("You cannot start a chat with yourself");
      return;
    }

    try {
      console.log("Full bike data:", bike);

      if (!bike.user || !bike.id) {
        throw new Error("Missing required bike data");
      }

      const chatData = {
        seller_id: bike.user,
        bike_id: bike.id,
      };

      console.log("Attempting to create chat:", chatData);

      const response = await fetch("http://127.0.0.1:8000/api/chats/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatData),
      });

      const data = await response.json();
      console.log("Server Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create chat");
      }

      console.log("Chat created successfully:", data);
      navigate(`/chats/${data.chat_id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      alert(error.message || "Failed to start chat. Please try again.");
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

  const handleImageClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!bike) return <div className="not-found">Bike not found</div>;

  return (
    <div className="bike-page">
      <div className="bike-container">
        <div className="bike-image-section">
          {bike.image ? (
            <>
              <img
                src={bike.image}
                alt={bike.name}
                className="main-image"
                onClick={handleImageClick}
              />
              <div className="bike-status">
                <span className={`status-badge ${bike.state}`}>
                  {bike.state === "new" ? "New" : "Used"}
                </span>
              </div>
              <div className="thumbnails-container">
                <img
                  src={bike.image}
                  alt={bike.name}
                  className="thumbnail active"
                />
              </div>
            </>
          ) : (
            <div className="no-image">
              <span className="no-image-icon">🚲</span>
              <p>No image available</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <img
              src={bike.image}
              alt={bike.name}
              className="modal-image"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        <div className="bike-details">
          <div className="bike-header">
            <h1 className="bike-title">{bike.name}</h1>
            {bike.model && <div className="bike-model">{bike.model}</div>}
            <div className="bike-price">
              ${bike.price}
              {bike.state === "used" && bike.condition && (
                <span className="condition-badge">{bike.condition}</span>
              )}
            </div>
          </div>

          <div className="bike-info-section info-block">
            <h2>Specifications</h2>
            <div className="specs-grid">
              <div className="specs-row">
                {bike.brand && (
                  <div className="spec-item">
                    <span className="spec-label">Brand</span>
                    <span className="spec-value">
                      {bike.brand.charAt(0).toUpperCase() + bike.brand.slice(1)}
                    </span>
                  </div>
                )}
                {bike.model && (
                  <div className="spec-item">
                    <span className="spec-label">Model</span>
                    <span className="spec-value">
                      {bike.model.charAt(0).toUpperCase() + bike.model.slice(1)}
                    </span>
                  </div>
                )}
              </div>
              <div className="specs-row">
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
              </div>
              <div className="specs-row">
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
                      {bike.color.charAt(0).toUpperCase() + bike.color.slice(1)}
                    </span>
                  </div>
                )}
              </div>
              <div className="specs-row">
                {bike.year && (
                  <div className="spec-item">
                    <span className="spec-label">Year</span>
                    <span className="spec-value">{bike.year}</span>
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
            </div>
          </div>

          <div className="bike-location info-block">
            <h2>Location</h2>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Address</span>
                <span className="spec-value">
                  <FaMapMarkerAlt />
                  {cities.find((c) => c.value === bike.city)?.label ||
                    bike.city}
                  {bike.street && `, ${bike.street}`}
                  {bike.house_number && ` ${bike.house_number}`}
                </span>
              </div>
            </div>
          </div>

          <div className="bike-description info-block">
            <h2>Description</h2>
            <p>{bike.description}</p>
          </div>

          {bike.features && (
            <div className="bike-features info-block">
              <h2>Features</h2>
              <p>{bike.features}</p>
            </div>
          )}

          <div className="bike-actions">
            {isAuthenticated ? (
              <>
                <button className="save-button" onClick={handleSave}>
                  {isSaved ? <FaHeart /> : <FaRegHeart />}
                </button>
                <button
                  className="contact-seller-button"
                  onClick={handleContactSeller}
                >
                  <FaEnvelope /> Contact Seller
                </button>
              </>
            ) : (
              <div className="auth-prompt">
                <p>
                  Please <Link to="/login">log in</Link> to save this bike or
                  contact the seller
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikePage;
