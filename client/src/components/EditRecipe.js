import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from '../utils/toast';

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Breakfast',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Easy',
    ingredients: '',
    instructions: '',
    image: ''
  });

  useEffect(() => {
    fetchRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/recipes/my-submissions`, getAuthConfig());
      const recipe = response.data.find(r => r._id === id);
      
      if (!recipe) {
        toast.error('Recipe not found');
        navigate('/my-recipes');
        return;
      }

      setFormData({
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        ingredients: recipe.ingredients.join('\n'),
        instructions: recipe.instructions.join('\n'),
        image: recipe.image || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast.error('Failed to load recipe');
      navigate('/my-recipes');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ingredientsArray = formData.ingredients
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const instructionsArray = formData.instructions
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const recipeData = {
      ...formData,
      prepTime: parseInt(formData.prepTime),
      cookTime: parseInt(formData.cookTime),
      servings: parseInt(formData.servings),
      ingredients: ingredientsArray,
      instructions: instructionsArray
    };

    try {
      await axios.put(`http://localhost:5000/api/recipes/${id}`, recipeData, getAuthConfig());
      toast.success('Recipe updated successfully!');
      navigate('/my-recipes');
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error(error.response?.data?.message || 'Failed to update recipe');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading recipe...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Edit Recipe</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
        Update your recipe details. If status was rejected, it will be reset to pending after editing.
      </p>

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Recipe Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Dessert">Dessert</option>
              <option value="Snack">Snack</option>
              <option value="Beverage">Beverage</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Difficulty *</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Prep Time (min) *</label>
            <input
              type="number"
              name="prepTime"
              value={formData.prepTime}
              onChange={handleChange}
              required
              min="1"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cook Time (min) *</label>
            <input
              type="number"
              name="cookTime"
              value={formData.cookTime}
              onChange={handleChange}
              required
              min="1"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Servings *</label>
            <input
              type="number"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              required
              min="1"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ingredients * (one per line)</label>
          <textarea
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            required
            rows="6"
            placeholder="2 cups flour&#10;1 cup sugar&#10;3 eggs"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', fontFamily: 'monospace' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Instructions * (one per line)</label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
            rows="8"
            placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Add wet ingredients"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', fontFamily: 'monospace' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '12px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Update Recipe
          </button>
          <button
            type="button"
            onClick={() => navigate('/my-recipes')}
            style={{
              flex: 1,
              padding: '12px',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditRecipe;
