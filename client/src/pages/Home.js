import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        color: '#ffffff',
        padding: '90px 24px 110px 24px',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Glow orb */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '850px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '8px 18px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#fdba74',
            marginBottom: '24px',
            backdropFilter: 'blur(8px)'
          }}>
            <span>✨</span> 100+ Chef Curated & Tested Recipes
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: '900',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: '0 0 20px 0'
          }}>
            Cook Smarter, <br />
            <span style={{
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Eat Deliciously Every Day
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(17px, 2vw, 20px)',
            color: '#94a3b8',
            maxWidth: '650px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6
          }}>
            Discover curated recipes based on ingredients you already have, bookmark your personal favorites, and calculate automated nutritional facts in seconds.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Link
              to="/recipes"
              style={{
                padding: '16px 36px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '14px',
                fontWeight: '700',
                fontSize: '16px',
                boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.5)',
                transition: 'transform 0.2s'
              }}
            >
              Browse 100+ Recipes →
            </Link>

            {isAuthenticated() ? (
              <Link
                to="/favorites"
                style={{
                  padding: '16px 32px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '14px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                ❤️ My Favorites
              </Link>
            ) : (
              <Link
                to="/signup"
                style={{
                  padding: '16px 32px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '14px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                Join Community
              </Link>
            )}
          </div>

          {/* Quick Category Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {['🍳 Breakfast', '🥗 Lunch', '🍝 Dinner', '🍰 Dessert', '🥤 Beverage'].map((cat, i) => (
              <Link
                key={i}
                to="/recipes"
                style={{
                  color: '#cbd5e1',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section style={{ maxWidth: '1200px', margin: '-50px auto 80px auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          <div style={{
            background: '#ffffff',
            padding: '36px 28px',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#fff7ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '20px'
            }}>
              🥕
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>
              Ingredient Matcher
            </h3>
            <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
              Got eggs, tomatoes, or chicken? Enter what’s in your pantry and get instant recipes ranked by match percentage.
            </p>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '36px 28px',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '20px'
            }}>
              ❤️
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>
              Personal Favorites
            </h3>
            <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
              Save mouth-watering dishes to your private cookbook with one click for easy, stress-free meal planning anytime.
            </p>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '36px 28px',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '20px'
            }}>
              📊
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>
              Nutrition Intelligence
            </h3>
            <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
              Accurate breakdown of calories, protein, carbs, and fats auto-calculated for every recipe you submit or browse.
            </p>
          </div>
        </div>
      </section>

      {/* Community Call to Action */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '28px',
          padding: '60px 40px',
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '30px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)'
        }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 10px 0' }}>
              Are You a Passionate Home Chef?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '540px', margin: 0 }}>
              Submit your secret family recipes to our admin-reviewed catalog and inspire thousands of food lovers.
            </p>
          </div>
          <Link
            to={isAuthenticated() ? "/add" : "/signup"}
            style={{
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '16px',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)'
            }}
          >
            {isAuthenticated() ? "Submit a Recipe Now" : "Sign Up & Share Recipes"}
          </Link>
        </div>
      </section>
    </div>
  );
}
