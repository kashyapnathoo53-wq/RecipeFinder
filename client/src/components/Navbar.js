import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "../utils/toast";

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info("You have logged out successfully");
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color: isActive(path) ? '#f97316' : '#cbd5e1',
    textDecoration: 'none',
    fontWeight: isActive(path) ? '700' : '500',
    fontSize: '14.5px',
    transition: 'color 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '8px',
    background: isActive(path) ? 'rgba(249, 115, 22, 0.12)' : 'transparent'
  });

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0 28px'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'white',
            fontSize: '20px',
            fontWeight: '800',
            letterSpacing: '-0.02em'
          }}
        >
          <span style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            padding: '6px 10px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(249, 115, 22, 0.4)'
          }}>
            🍲
          </span>
          <span>Recipe<span style={{ color: '#f97316' }}>Finder</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{
          display: 'none',
          gap: '12px',
          alignItems: 'center',
          '@media (min-width: 868px)': { display: 'flex' }
        }} className="desktop-menu">
          <Link to="/" style={linkStyle('/')}>Home</Link>
          <Link to="/recipes" style={linkStyle('/recipes')}>Recipes</Link>

          {isAuthenticated() ? (
            <>
              <Link to="/favorites" style={linkStyle('/favorites')}>
                <span>❤️</span> Favorites
              </Link>
              <Link to="/add" style={linkStyle('/add')}>
                <span>➕</span> Add Recipe
              </Link>
              {isAdmin() ? (
                <>
                  <Link to="/admin" style={linkStyle('/admin')}>Admin Dashboard</Link>
                  <Link to="/admin/users" style={linkStyle('/admin/users')}>Users</Link>
                </>
              ) : (
                <Link to="/my-recipes" style={linkStyle('/my-recipes')}>My Recipes</Link>
              )}
              <Link to="/profile" style={linkStyle('/profile')}>Profile</Link>

              <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 6px' }} />

              <span style={{
                color: '#94a3b8',
                fontSize: '13.5px',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '6px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                👋 {user?.firstName || 'User'} {isAdmin() && <span style={{ color: '#f97316', fontWeight: 'bold' }}>• Admin</span>}
              </span>

              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '10px' }}>
              <Link
                to="/login"
                style={{
                  color: '#e2e8f0',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)'
                }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle"
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px'
          }}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '16px 0 24px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/')}>Home</Link>
          <Link to="/recipes" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/recipes')}>Recipes</Link>

          {isAuthenticated() ? (
            <>
              <Link to="/favorites" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/favorites')}>
                <span>❤️</span> Favorites
              </Link>
              <Link to="/add" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/add')}>
                <span>➕</span> Add Recipe
              </Link>
              {isAdmin() ? (
                <>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/admin')}>Admin Dashboard</Link>
                  <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/admin/users')}>User Management</Link>
                </>
              ) : (
                <Link to="/my-recipes" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/my-recipes')}>My Recipes</Link>
              )}
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/profile')}>Profile</Link>
              <button
                onClick={handleLogout}
                style={{
                  marginTop: '10px',
                  padding: "10px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/login')}>Login</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} style={linkStyle('/signup')}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

