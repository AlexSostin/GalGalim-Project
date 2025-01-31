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
import PropTypes from "prop-types";

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

LoadingSpinner.propTypes = {
  size: PropTypes.string,
  color: PropTypes.string,
};

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <button onClick={() => window.location.reload()}>Try again</button>
      </div>
    );
  }

  return children;
};

const ShareButtons = ({ bike }) => {
  const shareUrl = window.location.href;

  return (
    <div className="share-buttons">
      <button
        onClick={() =>
          navigator.share({
            title: bike.name,
            text: `Check out this ${bike.name}`,
            url: shareUrl,
          })
        }
      >
        Share
      </button>
    </div>
  );
};

const BikeSpecs = ({ bike }) => {
  if (!bike) return null;

  const capitalizeValue = (value) => {
    if (typeof value !== "string") return value;
    return value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
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

  const specs = [
    { label: "Brand", value: capitalizeValue(bike.brand) },
    { label: "Model", value: capitalizeValue(bike.model) },
    { label: "Frame Size", value: getFrameSizeLabel(bike.frame_size) },
    {
      label: "Wheel Size",
      value: bike.wheel_size ? `${bike.wheel_size}"` : "",
    },
    { label: "Type", value: capitalizeValue(bike.bike_type) },
    { label: "Color", value: capitalizeValue(bike.color) },
    { label: "Year", value: bike.year },
    { label: "Condition", value: capitalizeValue(bike.condition) },
  ].filter((spec) => Boolean(spec.value));

  return specs.length ? (
    <div className="specs-grid">
      {specs.map((spec, index) => (
        <div key={index} className="spec-item">
          <span className="spec-label">{spec.label}</span>
          <span className="spec-value">{spec.value}</span>
        </div>
      ))}
    </div>
  ) : null;
};

const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const BikePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const { token, isAuthenticated, user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [similarBikes, setSimilarBikes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isContactingServer, setIsContactingServer] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    const fetchSimilarBikes = async () => {
      if (!bike) return;
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/bikes/similar/${bike.id}/`
        );
        if (response.ok && isMounted) {
          const data = await response.json();
          setSimilarBikes(data);
        }
      } catch (error) {
        console.error("Error fetching similar bikes:", error);
      }
    };

    fetchSimilarBikes();

    return () => {
      isMounted = false;
    };
  }, [bike]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isAuthenticated || !bike) return;
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/saved-bikes/check/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.is_saved);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    checkSavedStatus();
  }, [isAuthenticated, bike, id, token]);

  useEffect(() => {
    if (bike) {
      const imageUrls = new Set(); // Используем Set для уникальных URL

      // Добавляем дополнительные изображения из image_urls
      if (bike.image_urls && Array.isArray(bike.image_urls)) {
        bike.image_urls.forEach(url => {
          const fullUrl = url.startsWith("http") 
            ? url 
            : `http://127.0.0.1:8000${url}`;
          imageUrls.add(fullUrl);
        });
      }

      // Добавляем основное изображение только если его нет в image_urls
      if (bike.image) {
        const mainImageUrl = bike.image.startsWith("http")
          ? bike.image
          : `http://127.0.0.1:8000${bike.image}`;
        
        // Проверяем, нет ли уже этого URL в наборе
        if (!imageUrls.has(mainImageUrl)) {
          imageUrls.add(mainImageUrl);
        }
      }

      console.log("Setting images:", Array.from(imageUrls));
      setImages(Array.from(imageUrls));
    }
  }, [bike]);

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

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
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

  const handleImageClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    // Устанавливаем fallback изображение с абсолютным путем
    const fallbackImage = "/default-bike.png";
    if (bike && bike.image) {
      setImages((prevImages) => [fallbackImage, ...prevImages.slice(1)]);
    }
  };

  const handleThumbnailError = (event) => {
    event.target.classList.add("error");
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!bike) return <div className="not-found">Bike not found</div>;

  return (
    <ErrorBoundary>
      <div className="bike-page">
        <div className="bike-container">
          {images.length > 0 && (
            <div className="bike-image-section">
              {imageLoading && <div className="image-skeleton" />}
              <img
                src={images[activeImage]}
                alt={bike.name}
                className={`main-image ${imageLoading ? "hidden" : ""}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                onClick={handleImageClick}
                loading="lazy"
              />
              <div className="bike-status">
                <span className={`status-badge ${bike.state}`}>
                  {bike.state === "new" ? "New" : "Used"}
                </span>
              </div>
              {images.length > 1 && (
                <div className="thumbnails-container">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${bike.name} view ${index + 1}`}
                      className={`thumbnail ${
                        activeImage === index ? "active" : ""
                      }`}
                      onClick={() => setActiveImage(index)}
                      onError={handleThumbnailError}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {showModal && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="modal-close" onClick={handleCloseModal}>
                  ×
                </button>
                <img
                  src={images[activeImage] || bike.image}
                  alt={bike.name}
                  className="modal-image"
                />
                {images.length > 1 && (
                  <div className="modal-nav">
                    <button
                      onClick={() =>
                        setActiveImage((prev) =>
                          prev > 0 ? prev - 1 : images.length - 1
                        )
                      }
                    >
                      ‹
                    </button>
                    <button
                      onClick={() =>
                        setActiveImage((prev) =>
                          prev < images.length - 1 ? prev + 1 : 0
                        )
                      }
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
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
              <BikeSpecs bike={bike} />
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
              <p className="description-text">
                {capitalizeFirstLetter(bike.description)}
              </p>
            </div>

            {bike.features && (
              <div className="bike-features info-block">
                <h2>Features</h2>
                <p className="features-text">
                  {capitalizeFirstLetter(bike.features)}
                </p>
              </div>
            )}

            <div className="bike-actions">
              {isAuthenticated ? (
                <>
                  <button
                    className="save-button"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <LoadingSpinner />
                    ) : isSaved ? (
                      <FaHeart />
                    ) : (
                      <FaRegHeart />
                    )}
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
    </ErrorBoundary>
  );
};

export default BikePage;
