import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";
import { AuthContext } from "../../context/AuthContext";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleMenuItemClick = () => {
    closeMenu();
    setIsDropdownOpen(false);
  };
  const closeModal = () => {
    setModalContent(null);
  };

  const userMenuItems = [
    // ...
    {
      label: "Logout",
      path: "/logout",
      onClick: () => {
        logout();
        closeMenu();
      },
    },
  ];

  const categories = [
    { id: "mountain", name: "Mountain Bike" },
    { id: "road", name: "Road Bike" },
    { id: "city", name: "City Bike" },
    { id: "hybrid", name: "Hybrid Bike" },
    { id: "cruiser", name: "Cruiser Bike" },
    { id: "bmx", name: "BMX Bike" },
    { id: "electric", name: "Electric Bike" },
    { id: "folding", name: "Folding Bike" },
    { id: "touring", name: "Touring Bike" },
    { id: "gravel", name: "Gravel Bike" },
    { id: "cyclocross", name: "Cyclocross Bike" },
    { id: "kids", name: "Kids Bike" },
    { id: "fat", name: "Fat Bike" },
    { id: "track", name: "Track/Fixed Gear" },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    try {
      navigate(`/bikes?search=${encodeURIComponent(query)}`);
      setSearchQuery("");
      if (isMenuOpen) closeMenu();
    } catch (error) {
      console.error("Error searching bikes:", error);
      // Добавить уведомление пользователю об ошибке
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderAuthButtons = () => (
    <div className="nav-item auth-buttons">
      <Link
        to="/login"
        className="nav-link login-button"
        onClick={handleMenuItemClick}
      >
        Login
      </Link>
      <Link
        to="/register"
        className="nav-link register-button"
        onClick={handleMenuItemClick}
      >
        Register
      </Link>
    </div>
  );

  return (
    <>
      <header className={`header ${isMenuOpen ? "menu-open" : ""}`}>
        <div className="header-container">
          <Link to="/" className="logo" onClick={closeMenu}>
            GalGalim
          </Link>

          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bikes by brand, model, or location..."
                className="search-input"
              />
              <button
                type="submit"
                className="search-button"
                aria-label="Search"
              >
                🔍
              </button>
            </form>
          </div>

          <nav
            className={`nav-menu ${isMenuOpen ? "active" : ""}`}
            role="navigation"
          >
            <div className="nav-item">
              <Link to="/" className="nav-link" onClick={handleMenuItemClick}>
                Home
              </Link>
            </div>

            <div className="nav-item">
              <Link
                to="/bikes"
                className="nav-link"
                onClick={handleMenuItemClick}
              >
                Browse Bikes
              </Link>
            </div>

            {isAuthenticated ? (
              <>
                <div className="nav-item">
                  <Link
                    to="/add-bike"
                    className="nav-link add-listing"
                    onClick={handleMenuItemClick}
                  >
                    + Add Listing
                  </Link>
                </div>

                <div
                  className={`nav-item dropdown ${
                    isDropdownOpen ? "active" : ""
                  }`}
                >
                  <span
                    className="nav-link"
                    onClick={toggleDropdown}
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                  >
                    Account
                  </span>
                  <div
                    className={`dropdown-content ${
                      isDropdownOpen ? "show" : ""
                    }`}
                    role="menu"
                  >
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="dropdown-item"
                        onClick={handleMenuItemClick}
                        role="menuitem"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={handleMenuItemClick}
                      role="menuitem"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/my-listings"
                      className="dropdown-item"
                      onClick={handleMenuItemClick}
                      role="menuitem"
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/saved-bikes"
                      className="dropdown-item"
                      onClick={handleMenuItemClick}
                      role="menuitem"
                    >
                      Saved Bikes
                    </Link>
                    <Link
                      to="/messages"
                      className="dropdown-item"
                      onClick={handleMenuItemClick}
                      role="menuitem"
                    >
                      Messages
                    </Link>
                    <div className="dropdown-divider"></div>
                    <Link
                      to="/settings"
                      className="dropdown-item"
                      onClick={handleMenuItemClick}
                      role="menuitem"
                    >
                      Settings
                    </Link>
                    <button
                      className="dropdown-item logout-button"
                      onClick={() => {
                        handleLogout();
                        handleMenuItemClick();
                      }}
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              renderAuthButtons()
            )}
          </nav>

          <button
            className="mobile-menu-button"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {modalContent &&
        ReactDOM.createPortal(
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
              {modalContent}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

Header.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool,
  logout: PropTypes.func.isRequired,
};

export default Header;
