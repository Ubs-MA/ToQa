import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../api";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api("/cart");
      setCart(data.cart || { items: [], subtotal: 0, discount: 0, total: 0 });
    } catch (e) {
      setCart(null);
      setError(e.message || "Your bag could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(load, []);

  const change = async (variantId, quantity) => {
    if (quantity < 1) return;
    try {
      setError("");
      const data = await api(`/cart/items/${variantId}`, { method: "PATCH", body: JSON.stringify({ quantity }) });
      setCart(data.cart || { items: [], subtotal: 0, discount: 0, total: 0 });
    } catch (e) {
      setError(e.message || "This item could not be updated.");
    }
  };

  const remove = async (variantId) => {
    try {
      setError("");
      const data = await api(`/cart/items/${variantId}`, { method: "DELETE" });
      setCart(data.cart || { items: [], subtotal: 0, discount: 0, total: 0 });
    } catch (e) {
      setError(e.message || "This item could not be removed.");
    }
  };

  const apply = async () => {
    try {
      setError("");
      const data = await api("/cart/coupon", { method: "POST", body: JSON.stringify({ code: coupon }) });
      setCart(data.cart || { items: [], subtotal: 0, discount: 0, total: 0 });
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="page-state">Preparing your bag...</div>;
  if (!cart) return (
    <div className="page-state error">
      <h1>Bag unavailable</h1>
      <p>{error}</p>
      <div className="button-row centered">
        <button className="button outline" type="button" onClick={load}>Try again</button>
        <Link className="button dark" to="/">Go to shop</Link>
      </div>
    </div>
  );

  const items = Array.isArray(cart.items) ? cart.items : [];

  return (
    <section className="cart-page">
      <div>
        <p className="eyebrow">Your selection</p>
        <h1>Shopping bag</h1>
        {!items.length ? (
          <div className="empty-card">
            <p>Your bag is waiting.</p>
            <Link className="button dark" to="/">Browse the collection</Link>
          </div>
        ) : (
          items.map((item, index) => (
            <article className="cart-item" key={item.variant?._id || item.product?._id || index}>
              <img src={item.product?.images?.[0] || "https://placehold.co/200x240"} alt={item.product?.name || "Cart item"} />
              <div>
                <h3>{item.product?.name || "Unavailable item"}</h3>
                <p>{item.variant?.size || "-"} / {item.variant?.color || "-"}</p>
                <strong className="price">{money(item.variant?.price ?? item.product?.basePrice)}</strong>
              </div>
              <div className="quantity">
                <button disabled={!item.variant?._id} onClick={() => change(item.variant._id, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={15} /></button>
                <span>{item.quantity}</span>
                <button disabled={!item.variant?._id} onClick={() => change(item.variant._id, item.quantity + 1)} aria-label="Increase quantity"><Plus size={15} /></button>
              </div>
              <button className="icon-btn" disabled={!item.variant?._id} onClick={() => remove(item.variant._id)} aria-label="Remove item"><Trash2 size={18} /></button>
            </article>
          ))
        )}
      </div>

      <aside className="summary">
        <h2>Order summary</h2>
        <div><span>Subtotal</span><strong>{money(cart.subtotal)}</strong></div>
        <div><span>Discount</span><strong>- {money(cart.discount)}</strong></div>
        <div className="summary-total"><span>Total</span><strong>{money(cart.total)}</strong></div>
        <div className="coupon-row">
          <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" />
          <button onClick={apply}>Apply</button>
        </div>
        {error && <p className="form-error">{error}</p>}
        <Link className={`button dark full ${!items.length ? "disabled" : ""}`} to={items.length ? "/checkout" : "/cart"}>
          Continue to checkout
        </Link>
      </aside>
    </section>
  );
}
