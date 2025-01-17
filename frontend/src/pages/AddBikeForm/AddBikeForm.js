import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./AddBikeForm.css";
import { useNavigate } from "react-router-dom";

const AddBikeForm = () => {
  const navigate = useNavigate();

  // Переименуем locations в cities
  const cities = [
    { value: "acre", label: "Acre (עכו)" },
    { value: "afula", label: "Afula (עפולה)" },
    { value: "ashdod", label: "Ashdod (אשדוד)" },
    { value: "ashkelon", label: "Ashkelon (אשקלון)" },
    { value: "bat_yam", label: "Bat Yam (בת ים)" },
    { value: "beer_sheva", label: "Be'er Sheva (באר שבע)" },
    { value: "bnei_brak", label: "Bnei Brak (בני ברק)" },
    { value: "carmiel", label: "Carmiel (כרמיאל)" },
    { value: "dimona", label: "Dimona (דימונה)" },
    { value: "eilat", label: "Eilat (אילת)" },
    { value: "givataim", label: "Givataim (גבעתיים)" },
    { value: "hadera", label: "Hadera (חדרה)" },
    { value: "haifa", label: "Haifa (חיפה)" },
    { value: "herzliya", label: "Herzliya (הרצליה)" },
    { value: "hod_hasharon", label: "Hod HaSharon (הוד השרון)" },
    { value: "holon", label: "Holon (חולון)" },
    { value: "jerusalem", label: "Jerusalem (ירושלים)" },
    { value: "kfar_saba", label: "Kfar Saba (כפר סבא)" },
    { value: "kiryat_ata", label: "Kiryat Ata (קרית אתא)" },
    { value: "kiryat_bialik", label: "Kiryat Bialik (קרית ביאליק)" },
    { value: "kiryat_gat", label: "Kiryat Gat (קרית גת)" },
    { value: "kiryat_motzkin", label: "Kiryat Motzkin (קרית מוצקין)" },
    { value: "kiryat_yam", label: "Kiryat Yam (קרית ים)" },
    { value: "lod", label: "Lod (לוד)" },
    { value: "modiin", label: "Modi'in (מודיעין)" },
    { value: "nahariya", label: "Nahariya (נהריה)" },
    { value: "nazareth", label: "Nazareth (נצרת)" },
    { value: "netanya", label: "Netanya (נתניה)" },
    { value: "or_yehuda", label: "Or Yehuda (אור יהודה)" },
    { value: "petah_tikva", label: "Petah Tikva (פתח תקווה)" },
    { value: "raanana", label: "Ra'anana (רעננה)" },
    { value: "ramat_gan", label: "Ramat Gan (רמת גן)" },
    { value: "ramat_hasharon", label: "Ramat HaSharon (רמת השרון)" },
    { value: "ramla", label: "Ramla (רמלה)" },
    { value: "rehovot", label: "Rehovot (רחובות)" },
    { value: "rishon_lezion", label: "Rishon LeZion (ראשון לציון)" },
    { value: "sderot", label: "Sderot (שדרות)" },
    { value: "tel_aviv", label: "Tel Aviv (תל אביב)" },
    { value: "tiberias", label: "Tiberias (טבריה)" },
    { value: "yavne", label: "Yavne (יבנה)" },
  ];

  const wheel_size = [
    { value: "26", label: "26 inch" },
    { value: "27.5", label: "27.5 inch" },
    { value: "29", label: "29 inch" },
    { value: "700c", label: "700c (Road Bike)" },
    { value: "20", label: "20 inch (BMX)" },
    { value: "other", label: "Other" },
  ];

  const frame_size = [
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" },
    { value: "xxl", label: "XXL" },
  ];

  const colors = [
    { value: "black", label: "Black" },
    { value: "white", label: "White" },
    { value: "red", label: "Red" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "yellow", label: "Yellow" },
    { value: "silver", label: "Silver" },
    { value: "other", label: "Other" },
  ];

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("bikeFormData");
    return savedData
      ? JSON.parse(savedData)
      : {
          title: "",
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          price: "",
          condition: "new",
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
        };
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem("bikeFormData", JSON.stringify(formData));

    // Очищаем URL объекты при размонтировании компонента
    return () => {
      imagePreview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData, imagePreview]);

  const conditions = [
    { value: "new", label: "New" },
    { value: "like_new", label: "Like New" },
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "needs_repair", label: "Needs Repair" },
  ];

  const categories = [
    { value: "mountain", label: "Mountain Bike" },
    { value: "road", label: "Road Bike" },
    { value: "city", label: "City Bike" },
    { value: "bmx", label: "BMX" },
    { value: "electric", label: "Electric Bike" },
  ];

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

    // Очищаем старые URL перед созданием новых
    imagePreview.forEach((url) => URL.revokeObjectURL(url));

    setFormData((prev) => ({
      ...prev,
      images: files,
    }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const validateForm = () => {
    const errors = {};

    // Проверяем обязательные поля
    if (!formData.title) errors.title = "Title is required";
    if (!formData.brand) errors.brand = "Brand is required";
    if (!formData.price) errors.price = "Price is required";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.description) errors.description = "Description is required";

    // Проверка цены на положительное число
    if (formData.price && formData.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      console.log("Validation failed:", validationErrors);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.title);
      formDataToSend.append("bike_type", formData.category);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("model", formData.model);
      formDataToSend.append("year", formData.year);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("frame_size", formData.frame_size);
      formDataToSend.append("wheel_size", formData.wheel_size);
      formDataToSend.append("color", formData.color);
      formDataToSend.append("features", formData.features);

      // Отправляем все изображения
      if (formData.images && formData.images.length > 0) {
        formDataToSend.append("image", formData.images[0]); // основное изображение
        // Затем отправляем все изображения в массив images
        formData.images.forEach((image) => {
          formDataToSend.append("images", image);
        });
      }

      console.log("Sending data to server:", {
        url: "http://127.0.0.1:8000/api/bikes/create/",
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        formData: Object.fromEntries(formDataToSend.entries()),
      });

      const response = await fetch("http://127.0.0.1:8000/api/bikes/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add bike");
      }

      const data = await response.json();
      console.log("Success response:", data);

      // Добавляем здесь очистку формы
      const initialState = {
        title: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        price: "",
        condition: "new",
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
      };

      localStorage.removeItem("bikeFormData");
      setFormData(initialState);
      setImagePreview([]);
      setValidationErrors({});
      setError("");

      alert("Bike added successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.message || "Failed to add bike");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Добавляем CSS для отображения ошибок
  const getInputClassName = (fieldName) => {
    return `form-control ${validationErrors[fieldName] ? "is-invalid" : ""}`;
  };

  return (
    <div className="add-bike-form-container">
      <div className="form-header">
        <h2>Add Bike for Sale</h2>
        <p>Fill in the information about your bike</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="add-bike-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Listing Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={getInputClassName("title")}
                required
                placeholder="e.g., Giant Trance X 29 2022"
              />
              {validationErrors.title && (
                <div className="invalid-feedback">{validationErrors.title}</div>
              )}
            </div>

            <div className="form-group">
              <label>Brand*</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={getInputClassName("brand")}
                required
                placeholder="e.g., Trek, Specialized, Giant"
              />
              {validationErrors.brand && (
                <div className="invalid-feedback">{validationErrors.brand}</div>
              )}
            </div>

            <div className="form-group">
              <label>Model*</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={getInputClassName("model")}
                required
                placeholder="e.g., Fuel EX 8"
              />
              {validationErrors.model && (
                <div className="invalid-feedback">{validationErrors.model}</div>
              )}
            </div>

            <div className="form-group">
              <label>Year*</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={getInputClassName("year")}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {validationErrors.year && (
                <div className="invalid-feedback">{validationErrors.year}</div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Specifications</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Category*</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={getInputClassName("category")}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {validationErrors.category && (
                <div className="invalid-feedback">
                  {validationErrors.category}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Condition*</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className={getInputClassName("condition")}
                required
              >
                <option value="">Select condition</option>
                {conditions.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
              {validationErrors.condition && (
                <div className="invalid-feedback">
                  {validationErrors.condition}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Frame Size</label>
              <select
                name="frame_size"
                value={formData.frame_size}
                onChange={handleChange}
              >
                <option value="">Select frame size</option>
                {frame_size.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Wheel Size</label>
              <select
                name="wheel_size"
                value={formData.wheel_size}
                onChange={handleChange}
              >
                <option value="">Select wheel size</option>
                {wheel_size.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Color</label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
              >
                <option value="">Select color</option>
                {colors.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Price and Location</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Price ($)*</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="Enter price"
              />
            </div>

            <div className="form-group">
              <label>City*</label>
              <Select
                name="city"
                value={cities.find((city) => city.value === formData.city)}
                onChange={(option, action) =>
                  handleSelectChange(option, { name: "city" })
                }
                options={cities}
                isClearable
                isSearchable
                placeholder="Select city"
                required
              />
            </div>

            <div className="form-group">
              <label>Street</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Enter street"
              />
            </div>

            <div className="form-group">
              <label>House Number</label>
              <input
                type="text"
                name="house_number"
                value={formData.house_number}
                onChange={handleChange}
                placeholder="Enter house number"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Description</h3>
          <div className="form-group">
            <label>Bike Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe your bike, its features, and history"
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Features and Equipment</label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="List additional equipment, upgrades, accessories included"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Photos</h3>
          <div className="form-group">
            <label>Upload Photos (up to 5)</label>
            <input
              type="file"
              onChange={handleImageChange}
              multiple
              accept="image/*"
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
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Bike"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBikeForm;
