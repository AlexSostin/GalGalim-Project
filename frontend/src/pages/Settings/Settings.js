import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Settings.css";

const Settings = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || "",
    notifications: true,
    language: "en",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Загружаем текущие настройки при монтировании
  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/user/settings/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch settings");

      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/user/settings/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update settings");
      }

      const data = await response.json();
      setMessage(data.message || "Settings updated successfully!");

      // Обновляем форму новыми данными
      if (data.settings) {
        setFormData(data.settings);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="settings-page">Loading...</div>;

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h2>User Settings</h2>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="settings-section">
            <h3>Profile Settings</h3>
            <div className="setting-item">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="settings-section">
            <h3>Preferences</h3>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: e.target.checked,
                    })
                  }
                />
                Receive Email Notifications
              </label>
            </div>
            <div className="setting-item">
              <label>Language</label>
              <select
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
              >
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>
          </div>

          <div className="settings-actions">
            <button type="submit" className="save-btn">
              Save Changes
            </button>
            <button type="button" className="reset-btn" onClick={fetchSettings}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
