import React, { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import AdminOverview from "../AdminOverview/AdminOverview";
import AdminOrders from "../AdminOrders/AdminOrders";
import AdminProducts from "../AdminProduct/AdminProducts";
import AdminUsers from "../AdminUsers/AdminUsers";
import AdminSettings from "../AdminSettings/AdminSettings";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview />;
      case "orders":
        return <AdminOrders />;
      case "products":
        return <AdminProducts />;
      case "users":
        return <AdminUsers />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Dashboard</h2>
        <nav className="admin-nav">
          <button
            className={`admin-nav-btn ${
              activeTab === "overview" ? "active" : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`admin-nav-btn ${
              activeTab === "orders" ? "active" : ""
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`admin-nav-btn ${
              activeTab === "products" ? "active" : ""
            }`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={`admin-nav-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`admin-nav-btn ${
              activeTab === "settings" ? "active" : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </nav>
      </div>
      <div className="admin-content">{renderContent()}</div>
    </div>
  );
};

export default AdminDashboard;
