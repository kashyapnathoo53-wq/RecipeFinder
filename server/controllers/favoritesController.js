import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

// @desc    Add recipe to favorites
// @route   POST /api/favorites/:recipeId
export const addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const recipe = await Recipe.findById(req.params.recipeId);

    if (!recipe || recipe.status !== 'approved') {
      return res.status(404).json({ message: 'Recipe not found or not approved' });
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    const recipeIdStr = req.params.recipeId.toString();
    if (user.favorites.some(id => id.toString() === recipeIdStr)) {
      return res.status(400).json({ message: 'Recipe is already in favorites' });
    }

    user.favorites.push(req.params.recipeId);
    await user.save();

    res.json({ message: 'Added to favorites successfully', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Remove recipe from favorites
// @route   DELETE /api/favorites/:recipeId
export const removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favorites = (user.favorites || []).filter(
      id => id.toString() !== req.params.recipeId
    );

    await user.save();

    res.json({ message: 'Removed from favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user's favorite recipes
// @route   GET /api/favorites
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'favorites',
        match: { status: 'approved' },
        populate: { path: 'submittedBy', select: 'firstName lastName' }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out null entries if a recipe was deleted
    const activeFavorites = (user.favorites || []).filter(f => f !== null);

    res.json(activeFavorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Check if recipe is favorited
// @route   GET /api/favorites/check/:recipeId
export const checkFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isFavorited = (user.favorites || []).some(
      id => id.toString() === req.params.recipeId
    );
    res.json({ isFavorited });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
