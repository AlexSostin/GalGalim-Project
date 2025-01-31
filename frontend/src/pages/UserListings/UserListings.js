import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./UserListings.css";

const UserListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [token]);

  const fetchListings = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/listings/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bikeId) => {
    navigate(`/bikes/${bikeId}/edit`);
  };

  const handleDelete = async (bikeId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/bikes/${bikeId}/delete/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete listing");
        }

        await fetchListings();
      } catch (err) {
        console.error("Error deleting listing:", err);
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="user-listings">
      <div className="listings-header">
        <h2>My Listings</h2>
        <button
          className="add-listing-btn"
          onClick={() => navigate("/add-bike")}
        >
          Add New Listing
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚲</div>
          <p>You have no listings. Add one now!</p>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing.id} className="listing-card">
              <img
                src={listing.image || "/placeholder.png"}
                alt={listing.title}
                className="listing-image"
              />
              <div className="listing-info">
                <h3>{listing.title}</h3>
                <p>{listing.description}</p>
                <span
                  className={`status-badge ${
                    listing.status === "active" ? "active" : "inactive"
                  }`}
                >
                  {listing.status}
                </span>
                <div className="listing-actions">
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/bikes/${listing.id}`)}
                  >
                    View
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(listing.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(listing.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserListings;
