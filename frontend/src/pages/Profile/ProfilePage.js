import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./ProfilePage.css";
import { Link } from "react-router-dom";
import UserListings from "../UserListings/UserListings";

const ProfilePage = () => {
  const { user, isAdmin, token } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/user/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchProfileData();
    }
  }, [user, token]);

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/user/profile/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setProfileData(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) {
    return (
      <div className="profile-page">
        <div className="not-authorized">
          <h2>Please log in to view your profile</h2>
          <Link to="/login" className="login-link">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-summary">
          <h1>{profileData?.username}</h1>
          <p className="user-role">{profileData?.role}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">
                {profileData?.listings_count || 0}
              </span>
              <span className="stat-label">Listings</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profileData?.sold_count || 0}</span>
              <span className="stat-label">Sold</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Personal Info
        </button>
        <button
          className={`tab ${activeTab === "listings" ? "active" : ""}`}
          onClick={() => setActiveTab("listings")}
        >
          My Listings
        </button>
        {isAdmin && (
          <button
            className={`tab ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            Admin Panel
          </button>
        )}
      </div>

      <div className="profile-content">
        {activeTab === "info" && (
          <div className="info-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              <button
                className="edit-button"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>Username</label>
                <p>{profileData?.username}</p>
              </div>

              <div className="info-item">
                <label>Email</label>
                <p>{profileData?.email}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "listings" && <UserListings />}

        {activeTab === "admin" && isAdmin && (
          <div className="admin-section">
            <h2>Admin Panel</h2>
            {/* Добавьте компонент админ-панели */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
