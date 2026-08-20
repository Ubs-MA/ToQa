import { Heart, Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth";

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return <div className="site-shell">
    <header className="header">
      <Link to="/" className="brand">ToQa<span>.</span></Link>
      <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
      <nav className={open ? "nav open" : "nav"} onClick={() => setOpen(false)}>
        <NavLink to="/">Shop</NavLink>
        {user && <NavLink to="/account">Account</NavLink>}
        {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="header-actions">
        {user && <Link className="icon-btn" to="/account?tab=wishlist" aria-label="Wishlist"><Heart /></Link>}
        <Link className="icon-btn" to="/cart" aria-label="Cart"><ShoppingBag /></Link>
        {user ? <button className="text-btn" onClick={logout}>Sign out</button> : <Link className="icon-btn" to="/login" aria-label="Sign in"><UserRound /></Link>}
      </div>
    </header>
    <main><Outlet /></main>
    <footer><div><span className="brand light">ToQa.</span><p>Considered pieces for everyday grace.</p></div><p>Single-store demo · Egypt · 2026</p></footer>
  </div>;
}
