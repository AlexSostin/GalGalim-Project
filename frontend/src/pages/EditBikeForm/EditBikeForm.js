import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import "./EditBikeForm.css";

const EditBikeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    year: "",
    price: "",
    condition: "",
    category: "",
    frame_size: "",
    wheel_size: "",
    color: "",
    description: "",
    features: "",
    city: "",
    street: "",
    house_number: "",
    images: [],
  });

  // Загрузка данных велосипеда
  useEffect(() => {
    const fetchBikeData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/api/bikes/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bike data");
        }

        const bikeData = await response.json();

        // Преобразуем данные для формы
        setFormData({
          title: bikeData.name || "",
          brand: bikeData.brand || "",
          model: bikeData.model || "",
          year: bikeData.year || "",
          price: bikeData.price || "",
          condition: bikeData.condition || "",
          category: bikeData.bike_type || "",
          frame_size: bikeData.frame_size || "",
          wheel_size: bikeData.wheel_size || "",
          color: bikeData.color || "",
          description: bikeData.description || "",
          features: bikeData.features || "",
          city: bikeData.city || "",
          street: bikeData.street || "",
          house_number: bikeData.house_number || "",
          images: [],
        });

        if (bikeData.image) {
          setImagePreview([bikeData.image]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBikeData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Добавляем все текстовые поля
      Object.keys(formData).forEach((key) => {
        if (key !== "images") {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Добавляем новое изображение, если оно есть
      if (formData.images && formData.images.length > 0) {
        formDataToSend.append("images", formData.images[0]);
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/bikes/${id}/update/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update bike");
      }

      // Перенаправляем на страницу деталей велосипеда
      navigate(`/bikes/${id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: files,
    }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = "Title is required";
    if (!formData.price) errors.price = "Price is required";
    if (!formData.description) errors.description = "Description is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="edit-bike-form-container">
      <h2>Edit Bike Listing</h2>

      <form onSubmit={handleSubmit} className="edit-bike-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="required-field">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={
                  validationErrors.title ? "form-control is-invalid" : ""
                }
              />
              {validationErrors.title && (
                <div className="invalid-feedback">{validationErrors.title}</div>
              )}
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
              <label>Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="required-field">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={
                  validationErrors.price ? "form-control is-invalid" : ""
                }
              />
              {validationErrors.price && (
                <div className="invalid-feedback">{validationErrors.price}</div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Specifications</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="road">Road Bike</option>
                <option value="mountain">Mountain Bike</option>
                <option value="hybrid">Hybrid Bike</option>
                <option value="electric">Electric Bike</option>
              </select>
            </div>

            <div className="form-group">
              <label>Frame Size</label>
              <select
                name="frame_size"
                value={formData.frame_size}
                onChange={handleChange}
              >
                <option value="">Select size</option>
                <option value="xs">XS</option>
                <option value="s">S</option>
                <option value="m">M</option>
                <option value="l">L</option>
                <option value="xl">XL</option>
              </select>
            </div>

            <div className="form-group">
              <label>Wheel Size</label>
              <input
                type="number"
                name="wheel_size"
                value={formData.wheel_size}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Description</h3>
          <div className="form-group">
            <label className="required-field">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={
                validationErrors.description ? "form-control is-invalid" : ""
              }
            />
            {validationErrors.description && (
              <div className="invalid-feedback">
                {validationErrors.description}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Features</label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Location</h3>
          <div className="form-grid">
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
        </div>

        <div className="form-section">
          <h3>Images</h3>
          <div className="form-group">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="file-input"
            />
            <div className="image-preview-container">
              {imagePreview.map((url, index) => (
                <div key={index} className="image-preview">
                  <img src={url} alt={`Preview ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBikeForm;
