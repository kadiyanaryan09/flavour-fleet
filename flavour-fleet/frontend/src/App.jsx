import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Home from './pages/Home.jsx';
import RestaurantDetails from './pages/RestaurantDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants/:id" element={<RestaurantDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
