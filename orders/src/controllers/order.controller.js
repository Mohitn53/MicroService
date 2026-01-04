const orderModel = require('../models/order.model');
const axios = require('axios');

// TEMP stub — replace later with RabbitMQ / Kafka
const publishToQueue = async () => Promise.resolve();

const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { shippingAddress } = req.body;

    /* 1️⃣ Validate shipping address */
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

    /* 2️⃣ Fetch cart from Cart Service */
    const cartRes = await axios.get(
      'http://localhost:3002/cart',
      {
        headers: {
          Cookie: req.headers.cookie
        }
      }
    );

    const cartItems = cartRes.data?.cart?.items;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    /* 3️⃣ Fetch products + compute totals */
    let totalAmount = 0;

    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const productRes = await axios.get(
          `http://localhost:3001/products/${item.productId}`,
          {
            headers: {
              Cookie: req.headers.cookie
            }
          }
        );

        const product = productRes.data.data;

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}`);
        }

        const itemTotal = product.price.amount * item.quantity;
        totalAmount += itemTotal;

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

    /* 4️⃣ Create order (price snapshot) */
    const order = await orderModel.create({
      user: userId,
      items: orderItems,
      status: 'PENDING',
      totalprice: {
        amount: totalAmount,
        currency: orderItems[0].price.currency
      },
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipcode: shippingAddress.pincode,
        country: shippingAddress.country
      }
    });

    /* 5️⃣ Emit event (stubbed) */
    await publishToQueue('ORDER_CREATED', order);

    /* 6️⃣ Response (test-friendly shape) */
    return res.status(201).json({
      order: {
        _id: order._id,
        user: order.user,
        status: order.status,
        items: order.items,
        totalPrice: order.totalprice, // alias for test
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

module.exports = {
  createOrder
};
