import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import RecipeList from "./components/RecipeList";
import AddRecipe from "./components/AddRecipe";
import EditRecipe from "./components/EditRecipe";
import MyRecipes from "./components/MyRecipes";
import Profile from "./components/Profile";
import Favorites from "./components/Favorites";
import AdminDashboard from "./components/AdminDashboard";
import UserManagement from "./components/UserManagement";
import Navbar from "./components/Navbar";
import './style.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/add" element={<AddRecipe />} />
          <Route path="/edit-recipe/:id" element={<EditRecipe />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;