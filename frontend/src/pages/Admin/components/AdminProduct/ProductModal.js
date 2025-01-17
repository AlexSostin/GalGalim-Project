import React, { useState, useEffect } from "react";
import "./ProductModal.css";

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    product || {
      name: "",
      brand: "",
      bike_type: "mountain",
      price: "",
      description: "",
      frame_size: "",
      wheel_size: "",
      color: "",
      year: new Date().getFullYear(),
      condition: "new",
      city: "",
      street: "",
      house_number: "",
      features: "",
    }
  );

  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(product?.image || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Валидация
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (formData.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    // Создаем FormData для отправки файлов
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        submitData.append(key, formData[key]);
      }
    });

    try {
      await onSave(submitData);

      // Очищаем форму
      setFormData({
        name: "",
        brand: "",
        bike_type: "mountain",
        price: "",
        description: "",
        frame_size: "",
        wheel_size: "",
        color: "",
        condition: "new",
        city: "",
        street: "",
        house_number: "",
        features: "",
      });

      // Очищаем предпросмотр изображения
      setPreview(null);

      // Закрываем модальное окно
      onClose();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{product ? "Edit Bike" : "Add New Bike"}</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Bike Type</label>
            <select
              name="bike_type"
              value={formData.bike_type}
              onChange={handleChange}
            >
              <option value="mountain">Mountain Bike</option>
              <option value="road">Road Bike</option>
              <option value="city">City Bike</option>
              <option value="hybrid">Hybrid Bike</option>
              <option value="cruiser">Cruiser Bike</option>
              <option value="bmx">BMX Bike</option>
              <option value="electric">Electric Bike</option>
              {/* ... другие типы из вашей модели ... */}
            </select>
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Frame Size</label>
            <select
              name="frame_size"
              value={formData.frame_size}
              onChange={handleChange}
            >
              <option value="xs">XS (13-14")</option>
              <option value="s">S (15-16")</option>
              <option value="m">M (17-18")</option>
              <option value="l">L (19-20")</option>
              <option value="xl">XL (21-22")</option>
            </select>
          </div>

          <div className="form-group">
            <label>Wheel Size</label>
            <select
              name="wheel_size"
              value={formData.wheel_size}
              onChange={handleChange}
            >
              <option value="26">26"</option>
              <option value="27.5">27.5"</option>
              <option value="29">29"</option>
              <option value="700c">700c</option>
            </select>
          </div>

          <div className="form-group">
            <label>Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="needs_repair">Needs Repair</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Features</label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="location-fields">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Street</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>House Number</label>
              <input
                type="text"
                name="house_number"
                value={formData.house_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-btn">
              {product ? "Save Changes" : "Add Bike"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
