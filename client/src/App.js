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
  const [cart, setCart] = useState(null);       // NEW: holds current user's cart
  const [orders, setOrders] = useState([]);     // NEW: holds current user's past orders

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

  // NEW: fetch the logged-in user's cart
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

  // NEW: fetch the logged-in user's past orders
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

  // Runs whenever the active page changes — auto-loads the data that page needs.
  // TIP: if you add a new page later that needs its own data fetch on load,
  // add another "if (page === '...')" line here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // CART HANDLERS (NEW)
  // ----------------------------------------------------

  // Adds a product to the cart. Called from the "Add to Cart" button
  // on each product card. Always adds quantity 1 — if you want a
  // quantity selector later, change the hardcoded "1" below to a
  // state value tied to an input field.
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

  // Removes a single product line from the cart entirely.
  // TIP: if you want a "decrease quantity by 1" button instead of full
  // removal, you'd need a new backend route (e.g. PATCH /api/cart) —
  // the current backend only supports add (increments) and full remove.
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
  // ORDER HANDLERS (NEW)
  // ----------------------------------------------------

  // Converts the current cart into an order. Backend clears the cart
  // automatically after this succeeds.
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

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>ShopEZ</h1>

      {/* NAVIGATION BAR
          TIP: add new nav buttons here in the same pattern if you add
          more pages (e.g. "My Profile", "Seller Dashboard", etc.) */}
      <nav style={{ marginBottom: "1rem" }}>
        <button onClick={() => setPage("login")}>Login</button>{" "}
        <button onClick={() => setPage("register")}>Register</button>{" "}
        <button onClick={() => setPage("products")}>Products</button>{" "}
        {token && (
          <>
            <button onClick={() => setPage("cart")}>Cart</button>{" "}
            <button onClick={() => setPage("orders")}>My Orders</button>{" "}
            <button onClick={() => setPage("addProduct")}>Add Product</button>
          </>
        )}
      </nav>

      {/* ---------------- LOGIN PAGE ---------------- */}
      {page === "login" && (
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <input
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <br />
          <input
            placeholder="Password"
            type="password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <br />
          <button type="submit">Login</button>
        </form>
      )}

      {/* ---------------- REGISTER PAGE ---------------- */}
      {page === "register" && (
        <form onSubmit={handleRegister}>
          <h2>Register</h2>
          <input
            placeholder="Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <br />
          <input
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <br />
          <input
            placeholder="Password"
            type="password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <br />
          <button type="submit">Register</button>
        </form>
      )}

      {/* ---------------- PRODUCTS PAGE ---------------- */}
      {page === "products" && (
        <div>
          <h2>Products</h2>
          {products.length === 0 && <p>No products yet.</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {products.map((p) => (
              <div
                key={p._id}
                style={{ border: "1px solid #ccc", padding: "1rem", width: "200px" }}
              >
                <img src={p.image} alt={p.name} width="100%" />
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p>₹{p.price}</p>
                <p>Stock: {p.stock}</p>
                {/* NEW: Add to Cart button — only shown when logged in */}
                {token && (
                  <button onClick={() => addToCart(p._id)}>Add to Cart</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- ADD PRODUCT PAGE ---------------- */}
      {page === "addProduct" && (
        <form onSubmit={handleAddProduct}>
          <h2>Add Product</h2>
          <input
            placeholder="Name"
            onChange={(e) =>
              setProductForm({ ...productForm, name: e.target.value })
            }
          />
          <br />
          <input
            placeholder="Description"
            onChange={(e) =>
              setProductForm({ ...productForm, description: e.target.value })
            }
          />
          <br />
          <input
            placeholder="Price"
            onChange={(e) =>
              setProductForm({ ...productForm, price: e.target.value })
            }
          />
          <br />
          <input
            placeholder="Category"
            onChange={(e) =>
              setProductForm({ ...productForm, category: e.target.value })
            }
          />
          <br />
          <input
            placeholder="Stock"
            onChange={(e) =>
              setProductForm({ ...productForm, stock: e.target.value })
            }
          />
          <br />
          <input
            placeholder="Image URL"
            onChange={(e) =>
              setProductForm({ ...productForm, image: e.target.value })
            }
          />
          <br />
          <button type="submit">Add Product</button>
        </form>
      )}

      {/* ---------------- CART PAGE (NEW) ---------------- */}
      {page === "cart" && (
        <div>
          <h2>My Cart</h2>
          {(!cart || cart.items.length === 0) && <p>Cart is empty.</p>}

          {cart &&
            cart.items.map((item) => (
              <div
                key={item._id}
                style={{
                  border: "1px solid #ccc",
                  padding: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                <p>
                  {item.product.name} — Qty: {item.quantity} — ₹
                  {item.product.price * item.quantity}
                </p>
                <button onClick={() => removeFromCart(item.product._id)}>
                  Remove
                </button>
              </div>
            ))}

          {cart && cart.items.length > 0 && (
            <button onClick={placeOrder} style={{ marginTop: "1rem" }}>
              Place Order
            </button>
          )}
        </div>
      )}

      {/* ---------------- ORDERS PAGE (NEW) ---------------- */}
      {page === "orders" && (
        <div>
          <h2>My Orders</h2>
          {orders.length === 0 && <p>No orders yet.</p>}

          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              <p>Order ID: {order._id}</p>
              <p>Total: ₹{order.totalAmount}</p>
              <p>Status: {order.status}</p>
              <ul>
                {order.items.map((item) => (
                  <li key={item._id}>
                    {item.product.name} × {item.quantity} — ₹{item.price}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/*
        FUTURE ADDITIONS — where to plug things in:

        1. SELLER DASHBOARD PAGE
           - Add a new page string e.g. "sellerDashboard"
           - Add a nav button (only shown if user.role === "seller")
           - Fetch products where seller === current user id
           - Add Edit/Delete buttons per product

        2. EDIT PRODUCT
           - Add an "editingProduct" state (holds product being edited or null)
           - Reuse the Add Product form, pre-filled with editingProduct's data
           - On submit, call API.put(`/products/${id}`, ...) instead of POST

        3. QUANTITY SELECTOR IN CART
           - Add a small number input next to each cart item
           - Call addToCart again with a different quantity, or add a
             new backend route to directly SET quantity instead of increment

        4. USER PROFILE / LOGOUT
           - Add a "Logout" button: setToken(null); setPage("login");
           - Optionally store token in localStorage so refresh doesn't log out
             (NOTE: skip localStorage inside Claude artifacts, but it's fine
             in your real deployed app since this isn't an artifact)

        5. ORDER STATUS UPDATES (seller side)
           - Add a PATCH /api/orders/:id route on the backend to update status
           - Add a dropdown in the seller dashboard to change "pending" ->
             "confirmed" -> "shipped" -> "delivered"
      */}
    </div>
  );
}

export default App;