import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const fetchMyRecipes = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/recipes/my-submissions', getAuthConfig());
      setRecipes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load your recipes');
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId, recipeTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${recipeTitle}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/recipes/${recipeId}`, getAuthConfig());
      toast.success(`"${recipeTitle}" deleted successfully!`);
      fetchMyRecipes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#27ae60';
      case 'rejected':
        return '#e74c3c';
      case 'pending':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: getStatusColor(status),
        textTransform: 'uppercase'
      }}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your recipes...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>My Recipe Submissions</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
        Track the status of your submitted recipes. Pending recipes are awaiting admin review.
      </p>

      {recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#ecf0f1', borderRadius: '8px' }}>
          <h3>No recipes submitted yet</h3>
          <p>Start by adding your first recipe!</p>
          <button 
            onClick={() => navigate('/add')}
            style={{ 
              marginTop: '20px', 
              padding: '12px 24px', 
              background: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Add Recipe
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {recipes.map((recipe) => (
            <div 
              key={recipe._id} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '20px',
                background: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{recipe.title}</h3>
                  <p style={{ color: '#7f8c8d', marginBottom: '10px' }}>{recipe.description}</p>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#95a5a6' }}>
                    <span>📁 {recipe.category}</span>
                    <span>⏱️ {recipe.prepTime + recipe.cookTime} mins</span>
                    <span>🍽️ {recipe.servings} servings</span>
                    <span>📊 {recipe.difficulty}</span>
                  </div>
                  {recipe.adminNotes && (
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '10px', 
                      background: '#fff3cd', 
                      borderLeft: '4px solid #ffc107',
                      borderRadius: '4px'
                    }}>
                      <strong>Admin Notes:</strong> {recipe.adminNotes}
                    </div>
                  )}
                </div>
                <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  {getStatusBadge(recipe.status)}
                  <div style={{ fontSize: '12px', color: '#95a5a6' }}>
                    Submitted: {new Date(recipe.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => navigate(`/edit-recipe/${recipe._id}`)}
                      style={{
                        padding: '6px 12px',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(recipe._id, recipe.title)}
                      style={{
                        padding: '6px 12px',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRecipes;
