const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Place order from cart
const placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      totalAmount,
    });

    // Clear the cart after placing order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate("items.product");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { placeOrder, getMyOrders };