import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from '../utils/toast';

// Non-vegetarian ingredient keywords
const NON_VEG_KEYWORDS = [
  'chicken', 'beef', 'pork', 'bacon', 'turkey', 'ham', 'lamb', 'meat',
  'steak', 'sausage', 'pepperoni', 'salami', 'prosciutto', 'fish', 'salmon',
  'tuna', 'shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster',
  'squid', 'octopus', 'anchov', 'seafood'
];

export const isRecipeNonVeg = (recipe) => {
  if (!recipe) return false;
  const text = (
    (recipe.title || '') + ' ' +
    (recipe.description || '') + ' ' +
    (recipe.ingredients || []).join(' ')
  ).toLowerCase();
  return NON_VEG_KEYWORDS.some(k => text.includes(k));
};

function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDiet, setSelectedDiet] = useState('All'); // 'All', 'Veg', 'Non-Veg'
  const [selectedProtein, setSelectedProtein] = useState('All'); // 'All', 'High', 'Medium', 'Low'
  const [selectedTime, setSelectedTime] = useState('All'); // 'All', 'Quick', 'Medium', 'Long'
  
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    fetchRecipes();
    fetchUserFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
  };

  const fetchRecipes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/recipes');
      setRecipes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      toast.error('Failed to load recipes. Please check your connection.');
      setLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    const config = getAuthConfig();
    if (!config) return;
    try {
      const response = await axios.get('http://localhost:5000/api/favorites', config);
      const ids = new Set(response.data.map(r => r._id));
      setFavoriteIds(ids);
    } catch (err) {
      console.error('Could not prefetch favorites:', err);
    }
  };

  const toggleFavorite = async (recipeId, recipeTitle, e) => {
    if (e) e.stopPropagation();

    const config = getAuthConfig();
    if (!config) {
      toast.warning('Please log in to save recipes to your favorites!');
      return;
    }

    const isFav = favoriteIds.has(recipeId);

    try {
      if (isFav) {
        await axios.delete(`http://localhost:5000/api/favorites/${recipeId}`, config);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(recipeId);
          return next;
        });
        toast.info(`Removed "${recipeTitle || 'Recipe'}" from favorites`);
      } else {
        await axios.post(`http://localhost:5000/api/favorites/${recipeId}`, {}, config);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.add(recipeId);
          return next;
        });
        toast.success(`Saved "${recipeTitle || 'Recipe'}" to favorites! ❤️`);
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      toast.error(error.response?.data?.message || 'Could not update favorites');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.warning('Please enter a recipe title or ingredients to search');
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/recipes/search?query=${encodeURIComponent(searchQuery)}`
      );
      setSearchResults(response.data);
      setIsSearching(false);
      toast.info(`Found ${response.data.totalResults} matching recipes`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedDiet('All');
    setSelectedProtein('All');
    setSelectedTime('All');
    clearSearch();
  };

  const hasActiveFilters = (
    selectedCategory !== 'All' ||
    selectedDifficulty !== 'All' ||
    selectedDiet !== 'All' ||
    selectedProtein !== 'All' ||
    selectedTime !== 'All' ||
    searchResults !== null
  );

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

  // Filter recipes by category, difficulty, diet, protein, and time
  const getFilteredRecipes = () => {
    let filtered = searchResults ? searchResults.recipes : recipes;

    // Category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    // Difficulty
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    // Diet: Veg vs Non-Veg
    if (selectedDiet === 'Veg') {
      filtered = filtered.filter(recipe => !isRecipeNonVeg(recipe));
    } else if (selectedDiet === 'Non-Veg') {
      filtered = filtered.filter(recipe => isRecipeNonVeg(recipe));
    }

    // Protein Preferences
    if (selectedProtein === 'High') {
      filtered = filtered.filter(recipe => (recipe.nutrition?.protein || 0) >= 25);
    } else if (selectedProtein === 'Medium') {
      filtered = filtered.filter(recipe => {
        const p = recipe.nutrition?.protein || 0;
        return p >= 15 && p < 25;
      });
    } else if (selectedProtein === 'Low') {
      filtered = filtered.filter(recipe => (recipe.nutrition?.protein || 0) < 15);
    }

    // Time-consuming preferences (total minutes = prepTime + cookTime)
    if (selectedTime === 'Quick') {
      filtered = filtered.filter(recipe => ((recipe.prepTime || 0) + (recipe.cookTime || 0)) <= 20);
    } else if (selectedTime === 'Medium') {
      filtered = filtered.filter(recipe => {
        const total = (recipe.prepTime || 0) + (recipe.cookTime || 0);
        return total > 20 && total <= 40;
      });
    } else if (selectedTime === 'Long') {
      filtered = filtered.filter(recipe => ((recipe.prepTime || 0) + (recipe.cookTime || 0)) > 40);
    }

    return filtered;
  };

  const displayRecipes = getFilteredRecipes();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{
          display: 'inline-block',
          width: '50px',
          height: '50px',
          border: '4px solid #f1f5f9',
          borderTopColor: '#f97316',
          borderRadius: '50%',
          animation: 'spin 1s ease-in-out infinite'
        }} />
        <p style={{ marginTop: '20px', color: '#64748b', fontSize: '16px', fontWeight: '500' }}>
          Loading delicious recipes...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header & Search Bar Section */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '32px',
        paddingTop: '8px'
      }}>
        <div style={{ flex: '1 1 340px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Culinary Recipe Gallery
          </h1>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '15px' }}>
            Browse, search, and filter recipes by diet, protein content, cooking time, and category
          </p>
        </div>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearch}
          className="search-bar-form"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '999px',
            padding: '4px 4px 4px 16px',
            maxWidth: '460px',
            width: '100%',
            flex: '1 1 320px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
            margin: 0,
            boxSizing: 'border-box'
          }}
        >
          <span style={{ fontSize: '16px', marginRight: '8px', color: '#94a3b8', flexShrink: 0 }}>🔍</span>
          <input
            type="text"
            className="search-bar-input"
            id="recipe-search-input"
            placeholder="Search recipe or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14.5px',
              padding: '10px 4px',
              width: '100%',
              background: 'transparent',
              color: '#0f172a',
              margin: 0,
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                padding: '0 8px',
                cursor: 'pointer',
                fontSize: '16px',
                margin: 0,
                width: 'auto',
                flexShrink: 0
              }}
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="search-bar-btn"
            disabled={isSearching}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 22px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: isSearching ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              margin: 0,
              width: 'auto',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
            }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Comprehensive Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '36px',
        padding: '20px',
        background: '#ffffff',
        border: '1px solid #f1f5f9',
        borderRadius: '20px',
        alignItems: 'center',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
      }}>
        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>⚡</span> Preferences:
        </span>

        {/* 1. Veg / Non-Veg Diet Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Diet:</label>
          <select
            value={selectedDiet}
            onChange={(e) => setSelectedDiet(e.target.value)}
            style={{
              padding: '8px 12px',
              border: selectedDiet !== 'All' ? '1.5px solid #10b981' : '1px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              background: selectedDiet !== 'All' ? '#f0fdf4' : '#f8fafc',
              color: selectedDiet !== 'All' ? '#047857' : '#334155',
              outline: 'none'
            }}
          >
            <option value="All">All Diets</option>
            <option value="Veg">🌱 Vegetarian Only</option>
            <option value="Non-Veg">🍗 Non-Veg Only</option>
          </select>
        </div>

        {/* 2. Protein Preferences Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Protein:</label>
          <select
            value={selectedProtein}
            onChange={(e) => setSelectedProtein(e.target.value)}
            style={{
              padding: '8px 12px',
              border: selectedProtein !== 'All' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              background: selectedProtein !== 'All' ? '#f0f9ff' : '#f8fafc',
              color: selectedProtein !== 'All' ? '#0369a1' : '#334155',
              outline: 'none'
            }}
          >
            <option value="All">All Protein Levels</option>
            <option value="High">💪 High Protein (≥ 25g)</option>
            <option value="Medium">🥩 Moderate (15g - 24g)</option>
            <option value="Low">🥗 Light Protein (&lt; 15g)</option>
          </select>
        </div>

        {/* 3. Time-Consuming / Cook Time Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Time:</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            style={{
              padding: '8px 12px',
              border: selectedTime !== 'All' ? '1.5px solid #f97316' : '1px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              background: selectedTime !== 'All' ? '#fff7ed' : '#f8fafc',
              color: selectedTime !== 'All' ? '#c2410c' : '#334155',
              outline: 'none'
            }}
          >
            <option value="All">All Times</option>
            <option value="Quick">⚡ Quick (&le; 20 mins)</option>
            <option value="Medium">⏱️ Moderate (20 - 40 mins)</option>
            <option value="Long">⏳ Leisurely (&gt; 40 mins)</option>
          </select>
        </div>

        {/* 4. Category Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Meal:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              background: '#f8fafc',
              color: '#334155',
              outline: 'none'
            }}
          >
            <option value="All">All Meals</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Dessert">Dessert</option>
            <option value="Snack">Snack</option>
            <option value="Beverage">Beverage</option>
          </select>
        </div>

        {/* 5. Difficulty Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Skill:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              background: '#f8fafc',
              color: '#334155',
              outline: 'none'
            }}
          >
            <option value="All">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            style={{
              padding: '7px 14px',
              background: '#fee2e2',
              color: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              marginLeft: '4px'
            }}
          >
            Reset Filters
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '13.5px', color: '#64748b', fontWeight: '600' }}>
          Showing <strong>{displayRecipes.length}</strong> {displayRecipes.length === 1 ? 'recipe' : 'recipes'}
        </div>
      </div>

      {/* Recipes Grid */}
      {displayRecipes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: '#ffffff',
          borderRadius: '24px',
          border: '2px dashed #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🍽️</div>
          <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
            No matching recipes found
          </h3>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '20px' }}>
            Try relaxing some preferences (like protein, diet, or time) or clear the search query.
          </p>
          <button
            onClick={resetAllFilters}
            style={{
              padding: '10px 24px',
              background: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reset All Preferences
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '28px'
        }}>
          {displayRecipes.map((recipe) => {
            const isFav = favoriteIds.has(recipe._id);
            const nonVeg = isRecipeNonVeg(recipe);
            const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
            const protein = Math.round(recipe.nutrition?.protein || 0);

            return (
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
                {/* Image Container */}
                <div style={{ position: 'relative', height: '210px', background: '#f8fafc' }}>
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
                    background: nonVeg ? 'rgba(239, 68, 68, 0.92)' : 'rgba(16, 185, 129, 0.92)',
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
                    <span>{nonVeg ? '🍗' : '🌱'}</span>
                    <span>{nonVeg ? 'Non-Veg' : 'Veg'}</span>
                  </div>

                  {/* Top-Right: Favorite Toggle Button */}
                  <button
                    onClick={(e) => toggleFavorite(recipe._id, recipe.title, e)}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: isFav ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
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
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'transform 0.15s'
                    }}
                  >
                    {isFav ? '❤️' : '🤍'}
                  </button>

                  {/* Bottom-Left: Category Pill */}
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

                  {/* Bottom-Right: Time Pill */}
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
                    ⏱️ {totalTime}m
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                    {recipe.title}
                  </h3>

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

                  {/* Badges & Meta */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#475569',
                    marginBottom: '16px',
                    flexWrap: 'wrap'
                  }}>
                    {protein >= 25 && (
                      <span style={{
                        padding: '3px 8px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '11px'
                      }}>
                        💪 High Protein ({protein}g)
                      </span>
                    )}

                    {recipe.matchPercentage !== undefined && recipe.matchPercentage > 0 && (
                      <span style={{
                        padding: '3px 8px',
                        background: '#dcfce7',
                        color: '#15803d',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '11px'
                      }}>
                        ✓ {recipe.matchPercentage}% Match
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

                    <span>🍽️ {recipe.servings} Servings</span>
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
                          {protein}g
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

                  <div style={{ marginTop: '14px', fontSize: '12px', color: '#94a3b8' }}>
                    By {recipe.submittedBy?.firstName ? `${recipe.submittedBy.firstName} ${recipe.submittedBy.lastName || ''}` : 'Chef Community'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Detail Modal */}
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
              maxWidth: '780px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Close button */}
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
                style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '16px', marginBottom: '20px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    background: isRecipeNonVeg(selectedRecipe) ? '#fee2e2' : '#dcfce7',
                    color: isRecipeNonVeg(selectedRecipe) ? '#b91c1c' : '#15803d',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {isRecipeNonVeg(selectedRecipe) ? '🍗 Non-Vegetarian' : '🌱 Vegetarian'}
                  </span>
                  <span style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {selectedRecipe.category}
                  </span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {selectedRecipe.title}
                </h2>
              </div>

              {/* Modal Favorite Button */}
              <button
                onClick={(e) => toggleFavorite(selectedRecipe._id, selectedRecipe.title, e)}
                style={{
                  background: favoriteIds.has(selectedRecipe._id) ? '#fef2f2' : '#f8fafc',
                  border: `1px solid ${favoriteIds.has(selectedRecipe._id) ? '#fee2e2' : '#e2e8f0'}`,
                  color: favoriteIds.has(selectedRecipe._id) ? '#ef4444' : '#334155',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{favoriteIds.has(selectedRecipe._id) ? '❤️' : '🤍'}</span>
                {favoriteIds.has(selectedRecipe._id) ? 'Favorited' : 'Add to Favorites'}
              </button>
            </div>

            <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              {selectedRecipe.description}
            </p>

            {/* Quick Specs Bar */}
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
              <span>⏱️ Total Time: <strong>{(selectedRecipe.prepTime || 0) + (selectedRecipe.cookTime || 0)}m</strong> (Prep: {selectedRecipe.prepTime}m, Cook: {selectedRecipe.cookTime}m)</span>
              <span>🍽️ {selectedRecipe.servings} Servings</span>
              <span>📊 Difficulty: <span style={{ color: getDifficultyColor(selectedRecipe.difficulty), fontWeight: '700' }}>{selectedRecipe.difficulty}</span></span>
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
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
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

            <div style={{ fontSize: '13px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              Submitted by <strong>{selectedRecipe.submittedBy?.firstName} {selectedRecipe.submittedBy?.lastName}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeList;
