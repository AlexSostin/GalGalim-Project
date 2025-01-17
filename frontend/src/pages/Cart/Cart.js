import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  const fetchCart = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/bikes/api/cart/", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to load cart");
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemoveItem = (itemId) => {
    fetch(`http://127.0.0.1:8000/bikes/api/cart/remove/${itemId}/`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          fetchCart();
        }
      })
      .catch((error) => console.error("Error removing item:", error));
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.bike.price * item.quantity,
      0
    );
  };

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {cartItems.length > 0 ? (
        <>
          <ul className="cart-items">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="item-details">
                  <span className="item-name">{item.bike.name}</span>
                  <span className="item-quantity"> × {item.quantity}</span>
                  <span className="item-price"> - ${item.bike.price}</span>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="remove-button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <span className="total-amount">Total: ${calculateTotal()}</span>
            <button className="checkout-button">Proceed to Checkout</button>
          </div>
        </>
      ) : (
        <div className="cart-empty">
          <p>Your cart is empty</p>
          <Link to="/bikes" className="continue-shopping">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
