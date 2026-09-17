// File: /server/controllers/recipeController.js

import Recipe from '../models/Recipe.js';
import fetch from 'node-fetch';

// Helper function to get nutrition data
async function fetchNutrition(title, ingredients) {
  try {
    console.log('Fetching nutrition for:', title);
    
    const response = await fetch(
      `https://api.spoonacular.com/recipes/guessNutrition?apiKey=${process.env.SPOONACULAR_API_KEY}&title=${encodeURIComponent(title)}`
    );
    
    if (!response.ok) {
      console.error('Spoonacular API error:', response.status, response.statusText);
      return generateEstimatedNutrition(ingredients);
    }
    
    const data = await response.json();
    console.log('Spoonacular response:', data);
    
    // Check if we got valid data
    if (data.calories && data.calories.value) {
      return {
        calories: data.calories.value || 0,
        protein: data.protein?.value || 0,
        fat: data.fat?.value || 0,
        carbs: data.carbs?.value || 0,
      };
    } else {
      // If API doesn't return proper data, use estimation
      return generateEstimatedNutrition(ingredients);
    }
  } catch (err) {
    console.error("Spoonacular API error:", err.message);
    return generateEstimatedNutrition(ingredients);
  }
}

// Fallback: Generate estimated nutrition based on ingredients count
function generateEstimatedNutrition(ingredients) {
  const ingredientCount = ingredients.length;
  // Simple estimation: more ingredients = more calories
  const baseCalories = 150;
  const caloriesPerIngredient = 50;
  
  const estimatedCalories = baseCalories + (ingredientCount * caloriesPerIngredient);
  
  return {
    calories: estimatedCalories,
    protein: Math.round(estimatedCalories * 0.15 / 4), // 15% of calories from protein (4 cal/g)
    fat: Math.round(estimatedCalories * 0.30 / 9), // 30% of calories from fat (9 cal/g)
    carbs: Math.round(estimatedCalories * 0.55 / 4), // 55% of calories from carbs (4 cal/g)
  };
}

// @desc    Submit a new recipe for review
// @route   POST /api/recipes/submit
export const submitRecipe = async (req, res) => {
  try {
    const { title, description, category, prepTime, cookTime, servings, difficulty, ingredients, instructions } = req.body;

    // Fetch nutrition data automatically
    const nutrition = await fetchNutrition(title, ingredients);

    const recipe = new Recipe({
      ...req.body,
      submittedBy: req.user.id, // Get user ID from our 'protect' middleware
      nutrition,
    });

    const createdRecipe = await recipe.save();
    res.status(201).json(createdRecipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all recipes submitted by the logged-in user
// @route   GET /api/recipes/my-submissions
export const getMySubmissions = async (req, res) => {
  try {
    const recipes = await Recipe.find({ submittedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all APPROVED recipes
// @route   GET /api/recipes
export const getAllApprovedRecipes = async (req, res) => {
  try {
    // We only find recipes with the status 'approved'
    const recipes = await Recipe.find({ status: 'approved' })
      .populate('submittedBy', 'firstName lastName') // Get the author's name
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a single APPROVED recipe by ID
// @route   GET /api/recipes/:id
export const getSingleRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('submittedBy', 'firstName lastName');

    // Crucially, check if the recipe exists AND is approved
    if (recipe && recipe.status === 'approved') {
      res.json(recipe);
    } else {
      // If not found or not approved, return a 404 error
      res.status(404).json({ message: 'Recipe not found or is not approved.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete user's own recipe
// @route   DELETE /api/recipes/:id
export const deleteMyRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the recipe belongs to the logged-in user
    if (recipe.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own recipes' });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Edit user's own recipe
// @route   PUT /api/recipes/:id
export const editMyRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the recipe belongs to the logged-in user
    if (recipe.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own recipes' });
    }

    const { title, description, category, prepTime, cookTime, servings, difficulty, ingredients, instructions, image } = req.body;

    // If title or ingredients changed, recalculate nutrition
    let nutrition = recipe.nutrition;
    if (title !== recipe.title || JSON.stringify(ingredients) !== JSON.stringify(recipe.ingredients)) {
      nutrition = await fetchNutrition(title, ingredients);
    }

    // Update recipe fields
    recipe.title = title;
    recipe.description = description;
    recipe.category = category;
    recipe.prepTime = prepTime;
    recipe.cookTime = cookTime;
    recipe.servings = servings;
    recipe.difficulty = difficulty;
    recipe.ingredients = ingredients;
    recipe.instructions = instructions;
    recipe.image = image;
    recipe.nutrition = nutrition;
    
    // Reset status to pending if it was rejected
    if (recipe.status === 'rejected') {
      recipe.status = 'pending';
      recipe.adminNotes = '';
      recipe.reviewedBy = null;
      recipe.reviewedAt = null;
    }

    await recipe.save();

    res.json({ 
      message: 'Recipe updated successfully', 
      recipe 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Search recipes by ingredients or title
// @route   GET /api/recipes/search?ingredients=chicken,tomato or ?query=pasta
export const searchRecipesByIngredients = async (req, res) => {
  try {
    const rawSearch = req.query.ingredients || req.query.query || req.query.q || '';

    if (!rawSearch.trim()) {
      return res.status(400).json({ message: 'Please provide ingredients or keywords to search' });
    }

    // Split search terms by comma or whitespace if single term
    const searchTerms = rawSearch
      .split(/[,]+/)
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);

    if (searchTerms.length === 0) {
      return res.status(400).json({ message: 'Please provide valid search terms' });
    }

    const regexPattern = searchTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

    // Find approved recipes that contain search terms in ingredients, title, category, or description
    const recipes = await Recipe.find({ 
      status: 'approved',
      $or: [
        { ingredients: { $elemMatch: { $regex: regexPattern, $options: 'i' } } },
        { title: { $regex: regexPattern, $options: 'i' } },
        { description: { $regex: regexPattern, $options: 'i' } },
        { category: { $regex: regexPattern, $options: 'i' } }
      ]
    })
    .populate('submittedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

    // Calculate match score for each recipe
    const recipesWithScore = recipes.map(recipe => {
      let matchCount = 0;
      let titleBonus = 0;

      // Check title match bonus
      if (searchTerms.some(term => recipe.title.toLowerCase().includes(term))) {
        titleBonus = 5;
      }
      
      // Count how many of the recipe's ingredients match the search
      recipe.ingredients.forEach(recipeIng => {
        const hasMatch = searchTerms.some(term => 
          recipeIng.toLowerCase().includes(term)
        );
        if (hasMatch) matchCount++;
      });

      const totalScore = matchCount + titleBonus;
      let matchPercentage = Math.round((matchCount / Math.max(recipe.ingredients.length, 1)) * 100);
      if (titleBonus > 0 && matchPercentage < 60) {
        matchPercentage = Math.max(matchPercentage, 80);
      }

      return {
        ...recipe.toObject(),
        matchScore: totalScore,
        matchPercentage: Math.min(matchPercentage, 100),
        totalIngredients: recipe.ingredients.length
      };
    });

    // Sort by match score (highest first)
    recipesWithScore.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      searchedIngredients: searchTerms,
      totalResults: recipesWithScore.length,
      recipes: recipesWithScore
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
