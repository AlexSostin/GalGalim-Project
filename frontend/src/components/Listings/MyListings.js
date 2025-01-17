import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./MyListings.css";

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [token]);

  const fetchListings = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/my-bikes/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();
      setListings(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setError("Failed to load your listings");
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
        const response = await fetch(`http://127.0.0.1:8000/api/bikes/${id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete listing");
        }

        setListings(listings.filter((listing) => listing.id !== id));
      } catch (error) {
        console.error("Error deleting listing:", error);
        alert("Failed to delete listing");
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (listings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🚫</div>
        <h2>No listings yet</h2>
        <p>Start selling your bikes by creating a new listing!</p>
        <Link to="/create-listing" className="btn btn-primary">
          Create Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="my-listings">
      <div className="listings-header">
        <h1>My Listings</h1>
        <Link to="/create-listing" className="btn btn-primary">
          + Add New Listing
        </Link>
      </div>
      <div className="listings-container">
        {listings.map((bike) => (
          <div key={bike.id} className="listing-card">
            <div className="listing-image">
              {bike.image ? (
                <img
                  src={bike.image}
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
              <h2>{bike.name}</h2>
              <p className="price">${bike.price}</p>
              <p className="description">
                {bike.description || "No description provided"}
              </p>
              <div className="status">
                Status:{" "}
                <span className={bike.is_active ? "active" : "inactive"}>
                  {bike.is_active ? "Active" : "Inactive"}
                </span>
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
