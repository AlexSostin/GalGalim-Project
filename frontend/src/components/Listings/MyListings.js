import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./MyListings.css";

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

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchListings();
  }, [token, isAuthenticated, navigate]);

  const fetchListings = async () => {
    if (!token) {
      setError("Authentication required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/listings/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          throw new Error("Please login to view your listings");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched listings:", data);
      setListings(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setError(error.message || "Failed to load your listings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/bikes/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/bikes/${id}/delete/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setListings(listings.filter((listing) => listing.id !== id));
      } catch (error) {
        console.error("Error deleting listing:", error);
        alert(error.message || "Failed to delete listing");
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button
          onClick={fetchListings}
          className="btn btn-primary"
          style={{ marginLeft: "10px" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🚫</div>
        <h2>No listings yet</h2>
        <p>Start selling your bikes by creating a new listing!</p>
        <Link to="/add-bike" className="btn btn-primary">
          Create Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="my-listings">
      <div className="listings-header">
        <h1>My Listings</h1>
        <Link to="/add-bike" className="btn btn-primary">
          + Add New Listing
        </Link>
      </div>
      <div className="listings-container">
        {listings.map((bike) => (
          <div key={bike.id} className="listing-card">
            <div className="listing-image">
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
                  }}
                />
              ) : (
                <div className="no-image">No image available</div>
              )}
            </div>
            <div className="listing-details">
              <h2 className="bike-name">{bike.name}</h2>
              <p className="bike-price">${bike.price}</p>

              <div className="bike-specs">
                {bike.brand && (
                  <p className="bike-spec">
                    <span className="spec-label">Brand</span>
                    <span className="spec-value">
                      {bike.brand.charAt(0).toUpperCase() +
                        bike.brand.slice(1).toLowerCase()}
                    </span>
                  </p>
                )}
                {bike.model && (
                  <p className="bike-spec">
                    <span className="spec-label">Model</span>
                    <span className="spec-value">
                      {bike.model.charAt(0).toUpperCase() +
                        bike.model.slice(1).toLowerCase()}
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

              <div className="status">
                Status: <span className={bike.status}>{bike.status}</span>
              </div>

              <div className="actions">
                <button
                  className="btn btn-edit"
                  onClick={() => handleEdit(bike.id)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => handleDelete(bike.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyListings;
