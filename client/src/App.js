import { useState, useEffect } from "react";
import API from "./api";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(null);
  const [products, setProducts] = useState([]);

  // Auth form state
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });

  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  useEffect(() => {
    if (page === "products") fetchProducts();
  }, [page]);

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

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>ShopEZ</h1>

      <nav style={{ marginBottom: "1rem" }}>
        <button onClick={() => setPage("login")}>Login</button>{" "}
        <button onClick={() => setPage("register")}>Register</button>{" "}
        <button onClick={() => setPage("products")}>Products</button>{" "}
        {token && (
          <button onClick={() => setPage("addProduct")}>Add Product</button>
        )}
      </nav>

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
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}

export default App;