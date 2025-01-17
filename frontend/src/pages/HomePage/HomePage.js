import React from "react";
import { Link } from "react-router-dom";
import BikeList from "../../components/BikeList/BikeList";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Perfect Bike</h1>
          <p className="hero-text">
            Buy and sell bikes with confidence in our secure marketplace
          </p>
          <div className="hero-actions">
            <Link to="/bikes" className="btn btn-primary">
              Browse Bikes
            </Link>
            <Link to="/add-bike" className="btn btn-secondary">
              Sell Your Bike
            </Link>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-content">
          <div className="section-header">
            <h2>Featured Bikes</h2>
            <Link to="/bikes" className="view-all">
              View All
            </Link>
          </div>
          <BikeList />
        </div>
      </section>

      <section className="benefits-section">
        <div className="container-content">
          <h2>Why Choose Us</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Secure Transactions</h3>
              <p>Safe and secure platform for buyers and sellers</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">👥</div>
              <h3>Verified Users</h3>
              <p>All sellers are verified for your peace of mind</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💬</div>
              <h3>Direct Communication</h3>
              <p>Chat directly with sellers</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
