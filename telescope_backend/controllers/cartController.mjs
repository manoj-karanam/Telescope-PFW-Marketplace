// controllers/cartController.js
import CartItem from '../models/Cart.mjs';
import mongoose from 'mongoose';
import Product from '../models/Product.mjs'; 


// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productIds } = req.body;

    // Check if productIds is an array of valid strings
    if (!Array.isArray(productIds) || !productIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: 'Invalid product IDs' });
    }

    // Check if there's an existing cart item for the user
    const existingCartItem = await CartItem.findOne();

    if (existingCartItem) {
      // If cart item exists, append productIds to the existing list
      existingCartItem.productIds = [...existingCartItem.productIds, ...productIds];
      await existingCartItem.save();
      res.json(existingCartItem);
    } else {
      // If no cart item exists, create a new one
      const newCartItem = await CartItem.create({ productIds });
      res.json(newCartItem);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const getCart = async (req, res) => {
  try {
    // Fetch all cart items from the collection
    const allCartItems = await CartItem.find();

    // Check if there are no cart items
    if (!allCartItems || allCartItems.length === 0) {
      return res.json([]); // If no cart items, return an empty array
    }

    // Extract all product IDs from all cart items
    const allProductIds = allCartItems.reduce((ids, cartItem) => {
      return ids.concat(cartItem.productIds || []);
    }, []);

    // Check if there are no product IDs
    if (allProductIds.length === 0) {
      return res.json([]); // If no product IDs, return an empty array
    }

    // Fetch product details based on all product IDs
    const products = await Product.find({ _id: { $in: allProductIds } });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Remove product from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Assuming CartItem.findOneAndUpdate is available in your model
    await CartItem.findOneAndUpdate({}, { $pull: { productIds: productId } });

    res.json({ message: 'Product removed from cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete all cart items
const deleteAllCartItems = async (req, res) => {
  try {
    await CartItem.deleteMany({});
    res.json({ message: 'All cart items deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default {
  addToCart,getCart,deleteAllCartItems,removeFromCart,
};
