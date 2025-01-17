import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";
import BikesPage from "./pages/BikesPage/BikesPage";
import CategoryList from "./components/CategoryList";
import Cart from "./pages/Cart/Cart";
import Register from "./pages/Register/Register";
import Login from "./components/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AddBikeForm from "./pages/AddBikeForm/AddBikeForm";
import AccessDenied from "./pages/Auth/AccessDenied";
import ProfilePage from "./pages/Profile/ProfilePage";
import AdminDashboard from "./pages/Admin/components/AdminDashboard/AdminDashboard";
import AdminOrders from "./pages/Admin/components/AdminOrders/AdminOrders";
import { AdminRoute, UserRoute } from "./components/routes/ProtectedRoute";
import MyListings from "./components/Listings/MyListings";
import Messages from "./components/Messages/Messages";
import SavedBikes from "./components/SavedBikes/SavedBikes";
import useAutoLogout from "./hooks/useAutoLogout";
import BikePage from "./pages/BikePage/BikePage";
import UserListings from "./pages/UserListings/UserListings";
import EditBikeForm from "./pages/EditBikeForm/EditBikeForm";
import Settings from "./pages/Settings/Settings";
import Chat from "./components/Chat/Chat";

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { logout } = useAuth();

  useAutoLogout(logout, 6000000);

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bikes" element={<BikesPage />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/saved-bikes" element={<SavedBikes />} />
            <Route path="/bikes/:id" element={<BikePage />} />
            <Route path="/user-listings" element={<UserListings />} />
            <Route path="/bikes/:id/edit" element={<EditBikeForm />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chats/:chatId" element={<Chat />} />
            <Route
              path="/add-bike"
              element={
                <UserRoute>
                  <AddBikeForm />
                </UserRoute>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/profile/orders" element={<AdminOrders />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
