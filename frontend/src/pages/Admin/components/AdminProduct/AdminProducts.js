import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AdminProducts.css";
import ProductModal from "./ProductModal";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState(null);

  // Проверка прав доступа
  useEffect(() => {
    console.log("Token:", token);
    console.log("User:", user);
    console.log("User role:", user?.role);

    if (!token) {
      console.log("No token found");
      navigate("/access-denied");
      return;
    }

    if (!user) {
      console.log("No user found");
      navigate("/access-denied");
      return;
    }

    if (user.role !== "admin") {
      console.log("User is not admin. Current role:", user.role);
      navigate("/access-denied");
      return;
    }
  }, [token, user, navigate]);

  // Загрузка продуктов
  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/bikes/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Добавление нового продукта
  const handleAddProduct = async (productData) => {
    try {
      const formData = new FormData();

      Object.keys(productData).forEach((key) => {
        if (key !== "image") {
          formData.append(key, productData[key]);
        }
      });

      if (productData.image) {
        formData.append("images", productData.image);
      }

      const response = await fetch("http://127.0.0.1:8000/api/add-bike/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      // Дожидаемся ответа от сервера
      const result = await response.json();

      // Обновляем список
      await fetchProducts();

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Удаление продукта
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/bikes/${productId}/delete/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete listing");
        }

        await fetchProducts();
        setMessage && setMessage("Listing deleted successfully!");
      } catch (err) {
        setError("Failed to delete listing");
        console.error(err);
      }
    }
  };

  // Редактирование продукта
  const handleEditProduct = async (productId, updatedData) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/products/${productId}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error("Failed to update product");

      fetchProducts(); // Обновляем список после редактирования
    } catch (err) {
      setError(err.message);
    }
  };

  // Фильтрация продуктов
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.bike_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product = null) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setModalOpen(false);
  };

  const handleSaveProduct = async (formData) => {
    try {
      if (selectedProduct) {
        await handleEditProduct(selectedProduct.id, formData);
        handleCloseModal();
      } else {
        const success = await handleAddProduct(formData);
        if (success) {
          // Обновляем список
          await fetchProducts();
          // Закрываем модальное окно
          handleCloseModal();
          // Очищаем выбранный продукт
          setSelectedProduct(null);
          // Показываем сообщение об успехе (если есть)
          setMessage && setMessage("Product added successfully!");
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="admin-products">
      <h2>Product Management</h2>

      <div className="products-actions">
        <button className="add-product-btn" onClick={() => handleOpenModal()}>
          + Add New Product
        </button>
        <div className="products-filters">
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="mountain">Mountain Bikes</option>
            <option value="road">Road Bikes</option>
            <option value="city">City Bikes</option>
          </select>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                "🚲"
              )}
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="category">{product.category}</p>
              <p className="price">${product.price}</p>
              <p>Owner: {product.user?.username || "Unknown"}</p>
              <p
                className={`status ${
                  product.status === "active" ? "active" : ""
                }`}
              >
                Status: {product.status || "Active"}
              </p>
            </div>
            <div className="product-actions">
              <button
                className="edit-btn"
                onClick={() => handleOpenModal(product)}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteProduct(product.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default AdminProducts;
