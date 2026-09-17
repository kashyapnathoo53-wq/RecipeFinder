import express from 'express';
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite
} from '../controllers/favoritesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All favorites routes require authentication

router.get('/', getFavorites);
router.get('/check/:recipeId', checkFavorite);
router.post('/:recipeId', addToFavorites);
router.delete('/:recipeId', removeFromFavorites);

export default router;
