import { Link, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Storefront from "./pages/Storefront";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AuthPage from "./pages/AuthPage";
import Account from "./pages/Account";
import OrderSuccess from "./pages/OrderSuccess";
import Admin from "./pages/Admin";
import OrderDetails from "./pages/OrderDetails";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Storefront />} />
        <Route path="products/:productId" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="order-success/:orderId" element={<OrderSuccess />} />
        <Route path="admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
        <Route path="*" element={<div className="page-state"><h1>Page not found</h1><p>This address does not match an active ToQa page.</p><Link className="button dark" to="/">Go to shop</Link></div>} />
      </Route>
    </Routes>
  );
}
