/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import API from "./api";
import "./App.css";

function App() {
  // ----------------------------------------------------
  // PAGE / NAVIGATION STATE
  // "login" | "register" | "products" | "addProduct" | "cart" | "orders"
  // ----------------------------------------------------
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(null);

  // ----------------------------------------------------
  // DATA STATE
  // ----------------------------------------------------
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);

  // Auth form state (used for both Login and Register forms)
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Product form state (used for Add Product form)
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });

  // ----------------------------------------------------
  // DATA FETCHING FUNCTIONS
  // ----------------------------------------------------

  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (err) {
      console.error("Error fetching cart:", err.response?.data?.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err.response?.data?.message);
    }
  };

  useEffect(() => {
    if (page === "products") fetchProducts();
    if (page === "cart" && token) fetchCart();
    if (page === "orders" && token) fetchOrders();
  }, [page]);

  // ----------------------------------------------------
  // AUTH HANDLERS
  // ----------------------------------------------------

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", form);
      setToken(res.data.token);
      alert("Registered successfully!");
      setPage("products");
    } catch (err) {
      alert(err.response?.data?.message || "Error registering");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      setToken(res.data.token);
      alert("Logged in successfully!");
      setPage("products");
    } catch (err) {
      alert(err.response?.data?.message || "Error logging in");
    }
  };

  // ----------------------------------------------------
  // PRODUCT HANDLERS
  // ----------------------------------------------------

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await API.post("/products", {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        seller: JSON.parse(atob(token.split(".")[1])).id,
      });
      alert("Product added!");
      fetchProducts();
      setPage("products");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding product");
    }
  };

  // ----------------------------------------------------
  // CART HANDLERS
  // ----------------------------------------------------

  const addToCart = async (productId) => {
    try {
      const res = await API.post(
        "/cart",
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data);
      alert("Added to cart!");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding to cart");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await API.delete(`/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error removing item");
    }
  };

  // ----------------------------------------------------
  // ORDER HANDLERS
  // ----------------------------------------------------

  const placeOrder = async () => {
    try {
      await API.post(
        "/orders",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order placed successfully!");
      fetchCart();
      fetchOrders();
      setPage("orders");
    } catch (err) {
      alert(err.response?.data?.message || "Error placing order");
    }
  };

  const cartTotal = cart
    ? cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    : 0;

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          Shop<span className="brand-accent">EZ</span>
        </div>
        <nav className="nav-pill">
          <button
            className={`nav-btn ${page === "login" ? "active" : ""}`}
            onClick={() => setPage("login")}
          >
            Login
          </button>
          <button
            className={`nav-btn ${page === "register" ? "active" : ""}`}
            onClick={() => setPage("register")}
          >
            Register
          </button>
          <button
            className={`nav-btn ${page === "products" ? "active" : ""}`}
            onClick={() => setPage("products")}
          >
            Products
          </button>
          {token && (
            <>
              <button
                className={`nav-btn ${page === "cart" ? "active" : ""}`}
                onClick={() => setPage("cart")}
              >
                Cart
              </button>
              <button
                className={`nav-btn ${page === "orders" ? "active" : ""}`}
                onClick={() => setPage("orders")}
              >
                My Orders
              </button>
              <button
                className={`nav-btn ${page === "addProduct" ? "active" : ""}`}
                onClick={() => setPage("addProduct")}
              >
                Add Product
              </button>
            </>
          )}
        </nav>
      </header>

      {page === "login" && (
        <div className="auth-page">
          <form className="auth-card" onSubmit={handleLogin}>
            <h2 className="page-title">Log in</h2>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                placeholder="••••••••"
                type="password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <button className="btn btn-primary btn-block" type="submit">
              Log in
            </button>
          </form>
        </div>
      )}

      {page === "register" && (
        <div className="auth-page">
          <form className="auth-card" onSubmit={handleRegister}>
            <h2 className="page-title">Create account</h2>
            <label className="field">
              <span>Name</span>
              <input
                placeholder="Your name"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                placeholder="••••••••"
                type="password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <button className="btn btn-primary btn-block" type="submit">
              Register
            </button>
          </form>
        </div>
      )}

      {page === "products" && (
        <div>
          <h2 className="page-title">Products</h2>
          {products.length === 0 && (
            <div className="empty-state">
              <p>No products yet.</p>
              {token && (
                <button className="btn btn-ghost" onClick={() => setPage("addProduct")}>
                  Add the first one
                </button>
              )}
            </div>
          )}
          <div className="product-grid">
            {products.map((p) => (
              <article className="product-card" key={p._id}>
                <div className="product-media">
                  <img src={p.image} alt={p.name} />
                </div>
                <div className="product-body">
                  <h3 className="product-name">{p.name}</h3>
                  <p className="product-desc">{p.description}</p>
                  <div className="product-meta">
                    <span className="price">₹{p.price}</span>
                    <span className={`stock-badge ${p.stock < 5 ? "low" : ""}`}>
                      {p.stock} in stock
                    </span>
                  </div>
                  {token && (
                    <button className="btn btn-primary btn-block" onClick={() => addToCart(p._id)}>
                      Add to Cart
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {page === "addProduct" && (
        <div>
          <h2 className="page-title">Add Product</h2>
          <form className="form-card" onSubmit={handleAddProduct}>
            <label className="field">
              <span>Name</span>
              <input
                placeholder="Product name"
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Description</span>
              <input
                placeholder="Short description"
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Price (₹)</span>
              <input
                placeholder="0"
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Category</span>
              <input
                placeholder="e.g. Electronics"
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Stock</span>
              <input
                placeholder="0"
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Image URL</span>
              <input
                placeholder="https://..."
                onChange={(e) =>
                  setProductForm({ ...productForm, image: e.target.value })
                }
              />
            </label>
            <button className="btn btn-primary btn-block" type="submit">
              Add Product
            </button>
          </form>
        </div>
      )}

      {page === "cart" && (
        <div>
          <h2 className="page-title">My Cart</h2>

          {(!cart || cart.items.length === 0) && (
            <div className="empty-state">
              <p>Your cart is empty.</p>
              <button className="btn btn-ghost" onClick={() => setPage("products")}>
                Browse products
              </button>
            </div>
          )}

          {cart && cart.items.length > 0 && (
            <div className="receipt-list">
              <div className="receipt-card">
                {cart.items.map((item) => (
                  <div className="receipt-row" key={item._id}>
                    <span className="receipt-row-name">{item.product.name}</span>
                    <span className="receipt-row-qty">×{item.quantity}</span>
                    <span className="receipt-row-price">
                      ₹{item.product.price * item.quantity}
                    </span>
                    <div className="receipt-actions">
                      <button
                        className="btn-text"
                        onClick={() => removeFromCart(item.product._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="receipt-total">
                  <span>Total</span>
                  <span className="receipt-row-price">₹{cartTotal}</span>
                </div>

                <button
                  className="btn btn-primary btn-block place-order-btn"
                  onClick={placeOrder}
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {page === "orders" && (
        <div>
          <h2 className="page-title">My Orders</h2>

          {orders.length === 0 && (
            <div className="empty-state">
              <p>No orders yet.</p>
              <button className="btn btn-ghost" onClick={() => setPage("products")}>
                Start shopping
              </button>
            </div>
          )}

          <div className="receipt-list">
            {orders.map((order) => (
              <div className="receipt-card" key={order._id}>
                <div className="receipt-header">
                  <span className="receipt-id">#{order._id}</span>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </div>

                {order.items.map((item) => (
                  <div className="receipt-row" key={item._id}>
                    <span className="receipt-row-name">{item.product.name}</span>
                    <span className="receipt-row-qty">×{item.quantity}</span>
                    <span className="receipt-row-price">₹{item.price}</span>
                  </div>
                ))}

                <div className="receipt-total">
                  <span>Total</span>
                  <span className="receipt-row-price">₹{order.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;