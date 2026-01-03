const cartModel = require('../models/cart.model')

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body

    // validation
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid quantity"
      })
    }

    const userId = req.user.id

    let cart = await cartModel.findOne({ user: userId })

    // create cart if not exists
    if (!cart) {
      cart = await cartModel.create({
        user: userId,
        items: [{ productId, quantity }]
      })

      return res.status(200).json({
        message: "Item added to cart"
      })
    }

    // check if product already exists
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({ productId, quantity })
    }

    await cart.save()

    return res.status(200).json({
      message: "Item added to cart"
    })

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error"
    })
  }
}


const getCart = async (req, res) => {
  const userId = req.user.id;

  const cart = await cartModel.findOne({ user: userId });

  if (!cart) {
    return res.status(200).json({
      items: []
    });
  }

  return res.status(200).json({
    items: cart.items
  });
};


module.exports = {
  addToCart,
  getCart
}
