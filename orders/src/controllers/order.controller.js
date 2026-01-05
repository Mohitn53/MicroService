const orderModel = require('../models/order.model');
const axios = require('axios');

// TEMP stub — replace later with RabbitMQ / Kafka
const publishToQueue = async () => Promise.resolve();

/* =========================
   CREATE ORDER
========================= */
const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { shippingAddress } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        message: 'Invalid or missing shipping address'
      });
    }

    const cartRes = await axios.get(
      'http://localhost:3002/api/cart/me',
      {
        headers: { Cookie: req.headers.cookie }
      }
    );

    const cartItems = cartRes.data?.cart?.items;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;

    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const productRes = await axios.get(
          `http://localhost:3001/products/${item.productId}`,
          { headers: { Cookie: req.headers.cookie } }
        );

        const product = productRes.data?.data || productRes.data?.product;

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}`);
        }

        totalAmount += product.price.amount * item.quantity;

        return {
          product: item.productId,
          quantity: item.quantity,
          price: {
            amount: product.price.amount,
            currency: product.price.currency
          }
        };
      })
    );

    const order = await orderModel.create({
      user: userId,
      items: orderItems,
      status: 'PENDING',
      totalprice: {
        amount: totalAmount,
        currency: orderItems[0]?.price?.currency || 'INR'
      },
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipcode: shippingAddress.pincode,
        country: shippingAddress.country
      }
    });

    await publishToQueue('ORDER_CREATED', order);

    return res.status(201).json({
      order: {
        _id: order._id,
        user: order.user,
        status: order.status,
        items: order.items,
        totalPrice: order.totalprice,
        shippingAddress: {
          street: order.shippingAddress.street,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zip: order.shippingAddress.zipcode,
          country: order.shippingAddress.country
        }
      }
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
};

/* =========================
   GET MY ORDERS
========================= */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const orders = await orderModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
};

/* =========================
   GET ORDER BY ID
========================= */
const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderUserId =
      order.user?._id?.toString() ||
      order.user?.id?.toString() ||
      order.user?.toString();

    if (orderUserId !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.status(200).json({ order });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
};

/* =========================
   CANCEL ORDER
========================= */
const cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderUserId =
      order.user?._id?.toString() ||
      order.user?.id?.toString() ||
      order.user?.toString();

    if (orderUserId !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled once ${order.status}`
      });
    }

    order.status = 'CANCELLED';
    await order.save();

    await publishToQueue('ORDER_CANCELLED', order);

    return res.status(200).json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
};

/* =========================
   UPDATE ORDER ADDRESS
========================= */
const updateOrderAddress = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { shippingAddress } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        message: 'Invalid or missing shipping address'
      });
    }

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderUserId =
      order.user?._id?.toString() ||
      order.user?.id?.toString() ||
      order.user?.toString();

    if (orderUserId !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      return res.status(400).json({
        message: `Cannot update address once order is ${order.status}`
      });
    }

    order.shippingAddress = {
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipcode: shippingAddress.pincode,
      country: shippingAddress.country
    };

    await order.save();

    return res.status(200).json({
      message: 'Shipping address updated successfully',
      order
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
};

/* =========================
   GET SELLER ORDERS
========================= */
const getSellerOrders = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const sellerId = req.user.id;

    const orders = await orderModel.find({
      'items.seller': sellerId
    });

    const filteredOrders = orders.map(order => ({
      ...order,
      items: order.items.filter(
        item => item.seller?.toString() === sellerId
      )
    }));

    return res.status(200).json({ orders: filteredOrders });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
};

/* =========================
   EXPORTS (ONLY ONCE)
========================= */
module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderAddress,
  getSellerOrders
};
