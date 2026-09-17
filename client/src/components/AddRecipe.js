import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';

function AddRecipe() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Easy',
    ingredients: '',
    instructions: '',
    image: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      toast.warning('You must be logged in to create a recipe.');
      navigate('/login');
      return;
    }

    // Convert comma-separated strings to arrays
    const ingredientsArray = formData.ingredients.split('\n').map(item => item.trim()).filter(item => item);
    const instructionsArray = formData.instructions.split('\n').map(item => item.trim()).filter(item => item);

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const recipeData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        prepTime: parseInt(formData.prepTime),
        cookTime: parseInt(formData.cookTime),
        servings: parseInt(formData.servings),
        difficulty: formData.difficulty,
        ingredients: ingredientsArray,
        instructions: instructionsArray,
        image: formData.image
      };

      const response = await axios.post(
        'http://localhost:5000/api/recipes/submit', 
        recipeData, 
        config
      );

      console.log('Recipe created successfully:', response.data);
      toast.success('Recipe submitted for review! You can track its status in "My Recipes".');
      navigate('/my-recipes');
    } catch (error) {
      console.error('Error creating recipe:', error.response ? error.response.data : error.message);
      toast.error(`Error: ${error.response ? error.response.data.message : 'Could not create recipe'}`);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Submit a New Recipe</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
        Your recipe will be reviewed by an admin before being published.
      </p>
      
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Recipe Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            placeholder="Brief description of your recipe"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
            >
              <option value="">Select category</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Dessert">Dessert</option>
              <option value="Snack">Snack</option>
              <option value="Beverage">Beverage</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Difficulty *</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="prepTime" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Prep Time (min) *</label>
            <input
              type="number"
              id="prepTime"
              name="prepTime"
              value={formData.prepTime}
              onChange={handleChange}
              required
              min="0"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
            />
          </div>

          <div>
            <label htmlFor="cookTime" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Cook Time (min) *</label>
            <input
              type="number"
              id="cookTime"
              name="cookTime"
              value={formData.cookTime}
              onChange={handleChange}
              required
              min="0"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
            />
          </div>

          <div>
            <label htmlFor="servings" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Servings *</label>
            <input
              type="number"
              id="servings"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              required
              min="1"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="ingredients" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ingredients (one per line) *</label>
          <textarea
            id="ingredients"
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            required
            rows="8"
            placeholder="200g chicken breast&#10;1 onion, diced&#10;2 cloves garlic, minced&#10;1 cup rice"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="instructions" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Instructions (one step per line) *</label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
            rows="10"
            placeholder="Heat oil in a large pan over medium heat&#10;Add diced onion and cook until softened&#10;Add garlic and cook for 1 minute&#10;Add chicken and cook until browned"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="image" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Image URL (optional)</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
          />
        </div>

        <button 
          type="submit"
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: '#27ae60', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            cursor: 'pointer' 
          }}
        >
          Submit Recipe for Review
        </button>
      </form>
    </div>
  );
}

export default AddRecipe;