import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import "./AdminOrders.css";

const AdminOrders = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { token } = useAuth();

  useEffect(() => {
    fetchListings();
  }, [token]);

  const fetchListings = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/listings/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch listings");

      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (listingId, newStatus) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/listings/${listingId}/status/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update listing status");

      fetchListings(); // Обновляем список
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading)
    return <div className="loading-spinner">Loading listings...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="admin-listings">
      <h2>Listings Management</h2>

      <div className="listings-filters">
        <input
          type="text"
          placeholder="Search by seller or title..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Listings</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="reserved">Reserved</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <div className="listings-table">
        {filteredListings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Title</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Posted Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((listing) => (
                <tr key={listing.id}>
                  <td>#{listing.id}</td>
                  <td>
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.name}
                        className="listing-thumbnail"
                        onError={(e) => {
                          console.log("Image load error:", e);
                          e.target.src = "/placeholder.png"; // Путь к placeholder изображению
                        }}
                      />
                    ) : (
                      <div className="no-image">No image</div>
                    )}
                  </td>
                  <td>{listing.title}</td>
                  <td>{listing.seller}</td>
                  <td>${listing.price}</td>
                  <td>{new Date(listing.created_at).toLocaleDateString()}</td>
                  <td>
                    <select
                      className={`status-badge ${listing.status}`}
                      value={listing.status}
                      onChange={(e) =>
                        handleStatusChange(listing.id, e.target.value)
                      }
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="reserved">Reserved</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() =>
                          (window.location.href = `/bikes/${listing.id}`)
                        }
                      >
                        View
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleStatusChange(listing.id, "archived")
                        }
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-listings">
            <p>No listings found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
