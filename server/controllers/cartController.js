const Cart = require("../models/Cart");

// Get logged-in user's cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId }).populate("items.product");
    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [] });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [{ product: productId, quantity }] });
    } else {
      const existingItem = cart.items.find((item) => item.product.toString() === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
    }

    const populatedCart = await cart.populate("items.product");
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    const populatedCart = await cart.populate("items.product");
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart };