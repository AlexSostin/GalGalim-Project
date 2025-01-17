import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import "./AdminOverview.css";

const AdminOverview = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/admin/stats/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-overview">
      <h2>Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Listings</h3>
          <p className="stat-number">{stats.totalListings}</p>
        </div>

        <div className="stat-card">
          <h3>Active Listings</h3>
          <p className="stat-number">{stats.activeListings}</p>
        </div>

        <div className="stat-card">
          <h3>Pending Review</h3>
          <p className="stat-number">{stats.pendingListings}</p>
        </div>

        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>

        <div className="stat-card">
          <h3>New Users This Month</h3>
          <p className="stat-number">{stats.newUsersThisMonth}</p>
        </div>

        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-number">{stats.totalSales}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
