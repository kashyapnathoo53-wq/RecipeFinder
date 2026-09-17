import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from '../utils/toast';
import { isRecipeNonVeg } from './RecipeList';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.info('Please log in to view your favorite recipes');
      navigate('/login');
      return;
    }
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/favorites', getAuthConfig());
      setFavorites(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites. Please try again.');
      setLoading(false);
    }
  };

  const handleRemove = async (recipeId, recipeTitle, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.delete(`http://localhost:5000/api/favorites/${recipeId}`, getAuthConfig());
      setFavorites(prev => prev.filter(recipe => recipe._id !== recipeId));
      if (selectedRecipe && selectedRecipe._id === recipeId) {
        setSelectedRecipe(null);
      }
      toast.success(`"${recipeTitle || 'Recipe'}" removed from favorites`);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('Could not remove from favorites');
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{
          display: 'inline-block',
          width: '50px',
          height: '50px',
          border: '4px solid #f3f4f6',
          borderTopColor: '#f97316',
          borderRadius: '50%',
          animation: 'spin 1s ease-in-out infinite'
        }} />
        <p style={{ marginTop: '20px', color: '#64748b', fontSize: '16px', fontWeight: '500' }}>
          Loading your favorite recipes...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '24px',
        padding: '36px 40px',
        color: '#ffffff',
        marginBottom: '40px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
            <span>❤️</span> Personal Cookbook
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            My Favorite Recipes
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
            {favorites.length} curated {favorites.length === 1 ? 'dish' : 'dishes'} saved for quick cooking
          </p>
        </div>
        <Link
          to="/recipes"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
        >
          <span>🔍</span> Browse More Recipes
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: '#ffffff',
          borderRadius: '24px',
          border: '2px dashed #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍳</div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            No favorites added yet
          </h3>
          <p style={{ color: '#64748b', maxWidth: '450px', margin: '0 auto 24px auto', fontSize: '15px', lineHeight: 1.6 }}>
            Explore our curated culinary catalog, click the heart icon on any recipe, and it will appear here for easy access!
          </p>
          <Link
            to="/recipes"
            style={{
              display: 'inline-block',
              background: '#f97316',
              color: 'white',
              padding: '12px 28px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
            }}
          >
            Explore Recipes
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '28px'
        }}>
          {favorites.map((recipe) => (
            <div
              key={recipe._id}
              onClick={() => setSelectedRecipe(recipe)}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              {/* Card Image */}
              <div style={{ position: 'relative', height: '210px', background: '#f1f5f9' }}>
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                    🍲
                  </div>
                )}

                {/* Top-Left: Veg/Non-Veg Badge */}
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  background: isRecipeNonVeg(recipe) ? 'rgba(239, 68, 68, 0.92)' : 'rgba(16, 185, 129, 0.92)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}>
                  <span>{isRecipeNonVeg(recipe) ? '🍗' : '🌱'}</span>
                  <span>{isRecipeNonVeg(recipe) ? 'Non-Veg' : 'Veg'}</span>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemove(recipe._id, recipe.title, e)}
                  title="Remove from favorites"
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#ef4444',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    transition: 'transform 0.15s'
                  }}
                >
                  ❤️
                </button>

                {/* Category Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '14px',
                  left: '14px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {recipe.category}
                </div>

                {/* Time Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '14px',
                  right: '14px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  ⏱️ {(recipe.prepTime || 0) + (recipe.cookTime || 0)}m
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                    {recipe.title}
                  </h3>
                </div>

                <p style={{
                  color: '#64748b',
                  fontSize: '13.5px',
                  margin: '0 0 16px 0',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {recipe.description}
                </p>

                {/* Meta details */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#475569',
                  marginBottom: '16px',
                  flexWrap: 'wrap'
                }}>
                  {Math.round(recipe.nutrition?.protein || 0) >= 25 && (
                    <span style={{
                      padding: '3px 8px',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '11px'
                    }}>
                      💪 High Protein ({Math.round(recipe.nutrition?.protein || 0)}g)
                    </span>
                  )}
                  <span style={{
                    color: getDifficultyColor(recipe.difficulty),
                    fontWeight: '700',
                    background: `${getDifficultyColor(recipe.difficulty)}15`,
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {recipe.difficulty}
                  </span>
                  <span>🍽️ {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}</span>
                </div>

                {/* Nutrition Bar */}
                {recipe.nutrition && (
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    textAlign: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: '#64748b'
                  }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#f97316', fontSize: '13px' }}>
                        {recipe.nutrition.calories ? Math.round(recipe.nutrition.calories) : '--'}
                      </div>
                      <div>Calories</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0284c7', fontSize: '13px' }}>
                        {recipe.nutrition.protein ? `${Math.round(recipe.nutrition.protein)}g` : '--'}
                      </div>
                      <div>Protein</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#10b981', fontSize: '13px' }}>
                        {recipe.nutrition.carbs ? `${Math.round(recipe.nutrition.carbs)}g` : '--'}
                      </div>
                      <div>Carbs</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal View */}
      {selectedRecipe && (
        <div
          onClick={() => setSelectedRecipe(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <button
              onClick={() => setSelectedRecipe(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                fontSize: '18px',
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            {selectedRecipe.image && (
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.title}
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '16px', marginBottom: '20px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {selectedRecipe.title}
              </h2>
              <button
                onClick={(e) => handleRemove(selectedRecipe._id, selectedRecipe.title, e)}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  color: '#ef4444',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>💔</span> Remove Favorite
              </button>
            </div>

            <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              {selectedRecipe.description}
            </p>

            <div style={{
              display: 'flex',
              gap: '16px',
              padding: '14px 18px',
              background: '#f8fafc',
              borderRadius: '14px',
              marginBottom: '28px',
              fontSize: '14px',
              color: '#334155',
              flexWrap: 'wrap'
            }}>
              <span>📁 <strong>{selectedRecipe.category}</strong></span>
              <span>⏱️ Prep: {selectedRecipe.prepTime}m</span>
              <span>🔥 Cook: {selectedRecipe.cookTime}m</span>
              <span>🍽️ {selectedRecipe.servings} Servings</span>
              <span>📊 <span style={{ color: getDifficultyColor(selectedRecipe.difficulty), fontWeight: '700' }}>{selectedRecipe.difficulty}</span></span>
            </div>

            {/* Ingredients */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                🛒 Ingredients
              </h3>
              <ul style={{ paddingLeft: '20px', color: '#334155', lineHeight: 1.8 }}>
                {selectedRecipe.ingredients?.map((ing, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{ing}</li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                👨‍🍳 Instructions
              </h3>
              <ol style={{ paddingLeft: '20px', color: '#334155', lineHeight: 1.8 }}>
                {selectedRecipe.instructions?.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '10px' }}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Nutrition */}
            {selectedRecipe.nutrition && (
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                  🥗 Estimated Nutrition Facts
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#f97316' }}>
                      {Math.round(selectedRecipe.nutrition.calories || 0)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Calories</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#0284c7' }}>
                      {Math.round(selectedRecipe.nutrition.protein || 0)}g
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Protein</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>
                      {Math.round(selectedRecipe.nutrition.carbs || 0)}g
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Carbs</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#8b5cf6' }}>
                      {Math.round(selectedRecipe.nutrition.fat || 0)}g
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Fat</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Favorites;
