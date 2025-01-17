import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AddBikePage.css";

const AddBikePage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    bike_type: "",
    price: "",
    description: "",
    frame_material: "",
    frame_size: "",
    wheel_size: "",
    brake_type: "",
    suspension: "",
    gears: "",
    weight: "",
    condition: "new",
    additional_specs: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const bikeBrands = [
    "Trek",
    "Specialized",
    "Giant",
    "Cannondale",
    "Scott",
    "Merida",
    "GT",
    "Cube",
    "Canyon",
    "Santa Cruz",
    "Kona",
    "Orbea",
    "Bianchi",
    "Cervélo",
    "Ghost",
    "Focus",
    "Marin",
    "Norco",
    "Fuji",
    "BMC",
    "Other",
  ];

  const bikeTypes = {
    road: {
      label: "Road Bikes",
      types: [
        { value: "road_race", label: "Race Road Bike" },
        { value: "road_endurance", label: "Endurance Road Bike" },
        { value: "gravel", label: "Gravel Bike" },
        { value: "cyclocross", label: "Cyclocross Bike" },
        { value: "touring", label: "Touring Bike" },
      ],
    },
    mountain: {
      label: "Mountain Bikes",
      types: [
        { value: "mtb_xc", label: "Cross-Country (XC)" },
        { value: "mtb_trail", label: "Trail Bike" },
        { value: "mtb_enduro", label: "Enduro Bike" },
        { value: "mtb_downhill", label: "Downhill Bike" },
        { value: "mtb_dirt", label: "Dirt Jump Bike" },
      ],
    },
    urban: {
      label: "Urban Bikes",
      types: [
        { value: "city", label: "City Bike" },
        { value: "hybrid", label: "Hybrid Bike" },
        { value: "cruiser", label: "Cruiser" },
        { value: "folding", label: "Folding Bike" },
        { value: "commuter", label: "Commuter Bike" },
      ],
    },
    special: {
      label: "Special Bikes",
      types: [
        { value: "bmx", label: "BMX" },
        { value: "kids", label: "Kids Bike" },
        { value: "electric", label: "Electric Bike" },
        { value: "fat_bike", label: "Fat Bike" },
        { value: "cargo", label: "Cargo Bike" },
      ],
    },
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!isAdmin) {
      navigate("/access-denied");
    } else {
      fetchCategories();
    }
  }, [user, isAdmin, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/categories/");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError("Failed to load categories");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "brand" && value === "Other") {
      setShowCustomBrand(true);
    } else if (name === "brand") {
      setShowCustomBrand(false);
    }
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
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          data.append(key, value);
        }
      });

      const response = await fetch("http://127.0.0.1:8000/api/add-bike/", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
      });

      if (response.ok) {
        setFormData({
          brand: "",
          model: "",
          bike_type: "",
          price: "",
          description: "",
          frame_material: "",
          frame_size: "",
          wheel_size: "",
          brake_type: "",
          suspension: "",
          gears: "",
          weight: "",
          condition: "new",
          additional_specs: "",
          image: null,
        });

        setImagePreview(null);

        setError("Bike added successfully!");

        navigate("/admin/products");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to add bike");
      }
    } catch (error) {
      setError("Error adding bike");
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="add-bike-page">
      <div className="add-bike-container">
        <h2>Add Your Bike for Sale</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="add-bike-form">
          <div className="form-group">
            <label>Brand</label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
            >
              <option value="">Select Brand</option>
              {bikeBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            {showCustomBrand && (
              <input
                type="text"
                name="brand"
                value={formData.brand === "Other" ? "" : formData.brand}
                onChange={handleChange}
                placeholder="Enter custom brand"
                className="custom-brand-input"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label>Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              placeholder="Enter bike model (e.g., Fuel EX 8, Stumpjumper, Trance)"
            />
          </div>

          <div className="form-group">
            <label>Bike Type</label>
            <select
              name="bike_type"
              value={formData.bike_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Bike Type</option>
              {Object.entries(bikeTypes).map(([category, { label, types }]) => (
                <optgroup key={category} label={label}>
                  {types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Frame Material</label>
            <select
              name="frame_material"
              value={formData.frame_material}
              onChange={handleChange}
              required
            >
              <option value="">Select Frame Material</option>
              <option value="aluminum">Aluminum</option>
              <option value="carbon">Carbon Fiber</option>
              <option value="steel">Steel</option>
              <option value="titanium">Titanium</option>
              <option value="chromoly">Chromoly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Frame Size</label>
            <select
              name="frame_size"
              value={formData.frame_size}
              onChange={handleChange}
              required
            >
              <option value="">Select Frame Size</option>
              <optgroup label="Numeric Sizes">
                <option value="13">13" (XS)</option>
                <option value="15">15" (S)</option>
                <option value="17">17" (M)</option>
                <option value="19">19" (L)</option>
                <option value="21">21" (XL)</option>
                <option value="23">23" (XXL)</option>
              </optgroup>
              <optgroup label="Letter Sizes">
                <option value="xs">XS</option>
                <option value="s">S</option>
                <option value="m">M</option>
                <option value="l">L</option>
                <option value="xl">XL</option>
                <option value="xxl">XXL</option>
              </optgroup>
              <optgroup label="Road Bike Sizes">
                <option value="48">48cm</option>
                <option value="50">50cm</option>
                <option value="52">52cm</option>
                <option value="54">54cm</option>
                <option value="56">56cm</option>
                <option value="58">58cm</option>
                <option value="60">60cm</option>
                <option value="62">62cm</option>
              </optgroup>
            </select>
          </div>

          <div className="form-group">
            <label>Wheel Size</label>
            <select
              name="wheel_size"
              value={formData.wheel_size}
              onChange={handleChange}
              required
            >
              <option value="">Select Wheel Size</option>
              <option value="12">12" (Kids)</option>
              <option value="16">16" (Kids)</option>
              <option value="20">20" (BMX/Kids)</option>
              <option value="24">24" (Junior/Small MTB)</option>
              <option value="26">26" (Classic MTB)</option>
              <option value="27.5">27.5" (650b MTB)</option>
              <option value="29">29" (MTB)</option>
              <option value="700c">700c (Road/Gravel)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Brake Type</label>
            <select
              name="brake_type"
              value={formData.brake_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Brake Type</option>
              <option value="disc_hydraulic">Hydraulic Disc</option>
              <option value="disc_mechanical">Mechanical Disc</option>
              <option value="rim">Rim Brakes</option>
              <option value="v_brake">V-Brakes</option>
            </select>
          </div>

          <div className="form-group">
            <label>Suspension</label>
            <select
              name="suspension"
              value={formData.suspension}
              onChange={handleChange}
            >
              <option value="">Select Suspension Type</option>
              <option value="none">No Suspension</option>
              <option value="front">Front Suspension</option>
              <option value="full">Full Suspension</option>
            </select>
          </div>

          <div className="form-group">
            <label>Number of Gears</label>
            <input
              type="number"
              name="gears"
              value={formData.gears}
              onChange={handleChange}
              placeholder="e.g., 21"
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              step="0.1"
              placeholder="e.g., 12.5"
            />
          </div>

          <div className="form-group">
            <label>Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
            >
              <option value="">Select Condition</option>
              <option value="new">New</option>
              <option value="like_new">Like New (Used few times)</option>
              <option value="excellent">Excellent (Minor wear)</option>
              <option value="good">Good (Normal wear)</option>
              <option value="fair">Fair (Visible wear)</option>
              <option value="needs_repair">Needs Repair</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter price"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe your bike's features, history, and any special characteristics"
            />
          </div>

          <div className="form-group">
            <label>Additional Specifications</label>
            <textarea
              name="additional_specs"
              value={formData.additional_specs}
              onChange={handleChange}
              placeholder="Any additional details (upgrades, modifications, accessories included)"
            />
          </div>

          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Add Bike
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBikePage;
